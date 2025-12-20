<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotulensiLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'gdrive_url',
        'disaster_id',
    ];

    public function disaster()
    {
        return $this->belongsTo(Disaster::class);
    }

    /**
     * Get all notulensi dates for this link.
     */
    public function notulensiDates()
    {
        return $this->hasMany(NotulensiDate::class);
    }
}
