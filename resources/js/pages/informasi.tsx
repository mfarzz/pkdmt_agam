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
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, ChevronLeft, ChevronRight, Eye, Mail, Phone, Search, Users, XCircle, X, Activity, Stethoscope, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePage } from '@inertiajs/react';

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
    aggregateData?: {
        kapasitas: {
            rawat_jalan: number;
            rawat_inap: number;
            operasi_mayor: number;
            operasi_minor: number;
        };
        tenaga_medis: {
            dokter_umum: number;
            perawat: number;
            bidan: number;
            apoteker: number;
            psikolog: number;
            staf_logistik: number;
            staf_administrasi: number;
            petugas_keamanan: number;
        };
    };
    jenisLayananData?: Array<{ name: string; count: number }>;
    activeDisasterName?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
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

// Helper function to get badge variant/color based on status
function getStatusBadgeStyle(status: string | null): { variant: 'default' | 'secondary' | 'outline' | 'destructive'; className?: string } {
    if (!status) {
        return { variant: 'secondary' };
    }

    const statusLower = status.toLowerCase().trim();
    
    // Map status to different colors
    if (statusLower === 'aktif') {
        return { variant: 'default', className: 'bg-green-500 hover:bg-green-600 text-white' };
    } else if (statusLower === 'selesai' || statusLower.includes('selesai')) {
        return { variant: 'secondary', className: 'bg-gray-500 hover:bg-gray-600 text-white' };
    } else if (statusLower === 'belum datang' || statusLower.includes('belum') || statusLower.includes('pending')) {
        return { variant: 'outline', className: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800' };
    } else if (statusLower === 'dibatalkan' || statusLower.includes('batal')) {
        return { variant: 'destructive', className: 'bg-red-500 hover:bg-red-600 text-white' };
    } else if (statusLower === 'dijadwalkan' || statusLower.includes('jadwal')) {
        return { variant: 'outline', className: 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' };
    } else {
        // Default untuk status lainnya
        return { variant: 'secondary', className: 'bg-slate-500 hover:bg-slate-600 text-white' };
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
                                        variant={getStatusBadgeStyle(dmt.status_penugasan).variant}
                                        className={`ml-2 ${getStatusBadgeStyle(dmt.status_penugasan).className || ''}`}
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

export default function Informasi({ dmtData, statistics, aggregateData, jenisLayananData = [], activeDisasterName, sortBy: initialSortBy = 'tanggal_kedatangan', sortOrder: initialSortOrder = 'desc' }: InformasiProps) {
    const { url } = usePage();
    const urlParams = new URLSearchParams(url.split('?')[1] || '');

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

    const allDmtData = useMemo(() => {
        if (!dmtData) return [];
        // Handle both paginator object and direct array
        if (Array.isArray(dmtData)) {
            return dmtData;
        }
        return dmtData?.data || [];
    }, [dmtData]);
    const paginationLinks = dmtData?.links || [];

    // Initialize filter states from URL params (ignore page param)
    const [searchQuery, setSearchQuery] = useState(() => {
        const params = new URLSearchParams(url.split('?')[1] || '');
        return params.get('search') || '';
    });
    const [statusFilter, setStatusFilter] = useState<string>(() => {
        const params = new URLSearchParams(url.split('?')[1] || '');
        return params.get('status') || 'all';
    });
    const [sortBy, setSortBy] = useState(() => {
        const params = new URLSearchParams(url.split('?')[1] || '');
        return params.get('sort_by') || initialSortBy;
    });
    const [sortOrder, setSortOrder] = useState(() => {
        const params = new URLSearchParams(url.split('?')[1] || '');
        return params.get('sort_order') || initialSortOrder;
    });

    // Track if component just mounted to avoid request on initial load
    const isInitialMount = useRef(true);

    // Update URL when filters change
    const updateFilters = (search: string, status: string, sortBy: string, sortOrder: string, resetPage: boolean = true) => {
        // Skip on initial mount
        if (isInitialMount.current) {
            return;
        }

        // Start with current URL params to preserve page and other params
        const currentParams = new URLSearchParams(window.location.search);
        const params = new URLSearchParams();
        
        // Preserve page parameter if not resetting
        if (!resetPage && currentParams.has('page')) {
            params.set('page', currentParams.get('page')!);
        }
        
        // Set filter parameters
        if (search.trim()) {
            params.set('search', search.trim());
        }
        
        if (status && status !== 'all') {
            params.set('status', status);
        }
        
        if (sortBy && sortBy !== 'tanggal_kedatangan') {
            params.set('sort_by', sortBy);
        }
        
        if (sortOrder && sortOrder !== 'desc') {
            params.set('sort_order', sortOrder);
        }

        const queryString = params.toString();
        const newUrl = queryString ? `/informasi?${queryString}` : '/informasi';

        // Get current URL without hash
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        const currentUrl = currentPath + currentSearch;
        
        // Only navigate if filter parameters actually changed (ignore page param)
        const currentParamsWithoutPage = new URLSearchParams(currentSearch);
        const newParamsWithoutPage = new URLSearchParams(queryString);
        currentParamsWithoutPage.delete('page');
        newParamsWithoutPage.delete('page');
        
        // Compare filter params only (not page)
        const currentFilterString = currentParamsWithoutPage.toString();
        const newFilterString = newParamsWithoutPage.toString();
        
        // Only navigate if filter params changed
        if (currentFilterString !== newFilterString) {
            router.get(newUrl, {}, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }
    };

    // Track previous filter values to detect actual changes
    const prevFiltersRef = useRef({ search: searchQuery, status: statusFilter, sortBy, sortOrder });

    // Debounce search query updates and handle status/sort changes
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            prevFiltersRef.current = { search: searchQuery, status: statusFilter, sortBy, sortOrder };
            return;
        }

        // Only update if filters actually changed (not just on re-render from pagination)
        const filtersChanged = 
            prevFiltersRef.current.search !== searchQuery || 
            prevFiltersRef.current.status !== statusFilter ||
            prevFiltersRef.current.sortBy !== sortBy ||
            prevFiltersRef.current.sortOrder !== sortOrder;

        if (!filtersChanged) {
            return;
        }

        prevFiltersRef.current = { search: searchQuery, status: statusFilter, sortBy, sortOrder };

        // Debounce search, but update status/sort immediately
        if (prevFiltersRef.current.search !== searchQuery) {
            const timeoutId = setTimeout(() => {
                updateFilters(searchQuery, statusFilter, sortBy, sortOrder, true);
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            // Update immediately for status, sortBy, or sortOrder changes
            updateFilters(searchQuery, statusFilter, sortBy, sortOrder, true);
        }
    }, [searchQuery, statusFilter, sortBy, sortOrder]);
    
    const handleSort = (column: string) => {
        if (sortBy === column) {
            // Toggle sort order
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new column and default to desc
            setSortBy(column);
            setSortOrder('desc');
        }
    };
    
    const getSortIcon = (column: string) => {
        if (sortBy !== column) {
            return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
        }
        return sortOrder === 'asc' 
            ? <ArrowUp className="h-4 w-4 ml-1" />
            : <ArrowDown className="h-4 w-4 ml-1" />;
    };

    // Data is already filtered by backend, no need for client-side filtering
    // Ensure dmtDataList is always an array
    const dmtDataList = Array.isArray(allDmtData) ? allDmtData : [];

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

                    {/* Visualization Section */}
                    {aggregateData && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Kapasitas Layanan Chart */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-primary" />
                                        <CardTitle>Kapasitas Layanan</CardTitle>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Total kapasitas layanan dari tim DMT aktif
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={[
                                                {
                                                    name: 'Rawat Jalan',
                                                    value: aggregateData.kapasitas.rawat_jalan,
                                                    unit: 'pasien/hari',
                                                },
                                                {
                                                    name: 'Rawat Inap',
                                                    value: aggregateData.kapasitas.rawat_inap,
                                                    unit: 'pasien/hari',
                                                },
                                                {
                                                    name: 'Operasi Mayor',
                                                    value: aggregateData.kapasitas.operasi_mayor,
                                                    unit: 'kasus/hari',
                                                },
                                                {
                                                    name: 'Operasi Minor',
                                                    value: aggregateData.kapasitas.operasi_minor,
                                                    unit: 'kasus/hari',
                                                },
                                            ]}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value: number, name: string, props: any) => [
                                                    `${value} ${props.payload.unit}`,
                                                    props.payload.name,
                                                ]}
                                            />
                                            <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Tenaga Medis Chart */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Stethoscope className="h-5 w-5 text-primary" />
                                        <CardTitle>Tenaga Medis & Staf</CardTitle>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Total tenaga medis dan staf dari semua tim DMT
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={[
                                                { name: 'Dokter Umum', value: aggregateData.tenaga_medis.dokter_umum },
                                                { name: 'Perawat', value: aggregateData.tenaga_medis.perawat },
                                                { name: 'Bidan', value: aggregateData.tenaga_medis.bidan },
                                                { name: 'Apoteker', value: aggregateData.tenaga_medis.apoteker },
                                                { name: 'Psikolog', value: aggregateData.tenaga_medis.psikolog },
                                                { name: 'Staf Logistik', value: aggregateData.tenaga_medis.staf_logistik },
                                                { name: 'Staf Admin', value: aggregateData.tenaga_medis.staf_administrasi },
                                                { name: 'Petugas Keamanan', value: aggregateData.tenaga_medis.petugas_keamanan },
                                            ]}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <Tooltip formatter={(value: number) => [`${value} orang`, 'Jumlah']} />
                                            <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Jenis Layanan Tersedia Chart */}
                    {jenisLayananData && jenisLayananData.length > 0 && (
                        <Card className="mb-8">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    <CardTitle>Jenis Layanan yang Tersedia</CardTitle>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Frekuensi jenis layanan yang tersedia dari tim DMT aktif
                                </p>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={jenisLayananData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="name" 
                                            angle={-45} 
                                            textAnchor="end" 
                                            height={100}
                                            interval={0}
                                        />
                                        <YAxis />
                                        <Tooltip 
                                            formatter={(value: number) => [`${value} tim`, 'Jumlah Tim']} 
                                        />
                                        <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}

                    {/* Filter Section */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
                            {/* Search Input */}
                            <div className="relative flex-1 sm:flex-initial sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama DMT, ketua tim, kontak..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="Aktif">Aktif</SelectItem>
                                    <SelectItem value="Belum Datang">Belum Datang</SelectItem>
                                    <SelectItem value="Selesai">Selesai</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Results Count */}
                        <div className="text-sm text-muted-foreground">
                            {dmtData?.total || 0} tim ditemukan
                        </div>
                    </div>

                    {(!dmtData || dmtDataList.length === 0) ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Tidak ada data yang sesuai dengan filter.'
                                    : 'Belum ada data DMT tersedia.'}
                            </p>
                            {(searchQuery || statusFilter !== 'all') && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('all');
                                        setSortBy('tanggal_kedatangan');
                                        setSortOrder('desc');
                                        updateFilters('', 'all', 'tanggal_kedatangan', 'desc');
                                    }}
                                    className="mt-4"
                                >
                                    Reset Filter
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">ID</TableHead>
                                            <TableHead className="w-[200px]">
                                                <button
                                                    onClick={() => handleSort('nama_dmt')}
                                                    className="flex items-center hover:text-primary transition-colors"
                                                >
                                                    Nama DMT
                                                    {getSortIcon('nama_dmt')}
                                                </button>
                                            </TableHead>
                                            <TableHead>
                                                <button
                                                    onClick={() => handleSort('nama_ketua_tim')}
                                                    className="flex items-center hover:text-primary transition-colors"
                                                >
                                                    Ketua Tim
                                                    {getSortIcon('nama_ketua_tim')}
                                                </button>
                                            </TableHead>
                                            <TableHead>
                                                <button
                                                    onClick={() => handleSort('status_penugasan')}
                                                    className="flex items-center hover:text-primary transition-colors"
                                                >
                                                    Status
                                                    {getSortIcon('status_penugasan')}
                                                </button>
                                            </TableHead>
                                            <TableHead>
                                                <button
                                                    onClick={() => handleSort('tanggal_kedatangan')}
                                                    className="flex items-center hover:text-primary transition-colors"
                                                >
                                                    Tanggal Kedatangan
                                                    {getSortIcon('tanggal_kedatangan')}
                                                </button>
                                            </TableHead>
                                            <TableHead>
                                                <button
                                                    onClick={() => handleSort('masa_penugasan_hari')}
                                                    className="flex items-center hover:text-primary transition-colors"
                                                >
                                                    Masa Penugasan
                                                    {getSortIcon('masa_penugasan_hari')}
                                                </button>
                                            </TableHead>
                                            <TableHead>
                                                <button
                                                    onClick={() => handleSort('kapasitas_rawat_jalan')}
                                                    className="flex items-center hover:text-primary transition-colors"
                                                >
                                                    Kapasitas Rawat Jalan
                                                    {getSortIcon('kapasitas_rawat_jalan')}
                                                </button>
                                            </TableHead>
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
                                                            variant={getStatusBadgeStyle(dmt.status_penugasan).variant}
                                                            className={getStatusBadgeStyle(dmt.status_penugasan).className}
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
                                                href={paginationLinks[0].url || '#'}
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
                                        {dmtData.next_page_url && (
                                            <Link
                                                href={dmtData.next_page_url}
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
