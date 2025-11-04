<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class File extends Model
{
    use SoftDeletes;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'user_id',
        'original_name',
        'storage_path',
        'size_bytes',
        'mime_type',
        'privacy'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
