import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ToastProps } from '@/components/ui/toast';

interface Toast extends Omit<ToastProps, 'onClose'> {
    onClose?: () => void;
}

interface ToastContextType {
    toasts: Toast[];
    toast: (props: Omit<Toast, 'id' | 'onClose'>) => string;
    dismiss: (id: string) => void;
    dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastCount = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback(
        ({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id' | 'onClose'>) => {
            const id = `toast-${++toastCount}`;
            const newToast: Toast = {
                id,
                title,
                description,
                variant,
                duration,
                onClose: () => {
                    setToasts((prev) => prev.filter((t) => t.id !== id));
                },
            };

            setToasts((prev) => [...prev, newToast]);
            return id;
        },
        []
    );

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const dismissAll = useCallback(() => {
        setToasts([]);
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

