<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'url',
        'description',
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
