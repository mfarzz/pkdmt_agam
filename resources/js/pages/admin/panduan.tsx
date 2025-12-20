import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FolderTree, Link2, FileText, FileSpreadsheet, AlertCircle, CheckCircle2, Image, FileCheck, LayoutDashboard, LayoutGrid, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
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
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

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
            <Head title="Panduan" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <BookOpen className="h-8 w-8" />
                        Panduan Struktur Folder Google Drive
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Panduan lengkap untuk menyiapkan struktur folder Google Drive dan menambahkan link di menu Dokumen dan Notulensi
                    </p>
                </div>

                {/* Panduan Pengaturan Sistem */}
                <Card>
                    <CardHeader 
                        className="cursor-pointer"
                        onClick={() => toggleSection('pengaturan-sistem')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                    <LayoutDashboard className="h-5 w-5" />
                                    Panduan Pengaturan Sistem
                                </CardTitle>
                                <CardDescription>
                                    Panduan untuk mengelola pengaturan sistem, termasuk dashboard, manajemen user, dan kelola bencana.
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSection('pengaturan-sistem');
                                }}
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
                        <CardContent className="space-y-6">
                        {/* Dashboard */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <LayoutDashboard className="h-5 w-5 text-indigo-600" />
                                Dashboard
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">1</Badge>
                                    <div>
                                        <p className="font-semibold">Akses Dashboard</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Buka menu <strong>"Pengaturan Sistem" → "Dashboard"</strong> di sidebar admin
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">2</Badge>
                                    <div>
                                        <p className="font-semibold">Lihat Statistik</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Dashboard menampilkan statistik lengkap untuk bencana aktif, termasuk total tim aktif, total tim selesai, total tim keseluruhan, dan visualisasi jenis layanan yang tersedia.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">3</Badge>
                                    <div>
                                        <p className="font-semibold">Visualisasi Data</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Dashboard menampilkan grafik batang untuk jenis layanan yang tersedia, membantu Anda melihat distribusi layanan secara visual.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-indigo-600 mt-0.5" />
                                        <div className="space-y-1 text-sm text-indigo-800 dark:text-indigo-200">
                                            <p className="font-semibold text-indigo-900 dark:text-indigo-100">Catatan Penting:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Data yang ditampilkan hanya untuk bencana aktif</li>
                                                <li>Statistik dihitung berdasarkan data pendaftaran yang sudah disetujui (approved)</li>
                                                <li>Visualisasi akan otomatis terupdate ketika ada perubahan data</li>
                                            </ul>
                                        </div>
                                    </div>
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
                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">1</Badge>
                                    <div>
                                        <p className="font-semibold">Akses halaman Manajemen User</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Buka menu <strong>"Pengaturan Sistem" → "Manajemen User"</strong> di sidebar admin
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">2</Badge>
                                    <div>
                                        <p className="font-semibold">Tambah User Baru</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Klik tombol "Tambah User" untuk menambahkan admin baru. Isi nama, email, dan password. Email akan digunakan untuk login.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">3</Badge>
                                    <div>
                                        <p className="font-semibold">Edit User</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Klik tombol edit pada user yang ingin diubah. Anda dapat mengubah nama, email, dan password user.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">4</Badge>
                                    <div>
                                        <p className="font-semibold">Hapus User</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Klik tombol hapus untuk menghapus user. Pastikan user yang dihapus tidak sedang digunakan untuk menghindari masalah akses.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                                            <p className="font-semibold text-green-900 dark:text-green-100">Keamanan:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Pastikan password user kuat dan aman</li>
                                                <li>Jangan bagikan kredensial login kepada pihak yang tidak berwenang</li>
                                                <li>Hapus user yang tidak lagi aktif untuk menjaga keamanan sistem</li>
                                            </ul>
                                        </div>
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

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">1</Badge>
                                    <div>
                                        <p className="font-semibold">Akses halaman Kelola Bencana</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Buka menu <strong>"Pengaturan Sistem" → "Kelola Bencana"</strong> di sidebar admin
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">2</Badge>
                                    <div>
                                        <p className="font-semibold">Tambah Bencana Baru</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Klik tombol "Tambah Bencana" untuk menambahkan bencana baru. Isi nama bencana dan deskripsi (opsional).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">3</Badge>
                                    <div>
                                        <p className="font-semibold">Aktifkan Bencana</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Centang checkbox "Aktif" untuk mengaktifkan bencana. Hanya satu bencana yang dapat aktif pada satu waktu. Mengaktifkan bencana baru akan menonaktifkan bencana yang sebelumnya aktif.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">4</Badge>
                                    <div>
                                        <p className="font-semibold">Edit atau Hapus Bencana</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Klik tombol edit untuk mengubah informasi bencana, atau tombol hapus untuk menghapus bencana yang tidak diperlukan.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                        <div className="space-y-1 text-sm text-red-800 dark:text-red-200">
                                            <p className="font-semibold text-red-900 dark:text-red-100">Penting:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Bencana aktif menentukan data yang ditampilkan di halaman publik dan dashboard</li>
                                                <li>Mengubah bencana aktif akan mengubah semua data yang ditampilkan di sistem</li>
                                                <li>Pastikan bencana aktif sesuai dengan bencana yang sedang ditangani</li>
                                                <li>Jangan hapus bencana yang masih memiliki data terkait</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    )}
                </Card>

                {/* Struktur Folder Google Drive */}
                <Card>
                    <CardHeader 
                        className="cursor-pointer"
                        onClick={() => toggleSection('struktur-folder')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                    <FolderTree className="h-5 w-5" />
                                    Struktur Folder Google Drive yang Diperlukan
                                </CardTitle>
                                <CardDescription>
                                    Pastikan struktur folder Google Drive Anda mengikuti format berikut untuk memastikan sistem dapat mengakses dan memindai file dengan benar.
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSection('struktur-folder');
                                }}
                                className="flex-shrink-0"
                            >
                                {expandedSections.has('struktur-folder') ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    {expandedSections.has('struktur-folder') && (
                        <CardContent className="space-y-6">
                        {/* Struktur Report */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                Struktur Folder untuk Report (Dokumen)
                            </h3>

                            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span className="font-semibold">📁 Folder Report (Root)</span>
                                </div>
                                <div className="ml-6 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">├──</span>
                                        <span className="font-semibold">📁 Folder: <code className="bg-background px-1 rounded">Csv</code></span>
                                    </div>
                                    <div className="ml-6 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">├──</span>
                                            <span>📁 Folder: <code className="bg-background px-1 rounded">YYYY-MM-DD</code> (contoh: <code className="bg-background px-1 rounded">2025-12-07</code>)</span>
                                        </div>
                                        <div className="ml-6 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">└──</span>
                                                <span>📄 File CSV</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">├──</span>
                                        <span className="font-semibold">📁 Folder: <code className="bg-background px-1 rounded">Excel</code></span>
                                    </div>
                                    <div className="ml-6 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">├──</span>
                                            <span>📁 Folder: <code className="bg-background px-1 rounded">YYYY-MM-DD</code> (contoh: <code className="bg-background px-1 rounded">2025-12-07</code>)</span>
                                        </div>
                                        <div className="ml-6 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">└──</span>
                                                <span>📄 File Excel (.xlsx, .xls)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">└──</span>
                                        <span className="font-semibold">📁 Folder: <code className="bg-background px-1 rounded">PDF</code></span>
                                    </div>
                                    <div className="ml-6 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">├──</span>
                                            <span>📁 Folder: <code className="bg-background px-1 rounded">YYYY-MM-DD</code> (contoh: <code className="bg-background px-1 rounded">2025-12-07</code>)</span>
                                        </div>
                                        <div className="ml-6 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">└──</span>
                                                <span>📄 File PDF</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div className="space-y-2">
                                        <p className="font-semibold text-blue-900 dark:text-blue-100">Penting untuk Report:</p>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                            <li>Folder root harus berisi 3 folder utama: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">Csv</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">Excel</code>, dan <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">PDF</code></li>
                                            <li>Di dalam setiap folder utama (Csv/Excel/PDF), buat folder dengan format tanggal: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">YYYY-MM-DD</code></li>
                                            <li>Format: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">YYYY-MM-DD</code> (contoh: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">2025-12-07</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">2025-01-05</code>)</li>
                                            <li>Tahun: 4 digit (YYYY), Bulan: 2 digit (MM), Hari: 2 digit (DD)</li>
                                            <li>File report ditempatkan di dalam folder tanggal yang sesuai</li>
                                            <li>Sistem akan otomatis memindai folder berdasarkan tanggal di nama folder</li>
                                            <li>File akan muncul di kalender pada tanggal yang sesuai</li>
                                            <li>Format file yang didukung: CSV di folder Csv, Excel (.xlsx, .xls) di folder Excel, dan PDF di folder PDF</li>
                                            <li className="font-semibold text-blue-900 dark:text-blue-100 mt-2">⚠️ Catatan: Sistem saat ini hanya memindai folder <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">PDF</code> untuk ditampilkan di kalender. Folder Csv dan Excel dapat digunakan untuk penyimpanan tambahan.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Struktur Notulensi */}
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                Struktur Folder untuk Notulensi
                            </h3>

                            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span className="font-semibold">📊 Google Sheets (File Spreadsheet)</span>
                                </div>
                                <div className="ml-6 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">├──</span>
                                        <span>📑 Tab/Sheet: <code className="bg-background px-1 rounded">YYYY-MM-DD</code> (contoh: <code className="bg-background px-1 rounded">2025-12-07</code>)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">├──</span>
                                        <span>📑 Tab/Sheet: <code className="bg-background px-1 rounded">YYYY-MM-DD</code> (contoh: <code className="bg-background px-1 rounded">2025-12-08</code>)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">└──</span>
                                        <span>📑 Tab/Sheet: <code className="bg-background px-1 rounded">YYYY-MM-DD</code> (contoh: <code className="bg-background px-1 rounded">2025-12-09</code>)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div className="space-y-2">
                                        <p className="font-semibold text-green-900 dark:text-green-100">Penting untuk Notulensi:</p>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-green-800 dark:text-green-200">
                                            <li>Gunakan <strong>Google Sheets</strong> (bukan Excel file yang di-upload)</li>
                                            <li>Setiap tab/sheet harus menggunakan format tanggal: <code className="bg-green-100 dark:bg-green-900 px-1 rounded">YYYY-MM-DD</code></li>
                                            <li>Format: <code className="bg-green-100 dark:bg-green-900 px-1 rounded">YYYY-MM-DD</code> (contoh: <code className="bg-green-100 dark:bg-green-900 px-1 rounded">2025-12-07</code>, <code className="bg-green-100 dark:bg-green-900 px-1 rounded">2025-01-05</code>)</li>
                                            <li>Tahun: 4 digit (YYYY), Bulan: 2 digit (MM), Hari: 2 digit (DD)</li>
                                            <li>Sistem akan otomatis memindai tab berdasarkan tanggal di nama tab</li>
                                            <li>Tab akan muncul di kalender pada tanggal yang sesuai</li>
                                            <li>Pastikan Google Sheets sudah di-share dengan akses "Anyone with the link can view"</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    )}
                </Card>

                {/* Panduan Konten Publik */}
                <Card>
                    <CardHeader 
                        className="cursor-pointer"
                        onClick={() => toggleSection('konten-publik')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                    <Image className="h-5 w-5" />
                                    Panduan Konten Publik
                                </CardTitle>
                                <CardDescription>
                                    Panduan untuk mengelola konten yang ditampilkan di halaman publik, termasuk infografis dan pendaftaran DMT.
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSection('konten-publik');
                                }}
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
                        <CardContent className="space-y-6">
                        {/* Kelola Infografis */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Image className="h-5 w-5 text-purple-600" />
                                Kelola Infografis
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">1</Badge>
                                    <div>
                                        <p className="font-semibold">Akses halaman Kelola Infografis</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Buka menu <strong>"Konten Publik" → "Kelola Infografis"</strong> di sidebar admin
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">2</Badge>
                                    <div>
                                        <p className="font-semibold">Tambahkan Link Google Drive</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Masukkan link Google Drive folder yang berisi file infografis (format: PDF, PNG, JPG)
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">3</Badge>
                                    <div>
                                        <p className="font-semibold">Auto-Scan Folder</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Sistem akan otomatis memindai folder dan menampilkan semua file infografis yang ada. Klik tombol "Auto-Scan" untuk memindai ulang.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">4</Badge>
                                    <div>
                                        <p className="font-semibold">Kelola Infografis</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Setelah di-scan, Anda dapat melihat daftar infografis, mengubah judul, mengatur urutan tampilan, dan menghapus infografis yang tidak diperlukan.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                                        <div className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
                                            <p className="font-semibold text-purple-900 dark:text-purple-100">Catatan Penting:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Pastikan folder Google Drive di-share dengan permission <strong>"Anyone with the link can view"</strong></li>
                                                <li>Format file yang didukung: PDF, PNG, JPG</li>
                                                <li>Infografis akan ditampilkan di halaman publik sesuai urutan yang ditetapkan</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kelola Pendaftaran */}
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-blue-600" />
                                Kelola Pendaftaran DMT
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">1</Badge>
                                    <div>
                                        <p className="font-semibold">Akses halaman Kelola Pendaftaran</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Buka menu <strong>"Konten Publik" → "Kelola Pendaftaran"</strong> di sidebar admin
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">2</Badge>
                                    <div>
                                        <p className="font-semibold">Lihat Daftar Pendaftar</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Halaman ini menampilkan semua pendaftaran DMT yang masuk. Anda dapat melihat detail pendaftar, status pendaftaran, dan status penugasan.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">3</Badge>
                                    <div>
                                        <p className="font-semibold">Filter dan Cari Pendaftar</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Gunakan fitur filter untuk mencari pendaftar berdasarkan status (Aktif, Selesai, Menunggu) atau gunakan kolom pencarian untuk mencari berdasarkan nama, email, atau nomor HP.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">4</Badge>
                                    <div>
                                        <p className="font-semibold">Kelola Status Pendaftaran</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Anda dapat mengubah status pendaftaran (Approved/Rejected) dan status penugasan (Aktif, Selesai, Menunggu) untuk setiap pendaftar.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">5</Badge>
                                    <div>
                                        <p className="font-semibold">Notifikasi Pendaftaran Baru</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Ketika ada pendaftaran baru, Anda akan menerima notifikasi di sidebar dan email. Klik notifikasi untuk melihat detail pendaftar.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                            <p className="font-semibold text-blue-900 dark:text-blue-100">Status Pendaftaran:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li><strong>Approved:</strong> Pendaftaran disetujui dan akan muncul di halaman publik</li>
                                                <li><strong>Rejected:</strong> Pendaftaran ditolak dan tidak akan muncul di halaman publik</li>
                                            </ul>
                                            <p className="font-semibold text-blue-900 dark:text-blue-100 mt-2">Status Penugasan:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li><strong>Aktif:</strong> Tim sedang dalam penugasan aktif</li>
                                                <li><strong>Selesai:</strong> Penugasan tim telah selesai</li>
                                                <li><strong>Menunggu:</strong> Tim menunggu penugasan</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    )}
                </Card>

                {/* Cara Menambahkan Link */}
                <Card>
                    <CardHeader 
                        className="cursor-pointer"
                        onClick={() => toggleSection('cara-tambah-link')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                    <Link2 className="h-5 w-5" />
                                    Cara Menambahkan Link di Menu Dokumen dan Notulensi
                                </CardTitle>
                                <CardDescription>
                                    Langkah-langkah untuk menambahkan link Google Drive ke sistem agar dapat diakses melalui menu Dokumen dan Notulensi.
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSection('cara-tambah-link');
                                }}
                                className="flex-shrink-0"
                            >
                                {expandedSections.has('cara-tambah-link') ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    {expandedSections.has('cara-tambah-link') && (
                        <CardContent className="space-y-6">
                        {/* Menambahkan Link Report */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                Menambahkan Link Report (Dokumen)
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">1</Badge>
                                    <div>
                                        <p className="font-semibold">Buka halaman Kelola Report</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Akses menu <strong>"Dokumen & Laporan" → "Kelola Report"</strong> di sidebar admin
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">2</Badge>
                                    <div>
                                        <p className="font-semibold">Klik tombol "Tambah Link"</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Tombol berada di pojok kanan atas halaman
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">3</Badge>
                                    <div>
                                        <p className="font-semibold">Isi form dengan informasi berikut:</p>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                                            <li><strong>Judul:</strong> Nama untuk link ini (contoh: "Laporan Harian", "Daily Report")</li>
                                            <li><strong>URL Google Drive:</strong> Link folder Google Drive yang berisi file report</li>
                                            <li><strong>Publik:</strong> Centang jika ingin link dapat diakses oleh pengunjung tanpa login</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">4</Badge>
                                    <div>
                                        <p className="font-semibold">Pastikan folder Google Drive sudah di-share dengan benar</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Folder harus di-share dengan setting <strong>"Anyone with the link can view"</strong> agar sistem dapat mengakses file di dalamnya
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">5</Badge>
                                    <div>
                                        <p className="font-semibold">Klik "Simpan"</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Link akan tersimpan dan file di dalam folder akan otomatis terdeteksi oleh sistem
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Menambahkan Link Notulensi */}
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                Menambahkan Link Notulensi
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">1</Badge>
                                    <div>
                                        <p className="font-semibold">Buka halaman Kelola Notulensi</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Akses menu <strong>"Dokumen & Laporan" → "Kelola Notulensi"</strong> di sidebar admin
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">2</Badge>
                                    <div>
                                        <p className="font-semibold">Klik tombol "Tambah Link"</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Tombol berada di pojok kanan atas halaman
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">3</Badge>
                                    <div>
                                        <p className="font-semibold">Isi form dengan informasi berikut:</p>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                                            <li><strong>Judul:</strong> Nama untuk link ini (contoh: "Notulensi Rapat", "Meeting Minutes")</li>
                                            <li><strong>URL Google Sheets:</strong> Link Google Sheets yang berisi tab-tab notulensi</li>
                                        </ul>
                                        <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 font-semibold">
                                            ⚠️ Pastikan Anda menggunakan link Google Sheets, bukan folder!
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">4</Badge>
                                    <div>
                                        <p className="font-semibold">Pastikan Google Sheets sudah di-share dengan benar</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Google Sheets harus di-share dengan setting <strong>"Anyone with the link can view"</strong> agar sistem dapat mengakses tab di dalamnya
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                    <Badge variant="outline" className="mt-1">5</Badge>
                                    <div>
                                        <p className="font-semibold">Klik "Simpan"</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Link akan tersimpan dan tab di dalam Google Sheets akan otomatis terdeteksi oleh sistem
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    )}
                </Card>


                {/* Tips dan Catatan */}
                <Card>
                    <CardHeader 
                        className="cursor-pointer"
                        onClick={() => toggleSection('tips-catatan')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                    Tips dan Catatan Penting
                                </CardTitle>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSection('tips-catatan');
                                }}
                                className="flex-shrink-0"
                            >
                                {expandedSections.has('tips-catatan') ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    {expandedSections.has('tips-catatan') && (
                        <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Format Tanggal</p>
                                    <p className="text-sm text-muted-foreground">
                                        Gunakan format <code className="bg-muted px-1 rounded">YYYY-MM-DD</code> (contoh: <code className="bg-muted px-1 rounded">2025-12-20</code>) untuk nama file atau tab agar sistem dapat mengenali tanggal dengan benar.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Sharing Permission</p>
                                    <p className="text-sm text-muted-foreground">
                                        Pastikan folder atau file Google Drive/Sheets di-share dengan permission <strong>"Anyone with the link can view"</strong> agar sistem dapat mengakses konten.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Auto-Scan</p>
                                    <p className="text-sm text-muted-foreground">
                                        Sistem akan otomatis memindai file/tab baru saat halaman diakses. Anda juga dapat menggunakan fitur "Auto-Scan" untuk memindai ulang secara manual.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Multiple Links</p>
                                    <p className="text-sm text-muted-foreground">
                                        Anda dapat menambahkan beberapa link untuk Report dan Notulensi. Setiap link akan muncul sebagai opsi terpisah di halaman publik.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Bencana Aktif</p>
                                    <p className="text-sm text-muted-foreground">
                                        Semua data yang ditampilkan di halaman publik dan dashboard akan disesuaikan dengan bencana aktif. Pastikan bencana aktif sudah diatur dengan benar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}

