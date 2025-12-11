<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotulensiSheet extends Model
{
    use HasFactory;

    protected $fillable = [
        'sheet_id',
        'sheet_name',
        'sheet_url',
        'total_tabs',
        'total_dates',
        'last_scanned_at',
    ];

    protected $casts = [
        'last_scanned_at' => 'datetime',
    ];
}
