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
        'sheet_id',
        'tab_name',
        'tab_id',
        'sheet_link',
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
}
