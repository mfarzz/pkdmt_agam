import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle2, XCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Kelola Pendaftaran',
        href: '/kelola-pendaftaran',
    },
];

interface Registration {
    id: number;
    nama_dmt: string;
    nama_ketua_tim: string;
    status_pendaftaran: string;
    status_penugasan: string | null;
    tanggal_kedatangan: string | null;
    email: string;
    nomor_hp: string;
    created_at: string;
    updated_at: string;
}

interface PaginatedRegistrations {
    data: Registration[];
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

interface KelolaPendaftaranProps {
    registrations: PaginatedRegistrations;
    success?: string;
}

// Helper function to get badge variant/color based on status (same as informasi.tsx)
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

function getStatusBadge(status: string | null, statusPendaftaran?: string) {
    // Prioritize status_penugasan if available, otherwise use status_pendaftaran
    const displayStatus = status || statusPendaftaran || 'Tidak diketahui';
    const badgeStyle = getStatusBadgeStyle(status || statusPendaftaran);
    
    return (
        <Badge
            variant={badgeStyle.variant}
            className={badgeStyle.className}
        >
            {displayStatus}
        </Badge>
    );
}

export default function KelolaPendaftaran({ registrations, success }: KelolaPendaftaranProps) {
    const { url } = usePage();
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [registrationToDelete, setRegistrationToDelete] = useState<Registration | null>(null);
    
    // Initialize filter states from URL params
    const [searchQuery, setSearchQuery] = useState(urlParams.get('search') || '');
    const [statusFilter, setStatusFilter] = useState(urlParams.get('status') || '');
    const [sortBy, setSortBy] = useState(urlParams.get('sort_by') || 'created_at');
    const [sortOrder, setSortOrder] = useState(urlParams.get('sort_order') || 'desc');
    
    // Get display value for status filter (convert empty string to 'all' for Select)
    const statusFilterDisplay = statusFilter || 'all';
    
    // Track if component just mounted
    const isInitialMount = useRef(true);
    
    // Update URL when filters change
    const updateFilters = (search: string, status: string, sortBy: string, sortOrder: string, resetPage: boolean = true) => {
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
        
        if (status) {
            params.set('status', status);
        }
        
        if (sortBy && sortBy !== 'created_at') {
            params.set('sort_by', sortBy);
        }
        
        if (sortOrder && sortOrder !== 'desc') {
            params.set('sort_order', sortOrder);
        }

        const queryString = params.toString();
        const newUrl = queryString ? `/kelola-pendaftaran?${queryString}` : '/kelola-pendaftaran';

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

    // Get current query params for preserving on status change
    const getCurrentQueryParams = () => {
        const params = new URLSearchParams();
        if (urlParams.has('page')) params.set('page', urlParams.get('page')!);
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (statusFilter) params.set('status', statusFilter);
        if (sortBy && sortBy !== 'created_at') params.set('sort_by', sortBy);
        if (sortOrder && sortOrder !== 'desc') params.set('sort_order', sortOrder);
        return params;
    };

    const handleView = (id: number) => {
        router.visit(`/kelola-pendaftaran/${id}`);
    };

    const handleStatusChange = (id: number, status: 'approved' | 'rejected') => {
        const queryParams = getCurrentQueryParams();
        const queryString = queryParams.toString();
        const redirectUrl = queryString ? `/kelola-pendaftaran?${queryString}` : '/kelola-pendaftaran';
        
        router.put(`/kelola-pendaftaran/${id}/status`, {
            status_pendaftaran: status,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Redirect with preserved query params
                router.get(redirectUrl, {}, {
                    preserveState: true,
                    preserveScroll: true,
                });
            },
        });
    };
    
    const handleSort = (column: string) => {
        if (sortBy === column) {
            // Toggle sort order
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new column and default to asc
            setSortBy(column);
            setSortOrder('asc');
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

    const handleDeleteClick = (registration: Registration) => {
        setRegistrationToDelete(registration);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (registrationToDelete) {
            const queryParams = getCurrentQueryParams();
            const queryString = queryParams.toString();
            const redirectUrl = queryString ? `/kelola-pendaftaran?${queryString}` : '/kelola-pendaftaran';
            
            router.delete(`/kelola-pendaftaran/${registrationToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setRegistrationToDelete(null);
                    // Redirect with preserved query params
                    router.get(redirectUrl, {}, {
                        preserveState: true,
                        preserveScroll: true,
                    });
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Pendaftaran DMT" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kelola Pendaftaran DMT</h1>
                        <p className="text-muted-foreground mt-2">
                            Kelola pendaftaran Disaster Medical Team yang masuk melalui form web
                        </p>
                    </div>
                </div>

                {success && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm font-medium text-green-700">
                        {success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Pendaftaran</CardTitle>
                        <CardDescription>
                            Total: {registrations.total || 0} pendaftaran
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filter and Search Section */}
                        <div className="mb-6 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Search Input */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Cari nama DMT, ketua tim, email, atau nomor HP..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                
                                {/* Status Filter */}
                                <Select value={statusFilterDisplay} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Filter Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="pending">Menunggu</SelectItem>
                                        <SelectItem value="approved">Disetujui</SelectItem>
                                        <SelectItem value="rejected">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {/* Clear Filters Button */}
                            {(searchQuery || statusFilter) && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('');
                                        updateFilters('', '', sortBy, sortOrder, true);
                                    }}
                                    className="w-full sm:w-auto"
                                >
                                    Reset Filter
                                </Button>
                            )}
                        </div>
                        
                        {!registrations.data || registrations.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Belum ada pendaftaran yang masuk.</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-4 font-medium">
                                                    <button
                                                        onClick={() => handleSort('nama_dmt')}
                                                        className="flex items-center hover:text-primary transition-colors"
                                                    >
                                                        Nama DMT
                                                        {getSortIcon('nama_dmt')}
                                                    </button>
                                                </th>
                                                <th className="text-left p-4 font-medium">
                                                    <button
                                                        onClick={() => handleSort('nama_ketua_tim')}
                                                        className="flex items-center hover:text-primary transition-colors"
                                                    >
                                                        Ketua Tim
                                                        {getSortIcon('nama_ketua_tim')}
                                                    </button>
                                                </th>
                                                <th className="text-left p-4 font-medium">
                                                    <button
                                                        onClick={() => handleSort('status_pendaftaran')}
                                                        className="flex items-center hover:text-primary transition-colors"
                                                    >
                                                        Status
                                                        {getSortIcon('status_pendaftaran')}
                                                    </button>
                                                </th>
                                                <th className="text-left p-4 font-medium">
                                                    <button
                                                        onClick={() => handleSort('tanggal_kedatangan')}
                                                        className="flex items-center hover:text-primary transition-colors"
                                                    >
                                                        Tanggal Kedatangan
                                                        {getSortIcon('tanggal_kedatangan')}
                                                    </button>
                                                </th>
                                                <th className="text-left p-4 font-medium">
                                                    <button
                                                        onClick={() => handleSort('email')}
                                                        className="flex items-center hover:text-primary transition-colors"
                                                    >
                                                        Email
                                                        {getSortIcon('email')}
                                                    </button>
                                                </th>
                                                <th className="text-left p-4 font-medium">
                                                    <button
                                                        onClick={() => handleSort('created_at')}
                                                        className="flex items-center hover:text-primary transition-colors"
                                                    >
                                                        Tanggal Daftar
                                                        {getSortIcon('created_at')}
                                                    </button>
                                                </th>
                                                <th className="text-right p-4 font-medium">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {registrations.data.map((registration) => (
                                            <tr key={registration.id} className="border-b hover:bg-muted/50">
                                                <td className="p-4">{registration.nama_dmt}</td>
                                                <td className="p-4">{registration.nama_ketua_tim}</td>
                                                <td className="p-4">{getStatusBadge(registration.status_penugasan, registration.status_pendaftaran)}</td>
                                                <td className="p-4">
                                                    {registration.tanggal_kedatangan 
                                                        ? new Date(registration.tanggal_kedatangan).toLocaleDateString('id-ID')
                                                        : '-'}
                                                </td>
                                                <td className="p-4">{registration.email}</td>
                                                <td className="p-4">
                                                    {new Date(registration.created_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleView(registration.id)}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Lihat Detail</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        {registration.status_pendaftaran === 'pending' && (
                                                            <>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleStatusChange(registration.id, 'approved')}
                                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                        >
                                                                            <CheckCircle2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Setujui</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleStatusChange(registration.id, 'rejected')}
                                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        >
                                                                            <XCircle className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Tolak</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </>
                                                        )}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteClick(registration)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Hapus</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {registrations.last_page > 1 && (
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Menampilkan {registrations.from} sampai {registrations.to} dari {registrations.total} pendaftaran
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Previous Button */}
                                            {registrations.prev_page_url && (
                                                <Link
                                                    href={registrations.prev_page_url}
                                                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                                                    preserveScroll
                                                >
                                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                                    Sebelumnya
                                                </Link>
                                            )}

                                            {/* Page Numbers */}
                                            <div className="flex items-center gap-1">
                                                {registrations.links.slice(1, -1).map((link, index) => {
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
                                            {registrations.next_page_url && (
                                                <Link
                                                    href={registrations.next_page_url}
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
                    </CardContent>
                </Card>

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Pendaftaran</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus pendaftaran "{registrationToDelete?.nama_dmt}"?
                                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua file yang terkait.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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

