import AppFooter from '@/components/app-footer';
import AppNavbar from '@/components/app-navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, ChevronLeft, ChevronRight, Eye, Mail, Phone, Users, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DmtData {
    id: number;
    nama_dmt: string;
    nama_ketua_tim: string | null;
    status_penugasan: string | null;
    tanggal_kedatangan: string | null;
    masa_penugasan_hari: number | null;
    tanggal_pelayanan_dimulai: string | null;
    tanggal_pelayanan_diakhiri: string | null;
    rencana_tanggal_kepulangan: string | null;
    nama_nara_hubung: string | null;
    posisi_jabatan: string | null;
    email: string | null;
    nomor_hp: string | null;
    kapasitas_rawat_jalan: number | null;
    kapasitas_rawat_inap: number | null;
    kapasitas_operasi_bedah_mayor: number | null;
    kapasitas_operasi_bedah_minor: number | null;
    jenis_layanan_tersedia: string | null;
    jumlah_dokter_umum: number | null;
    rincian_dokter_spesialis: string | null;
    jumlah_perawat: number | null;
    jumlah_bidan: number | null;
    jumlah_apoteker: number | null;
    jumlah_psikolog: number | null;
    jumlah_staf_logistik: number | null;
    jumlah_staf_administrasi: number | null;
    jumlah_petugas_keamanan: number | null;
}

interface PaginatedDmtData {
    data: DmtData[];
    current_page: number;
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

interface InformasiProps {
    dmtData?: PaginatedDmtData;
    statistics?: {
        total_aktif: number;
        total_selesai: number;
        total_tim: number;
    };
    activeDisasterName?: string;
}

function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
}

