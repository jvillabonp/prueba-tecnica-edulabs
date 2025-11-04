<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\File;
use App\Models\User;
use ZipArchive;

class StorageRulesService
{
    public function assignedQuotaBytes(User $user): int
    {
        if ($user->quota_bytes) return (int) $user->quota_bytes;

        if ($user->group()->exists()) return (int) $user->group->quota_bytes;
        
        return (int) (Setting::where('setting_name', 'default_quota_bytes')->first()->value);
    }

    public function usedBytes(User $user): int
    {
        if ($user->quota_bytes) return (int) $user->usage();

        if ($user->group()->exists()) return (int) $user->group->usage();
    }

    public function checkQuotaOrFail(User $user, int $newFileBytes): void
    {
        $assigned = $this->assignedQuotaBytes($user);

        $used = $this->usedBytes($user);

        if ($used + $newFileBytes > $assigned) {
            throw new \RuntimeException(
                sprintf('Cuota de almacenamiento (%.2f MB) excedida', $assigned / 1024 / 1024)
            );
        }
    }

    public function getBannedExtensions(): array
    {
        return json_decode(Setting::where('setting_name', 'banned_extensions')->first()->value);
    }

    public function isExtensionBanned(string $ext): bool
    {
        $ext = strtolower(ltrim($ext, '.'));
        $extensions = $this->getBannedExtensions();

        return in_array($ext, $extensions);
    }

    public function scanZipOrFail($file): void
    {
        $path = $file->getPathname();
        $zip = new ZipArchive();
        if ($zip->open($path) === true) {
            $banned = $this->getBannedExtensions();
            $bad = [];

            for ($i = 0; $i < $zip->numFiles; $i++) {
                $name = $zip->getNameIndex($i);
                $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                if (in_array($ext, $banned)) {
                    $bad[] = $name;
                }
            }

            $zip->close();
            if (!empty($bad)) {
                throw new \RuntimeException("El archivo(s) dentro del .zip no está permitido: " . implode(', ', $bad));
            }
        } else {
            throw new \RuntimeException('No se pudo abrir el ZIP para analizar.');
        }
    }
}