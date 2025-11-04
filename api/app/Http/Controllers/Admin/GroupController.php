<?php

namespace App\Http\Controllers\Admin;

use App\Models\Group;
use App\Models\Setting;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

class GroupController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            return response()->json([
                'success'   => true,
                'message'   => 'Listado de grupos',
                'data'      => Group::all()->map(function ($group) {
                    return [
                        'id'            => $group->id,
                        'name'          => $group->name,
                        'quota'         => $group->quota_bytes,
                        'users'         => $group->users()->count(),
                        'usage'         => $group->usage()
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
            'name'          => 'required|unique:groups,name',
            'quota_bytes'   => 'numeric'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success'   => false,
                'message'   => 'Datos incorrectos',
                'data'      => $validator->messages()
            ], 400);
        }

        $data = [
            'name'          => $request->get('name'),
            'quota_bytes'   => (int) $request->get('quota_bytes', Setting::where('setting_name', 'default_quota_bytes')->first()->value)
        ];

        try {
            Group::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Grupo creado'
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
        $group = Group::find($id);
        
        abort_if(!$group, 404);
        
        return response()->json([
            'success'   => true,
            'message'   => 'Grupo encontrado',
            'data'      => $group
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $group = Group::find($id);
        
        abort_if(!$group, 404);

        $validator = Validator::make($request->all(), [
            'quota_bytes'   => 'numeric'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success'   => false,
                'message'   => 'Datos incorrectos',
                'data'      => $validator->messages()
            ], 400);
        }

        try {
            $data = [
                'quota_bytes' => (int) $request->get('quota_bytes', Setting::where('setting_name', 'default_quota_bytes')->first()->value)
            ];
            $group->fill($data);
            $group->save();

            return response()->json([
                'success'   => true,
                'message'   => 'Grupo actualizado'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success'   => false,
                'message'   => 'Error Interno'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $group = Group::find($id);
        
        abort_if(!$group, 404);

        $group->delete();

        return response()->json([
            'success'   => true,
            'message'   => 'Grupo eliminado'
        ], 200);
    }
}