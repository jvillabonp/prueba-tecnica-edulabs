<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Services\StorageRulesService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Exception;

class FileController extends Controller
{
    public function __construct(private StorageRulesService $rules) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            return response()->json([
                'success'   => true,
                'message'   => 'Listado de archivos',
                'data'      => auth()->user()->files()->get()->map(function ($file) {
                    return [
                        'id'            => $file->uuid,
                        'name'          => $file->original_name,
                        'size'          => $file->size_bytes,
                        'privacy'       => $file->privacy,
                        'created_at'    => $file->created_at->format("d M Y")
                    ];
                })
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error Interno'
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file'      => 'required|file',
            'privacy'   => 'nullable|in:private,group,public',
            'group_id'  => 'nullable|exists:groups,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success'   => false,
                'message'   => 'Datos incorrectos',
                'data'      => $validator->messages()
            ], 400);
        }

        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension());

        try {
            $this->rules->checkQuotaOrFail(auth()->user(), $file->getSize());
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
        
        if ($this->rules->isExtensionBanned($ext)) {
            return response()->json([
                'success' => false,
                'message' => "El tipo de archivo '.{$ext}' no está permitido"
            ], 422);
        }

        if ($ext === 'zip') {
            try {
                $this->rules->scanZipOrFail($file);
            } catch (\RuntimeException $e) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage()
                ], 422);
            }
        }

        $uuid = \Str::uuid()->toString();
        $path = sprintf('users/%d/%s', auth()->id(), "{$uuid}.{$ext}");

        try {
            Storage::disk('s3')->put($path, file_get_contents($file->getRealPath()), 'private');
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'No se ha podido cargar el archivo'
            ], 500);
        }

        try {
            File::create([
                'uuid'              => $uuid,
                'user_id'           => auth()->id(),
                'group_id'          => $request->input('privacy') ==='group' ? $request->get('group_id') : null,
                'original_name'     => $file->getClientOriginalName(),
                'storage_path'      => $path,
                'size_bytes'        => $file->getSize(),
                'mime_type'         => $file->getMimeType(),
                'privacy'           => $request->input('privacy', 'private')
            ]);

            return response()->json([
                'success' => true,
                'message' => "Archivo cargado correctamente"
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error Interno'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $file = auth()->user()->files()->where("uuid", $id)->first();

        abort_if(!$file, 404);

        return response()->json([
            'success'   => true,
            'message'   => 'Archivo obtenido',
            'data'      => $file
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'privacy' => 'required|in:private,group,public'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success'   => false,
                'message'   => 'Datos incorrectos',
                'data'      => $validator->messages()
            ], 400);
        }

        $file = auth()->user()->files()->where("uuid", $id)->first();

        abort_if(!$file, 404);
        
        try {
            $file->fill($request->only('privacy'));
            $file->save();

            return response()->json([
                'success' => true,
                'message' => 'Permisos actualizados'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error Interno'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $file = auth()->user()->files()->where("uuid", $id)->first();

        abort_if(!$file, 404);

        $file->delete();

        return response()->json([
            'success' => true,
            'message' => 'Archivo movido a la papelera'
        ], 200);
    }

    /**
     * Download the specified resource from storage.
     */
    public function download(string $id)
    {
        $file = File::where('uuid', $id)->first();

        abort_if(
            !$file ||
            $file->privacy == "private" && auth()->id() != $file->user_id ||
            $file->privacy == "group" && auth()->id()->group_id != $file->user->group_id, 404);
        
        $fileContents = Storage::disk('s3')->get($file->storage_path);

        $mimeType = Storage::disk('s3')->mimeType($file->mime_type);

        return response($fileContents, 200)
                ->header('Content-Type', $file->mime_type)
                ->header('Content-Disposition', 'attachment; filename="' . basename($file->original_name) . '"');
    }

    /**
     * Display a listing of the resource from trash.
     */
    public function trash()
    {
        try {
            return response()->json([
                'success'   => true,
                'message'   => 'Listado de archivos en la papelera',
                'data'      => auth()->user()->files()->onlyTrashed()->get()->map(function ($file) {
                    return [
                        'id'            => $file->uuid,
                        'name'          => $file->original_name,
                        'size'          => $file->size_bytes,
                        'deleted_at'    => $file->deleted_at->format("d M Y")
                    ];
                })
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error Interno'
            ], 500);
        }
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(string $id)
    {
        $file = auth()->user()->files()->onlyTrashed()->where("uuid", $id)->first();

        abort_if(!$file, 404);

        $file->restore();

        return response()->json([
            'success' => true,
            'message' => 'Archivo restaurado'
        ], 200);
    }

    /**
     * Display a listing of the resource from shared files.
     */
    public function shared()
    {
        try {
            $files = File::where(function ($query) {
                            $query->where('privacy', 'public')
                                ->where('user_id', '<>', auth()->id());
                        });

            $group = auth()->user()->group;
            if ($group) {
                $files = $files->orWhere(function ($query) use ($group) {
                            $query->where('privacy', 'group')
                                ->whereIn('user_id', $group->users()->where('id', '<>', auth()->id())->pluck('id'));
                        });
            }

            $files = $files->get();

            return response()->json([
                'success'   => true,
                'message'   => 'Listado de archivos compartidos',
                'data'      => $files->map(function ($file) {
                    return [
                        'id'            => $file->uuid,
                        'name'          => $file->original_name,
                        'owner'         => $file->user->fullName(),
                        'privacy'       => $file->privacy,
                        'size'          => $file->size_bytes,
                        'created_at'    => $file->created_at->format("d M Y")
                    ];
                })
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error Interno'
            ], 500);
        }
    }
}