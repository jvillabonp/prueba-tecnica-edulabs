<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use App\Models\Setting;
use App\Http\Controllers\Controller;
use App\Services\StorageRulesService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $storageService = new StorageRulesService();
            
            return response()->json([
                'success'   => true,
                'message'   => 'Listado de usuarios',
                'data'      => User::with(['group', 'role'])->get()->map(function ($user) use ($storageService) {
                    return [
                        'id'        => $user->id,
                        'fullName'  => $user->fullName(),
                        'email'     => $user->email,
                        'group'     => $user->group ? $user->group->name : null,
                        'role'      => $user->role ? $user->role->name : null,
                        'quota'     => $storageService->assignedQuotaBytes($user),
                        'usage'     => $storageService->usedBytes($user),
                    ];
                })
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success'   => false,
                'message'   => 'Error Interno'
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'          => 'required',
            'last_name'     => 'required',
            'email'         => 'required|email|unique:users',
            'role_id'       => 'required|exists:roles,id',
            'group_id'      => 'nullable|exists:groups,id',
            'quota_bytes'   => 'numeric',
            'password'      => 'required|min:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success'   => false,
                'message'   => 'Datos incorrectos',
                'data'      => $validator->messages()
            ], 400);
        }

        $data = $request->only('name', 'last_name', 'email', 'role_id', 'group_id');
        $data['password'] = bcrypt($request->get('password'));
        $data['quota_bytes'] = (int) $request->get('quota_bytes');
        if ($data['quota_bytes'] == 0 && !(int) $request->get('group_id')) {
            $data['quota_bytes'] = Setting::where('setting_name', 'default_quota_bytes')->first()->value;
        }

        if ($data['quota_bytes'] == 0 && (int) $request->get('group_id')) {
            $data['quota_bytes'] = null;
        }

        try {
            User::create($data);

            return response()->json([
                'success'   => true,
                'message'   => 'Usuario creado'
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success'   => false,
                'message'   => 'Error Interno'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::find($id);
        
        abort_if(!$user, 404);
        
        return response()->json([
            'success'   => true,
            'message'   => 'Usuario encontrado',
            'data'      => $user
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::find($id);
        
        abort_if(!$user, 404);

        $validator = Validator::make($request->all(), [
            'name'          => 'required',
            'last_name'     => 'required',
            'role_id'       => 'required|exists:roles,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success'   => false,
                'message'   => 'Datos incorrectos',
                'data'      => $validator->messages()
            ], 400);
        }

        $data = $request->only("name", "last_name", "role_id");

        $groupId = (int) $request->get('group_id');
        $password = $request->get("password");
        $quota = (int) $request->get('quota_bytes');
        $defaultQuota = (int) Setting::where('setting_name', 'default_quota_bytes')->first()->value;

        if ($password !== "" && $password) {
            $data["password"] = bcrypt($password);
        }

        if (!$groupId) {
            $data["group_id"] = null;
            $data["quota_bytes"] = $quota;
        }

        if (!$groupId && $quota == 0) {
            $data["quota_bytes"] = $defaultQuota;
        }

        if ($groupId) {
            $data["group_id"] = $groupId;
            $data["quota_bytes"] = $quota == 0 ? null : $quota;
        }

        try {
            $user->fill($data);
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Usuario actualizado'
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
        $user = User::find($id);
        
        abort_if(!$user || $id == auth()->id(), 404);

        $user->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado'
        ], 200);
    }
}