import { Toast } from '@/components/ui/toast';
import { useToast } from '@/contexts/toast-context';

export function Toaster() {
    const { toasts } = useToast();

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[420px] w-full">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    title={toast.title}
                    description={toast.description}
                    variant={toast.variant}
                    duration={toast.duration}
                    onClose={() => toast.onClose?.()}
                />
            ))}
        </div>
    );
}

