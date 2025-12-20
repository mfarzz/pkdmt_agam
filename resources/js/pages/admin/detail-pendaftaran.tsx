import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, XCircle, Download, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Kelola Pendaftaran',
        href: '/kelola-pendaftaran',
    },
    {
        title: 'Detail Pendaftaran',
        href: '#',
    },
];

interface FileInfo {
    path: string;
    url: string;
    name: string;
}

interface Registration {
    id: number;
    nama_dmt: string;
    nama_ketua_tim: string;
    status_penugasan: string | null;
    status_pendaftaran: string;
    tanggal_kedatangan: string | null;
    masa_penugasan_hari: number | null;
    tanggal_pelayanan_dimulai: string | null;
    tanggal_pelayanan_diakhiri: string | null;
    rencana_tanggal_kepulangan: string | null;
    nama_nara_hubung: string;
    posisi_jabatan: string;
    email: string;
    nomor_hp: string;
    kapasitas_rawat_jalan: number;
    kapasitas_rawat_inap: number;
    kapasitas_operasi_bedah_mayor: number;
    kapasitas_operasi_bedah_minor: number;
    jenis_layanan_tersedia: string;
    jumlah_dokter_umum: number;
    rincian_dokter_spesialis: string;
    jumlah_perawat: number;
    jumlah_bidan: number;
    jumlah_apoteker: number;
    jumlah_psikolog: number;
    jumlah_staf_logistik: number;
    jumlah_staf_administrasi: number;
    jumlah_petugas_keamanan: number;
    logistik_non_medis: string;
    logistik_non_medis_files: FileInfo[];
    logistik_medis: string;
    logistik_medis_files: FileInfo[];
    surat_tugas_file: FileInfo | null;
    scan_str_file: FileInfo | null;
    daftar_nama_anggota_file: FileInfo | null;
    created_at: string;
    updated_at: string;
}

