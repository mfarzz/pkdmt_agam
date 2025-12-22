import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link2, ExternalLink, Plus, Edit, Trash2, Image as ImageIcon, Upload, X, Eye } from 'lucide-react';
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

interface NotulensiImage {
    id: number;
    image_path: string;
    image_name: string;
    description: string | null;
    file_size: number;
    mime_type: string;
    created_at: string;
}

interface UploadedImageGroup {
    date: string;
    date_formatted: string;
    images: NotulensiImage[];
    count: number;
}

interface KelolaNotulensiProps {
    links?: NotulensiLink[];
    uploadedImages?: UploadedImageGroup[];
    success?: string;
}

export default function KelolaNotulensi({ links = [], uploadedImages = [], success }: KelolaNotulensiProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<NotulensiLink | null>(null);
    const [formData, setFormData] = useState({ title: '', gdrive_url: '' });
    
    // Image upload state
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [imageDate, setImageDate] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imageDescriptions, setImageDescriptions] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Image preview state
    const [previewImageGroup, setPreviewImageGroup] = useState<UploadedImageGroup | null>(null);
    const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

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
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsImageDialogOpen(true)}>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Upload Gambar
                        </Button>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Link
                        </Button>
                    </div>
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

                {/* Uploaded Images List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gambar Notulensi yang Sudah Diupload</CardTitle>
                        <CardDescription>
                            Daftar semua gambar notulensi yang sudah diupload, dikelompokkan berdasarkan tanggal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {uploadedImages.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Belum ada gambar notulensi yang diupload. Klik "Upload Gambar" untuk menambahkan.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Tanggal</th>
                                            <th className="text-center py-3 px-4 font-semibold text-sm">Jumlah Gambar</th>
                                            <th className="text-center py-3 px-4 font-semibold text-sm">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {uploadedImages.map((group) => (
                                            <tr
                                                key={group.date}
                                                className="border-b border-border hover:bg-muted/50 transition-colors"
                                            >
                                                <td className="py-3 px-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{group.date_formatted}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center text-sm">
                                                    <span className="font-medium">{group.count} gambar</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setPreviewImageGroup(group);
                                                                setIsPreviewDialogOpen(true);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Detail
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

                {/* Image Preview Dialog */}
                <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Detail Gambar Notulensi</DialogTitle>
                            <DialogDescription>
                                {previewImageGroup?.date_formatted} - {previewImageGroup?.count} gambar
                            </DialogDescription>
                        </DialogHeader>
                        {previewImageGroup && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {previewImageGroup.images.map((image) => (
                                        <div key={image.id} className="border rounded-lg overflow-hidden space-y-2">
                                            <div className="relative aspect-square">
                                                <img
                                                    src={image.image_path}
                                                    alt={image.image_name}
                                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => window.open(image.image_path, '_blank')}
                                                />
                                            </div>
                                            <div className="p-3 space-y-1">
                                                <p className="text-sm font-medium truncate" title={image.image_name}>
                                                    {image.image_name}
                                                </p>
                                                {image.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2" title={image.description}>
                                                        {image.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>{(image.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 text-xs"
                                                        onClick={() => {
                                                            if (confirm('Apakah Anda yakin ingin menghapus gambar ini?')) {
                                                                router.delete(`/notulensi/images/${image.id}`, {
                                                                    preserveScroll: true,
                                                                    onSuccess: () => {
                                                                        // Refresh the preview if still open
                                                                        if (previewImageGroup) {
                                                                            router.reload({ only: ['uploadedImages'] });
                                                                        }
                                                                    },
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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

                {/* Image Upload Dialog */}
                <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Upload Gambar Notulensi</DialogTitle>
                            <DialogDescription>
                                Upload gambar notulensi untuk tanggal tertentu. Anda dapat mengupload multiple gambar sekaligus.
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (selectedImages.length === 0 || !imageDate) {
                                    return;
                                }

                                setUploadingImages(true);
                                const formData = new FormData();
                                formData.append('date', imageDate);
                                selectedImages.forEach((file, index) => {
                                    formData.append('images[]', file);
                                    if (imageDescriptions[index]) {
                                        formData.append(`descriptions[${index}]`, imageDescriptions[index]);
                                    }
                                });

                                router.post('/notulensi/images', formData, {
                                    forceFormData: true,
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        setIsImageDialogOpen(false);
                                        setSelectedImages([]);
                                        setImageDescriptions([]);
                                        setImageDate('');
                                        setUploadingImages(false);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    },
                                    onError: () => {
                                        setUploadingImages(false);
                                    },
                                });
                            }}
                        >
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="image_date">Tanggal Notulensi *</Label>
                                    <Input
                                        id="image_date"
                                        type="date"
                                        value={imageDate}
                                        onChange={(e) => setImageDate(e.target.value)}
                                        required
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="images">Pilih Gambar *</Label>
                                    <Input
                                        ref={fileInputRef}
                                        id="images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            if (files.length > 0) {
                                                // Validate file sizes (max 5MB each)
                                                const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
                                                if (oversizedFiles.length > 0) {
                                                    alert('Beberapa file melebihi 5 MB. Silakan pilih file yang lebih kecil.');
                                                    return;
                                                }
                                                setSelectedImages(files);
                                                // Initialize descriptions array
                                                setImageDescriptions(new Array(files.length).fill(''));
                                            }
                                        }}
                                        disabled={uploadingImages}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Maksimal 5 MB per gambar. Format yang didukung: JPG, PNG, GIF, WebP
                                    </p>
                                </div>

                                {selectedImages.length > 0 && (
                                    <div className="space-y-3">
                                        <Label>Preview Gambar</Label>
                                        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                                            {selectedImages.map((file, index) => (
                                                <div key={index} className="border rounded-lg p-3 space-y-2">
                                                    <div className="relative">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute top-1 right-1 h-6 w-6"
                                                            onClick={() => {
                                                                const newImages = selectedImages.filter((_, i) => i !== index);
                                                                const newDescriptions = imageDescriptions.filter((_, i) => i !== index);
                                                                setSelectedImages(newImages);
                                                                setImageDescriptions(newDescriptions);
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {file.name}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label htmlFor={`desc-${index}`} className="text-xs">
                                                            Keterangan (opsional)
                                                        </Label>
                                                        <Input
                                                            id={`desc-${index}`}
                                                            type="text"
                                                            value={imageDescriptions[index] || ''}
                                                            onChange={(e) => {
                                                                const newDescriptions = [...imageDescriptions];
                                                                newDescriptions[index] = e.target.value;
                                                                setImageDescriptions(newDescriptions);
                                                            }}
                                                            placeholder="Keterangan gambar..."
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsImageDialogOpen(false);
                                        setSelectedImages([]);
                                        setImageDescriptions([]);
                                        setImageDate('');
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                    disabled={uploadingImages}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={uploadingImages || selectedImages.length === 0 || !imageDate}>
                                    {uploadingImages ? (
                                        <>
                                            <Upload className="mr-2 h-4 w-4 animate-spin" />
                                            Mengunggah...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload {selectedImages.length} Gambar
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
