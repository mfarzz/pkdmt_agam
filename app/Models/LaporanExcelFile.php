<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LaporanExcelFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_name',
        'path',
        'original_name',
        'mime_type',
        'is_active',
        'disaster_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function disaster()
    {
        return $this->belongsTo(Disaster::class);
    }
}
