import { useState, useRef, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagInputProps {
    id?: string;
    value: string; // CSV string, e.g. "tenda 10 unit, genset 3 unit"
    onChange: (csv: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

/**
 * TagInput – type an item then press Enter or comma to add it as a chip.
 * The value is stored as a comma-separated string so the backend is unchanged.
 */
export default function TagInput({
    id,
    value,
    onChange,
    placeholder = 'Ketik lalu tekan Enter atau koma…',
    className,
    disabled,
}: TagInputProps) {
    // Split the CSV string into an array of non-empty trimmed tags
    const tags = value
        ? value
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
        : [];

    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const commit = (raw: string) => {
        const trimmed = raw.trim().replace(/,+$/, '').trim();
        if (!trimmed) return;
        if (!tags.includes(trimmed)) {
            const next = [...tags, trimmed];
            onChange(next.join(', '));
        }
        setInputValue('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commit(inputValue);
        } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            const next = tags.slice(0, -1);
            onChange(next.join(', '));
        }
    };

    const handleInputChange = (raw: string) => {
        if (raw.includes(',')) {
            const parts = raw.split(',');
            const toCommit = parts.slice(0, -1);
            const remaining = parts[parts.length - 1];
            toCommit.forEach((p) => commit(p));
            setInputValue(remaining);
        } else {
            setInputValue(raw);
        }
    };

    const removeTag = (index: number) => {
        const next = tags.filter((_, i) => i !== index);
        onChange(next.join(', '));
    };

    return (
        <div
            id={id ? `${id}-wrapper` : undefined}
            className={cn(
                'flex flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                'min-h-[2.5rem] cursor-text',
                disabled && 'opacity-50 cursor-not-allowed',
                className,
            )}
            onClick={() => inputRef.current?.focus()}
        >
            {tags.map((tag, i) => (
                <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium"
                >
                    {tag}
                    {!disabled && (
                        <button
                            type="button"
                            aria-label={`Hapus ${tag}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTag(i);
                            }}
                            className="ml-0.5 rounded-full hover:bg-primary/20 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </span>
            ))}
            <input
                ref={inputRef}
                id={id}
                type="text"
                value={inputValue}
                disabled={disabled}
                placeholder={tags.length === 0 ? placeholder : ''}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => commit(inputValue)}
                className="flex-1 min-w-[140px] bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            />
        </div>
    );
}
