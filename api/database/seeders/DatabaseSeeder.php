<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Setting::insert([
            [
                'setting_name'  => 'default_quota_bytes',
                'value'         => 10 * 1024 * 1024 // 10 MB
            ],
            [
                'setting_name'  => 'banned_extensions',
                'value'         => json_encode(['exe', 'bat', 'js', 'php', 'sh'])
            ]
        ]);


        Role::insert([
            ['name' => 'Administrador'],
            ['name' => 'Usuario']
        ]);

        User::insert([
            [
                'name'      => 'Administrador',
                'last_name' => 'Sistema',
                'email'     => 'admin@edu-labs.com.co',
                'password'  => bcrypt(123456),
                'role_id'   => 1,
                'quota_bytes' => 10 * 1024 * 1024
            ],
            [
                'name'      => 'Usuario',
                'last_name' => 'Edulabs',
                'email'     => 'usuario@edu-labs.com.co',
                'password'  => bcrypt(123456),
                'role_id'   => 2,
                'quota_bytes' => 10 * 1024 * 1024
            ]
        ]);
    }
}
