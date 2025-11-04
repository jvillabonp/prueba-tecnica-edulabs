<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

class SettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            return response()->json([
                'success'   => true,
                'message'   => 'Ajustes obtenidos',
                'data'      => [
                    'quota'         => Setting::where('setting_name', 'default_quota_bytes')->first()->value,
                    'extensions'    => json_decode(Setting::where('setting_name', 'banned_extensions')->first()->value)
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error Interno'
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'quota'         => 'required|numeric',
            'extensions'    => 'required|array|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success'   => false,
                'message'   => 'Datos incorrectos',
                'data'      => $validator->messages()
            ], 400);
        }

        $quota = (int) $request->get('quota');
        $extensions = $request->get("extensions");

        try {
            Setting::where("id", 1)->update(["value" => $quota]);
            Setting::where("id", 2)->update(["value" => json_encode($extensions)]);

            return response()->json([
                'success' => true,
                'message' => 'Ajustes actualizados'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error Interno'
            ], 500);
        }
    }
}
