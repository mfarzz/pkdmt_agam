import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Form, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { FileSpreadsheet, Link2, Trash2 } from 'lucide-react';
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
        title: 'Kelola DMT',
        href: '/kelola-dmt',
    },
];

interface DmtLink {
    id: number;
    gdrive_url: string;
    created_at: string;
    updated_at: string;
}

interface KelolaDmtProps {
    dmtLink?: DmtLink;
    totalDmt?: number;
    success?: string;
    error?: string;
}

export default function KelolaDmt({ dmtLink, totalDmt, success, error }: KelolaDmtProps) {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [linkToDelete, setLinkToDelete] = useState<DmtLink | null>(null);

    // Auto-scan DMT sheet on page load - using same logic as scan button
    useEffect(() => {
        // Check if already scanned in this session
        const scanKey = 'kelola_dmt_auto_scanned';
        if (sessionStorage.getItem(scanKey)) {
            return;
        }

        const autoScan = async () => {
            if (dmtLink) {
                try {
                    // Get CSRF token from cookie
                    const getCookie = (name: string) => {
                        const value = `; ${document.cookie}`;
                        const parts = value.split(`; ${name}=`);
                        if (parts.length === 2) return parts.pop()?.split(';').shift();
                        return null;
                    };
                    
                    const csrfToken = getCookie('XSRF-TOKEN');
                    
                    const response = await fetch('/informasi/auto-scan', {
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
                            router.reload({ only: ['totalDmt'] });
                        }
                    }
                } catch (error) {
                    console.error('Error auto-scanning DMT:', error);
                }
            }
        };

        autoScan();
    }, [dmtLink]);

    const handleDeleteClick = () => {
        if (dmtLink) {
            setLinkToDelete(dmtLink);
            setDeleteConfirmOpen(true);
        }
    };

    const handleDeleteConfirm = () => {
        if (linkToDelete) {
            // Delete DMT link and all data
            router.delete(`/dmt-links/${linkToDelete.id}`, {
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
            <Head title="Kelola DMT" />
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kelola Data DMT</h1>
                    <p className="text-muted-foreground mt-2">
                        Kelola link Google Sheet untuk menyimpan data Disaster Medical Team
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
                        <CardTitle>Link Google Sheet</CardTitle>
                        <CardDescription>
                            Masukkan link Google Sheet yang berisi data DMT. Sistem akan membaca dan menampilkan data tersebut.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="post"
                            action="/dmt-links"
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="gdrive_url">
                                            Link Google Sheet *
                                        </Label>
                                        <div className="relative">
                                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="gdrive_url"
                                                name="gdrive_url"
                                                type="url"
                                                defaultValue={dmtLink?.gdrive_url || ''}
                                                required
                                                placeholder="https://docs.google.com/spreadsheets/d/..."
                                                className="pl-10"
                                            />
                                        </div>
                                        <InputError message={errors.gdrive_url} />
                                        <p className="text-xs text-muted-foreground">
                                            Pastikan Google Sheet dapat diakses publik atau API key memiliki akses yang tepat.
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                        <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                            {processing ? (
                                                <>
                                                    <Spinner />
                                                    Memindai Sheet...
                                                </>
                                            ) : (
                                                <>
                                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                                    Simpan & Scan Sheet
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                        {dmtLink && (
                            <div className="mt-6 p-4 bg-muted rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-2">Sheet Saat Ini:</h3>
                                        <a
                                            href={dmtLink.gdrive_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline flex items-center gap-1 break-words"
                                        >
                                            <span className="break-all">{dmtLink.gdrive_url}</span>
                                        </a>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Terakhir diperbarui: {new Date(dmtLink.updated_at).toLocaleString('id-ID')}
                                        </p>
                                        {totalDmt !== undefined && (
                                            <p className="text-sm font-medium mt-2">
                                                Total Data DMT: {totalDmt} tim
                                            </p>
                                        )}
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

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Link DMT</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus link Google Sheet ini? Semua data DMT yang terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
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

