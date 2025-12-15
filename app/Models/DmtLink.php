<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DmtLink extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'gdrive_url',
        'title',
        'disaster_id',
    ];

    /**
     * Get all DMT data for this link.
     */
    public function dmtData()
    {
        return $this->hasMany(DmtData::class);
    }
}
