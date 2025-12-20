<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InfografisLink extends Model
{
    protected $fillable = [
        'gdrive_url',
        'title',
        'disaster_id',
    ];

    /**
     * Get all infografis for this link.
     */
    public function infografis()
    {
        return $this->hasMany(Infografis::class);
    }
}