function DetailDialog({ dmt }: { dmt: DmtData }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Detail
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{dmt.nama_dmt}</DialogTitle>
                    <DialogDescription>
                        Informasi lengkap Disaster Medical Team
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                    {/* Informasi Dasar */}
                    <div>
                        <h3 className="font-semibold text-lg mb-3">Informasi Dasar</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {dmt.nama_ketua_tim && (
                                <div>
                                    <span className="text-muted-foreground">Ketua Tim:</span>
                                    <span className="font-medium ml-2">{dmt.nama_ketua_tim}</span>
                                </div>
                            )}
                            {dmt.status_penugasan && (
                                <div>
                                    <span className="text-muted-foreground">Status:</span>
                                    <Badge
                                        variant={dmt.status_penugasan.toLowerCase() === 'aktif' ? 'default' : 'secondary'}
                                        className="ml-2"
                                    >
                                        {dmt.status_penugasan}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Informasi Penugasan */}
                    <div>
                        <h3 className="font-semibold text-lg mb-3">Informasi Penugasan</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {dmt.tanggal_kedatangan && (
                                <div>
                                    <span className="text-muted-foreground">Tanggal Kedatangan:</span>
                                    <span className="font-medium ml-2">{formatDate(dmt.tanggal_kedatangan)}</span>
                                </div>
                            )}
                            {dmt.masa_penugasan_hari !== null && (
                                <div>
                                    <span className="text-muted-foreground">Masa Penugasan:</span>
                                    <span className="font-medium ml-2">{dmt.masa_penugasan_hari} hari</span>
                                </div>
                            )}
                            {dmt.tanggal_pelayanan_dimulai && (
                                <div>
                                    <span className="text-muted-foreground">Pelayanan Dimulai:</span>
                                    <span className="font-medium ml-2">{formatDate(dmt.tanggal_pelayanan_dimulai)}</span>
                                </div>
                            )}
                            {dmt.tanggal_pelayanan_diakhiri && (
                                <div>
                                    <span className="text-muted-foreground">Pelayanan Diakhiri:</span>
                                    <span className="font-medium ml-2">{formatDate(dmt.tanggal_pelayanan_diakhiri)}</span>
                                </div>
                            )}
                            {dmt.rencana_tanggal_kepulangan && (
                                <div>
                                    <span className="text-muted-foreground">Rencana Kepulangan:</span>
                                    <span className="font-medium ml-2">{formatDate(dmt.rencana_tanggal_kepulangan)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Kontak */}
                    {(dmt.nama_nara_hubung || dmt.email || dmt.nomor_hp) && (
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Kontak</h3>
                            <div className="space-y-2 text-sm">
                                {dmt.nama_nara_hubung && (
                                    <div>
                                        <span className="text-muted-foreground">Nara Hubung:</span>
                                        <span className="font-medium ml-2">{dmt.nama_nara_hubung}</span>
                                        {dmt.posisi_jabatan && (
                                            <span className="text-muted-foreground ml-2">({dmt.posisi_jabatan})</span>
                                        )}
                                    </div>
                                )}
                                {dmt.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a href={`mailto:${dmt.email}`} className="text-primary hover:underline">
                                            {dmt.email}
                                        </a>
                                    </div>
                                )}
                                {dmt.nomor_hp && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <a
                                            href={`https://wa.me/${dmt.nomor_hp.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            {dmt.nomor_hp}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Kapasitas Layanan */}
                    {(dmt.kapasitas_rawat_jalan !== null ||
                        dmt.kapasitas_rawat_inap !== null ||
                        dmt.kapasitas_operasi_bedah_mayor !== null ||
                        dmt.kapasitas_operasi_bedah_minor !== null) && (
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Kapasitas Layanan</h3>
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                    {dmt.kapasitas_rawat_jalan !== null && (
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <div className="text-xl font-bold">{dmt.kapasitas_rawat_jalan}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Rawat Jalan/hari</div>
                                        </div>
                                    )}
                                    {dmt.kapasitas_rawat_inap !== null && (
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <div className="text-xl font-bold">{dmt.kapasitas_rawat_inap}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Rawat Inap/hari</div>
                                        </div>
                                    )}
                                    {dmt.kapasitas_operasi_bedah_mayor !== null && (
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <div className="text-xl font-bold">{dmt.kapasitas_operasi_bedah_mayor}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Bedah Mayor/hari</div>
                                        </div>
                                    )}
                                    {dmt.kapasitas_operasi_bedah_minor !== null && (
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <div className="text-xl font-bold">{dmt.kapasitas_operasi_bedah_minor}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Bedah Minor/hari</div>
                                        </div>
                                    )}
                                </div>
                                {dmt.jenis_layanan_tersedia && (
                                    <div className="mt-4 text-sm">
                                        <span className="text-muted-foreground">Jenis Layanan: </span>
                                        <span className="font-medium">{dmt.jenis_layanan_tersedia}</span>
                                    </div>
                                )}
                            </div>
                        )}

                    {/* Tenaga Medis */}
                    {(dmt.jumlah_dokter_umum !== null ||
                        dmt.rincian_dokter_spesialis ||
                        dmt.jumlah_perawat !== null ||
                        dmt.jumlah_bidan !== null ||
                        dmt.jumlah_apoteker !== null ||
                        dmt.jumlah_psikolog !== null) && (
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Tenaga Medis</h3>
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                    {dmt.jumlah_dokter_umum !== null && dmt.jumlah_dokter_umum > 0 && (
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <div className="text-lg font-bold">{dmt.jumlah_dokter_umum}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Dokter Umum</div>
                                        </div>
                                    )}
                                    {dmt.jumlah_perawat !== null && dmt.jumlah_perawat > 0 && (
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <div className="text-lg font-bold">{dmt.jumlah_perawat}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Perawat</div>
                                        </div>
                                    )}
                                    {dmt.jumlah_bidan !== null && dmt.jumlah_bidan > 0 && (
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <div className="text-lg font-bold">{dmt.jumlah_bidan}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Bidan</div>
                                        </div>
                                    )}
                                    {dmt.jumlah_apoteker !== null && dmt.jumlah_apoteker > 0 && (
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <div className="text-lg font-bold">{dmt.jumlah_apoteker}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Apoteker</div>
                                        </div>
                                    )}
                                    {dmt.jumlah_psikolog !== null && dmt.jumlah_psikolog > 0 && (
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <div className="text-lg font-bold">{dmt.jumlah_psikolog}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Psikolog</div>
                                        </div>
                                    )}
                                    {dmt.jumlah_staf_logistik !== null && dmt.jumlah_staf_logistik > 0 && (
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <div className="text-lg font-bold">{dmt.jumlah_staf_logistik}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Staf Logistik</div>
                                        </div>
                                    )}
                                    {dmt.jumlah_staf_administrasi !== null && dmt.jumlah_staf_administrasi > 0 && (
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <div className="text-lg font-bold">{dmt.jumlah_staf_administrasi}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Staf Administrasi</div>
                                        </div>
                                    )}
                                    {dmt.jumlah_petugas_keamanan !== null && dmt.jumlah_petugas_keamanan > 0 && (
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <div className="text-lg font-bold">{dmt.jumlah_petugas_keamanan}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Petugas Keamanan</div>
                                        </div>
                                    )}
                                </div>
                                {dmt.rincian_dokter_spesialis && (
                                    <div className="mt-4 text-sm">
                                        <span className="text-muted-foreground">Dokter Spesialis: </span>
                                        <span className="font-medium">{dmt.rincian_dokter_spesialis}</span>
                                    </div>
                                )}
                            </div>
                        )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function Informasi({ dmtData, statistics, activeDisasterName }: InformasiProps) {
    const navItems = [
        {
            name: 'Beranda',
            link: '/',
        },
        {
            name: 'Informasi',
            link: '/informasi',
        },
    ];

    const dmtDataList = dmtData?.data || [];
    const paginationLinks = dmtData?.links || [];

    // Auto-scan DMT sheet on page load - using same logic as scan button
    useEffect(() => {
        // Check if already scanned in this session
        const scanKey = 'dmt_auto_scanned';
        if (sessionStorage.getItem(scanKey)) {
            return;
        }

        const autoScan = async () => {
            try {
                const response = await fetch('/informasi/auto-scan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        console.log('Auto-scan completed:', result.message);
                        sessionStorage.setItem(scanKey, 'true');
                        // Reload page to show updated data
                        window.location.reload();
                    }
                }
            } catch (error) {
                console.error('Error auto-scanning DMT:', error);
            }
        };

        autoScan();
    }, []);

    return (
        <>
            <Head title="Informasi DMT - PKDMT" />
            <div className="min-h-screen bg-background flex flex-col">
                <AppNavbar navItems={navItems} />

                <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 pt-24 flex-1">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Informasi Disaster Medical Team (DMT)
                        </h1>
                        <p className="mt-2 text-lg text-muted-foreground">
                            {activeDisasterName ? `Data tim medis yang bertugas di ${activeDisasterName}` : 'Data tim medis yang bertugas di Kabupaten Agam'}
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    {statistics && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Tim
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{statistics.total_tim}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Total Disaster Medical Team
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Tim Aktif
                                    </CardTitle>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{statistics.total_aktif}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Tim yang sedang bertugas
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Tim Selesai
                                    </CardTitle>
                                    <XCircle className="h-4 w-4 text-gray-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-600">{statistics.total_selesai}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Tim yang telah menyelesaikan tugas
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {dmtDataList.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Belum ada data DMT tersedia.</p>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">ID</TableHead>
                                            <TableHead className="w-[200px]">Nama DMT</TableHead>
                                            <TableHead>Ketua Tim</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Tanggal Kedatangan</TableHead>
                                            <TableHead>Masa Penugasan</TableHead>
                                            <TableHead>Kapasitas Rawat Jalan</TableHead>
                                            <TableHead>Kontak</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dmtDataList.map((dmt) => (
                                            <TableRow key={dmt.id}>
                                                <TableCell className="font-medium">{dmt.id}</TableCell>
                                                <TableCell className="font-medium">{dmt.nama_dmt}</TableCell>
                                                <TableCell>{dmt.nama_ketua_tim || '-'}</TableCell>
                                                <TableCell>
                                                    {dmt.status_penugasan ? (
                                                        <Badge
                                                            variant={
                                                                dmt.status_penugasan.toLowerCase() === 'aktif'
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {dmt.status_penugasan}
                                                        </Badge>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </TableCell>
                                                <TableCell>{formatDate(dmt.tanggal_kedatangan)}</TableCell>
                                                <TableCell>
                                                    {dmt.masa_penugasan_hari !== null
                                                        ? `${dmt.masa_penugasan_hari} hari`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {dmt.kapasitas_rawat_jalan !== null
                                                        ? `${dmt.kapasitas_rawat_jalan} pasien/hari`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {dmt.email && (
                                                            <a
                                                                href={`mailto:${dmt.email}`}
                                                                className="text-primary hover:underline text-sm flex items-center gap-1"
                                                            >
                                                                <Mail className="h-3 w-3" />
                                                                {dmt.email}
                                                            </a>
                                                        )}
                                                        {dmt.nomor_hp && (
                                                            <a
                                                                href={`https://wa.me/${dmt.nomor_hp.replace(/[^0-9]/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:underline text-sm flex items-center gap-1"
                                                            >
                                                                <Phone className="h-3 w-3" />
                                                                {dmt.nomor_hp}
                                                            </a>
                                                        )}
                                                        {!dmt.email && !dmt.nomor_hp && '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DetailDialog dmt={dmt} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {dmtData && dmtData.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Menampilkan {dmtData.from} sampai {dmtData.to} dari {dmtData.total} tim
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Previous Button */}
                                        {dmtData.current_page > 1 && paginationLinks[0]?.url && (
                                            <Link
                                                href={paginationLinks[0].url}
                                                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                                                preserveScroll
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
                                                        className={`inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors ${link.active
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                                                            }`}
                                                        preserveScroll
                                                    >
                                                        {link.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>

                                        {/* Next Button */}
                                        {dmtData.current_page < dmtData.last_page && paginationLinks[paginationLinks.length - 1]?.url && (
                                            <Link
                                                href={paginationLinks[paginationLinks.length - 1].url as string}
                                                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                                                preserveScroll
                                            >
                                                Selanjutnya
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <AppFooter />
            </div>
        </>
    );
}
