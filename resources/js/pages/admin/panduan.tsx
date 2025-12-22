import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Link2, FileText, FileSpreadsheet, AlertCircle, CheckCircle2, Image, FileCheck, LayoutDashboard, LayoutGrid, AlertTriangle, ChevronDown, ChevronUp, Upload, Calendar, FileType } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Panduan',
        href: '/panduan',
    },
];

export default function Panduan() {
    const { auth } = usePage<SharedData>().props;
    // Cast user to any to access role since it's not explicitly in the User interface in index.d.ts
    const userRole = (auth.user as any).role;
    const isSuperAdmin = userRole === 'superadmin';

    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['laporan-dokumen']));

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panduan - HEOC" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <BookOpen className="h-8 w-8" />
                        Panduan Penggunaan Sistem HEOC
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Panduan lengkap untuk mengelola sistem, laporan, dan konten publik pada aplikasi HEOC.
                    </p>
                </div>

                {/* Panduan Pengaturan Sistem - Only for Superadmin */}
                {isSuperAdmin && (
                    <Card>
                        <CardHeader
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleSection('pengaturan-sistem')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <LayoutDashboard className="h-5 w-5" />
                                        Pengaturan Sistem
                                    </CardTitle>
                                    <CardDescription>
                                        Panduan untuk dashboard, manajemen user, dan kelola bencana.
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="flex-shrink-0"
                                >
                                    {expandedSections.has('pengaturan-sistem') ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        {expandedSections.has('pengaturan-sistem') && (
                            <CardContent className="space-y-6 animate-in slide-in-from-top-2 duration-200">
                                {/* Dashboard */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <LayoutDashboard className="h-5 w-5 text-indigo-600" />
                                        Dashboard
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="p-4 bg-muted rounded-lg space-y-2">
                                            <p className="font-semibold">Statistik Real-time</p>
                                            <p className="text-sm text-muted-foreground">
                                                Menampilkan data bencana aktif, tim EMT, dan status layanan terkini.
                                            </p>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg space-y-2">
                                            <p className="font-semibold">Visualisasi Data</p>
                                            <p className="text-sm text-muted-foreground">
                                                Grafik distribusi layanan dan status tim untuk pemantauan cepat.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Manajemen User */}
                                <div className="space-y-4 border-t pt-6">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <LayoutGrid className="h-5 w-5 text-green-600" />
                                        Manajemen User
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <Badge variant="outline">1</Badge>
                                            <div>
                                                <p className="font-medium">Tambah User</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Menu <strong>"Manajemen User"</strong> → Klik "Buat User Baru". Isi nama, email, password, dan role (Admin/Superadmin).
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Badge variant="outline">2</Badge>
                                            <div>
                                                <p className="font-medium">Kelola Akses</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Edit atau hapus user sesuai kebutuhan. Pastikan hanya memberikan akses kepada personel yang berwenang.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Kelola Bencana */}
                                <div className="space-y-4 border-t pt-6">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                        Kelola Bencana
                                    </h3>
                                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                            <div className="space-y-1 text-sm text-red-800 dark:text-red-200">
                                                <p className="font-semibold">Penting:</p>
                                                <p>Hanya satu bencana yang dapat berstatus <strong>Aktif</strong>. Mengaktifkan bencana baru akan otomatis menonaktifkan bencana sebelumnya. Data di dashboard dan halaman publik akan menyesuaikan dengan bencana yang aktif.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                )}

                {/* Kelola Laporan & Dokumen - Visible for All */}
                <Card>
                    <CardHeader
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleSection('laporan-dokumen')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Kelola Laporan & Dokumen
                                </CardTitle>
                                <CardDescription>
                                    Panduan upload report harian, mingguan, file excel, dan notulensi.
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="flex-shrink-0"
                            >
                                {expandedSections.has('laporan-dokumen') ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    {expandedSections.has('laporan-dokumen') && (
                        <CardContent className="space-y-6 animate-in slide-in-from-top-2 duration-200">

                            {/* Report Harian */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    Report Harian (HEOC & DMT)
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="border rounded-lg p-4 space-y-3">
                                        <p className="font-semibold text-sm">Report HEOC</p>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                            <li>Menu: <strong>"Kelola Report HEOC"</strong></li>
                                            <li>Klik "Upload Report Harian"</li>
                                            <li>Pilih Tanggal & Upload file PDF (Max 2MB)</li>
                                            <li>Bisa upload multiple file per tanggal</li>
                                        </ul>
                                    </div>
                                    <div className="border rounded-lg p-4 space-y-3">
                                        <p className="font-semibold text-sm">Report DMT</p>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                            <li>Menu: <strong>"Kelola Report DMT"</strong></li>
                                            <li>Klik "Upload Report Harian"</li>
                                            <li>Pilih Tanggal & Upload file PDF (Max 2MB)</li>
                                            <li>Bisa upload multiple file per tanggal</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Report Mingguan & Excel */}
                            <div className="space-y-4 border-t pt-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                                            <FileText className="h-5 w-5 text-purple-600" />
                                            Report Mingguan
                                        </h3>
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <p>Menu: <strong>"Kelola Report Mingguan"</strong></p>
                                            <p>Upload laporan rekapitulasi mingguan dalam format PDF.</p>
                                            <ul className="list-disc list-inside pl-2">
                                                <li>Pilih Rentang Tanggal (Start - End)</li>
                                                <li>Upload file PDF</li>
                                                <li>Tambahkan deskripsi (opsional)</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                                            <FileType className="h-5 w-5 text-green-600" />
                                            File Excel Laporan
                                        </h3>
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <p>Menu: <strong>"Kelola File Excel"</strong></p>
                                            <p>Upload file master Excel (.xlsm) yang digunakan sebagai template atau sumber data laporan.</p>
                                            <ul className="list-disc list-inside pl-2">
                                                <li>Format wajib: <strong>.xlsm</strong> (Macro Enabled)</li>
                                                <li>Maksimal ukuran: 10MB</li>
                                                <li>File baru akan menggantikan file lama</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notulensi */}
                            <div className="space-y-4 border-t pt-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <FileSpreadsheet className="h-5 w-5 text-orange-600" />
                                    Kelola Notulensi
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                        <Badge variant="outline">1</Badge>
                                        <div>
                                            <p className="font-medium">Link Google Sheets</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Hubungkan Google Sheets notulensi. Pastikan akses link diset ke <strong>"Anyone with the link can view"</strong>.
                                                <br />
                                                Sistem akan membaca tab/sheet dengan format nama tanggal: <code className="bg-background px-1 rounded">YYYY-MM-DD</code> (contoh: 2025-12-25).
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                        <Badge variant="outline">2</Badge>
                                        <div>
                                            <p className="font-medium">Upload Gambar Dokumentasi</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Gunakan tombol "Upload Gambar" untuk menambahkan foto dokumentasi rapat/kegiatan.
                                                <br />
                                                Pilih tanggal yang sesuai agar gambar muncul pada laporan tanggal tersebut.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    )}
                </Card>

                {/* Konten Publik - Only for Superadmin */}
                {isSuperAdmin && (
                    <Card>
                        <CardHeader
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleSection('konten-publik')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <Image className="h-5 w-5" />
                                        Konten Publik
                                    </CardTitle>
                                    <CardDescription>
                                        Kelola Infografis dan Pendaftaran DMT.
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="flex-shrink-0"
                                >
                                    {expandedSections.has('konten-publik') ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        {expandedSections.has('konten-publik') && (
                            <CardContent className="space-y-6 animate-in slide-in-from-top-2 duration-200">

                                {/* Infografis */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Image className="h-5 w-5 text-purple-600" />
                                        Kelola Infografis
                                    </h3>
                                    <div className="p-4 border rounded-lg space-y-3">
                                        <p className="text-sm text-muted-foreground">
                                            Infografis diambil dari folder Google Drive.
                                        </p>
                                        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                                            <li>Siapkan folder di Google Drive berisi gambar/PDF infografis.</li>
                                            <li>Pastikan akses folder: <strong>"Anyone with the link can view"</strong>.</li>
                                            <li>Copy link folder dan masukkan di menu "Kelola Infografis".</li>
                                            <li>Klik "Simpan & Scan" untuk memuat file.</li>
                                        </ol>
                                    </div>
                                </div>

                                {/* Pendaftaran DMT */}
                                <div className="space-y-4 border-t pt-6">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <FileCheck className="h-5 w-5 text-blue-600" />
                                        Kelola Pendaftaran DMT
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="p-3 bg-muted rounded text-sm">
                                            <p className="font-semibold mb-1">Verifikasi</p>
                                            <p className="text-muted-foreground">Review data pendaftar dan ubah status menjadi <strong>Approved</strong> atau <strong>Rejected</strong>.</p>
                                        </div>
                                        <div className="p-3 bg-muted rounded text-sm">
                                            <p className="font-semibold mb-1">Status Penugasan</p>
                                            <p className="text-muted-foreground">Atur status tim: <strong>Aktif</strong> (sedang bertugas), <strong>Selesai</strong>, atau <strong>Menunggu</strong>.</p>
                                        </div>
                                        <div className="p-3 bg-muted rounded text-sm">
                                            <p className="font-semibold mb-1">Export Data</p>
                                            <p className="text-muted-foreground">Gunakan fitur export untuk mengunduh data pendaftar dalam format Excel/CSV.</p>
                                        </div>
                                    </div>
                                </div>

                            </CardContent>
                        )}
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
