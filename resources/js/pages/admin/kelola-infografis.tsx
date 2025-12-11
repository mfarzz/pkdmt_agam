import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Form, router, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Image, Link2, ExternalLink, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
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
        title: 'Kelola Infografis',
        href: '/kelola-infografis',
    },
];

interface InfografisLink {
    id: number;
    gdrive_url: string;
    created_at: string;
    updated_at: string;
}

interface InfografisItem {
    id: number;
    file_id: string;
    file_name: string;
    file_url: string;
    thumbnail_url: string | null;
    file_size: number | null;
    mime_type: string;
    created_at: string;
    updated_at: string;
}

interface KelolaInfografisProps {
    infografisLink?: InfografisLink;
    infografis?: {
        data: InfografisItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    success?: string;
    error?: string;
}

export default function KelolaInfografis({ infografisLink, infografis, success, error }: KelolaInfografisProps) {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [linkToDelete, setLinkToDelete] = useState<InfografisLink | null>(null);

    const infografisData = infografis?.data || [];
    const paginationLinks = infografis?.links || [];

    // Auto-scan infografis folder on page load - using same logic as scan button
    useEffect(() => {
        // Check if already scanned in this session
        const scanKey = 'kelola_infografis_auto_scanned';
        if (sessionStorage.getItem(scanKey)) {
            return;
        }

        const autoScan = async () => {
            if (infografisLink) {
                try {
                    // Get CSRF token from cookie
                    const getCookie = (name: string) => {
                        const value = `; ${document.cookie}`;
                        const parts = value.split(`; ${name}=`);
                        if (parts.length === 2) return parts.pop()?.split(';').shift();
                        return null;
                    };

                    const csrfToken = getCookie('XSRF-TOKEN');

                    const response = await fetch('/infografis/auto-scan', {
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
                            router.reload({ only: ['infografis'] });
                        }
                    }
                } catch (error) {
                    console.error('Error auto-scanning infografis:', error);
                }
            }
        };

        autoScan();
    }, [infografisLink]);

    const handleDeleteClick = () => {
        if (infografisLink) {
            setLinkToDelete(infografisLink);
            setDeleteConfirmOpen(true);
        }
    };

    const handleDeleteConfirm = () => {
        if (linkToDelete) {
            router.delete(`/infografis-links/${linkToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteConfirmOpen(false);
                    setLinkToDelete(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Infografis" />
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kelola Infografis</h1>
                    <p className="text-muted-foreground mt-2">
                        Kelola link Google Drive folder untuk menyimpan infografis
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
                        <CardTitle>Link Google Drive Folder</CardTitle>
                        <CardDescription>
                            Masukkan link Google Drive folder yang berisi file infografis (PNG, JPG). Sistem akan menampilkan semua file gambar di folder tersebut.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="post"
                            action="/infografis-links"
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="gdrive_url">
                                            Link Google Drive Folder *
                                        </Label>
                                        <div className="relative">
                                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="gdrive_url"
                                                name="gdrive_url"
                                                type="url"
                                                defaultValue={infografisLink?.gdrive_url || ''}
                                                required
                                                placeholder="https://drive.google.com/drive/folders/..."
                                                className="pl-10"
                                            />
                                        </div>
                                        <InputError message={errors.gdrive_url} />
                                        <p className="text-xs text-muted-foreground">
                                            Pastikan folder dapat diakses publik atau API key memiliki akses yang tepat.
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                        <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                            {processing ? (
                                                <>
                                                    <Spinner />
                                                    Memindai Folder...
                                                </>
                                            ) : (
                                                <>
                                                    <Image className="mr-2 h-4 w-4" />
                                                    Simpan & Scan Folder
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>

                        {infografisLink && (
                            <div className="mt-6 p-4 bg-muted rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-2">Folder Saat Ini:</h3>
                                        <a
                                            href={infografisLink.gdrive_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline flex items-center gap-1 break-words"
                                        >
                                            <span className="break-all">{infografisLink.gdrive_url}</span>
                                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                        </a>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Terakhir diperbarui: {new Date(infografisLink.updated_at).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDeleteClick}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Hapus
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Infografis</CardTitle>
                        <CardDescription>
                            Infografis yang ditemukan di folder. Total: {infografis?.total || 0} file
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {infografisData.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Belum ada infografis. Simpan link folder terlebih dahulu.
                            </div>
                        ) : (
                            <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {infografisData.map((item) => (
                                    <div
                                        key={item.id}
                                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        <div className="aspect-video bg-muted relative">
                                            <img
                                                src={`/infografis/${item.id}/image`}
                                                alt={item.file_name}
                                                className="w-full h-full object-contain"
                                                loading="lazy"
                                                crossOrigin="anonymous"
                                                referrerPolicy="no-referrer"
                                                onError={(e) => {
                                                    // Fallback: try using file_url if thumbnail fails
                                                    const target = e.target as HTMLImageElement;
                                                    if (target.src !== item.file_url) {
                                                        target.src = item.file_url;
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="p-3">
                                            <p className="text-sm font-medium truncate" title={item.file_name}>
                                                {item.file_name}
                                            </p>
                                            {item.file_size && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {(item.file_size / 1024).toFixed(2)} KB
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {infografis && infografis.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-center gap-2">
                                    {/* Previous Button */}
                                    {infografis.current_page > 1 && paginationLinks[0]?.url && (
                                        <Link
                                            href={paginationLinks[0].url}
                                            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Sebelumnya
                                        </Link>
                                    )}

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {paginationLinks.slice(1, -1).map((link, index) => {
                                            if (!link.url) {
                                                return (
                                                    <span
                                                        key={`ellipsis-${index}`}
                                                        className="px-3 py-2 text-sm text-muted-foreground"
                                                    >
                                                        {link.label}
                                                    </span>
                                                );
                                            }

                                            return (
                                                <Link
                                                    key={link.url}
                                                    href={link.url}
                                                    className={`inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                                        link.active
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                                                    }`}
                                                >
                                                    {link.label}
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    {/* Next Button */}
                                    {infografis.current_page < infografis.last_page && paginationLinks[paginationLinks.length - 1]?.url && (
                                        <Link
                                            href={paginationLinks[paginationLinks.length - 1].url as string}
                                            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            Selanjutnya
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Link>
                                    )}
                                </div>
                            )}

                            {/* Pagination Info */}
                            {infografis && (
                                <div className="mt-4 text-center text-sm text-muted-foreground">
                                    Menampilkan {((infografis.current_page - 1) * infografis.per_page) + 1} - {Math.min(infografis.current_page * infografis.per_page, infografis.total)} dari {infografis.total} infografis
                                </div>
                            )}
                        </>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Link Infografis</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus link Google Drive folder ini? Semua infografis yang terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
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

