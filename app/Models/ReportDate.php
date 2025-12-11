<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportDate extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_link_id',
        'date',
        'folder_link',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    /**
     * Get the report link that owns this date.
     */
    public function reportLink()
    {
        return $this->belongsTo(ReportLink::class);
    }
}
