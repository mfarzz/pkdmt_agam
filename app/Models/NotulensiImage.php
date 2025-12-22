<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotulensiImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'disaster_id',
        'image_path',
        'image_name',
        'description',
        'file_size',
        'mime_type',
        'order',
    ];

    protected $casts = [
        'date' => 'date',
        'file_size' => 'integer',
        'order' => 'integer',
    ];

    /**
     * Get the disaster that owns this notulensi image.
     */
    public function disaster()
    {
        return $this->belongsTo(Disaster::class);
    }
}
