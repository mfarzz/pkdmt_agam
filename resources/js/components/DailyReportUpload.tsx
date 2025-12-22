import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { Upload, X, FileText } from 'lucide-react';
import { useState, useRef } from 'react';

interface DailyReportUploadProps {
    isDmt: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DailyReportUpload({ isDmt, open, onOpenChange }: DailyReportUploadProps) {
    const [date, setDate] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            const validFiles: File[] = [];
            let currentError = '';

            fileArray.forEach(file => {
                // Validate file type
                if (file.type !== 'application/pdf') {
                    currentError = 'Beberapa file bukan format PDF';
                    return;
                }
                // Validate file size (2MB = 2048KB)
                if (file.size > 2 * 1024 * 1024) {
                    currentError = 'Beberapa file melebihi 2MB';
                    return;
                }
                validFiles.push(file);
            });

            if (currentError) {
                setError(currentError);
            } else {
                setError('');
            }

            // Filter out duplicates by name
            const existingFileNames = selectedFiles.map(f => f.name);
            const newFiles = validFiles.filter(file => !existingFileNames.includes(file.name));

            setSelectedFiles(prev => [...prev, ...newFiles]);

            // Reset input so the same file can be selected again if removed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!date || selectedFiles.length === 0) {
            setError('Semua field harus diisi');
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('date', date);
        formData.append('is_dmt', isDmt ? '1' : '0');

        // Append multiple files
        selectedFiles.forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });

        router.post('/report-dates/upload', formData, {
            onSuccess: () => {
                // Reset form
                setDate('');
                setSelectedFiles([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                onOpenChange(false);
                setUploading(false);
            },
            onError: (errors) => {
                console.error('Upload error:', errors);
                setError(Object.values(errors)[0] || 'Gagal upload file');
                setUploading(false);
            },
        });
    };

    const handleClose = () => {
        if (!uploading) {
            setDate('');
            setSelectedFiles([]);
            setError('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload Report Harian {isDmt ? 'DMT' : 'HEOC'}</DialogTitle>
                    <DialogDescription>
                        Upload file PDF untuk report harian. Maksimal ukuran file 2MB per file.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Date Input */}
                    <div className="space-y-2">
                        <Label htmlFor="date">Tanggal</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            disabled={uploading}
                        />
                    </div>

                    {/* File Input */}
                    <div className="space-y-2">
                        <Label>File PDF</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="file"
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                multiple
                                onChange={handleFileChange}
                                disabled={uploading}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                Pilih File
                            </Button>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                <p className="text-sm font-medium text-foreground">
                                    File yang dipilih ({selectedFiles.length}):
                                </p>
                                <div className="space-y-2">
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-muted rounded-md border border-border"
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                                onClick={() => handleRemoveFile(index)}
                                                disabled={uploading}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={uploading}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={uploading || selectedFiles.length === 0}>
                            {uploading ? (
                                <>
                                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
