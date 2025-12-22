<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportWeek extends Model
{
    use HasFactory;

    protected $fillable = [
        'week_start_date',
        'week_end_date',
        'week_number',
        'year',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'description',
        'disaster_id',
    ];

    protected $casts = [
        'week_start_date' => 'date',
        'week_end_date' => 'date',
        'week_number' => 'integer',
        'year' => 'integer',
        'file_size' => 'integer',
    ];

    /**
     * Get the disaster that owns this week report.
     */
    public function disaster()
    {
        return $this->belongsTo(Disaster::class);
    }
}