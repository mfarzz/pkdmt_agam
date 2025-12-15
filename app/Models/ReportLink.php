<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'is_public',
        'title',
        'disaster_id',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function disaster()
    {
        return $this->belongsTo(Disaster::class);
    }

    /**
     * Get the report dates for this link.
     */
    public function reportDates()
    {
        return $this->hasMany(ReportDate::class);
    }
}
