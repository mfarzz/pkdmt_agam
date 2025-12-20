<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'type',
        'title',
        'message',
        'dmt_data_id',
        'disaster_id',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    /**
     * Get the DMT data associated with this notification.
     */
    public function dmtData(): BelongsTo
    {
        return $this->belongsTo(DmtData::class, 'dmt_data_id');
    }

    /**
     * Get the disaster associated with this notification.
     */
    public function disaster(): BelongsTo
    {
        return $this->belongsTo(Disaster::class, 'disaster_id');
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(): void
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }
}
