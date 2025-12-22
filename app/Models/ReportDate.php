<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportDate extends Model
{
    use HasFactory;

    protected $fillable = [
        'disaster_id',
        'is_dmt',
        'date',
        'file_path',
        'file_name',
        'file_size',
        'uploaded_by',
    ];

    protected $casts = [
        'date' => 'date',
        'is_dmt' => 'boolean',
    ];
}
