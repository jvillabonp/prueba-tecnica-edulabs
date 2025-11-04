<?php

use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [App\Http\Controllers\AuthController::class, 'login']);
    Route::post('register', [App\Http\Controllers\AuthController::class, 'register']);
});

Route::middleware('auth')->group(function () {
    Route::get('me', [App\Http\Controllers\AuthController::class, 'me']);

    Route::prefix('file')->group(function () {
        Route::get('download/{uuid}', [App\Http\Controllers\FileController::class, 'download']);
        Route::get('trash', [App\Http\Controllers\FileController::class, 'trash']);
        Route::patch('trash/{id}', [App\Http\Controllers\FileController::class, 'restore']);
        Route::get('shared', [App\Http\Controllers\FileController::class, 'shared']);
    });
    
    Route::resource('file', App\Http\Controllers\FileController::class)->except(['create', 'edit']);

    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('setting', [App\Http\Controllers\Admin\SettingController::class, 'index']);
        Route::patch('setting', [App\Http\Controllers\Admin\SettingController::class, 'update']);

        Route::resource('group', App\Http\Controllers\Admin\GroupController::class)->except(['create', 'edit']);
        Route::resource('user', App\Http\Controllers\Admin\UserController::class)->except(['create', 'edit']);
    });
});