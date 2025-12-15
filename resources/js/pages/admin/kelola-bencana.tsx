import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Disaster } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
    disasters: Disaster[];
    success?: string;
    error?: string;
}

export default function KelolaBencana({ disasters, success, error }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Kelola Bencana',
            href: '/kelola-bencana',
        },
    ];

    const [isOpen, setIsOpen] = useState(false);
    const [editingDisaster, setEditingDisaster] = useState<Disaster | null>(null);

    const { data, setData, post, put, processing, errors, reset, delete: destroy } = useForm({
        name: '',
        description: '',
        is_active: false,
    });

    const handleCreate = () => {
        setEditingDisaster(null);
        reset();
        setIsOpen(true);
    };

    const handleEdit = (disaster: Disaster) => {
        setEditingDisaster(disaster);
        setData({
            name: disaster.name,
            description: disaster.description || '',
            is_active: disaster.is_active,
        });
        setIsOpen(true);
    };

    const handleDelete = (disaster: Disaster) => {
        if (confirm('Apakah Anda yakin ingin menghapus bencana ini? Semua data terkait (laporan, notulensi, dll) akan ikut terhapus!')) {
            destroy(`/disasters/${disaster.id}`);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingDisaster) {
            put(`/disasters/${editingDisaster.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                },
            });
        } else {
            post('/disasters', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Bencana" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kelola Bencana</h1>
                        <p className="text-muted-foreground">
                            Tambah, ubah, atau hapus data bencana. Bencana yang aktif akan ditampilkan di halaman publik.
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Bencana
                    </Button>
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

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Bencana</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead className="w-[100px] text-center">Status</TableHead>
                                <TableHead className="w-[100px] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {disasters.map((disaster) => (
                                <TableRow key={disaster.id}>
                                    <TableCell className="font-medium">{disaster.name}</TableCell>
                                    <TableCell>{disaster.slug}</TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={disaster.description || ''}>
                                        {disaster.description || '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {disaster.is_active ? (
                                            <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                                                Nonaktif
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(disaster)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(disaster)}
                                                disabled={disaster.is_active && disasters.length > 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {disasters.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Belum ada data bencana.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={submit}>
                            <DialogHeader>
                                <DialogTitle>{editingDisaster ? 'Edit Bencana' : 'Tambah Bencana'}</DialogTitle>
                                <DialogDescription>
                                    Isi form di bawah ini untuk {editingDisaster ? 'mengubah' : 'menambahkan'} data bencana.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Bencana</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Banjir Bandang Agam 2024"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <textarea
                                        id="description"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Deskripsi singkat tentang bencana..."
                                        rows={3}
                                    />
                                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                </div>
                                <div className="flex items-center space-x-2 rounded-lg border p-3 shadow-sm">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked === true)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label
                                            htmlFor="is_active"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Set sebagai Bencana Aktif (Publik)
                                        </label>
                                        <p className="text-sm text-muted-foreground">
                                            Jika diaktifkan, bencana ini akan ditampilkan di halaman publik utama.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
