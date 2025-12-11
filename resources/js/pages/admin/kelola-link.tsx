import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Form, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Link2, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
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
        title: 'Kelola Link',
        href: '/kelola-link',
    },
];

interface SiteLink {
    id: number;
    name: string;
    url: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface KelolaLinkProps {
    links: SiteLink[];
    success?: string;
}

export default function KelolaLink({ links, success }: KelolaLinkProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<SiteLink | null>(null);

    const handleEdit = (link: SiteLink) => {
        setEditingLink(link);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingLink(null);
        setIsDialogOpen(true);
    };

    const handleDelete = (link: SiteLink) => {
        if (confirm(`Apakah Anda yakin ingin menghapus link "${link.name}"?`)) {
            router.delete(`/links/${link.id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Link" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kelola Link</h1>
                        <p className="text-muted-foreground">
                            Kelola link yang ditampilkan di halaman beranda
                        </p>
                    </div>
                    <Button onClick={handleAdd}>
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
                        <CardTitle>Daftar Link</CardTitle>
                        <CardDescription>
                            Link-link yang akan ditampilkan di halaman beranda. Link dengan nama yang mengandung "registrasi" akan digunakan untuk menu Link Registrasi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {links.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Belum ada link. Klik "Tambah Link" untuk menambahkan.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Nama</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">URL</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Deskripsi</th>
                                            <th className="text-center py-3 px-4 font-semibold text-sm">Status</th>
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
                                                    <div className="flex items-center gap-2">
                                                        <Link2 className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{link.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-primary hover:underline flex items-center gap-1 max-w-md truncate"
                                                        title={link.url}
                                                    >
                                                        {link.url}
                                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                    </a>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm text-muted-foreground">
                                                        {link.description || '-'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {link.is_active ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                                            Nonaktif
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEdit(link)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(link)}
                                                            className="text-red-600 hover:text-red-700"
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

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingLink ? 'Edit Link' : 'Tambah Link Baru'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingLink
                                    ? 'Perbarui informasi link'
                                    : 'Tambahkan link baru yang akan ditampilkan di halaman beranda'}
                            </DialogDescription>
                        </DialogHeader>
                        <Form
                            method={editingLink ? 'put' : 'post'}
                            action={editingLink ? `/links/${editingLink.id}` : '/links'}
                            onSubmit={() => setIsDialogOpen(false)}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Link *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={editingLink?.name}
                                            required
                                            placeholder="Contoh: Link Registrasi"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Untuk link registrasi, pastikan nama mengandung kata "registrasi"
                                        </p>
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="url">URL *</Label>
                                        <Input
                                            id="url"
                                            name="url"
                                            type="url"
                                            defaultValue={editingLink?.url}
                                            required
                                            placeholder="https://example.com"
                                        />
                                        <InputError message={errors.url} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <Input
                                            id="description"
                                            name="description"
                                            defaultValue={editingLink?.description || ''}
                                            placeholder="Deskripsi link (opsional)"
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            name="is_active"
                                            defaultChecked={editingLink?.is_active ?? true}
                                            value="1"
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            Aktif
                                        </Label>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsDialogOpen(false)}
                                            disabled={processing}
                                        >
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? (
                                                <>
                                                    <Spinner />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                'Simpan'
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

