import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link2, ExternalLink, Plus, Edit, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
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
        href: '/kelola-report',
    },
];

interface ReportLink {
    id: number;
    title: string;
    is_public: boolean;
    gdrive_url: string;
    created_at: string;
    updated_at: string;
    total_dates?: number;
}

interface KelolaReportProps {
    links?: ReportLink[];
    success?: string;
}

export default function KelolaReport({ links = [], success }: KelolaReportProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<ReportLink | null>(null);
    const [formData, setFormData] = useState({ title: '', is_public: true, gdrive_url: '' });

    const handleOpenDialog = (link?: ReportLink) => {
        if (link) {
            setEditingLink(link);
            setFormData({ title: link.title, is_public: link.is_public, gdrive_url: link.gdrive_url });
        } else {
            setEditingLink(null);
            setFormData({ title: '', is_public: true, gdrive_url: '' });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingLink(null);
        setFormData({ title: '', is_public: true, gdrive_url: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLink) {
            router.put(`/report-links/${editingLink.id}`, formData, {
                preserveScroll: true,
                onSuccess: () => {
                    handleCloseDialog();
                },
            });
        } else {
            router.post('/report-links', formData, {
                preserveScroll: true,
                onSuccess: () => {
                    handleCloseDialog();
                },
            });
        }
    };

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [linkToDelete, setLinkToDelete] = useState<ReportLink | null>(null);

    const handleDelete = (link: ReportLink) => {
        setLinkToDelete(link);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (linkToDelete) {
            router.delete(`/report-links/${linkToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteConfirmOpen(false);
                    setLinkToDelete(null);
                },
            });
        }
    };

    // Auto-scan all links on page load
    useEffect(() => {
        const scanKey = 'kelola_report_auto_scanned';
        if (sessionStorage.getItem(scanKey)) {
            return;
        }

        const autoScan = async () => {
            if (links.length > 0) {
                try {
                    // Get CSRF token from cookie
                    const getCookie = (name: string) => {
                        const value = `; ${document.cookie}`;
                        const parts = value.split(`; ${name}=`);
                        if (parts.length === 2) return parts.pop()?.split(';').shift();
                        return null;
                    };

                    const csrfToken = getCookie('XSRF-TOKEN');

                    const response = await fetch('/rekap/auto-scan', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
                        },
                        credentials: 'same-origin',
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                            console.log('Auto-scan completed:', result.message);
                            sessionStorage.setItem(scanKey, 'true');
                            router.reload({ only: ['links'] });
                        }
                    }
                } catch (error) {
                    console.error('Error auto-scanning report links:', error);
                }
            }
        };

        autoScan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Report" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kelola Report</h1>
                        <p className="text-muted-foreground mt-2">
                            Kelola link Google Drive untuk report. Folder PDF akan otomatis di-scan dan folder tanggal akan terdeteksi.
                        </p>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Link
                    </Button>
                </div>

                {success && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm font-medium text-green-700">
                        {success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Link Report</CardTitle>
                        <CardDescription>
                            Daftar Google Drive folder yang digunakan untuk menyimpan report. Folder PDF akan otomatis di-scan saat ditambahkan atau diubah.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {links.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Belum ada link report. Klik "Tambah Link" untuk menambahkan.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Judul</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Akses</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Link Google Drive</th>
                                            <th className="text-center py-3 px-4 font-semibold text-sm">Total Tanggal</th>
                                            <th className="text-center py-3 px-4 font-semibold text-sm">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {links.map((link) => (
                                            <tr key={link.id} className="border-b hover:bg-muted/50">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium">{link.title}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm">
                                                        {link.is_public ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Publik
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                                Hanya Login
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <a
                                                        href={link.gdrive_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-primary hover:underline flex items-center gap-1 max-w-md truncate"
                                                        title={link.gdrive_url}
                                                    >
                                                        {link.gdrive_url}
                                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                    </a>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="text-sm font-medium">{link.total_dates || 0}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOpenDialog(link)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(link)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
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

                {/* Add/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingLink ? 'Edit Link Report' : 'Tambah Link Report'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingLink
                                    ? 'Ubah informasi link report. Folder PDF akan otomatis di-scan ulang setelah disimpan.'
                                    : 'Tambahkan link Google Drive folder untuk report. Folder PDF akan otomatis di-scan setelah disimpan.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Contoh: Report DMT"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="is_public"
                                            checked={formData.is_public}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked as boolean })}
                                        />
                                        <Label htmlFor="is_public" className="text-sm font-medium cursor-pointer">
                                            Akses Publik
                                        </Label>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Jika dicentang, report dapat diakses oleh semua pengunjung. Jika tidak dicentang, hanya pengguna yang login yang dapat mengakses.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gdrive_url">Link Google Drive *</Label>
                                    <div className="relative">
                                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="gdrive_url"
                                            type="url"
                                            value={formData.gdrive_url}
                                            onChange={(e) => setFormData({ ...formData, gdrive_url: e.target.value })}
                                            placeholder="https://drive.google.com/drive/folders/..."
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Masukkan link Google Drive folder utama. Di dalam folder ini harus ada folder "PDF" yang berisi folder per tanggal (format: "8 des 2025").
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                    Batal
                                </Button>
                                <Button type="submit">
                                    {editingLink ? 'Simpan Perubahan' : 'Tambah Link'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Link Report?</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus link "{linkToDelete?.title}"? Semua data tanggal yang terkait dengan link ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                                Batal
                            </Button>
                            <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>
                                Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
