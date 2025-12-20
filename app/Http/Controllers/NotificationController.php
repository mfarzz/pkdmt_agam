<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Get unread notifications count.
     */
    public function count(Request $request): JsonResponse
    {
        $disasterId = $request->session()->get('admin_active_disaster_id');
        
        $count = Notification::where('is_read', false)
            ->where(function ($query) use ($disasterId) {
                $query->where('disaster_id', $disasterId)
                    ->orWhereNull('disaster_id');
            })
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Get notifications list.
     */
    public function index(Request $request): JsonResponse
    {
        $disasterId = $request->session()->get('admin_active_disaster_id');
        $limit = $request->get('limit', 10);

        $notifications = Notification::where(function ($query) use ($disasterId) {
                $query->where('disaster_id', $disasterId)
                    ->orWhereNull('disaster_id');
            })
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'is_read' => $notification->is_read,
                    'created_at' => $notification->created_at->diffForHumans(),
                    'dmt_data_id' => $notification->dmt_data_id,
                ];
            });

        return response()->json(['notifications' => $notifications]);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $disasterId = $request->session()->get('admin_active_disaster_id');

        Notification::where('is_read', false)
            ->where(function ($query) use ($disasterId) {
                $query->where('disaster_id', $disasterId)
                    ->orWhereNull('disaster_id');
            })
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['success' => true]);
    }
}
