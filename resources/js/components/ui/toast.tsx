import * as React from 'react';
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
    id: string;
    title?: string;
    description?: string;
    variant?: 'default' | 'success' | 'error' | 'info' | 'loading';
    duration?: number;
    onClose?: () => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
    ({ id, title, description, variant = 'default', duration = 5000, onClose }, ref) => {
        React.useEffect(() => {
            if (variant !== 'loading' && duration > 0) {
                const timer = setTimeout(() => {
                    onClose?.();
                }, duration);
                return () => clearTimeout(timer);
            }
        }, [duration, variant, onClose]);

        const icons = {
            success: CheckCircle2,
            error: AlertCircle,
            info: Info,
            loading: Loader2,
            default: Info,
        };

        const styles = {
            default: 'bg-background border-border text-foreground',
            success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
            error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
            info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
            loading: 'bg-background border-border text-foreground',
        };

        const Icon = icons[variant];

        return (
            <div
                ref={ref}
                className={cn(
                    'relative flex w-full items-center gap-3 rounded-lg border p-4 shadow-lg transition-all',
                    styles[variant]
                )}
            >
                <Icon
                    className={cn(
                        'h-5 w-5 shrink-0',
                        variant === 'loading' && 'animate-spin'
                    )}
                />
                <div className="flex-1">
                    {title && (
                        <div className="font-semibold text-sm">{title}</div>
                    )}
                    {description && (
                        <div className="text-sm opacity-90 mt-1">{description}</div>
                    )}
                </div>
                {variant !== 'loading' && onClose && (
                    <button
                        onClick={onClose}
                        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        );
    }
);
Toast.displayName = 'Toast';

export { Toast };

