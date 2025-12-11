<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Infografis extends Model
{
    protected $fillable = [
        'infografis_link_id',
        'file_id',
        'file_name',
        'file_url',
        'thumbnail_url',
        'file_size',
        'mime_type',
    ];

    /**
     * Get the infografis link that owns this infografis.
     */
    public function infografisLink()
    {
        return $this->belongsTo(InfografisLink::class);
    }
}
