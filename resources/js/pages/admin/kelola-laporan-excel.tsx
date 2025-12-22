import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { FileSpreadsheet, Upload, Download, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Kelola File Excel Laporan',
        href: '/kelola-laporan-excel',
    },
];

interface LaporanExcelFile {
    id: number;
    file_name: string;
    file_path: string;
    original_name: string;
    file_size: number;
    mime_type: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface KelolaLaporanExcelProps {
    excelFile?: LaporanExcelFile;
    success?: string;
    error?: string;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export default function KelolaLaporanExcel({ excelFile, success, error }: KelolaLaporanExcelProps) {
    const [uploading, setUploading] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola File Excel Laporan - HEOC" />
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kelola File Excel Laporan</h1>
                    <p className="text-muted-foreground mt-2">
                        Unggah file Excel yang akan digunakan untuk pengisian laporan. File yang diunggah akan menggantikan file sebelumnya.
                    </p>
                </div>

                {success && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm font-medium text-green-700">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-700">
                        {error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Unggah File Excel</CardTitle>
                        <CardDescription>
                            Pilih file Excel (.xlsm) yang akan digunakan untuk pengisian laporan. Maksimal ukuran file 10MB.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;

                                if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                                    alert('Silakan pilih file terlebih dahulu.');
                                    return;
                                }

                                const formData = new FormData();
                                formData.append('excel_file', fileInput.files[0]);

                                console.log('Uploading file:', fileInput.files[0].name);
                                console.log('File size:', fileInput.files[0].size);
                                console.log('File type:', fileInput.files[0].type);

                                setUploading(true);
                                router.post('/laporan-excel', formData, {
                                    forceFormData: true,
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        setUploading(false);
                                        // Reset form
                                        form.reset();
                                    },
                                    onError: (errors) => {
                                        setUploading(false);
                                        console.error('Upload errors:', errors);
                                    },
                                });
                            }}
                            encType="multipart/form-data"
                            className="space-y-4"
                        >
                            <div>
                                <Label htmlFor="excel_file">File Excel</Label>
                                <Input
                                    id="excel_file"
                                    name="excel_file"
                                    type="file"
                                    accept=".xlsm"
                                    required
                                    disabled={uploading}
                                    className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Format yang didukung: .xlsm (Excel Macro-Enabled Workbook, Maksimal 10MB)
                                </p>
                            </div>

                            <Button type="submit" disabled={uploading}>
                                {uploading ? (
                                    <>
                                        <Spinner className="mr-2 h-4 w-4" />
                                        Mengunggah...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Unggah File
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {excelFile && (
                    <Card>
                        <CardHeader>
                            <CardTitle>File Excel Aktif</CardTitle>
                            <CardDescription>
                                File Excel yang saat ini digunakan untuk pengisian laporan
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-lg">
                                    <div className="rounded-lg bg-primary/10 p-3 flex-shrink-0">
                                        <FileSpreadsheet className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg break-words">{excelFile.original_name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Ukuran: {formatFileSize(excelFile.file_size)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Diunggah: {new Date(excelFile.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                window.open(`/laporan-excel/download`, '_blank');
                                            }}
                                            className="w-full sm:w-auto"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                if (confirm(`Apakah Anda yakin ingin menghapus file "${excelFile.original_name}"?`)) {
                                                    router.delete(`/laporan-excel/${excelFile.id}`, {
                                                        preserveScroll: true,
                                                    });
                                                }
                                            }}
                                            className="w-full sm:w-auto"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Hapus
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!excelFile && (
                    <Card>
                        <CardContent className="py-8">
                            <div className="text-center text-muted-foreground">
                                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Belum ada file Excel yang diunggah.</p>
                                <p className="text-sm mt-1">Silakan unggah file Excel untuk memulai.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

