<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Models\User;
use App\Models\Setting;
use App\Services\StorageRulesService;

class AuthController extends Controller
{
    /**
     * Login with email and password
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'     => 'required|email',
            'password'  => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success'   => false,
                'message'   => 'No se proporcionarion credenciales válidas',
                'data'      => $validator->messages()
            ], 400);
        }

        $credentials = $request->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'success'   => false,
                    'message' => 'Credenciales incorrectas'
                ], 401);
            }
        } catch (JWTException $e) {
            return response()->json([
                'success'   => false,
                'message' => 'No se puede iniciar sesión'
            ], 500);
        }

        return response()->json([
            'success'       => true,
            'access_token'  => $token
        ]);
    }

    /**
     * Register new user from register route
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'      => 'required',
            'last_name' => 'required',
            'email'     => 'required|email|unique:users,email',
            'password'  => 'required|min:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success'   => false,
                'message'   => 'Datos incorrectos',
                'data'      => $validator->messages()
            ], 400);
        }

        $user = User::create([
            'name'          => $request->get('name'),
            'last_name'     => $request->get('last_name'),
            'email'         => $request->get('email'),
            'password'      => bcrypt($request->password),
            'role_id'       => 2,
            'quota_bytes'   => Setting::where('setting_name', 'default_quota_bytes')->first()->value
        ]);

        try {
            $token = JWTAuth::fromUser($user);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo inicar sesión'
            ], 500);
        }

        return response()->json([
            'success'       => true,
            'access_token'  => $token
        ], 201);
    }

    /**
     * Logout and invalidate access_token
     */
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (JWTException $e) {
            return response()->json(['message' => 'Failed to logout, please try again'], 500);
        }

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Get profile from auth provide
     */
    public function me()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            $storageService = new StorageRulesService();

            return response()->json([
                'success'   => true,
                'message'   => 'Perfil obtenido',
                'data'      => [
                    'id'            => $user->id,
                    'name'          => $user->name,
                    'last_name'     => $user->last_name,
                    'email'         => $user->email,
                    'quota'         => $storageService->assignedQuotaBytes($user),
                    'usage'         => $storageService->usedBytes($user),
                    'role'          => $user->role_id,
                    'group'         => $user->group_id ? true : false
                ]
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error Interno'
            ], 500);
        }
    }
}