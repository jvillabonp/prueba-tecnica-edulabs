<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Group extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'quota_bytes'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'deleted_at'
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function usage(): int
    {
        $usersWithoutQuota = $this->users()->whereNull('quota_bytes')->with('files')->get();

        return (int) $usersWithoutQuota->reduce(function ($carry, $user) {
            return $carry + $user->files->sum('size_bytes');
        }, 0);
    }
}
