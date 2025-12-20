import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

// Helper to get CSRF token
const getCsrfToken = (): string | null => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : null;
};

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    dmt_data_id?: number;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const headers: HeadersInit = {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }
            const response = await fetch('/notifications', {
                headers,
                credentials: 'same-origin',
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const headers: HeadersInit = {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }
            const response = await fetch('/notifications/count', {
                headers,
                credentials: 'same-origin',
            });
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.count || 0);
            }
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            fetchUnreadCount();
            if (!isOpen) {
                fetchNotifications();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            const headers: HeadersInit = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }
            const response = await fetch(`/notifications/${notificationId}/read`, {
                method: 'POST',
                headers,
                credentials: 'same-origin',
            });
            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notificationId ? { ...n, is_read: true } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const headers: HeadersInit = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }
            const response = await fetch('/notifications/read-all', {
                method: 'POST',
                headers,
                credentials: 'same-origin',
            });
            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => ({ ...n, is_read: true }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            handleMarkAsRead(notification.id);
        }

        // Navigate to DMT registration detail if it's a DMT registration notification
        if (notification.type === 'dmt_registration' && notification.dmt_data_id) {
            router.visit(`/kelola-pendaftaran/${notification.dmt_data_id}`);
            setIsOpen(false);
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                    <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs"
                            onClick={handleMarkAllAsRead}
                        >
                            Tandai semua sudah dibaca
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        Tidak ada notifikasi
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start justify-between w-full gap-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">
                                                {notification.title}
                                            </span>
                                            {!notification.is_read && (
                                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {notification.created_at}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