interface DetailPendaftaranProps {
    registration: Registration;
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'pending':
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Menunggu</Badge>;
        case 'approved':
            return <Badge variant="default" className="bg-green-500 text-white">Disetujui</Badge>;
        case 'rejected':
            return <Badge variant="destructive">Ditolak</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function DetailPendaftaran({ registration }: DetailPendaftaranProps) {
    const handleStatusChange = (status: 'approved' | 'rejected') => {
        router.put(`/kelola-pendaftaran/${registration.id}/status`, {
            status_pendaftaran: status,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Pendaftaran - ${registration.nama_dmt}`} />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit('/kelola-pendaftaran')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{registration.nama_dmt}</h1>
                            <p className="text-muted-foreground mt-1">
                                Status: {getStatusBadge(registration.status_pendaftaran)}
                            </p>
                        </div>
                    </div>
                    {(registration.status_pendaftaran === 'pending' || registration.status_pendaftaran === 'approved') && (
                        <div className="flex gap-2">
                            {registration.status_pendaftaran === 'pending' && (
                                <Button
                                    onClick={() => handleStatusChange('approved')}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Setujui
                                </Button>
                            )}
                            <Button
                                variant="destructive"
                                onClick={() => handleStatusChange('rejected')}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Tolak
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Data Rincian Tim */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Rincian Tim</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Nama DMT</p>
                                <p className="text-base font-medium text-foreground">{registration.nama_dmt}</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Ketua Tim</p>
                                <p className="text-base font-medium text-foreground">{registration.nama_ketua_tim}</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Tanggal Kedatangan</p>
                                <p className="text-base font-medium text-foreground">{formatDate(registration.tanggal_kedatangan)}</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Masa Penugasan</p>
                                <p className="text-base font-medium text-foreground">{registration.masa_penugasan_hari} hari</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Tanggal Pelayanan Dimulai</p>
                                <p className="text-base font-medium text-foreground">{formatDate(registration.tanggal_pelayanan_dimulai)}</p>
                            </div>
                            {registration.tanggal_pelayanan_diakhiri && (
                                <div className="flex items-center justify-between py-2 border-b border-border/40">
                                    <p className="text-sm font-semibold text-muted-foreground">Tanggal Pelayanan Diakhiri</p>
                                    <p className="text-base font-medium text-foreground">{formatDate(registration.tanggal_pelayanan_diakhiri)}</p>
                                </div>
                            )}
                            {registration.rencana_tanggal_kepulangan && (
                                <div className="flex items-center justify-between py-2 border-b border-border/40">
                                    <p className="text-sm font-semibold text-muted-foreground">Rencana Tanggal Kepulangan</p>
                                    <p className="text-base font-medium text-foreground">{formatDate(registration.rencana_tanggal_kepulangan)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Nara Hubung */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Nara Hubung Paska Kepulangan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Nama</p>
                                <p className="text-base font-medium text-foreground">{registration.nama_nara_hubung}</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Posisi / Jabatan</p>
                                <p className="text-base font-medium text-foreground">{registration.posisi_jabatan}</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Email</p>
                                <p className="text-base font-medium text-foreground">{registration.email}</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Nomor HP / WhatsApp</p>
                                <p className="text-base font-medium text-foreground">{registration.nomor_hp}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Kapasitas Layanan */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Kapasitas Layanan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Rawat Jalan</p>
                                <p className="text-base font-medium text-foreground">{registration.kapasitas_rawat_jalan} pasien/hari</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Rawat Inap</p>
                                <p className="text-base font-medium text-foreground">{registration.kapasitas_rawat_inap} pasien/hari</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Operasi Bedah Mayor</p>
                                <p className="text-base font-medium text-foreground">{registration.kapasitas_operasi_bedah_mayor} kasus/hari</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Operasi Bedah Minor</p>
                                <p className="text-base font-medium text-foreground">{registration.kapasitas_operasi_bedah_minor} kasus/hari</p>
                            </div>
                            <div className="flex items-start justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground flex-shrink-0 mr-4">Jenis Layanan Tersedia</p>
                                <p className="text-base font-medium text-foreground text-right">{registration.jenis_layanan_tersedia}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Komposisi Anggota Tim */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Komposisi Anggota Tim</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Dokter Umum</p>
                                <p className="text-base font-medium text-foreground">{registration.jumlah_dokter_umum} orang</p>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-2 border-b border-border/40 gap-2">
                                <p className="text-sm font-semibold text-muted-foreground flex-shrink-0">Rincian Dokter Spesialis</p>
                                <p className="text-base font-medium text-foreground sm:text-right break-words">{registration.rincian_dokter_spesialis}</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Perawat</p>
                                <p className="text-base font-medium text-foreground">{registration.jumlah_perawat} orang</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Bidan</p>
                                <p className="text-base font-medium text-foreground">{registration.jumlah_bidan} orang</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Apoteker / Asisten Apoteker</p>
                                <p className="text-base font-medium text-foreground">{registration.jumlah_apoteker} orang</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Psikolog</p>
                                <p className="text-base font-medium text-foreground">{registration.jumlah_psikolog} orang</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Staf Logistik</p>
                                <p className="text-base font-medium text-foreground">{registration.jumlah_staf_logistik} orang</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Staf Administrasi</p>
                                <p className="text-base font-medium text-foreground">{registration.jumlah_staf_administrasi} orang</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">Petugas Keamanan</p>
                                <p className="text-base font-medium text-foreground">{registration.jumlah_petugas_keamanan} orang</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Kapasitas Logistik */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Kapasitas Logistik Tim</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="py-2">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 pb-2 border-b border-border/40 gap-2">
                                    <p className="text-sm font-semibold text-muted-foreground flex-shrink-0">Logistik Non Medis</p>
                                    <div className="flex-1 sm:text-right">
                                        <p className="text-base font-medium text-foreground whitespace-pre-wrap break-words">{registration.logistik_non_medis}</p>
                                    </div>
                                </div>
                                {registration.logistik_non_medis_files.length > 0 && (
                                    <div className="mt-3 space-y-2 pl-0 sm:pl-4">
                                        <p className="text-xs font-semibold text-muted-foreground mb-2">File Terlampir:</p>
                                        {registration.logistik_non_medis_files.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 min-w-0"
                                            >
                                                <Download className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate break-all">{file.name}</span>
                                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Separator />
                            <div className="py-2">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 pb-2 border-b border-border/40 gap-2">
                                    <p className="text-sm font-semibold text-muted-foreground flex-shrink-0">Logistik Medis</p>
                                    <div className="flex-1 sm:text-right">
                                        <p className="text-base font-medium text-foreground whitespace-pre-wrap break-words">{registration.logistik_medis}</p>
                                    </div>
                                </div>
                                {registration.logistik_medis_files.length > 0 && (
                                    <div className="mt-3 space-y-2 pl-0 sm:pl-4">
                                        <p className="text-xs font-semibold text-muted-foreground mb-2">File Terlampir:</p>
                                        {registration.logistik_medis_files.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 min-w-0"
                                            >
                                                <Download className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate break-all">{file.name}</span>
                                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lampiran Dokumen */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lampiran Dokumen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {registration.surat_tugas_file && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-border/40 gap-2">
                                    <p className="text-sm font-semibold text-muted-foreground flex-shrink-0">Surat Tugas</p>
                                    <a
                                        href={registration.surat_tugas_file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 min-w-0"
                                    >
                                        <Download className="h-4 w-4 flex-shrink-0" />
                                        <span className="truncate break-all">{registration.surat_tugas_file.name}</span>
                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                    </a>
                                </div>
                            )}
                            {registration.scan_str_file && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-border/40 gap-2">
                                    <p className="text-sm font-semibold text-muted-foreground flex-shrink-0">Scan STR Anggota Tim</p>
                                    <a
                                        href={registration.scan_str_file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 min-w-0"
                                    >
                                        <Download className="h-4 w-4 flex-shrink-0" />
                                        <span className="truncate break-all">{registration.scan_str_file.name}</span>
                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                    </a>
                                </div>
                            )}
                            {registration.daftar_nama_anggota_file && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-border/40 gap-2">
                                    <p className="text-sm font-semibold text-muted-foreground flex-shrink-0">Daftar Nama Anggota Tim</p>
                                    <a
                                        href={registration.daftar_nama_anggota_file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 min-w-0"
                                    >
                                        <Download className="h-4 w-4 flex-shrink-0" />
                                        <span className="truncate break-all">{registration.daftar_nama_anggota_file.name}</span>
                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Sistem</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-border/40">
                            <p className="text-sm font-semibold text-muted-foreground">Tanggal Daftar</p>
                            <p className="text-base font-medium text-foreground">
                                {new Date(registration.created_at).toLocaleString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-border/40">
                            <p className="text-sm font-semibold text-muted-foreground">Terakhir Diupdate</p>
                            <p className="text-base font-medium text-foreground">
                                {new Date(registration.updated_at).toLocaleString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

