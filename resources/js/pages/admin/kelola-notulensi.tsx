import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link2, ExternalLink, Plus, Edit, Trash2 } from 'lucide-react';
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
        title: 'Kelola Notulensi',
        href: '/kelola-notulensi',
    },
];

interface NotulensiLink {
    id: number;
    title: string;
    gdrive_url: string;
    created_at: string;
    updated_at: string;
    total_tabs?: number;
    total_dates?: number;
}

interface KelolaNotulensiProps {
    links?: NotulensiLink[];
    success?: string;
}

export default function KelolaNotulensi({ links = [], success }: KelolaNotulensiProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<NotulensiLink | null>(null);
    const [formData, setFormData] = useState({ title: '', gdrive_url: '' });

    const handleOpenDialog = (link?: NotulensiLink) => {
        if (link) {
            setEditingLink(link);
            setFormData({ title: link.title, gdrive_url: link.gdrive_url });
        } else {
            setEditingLink(null);
            setFormData({ title: '', gdrive_url: '' });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingLink(null);
        setFormData({ title: '', gdrive_url: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLink) {
            router.put(`/notulensi-links/${editingLink.id}`, formData, {
                preserveScroll: true,
                onSuccess: () => {
                    handleCloseDialog();
                },
            });
        } else {
            router.post('/notulensi-links', formData, {
                preserveScroll: true,
                onSuccess: () => {
                    handleCloseDialog();
                },
            });
        }
    };

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [linkToDelete, setLinkToDelete] = useState<NotulensiLink | null>(null);

    const handleDelete = (link: NotulensiLink) => {
        setLinkToDelete(link);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (linkToDelete) {
            router.delete(`/notulensi-links/${linkToDelete.id}`, {
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
        const scanKey = 'kelola_notulensi_auto_scanned';
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

                    const response = await fetch('/notulensi/auto-scan', {
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
                    console.error('Error auto-scanning notulensi:', error);
                }
            }
        };

        autoScan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Notulensi" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kelola Notulensi</h1>
                        <p className="text-muted-foreground mt-2">
                            Kelola link Google Sheet untuk menyimpan notulensi. Setiap tab dengan format tanggal (contoh: "11 Des 2025") akan otomatis terdeteksi.
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
                        <CardTitle>Daftar Link Notulensi</CardTitle>
                        <CardDescription>
                            Daftar Google Sheet yang digunakan untuk menyimpan notulensi. Sheet akan otomatis di-scan saat ditambahkan atau diubah.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {links.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Belum ada link notulensi. Klik "Tambah Link" untuk menambahkan.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Judul</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Link Google Sheet</th>
                                            <th className="text-center py-3 px-4 font-semibold text-sm">Total Tab</th>
                                            <th className="text-center py-3 px-4 font-semibold text-sm">Total Tanggal</th>
                                            <th className="text-center py-3 px-4 font-semibold text-sm">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {links.map((link) => (
                                            <tr
                                                key={link.id}
                                                className="border-b hover:bg-muted/50 transition-colors"
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="font-medium">{link.title}</div>
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
                                                    <span className="text-sm">{link.total_tabs ?? 0}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="text-sm font-medium">{link.total_dates ?? 0}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleOpenDialog(link)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDelete(link)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
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

                {/* Dialog for Add/Edit */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingLink ? 'Edit Link Notulensi' : 'Tambah Link Notulensi'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingLink
                                    ? 'Ubah informasi link Google Sheet untuk notulensi.'
                                    : 'Tambahkan link Google Sheet baru untuk menyimpan notulensi. Setiap tab dengan format tanggal (contoh: "11 Des 2025") akan otomatis terdeteksi.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">
                                        Judul Notulensi *
                                    </Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        placeholder="Contoh: Notulensi Rapat Bulanan"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gdrive_url">
                                        Link Google Sheet *
                                    </Label>
                                    <div className="relative">
                                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="gdrive_url"
                                            type="url"
                                            value={formData.gdrive_url}
                                            onChange={(e) => setFormData({ ...formData, gdrive_url: e.target.value })}
                                            required
                                            placeholder="https://docs.google.com/spreadsheets/d/..."
                                            className="pl-10"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Pastikan Google Sheet dapat diakses publik atau API key memiliki akses yang tepat.
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                    Batal
                                </Button>
                                <Button type="submit">
                                    {editingLink ? 'Simpan Perubahan' : 'Simpan & Scan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Link Notulensi</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus link "{linkToDelete?.title}"? Semua data notulensi yang terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>
                                Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
