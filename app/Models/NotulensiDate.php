<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotulensiDate extends Model
{
    use HasFactory;

    protected $fillable = [
        'notulensi_link_id',
        'date',
        'type',
        'sheet_id',
        'tab_name',
        'tab_id',
        'sheet_link',
        'disaster_id',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    /**
     * Get the notulensi link that owns this date.
     */
    public function notulensiLink()
    {
        return $this->belongsTo(NotulensiLink::class);
    }

    /**
     * Get the disaster that owns this notulensi date.
     */
    public function disaster()
    {
        return $this->belongsTo(Disaster::class);
    }

    /**
     * Get all images for this notulensi date (if type is image).
     */
    public function images()
    {
        return $this->hasMany(NotulensiImage::class, 'date', 'date')
            ->where('disaster_id', $this->disaster_id)
            ->orderBy('created_at', 'asc');
    }
}
