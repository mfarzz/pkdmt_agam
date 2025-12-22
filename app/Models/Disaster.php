<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disaster extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function reportLinks()
    {
        return $this->hasMany(ReportLink::class);
    }

    public function notulensiLinks()
    {
        return $this->hasMany(NotulensiLink::class);
    }

    public function infografisLinks()
    {
        return $this->hasMany(InfografisLink::class);
    }


    public function laporanExcelFiles()
    {
        return $this->hasMany(LaporanExcelFile::class);
    }
}
