import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Eye, Trash2, ExternalLink } from 'lucide-react';
import { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Kelola Report',
        href: '#',
    },
    {
        title: 'Report Mingguan',
        href: '/kelola-report-mingguan',
    },
];

interface ReportWeek {
    id: number;
    week_start_date: string;
    week_end_date: string;
    week_number: number;
    year: number;
    week_period: string;
    source_type: 'manual' | 'gdrive';
    file_path: string | null;
    file_name: string | null;
    file_size: number | null;
    description: string | null;
}

interface KelolaReportMingguanProps {
    weeklyReports?: ReportWeek[];
    success?: string;
}

export default function KelolaReportMingguan({ weeklyReports = [], success }: KelolaReportMingguanProps) {
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [uploadFormData, setUploadFormData] = useState({
        week_start_date: '',
        week_end_date: '',
        description: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [previewWeek, setPreviewWeek] = useState<ReportWeek | null>(null);
    const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

    const [deleteWeek, setDeleteWeek] = useState<ReportWeek | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('week_start_date', uploadFormData.week_start_date);
        formData.append('week_end_date', uploadFormData.week_end_date);
        formData.append('description', uploadFormData.description);
        formData.append('file', selectedFile);

        router.post('/report-weeks/upload', formData, {
            onSuccess: () => {
                setIsUploadDialogOpen(false);
                setUploadFormData({ week_start_date: '', week_end_date: '', description: '' });
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setUploading(false);
            },
            onError: () => {
                setUploading(false);
            },
        });
    };

    const handleDelete = () => {
        if (!deleteWeek) return;

        router.delete(`/report-weeks/${deleteWeek.id}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setDeleteWeek(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Report Mingguan - HEOC" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Report Mingguan</h1>
                        <p className="text-muted-foreground mt-2">
                            Upload dan kelola report mingguan (PDF, max 2MB).
                        </p>
                    </div>
                    <Button onClick={() => setIsUploadDialogOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Report
                    </Button>
                </div>

                {success && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm font-medium text-green-700">
                        {success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Report Mingguan</CardTitle>
                        <CardDescription>
                            Report mingguan yang sudah diupload.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {weeklyReports.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Belum ada report mingguan. Klik "Upload Report" untuk menambahkan.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Periode</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Minggu Ke</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">File</th>
                                            <th className="text-center py-3 px-4 font-semibold text-sm">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {weeklyReports.map((week) => (
                                            <tr key={week.id} className="border-b hover:bg-muted/50">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium">{week.week_period}</div>
                                                    {week.description && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {week.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm">Minggu {week.week_number}, {week.year}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {week.file_name ? (
                                                        <div className="text-sm flex items-center gap-2">
                                                            <FileText className="h-4 w-4" />
                                                            {week.file_name}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-muted-foreground">-</div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setPreviewWeek(week);
                                                                setIsPreviewDialogOpen(true);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {week.source_type === 'manual' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setDeleteWeek(week);
                                                                    setIsDeleteDialogOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upload Dialog */}
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload Report Mingguan</DialogTitle>
                            <DialogDescription>
                                Upload file PDF untuk report mingguan. Maksimal ukuran file 2MB.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUploadSubmit}>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="week_start_date">Tanggal Mulai *</Label>
                                        <Input
                                            id="week_start_date"
                                            type="date"
                                            value={uploadFormData.week_start_date}
                                            onChange={(e) => setUploadFormData({ ...uploadFormData, week_start_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="week_end_date">Tanggal Selesai *</Label>
                                        <Input
                                            id="week_end_date"
                                            type="date"
                                            value={uploadFormData.week_end_date}
                                            onChange={(e) => setUploadFormData({ ...uploadFormData, week_end_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Deskripsi (Opsional)</Label>
                                    <Input
                                        id="description"
                                        value={uploadFormData.description}
                                        onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                                        placeholder="Contoh: Report Minggu Pertama Desember"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="file">File PDF *</Label>
                                    <Input
                                        id="file"
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        required
                                    />
                                    {selectedFile && (
                                        <p className="text-sm text-muted-foreground">
                                            📄 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                        </p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={uploading}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={uploading || !selectedFile}>
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Preview Dialog */}
                <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Detail Report Mingguan</DialogTitle>
                        </DialogHeader>
                        {previewWeek && (
                            <div className="space-y-4">
                                <div>
                                    <Label>Periode</Label>
                                    <p className="text-sm mt-1">{previewWeek.week_period}</p>
                                </div>
                                <div>
                                    <Label>Minggu Ke / Tahun</Label>
                                    <p className="text-sm mt-1">Minggu {previewWeek.week_number}, {previewWeek.year}</p>
                                </div>
                                {previewWeek.description && (
                                    <div>
                                        <Label>Deskripsi</Label>
                                        <p className="text-sm mt-1">{previewWeek.description}</p>
                                    </div>
                                )}
                                <div>
                                    {previewWeek.file_path ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => window.open(previewWeek.file_path!, '_blank')}
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Buka File
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                                Tutup
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Report?</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus report "{deleteWeek?.week_period}"? Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
