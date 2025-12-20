import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
    data: Record<string, any>;
    storageKey: string;
    debounceMs?: number;
    onLoad?: (savedData: Record<string, any>) => void;
}

/**
 * Hook untuk auto-save form data ke localStorage
 * Mirip dengan Google Forms auto-save
 */
export function useAutoSave({ data, storageKey, debounceMs = 1000, onLoad }: UseAutoSaveOptions) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialLoadRef = useRef(true);

    // Load saved data on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsedData = JSON.parse(saved);
                if (onLoad && Object.keys(parsedData).length > 0) {
                    onLoad(parsedData);
                }
            }
        } catch (error) {
            console.error('Error loading auto-saved data:', error);
        }
        isInitialLoadRef.current = false;
    }, []); // Only run on mount

    // Auto-save on data change
    useEffect(() => {
        // Skip auto-save on initial load
        if (isInitialLoadRef.current) {
            return;
        }

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout for debounced save
        timeoutRef.current = setTimeout(() => {
            try {
                // Convert File objects to a serializable format
                const serializableData: Record<string, any> = {};
                for (const [key, value] of Object.entries(data)) {
                    // Skip file fields - they can't be stored in localStorage
                    // Files will need to be re-selected by user
                    if (value instanceof File) {
                        // Don't save file objects, just skip them
                        continue;
                    } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
                        // Don't save file arrays, just skip them
                        continue;
                    } else if (value === null || value === undefined) {
                        // Save null/undefined as empty string for consistency
                        serializableData[key] = '';
                    } else {
                        serializableData[key] = value;
                    }
                }
                localStorage.setItem(storageKey, JSON.stringify(serializableData));
            } catch (error) {
                console.error('Error auto-saving data:', error);
                // If storage is full, try to clear old data
                if (error instanceof DOMException && error.code === 22) {
                    console.warn('LocalStorage is full, clearing old auto-save data');
                    try {
                        localStorage.removeItem(storageKey);
                    } catch (clearError) {
                        console.error('Error clearing storage:', clearError);
                    }
                }
            }
        }, debounceMs);

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data, storageKey, debounceMs]);

    // Clear saved data
    const clearSaved = () => {
        try {
            localStorage.removeItem(storageKey);
        } catch (error) {
            console.error('Error clearing auto-saved data:', error);
        }
    };

    // Check if there's saved data
    const hasSavedData = (): boolean => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (!saved) return false;
            const parsed = JSON.parse(saved);
            return Object.keys(parsed).length > 0;
        } catch {
            return false;
        }
    };

    return { clearSaved, hasSavedData };
}

