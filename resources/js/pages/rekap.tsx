import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import AppNavbar from '@/components/app-navbar';
import AppFooter from '@/components/app-footer';
import { type SharedData } from '@/types';

interface ReportData {
    folder_link: string | null;
    title?: string;
    is_public?: boolean;
}

interface ReportLink {
    id: number;
    title: string;
    is_public: boolean;
    gdrive_url: string;
}

interface RekapProps {
    reportLinks?: ReportLink[];
}

export default function Rekap({ reportLinks = [] }: RekapProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const isAuthenticated = !!auth?.user;

    const [currentDate, setCurrentDate] = useState(new Date());

    // Get available report links based on access
    const availableLinks = useMemo(() => {
        return reportLinks.filter(link => {
            // If public, always show
            if (link.is_public) return true;
            // If not public, only show if authenticated
            return isAuthenticated;
        });
    }, [reportLinks, isAuthenticated]);

    // Initialize selected link IDs (all available links by default)
    const [selectedLinkIds, setSelectedLinkIds] = useState<number[]>(
        availableLinks.map(link => link.id)
    );
    const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({});
    const [reportData, setReportData] = useState<Record<string, ReportData>>({});
    const [loadingReports, setLoadingReports] = useState(false);

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

    // Fungsi untuk mendapatkan semua hari dalam bulan
    const getCalendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Hari pertama bulan
        const firstDay = new Date(year, month, 1);
        // Hari terakhir bulan
        const lastDay = new Date(year, month + 1, 0);

        // Hari pertama yang ditampilkan (bisa dari bulan sebelumnya)
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Mulai dari Minggu

        // Hari terakhir yang ditampilkan (bisa dari bulan berikutnya)
        const endDate = new Date(lastDay);
        const daysToAdd = 6 - endDate.getDay();
        endDate.setDate(endDate.getDate() + daysToAdd);

        const days: Date[] = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return days;
    }, [currentDate]);

    // Format bulan dan tahun
    const monthYear = currentDate.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
    });

    // Navigasi bulan
    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setCurrentDate(newDate);
    };

    // Navigasi ke hari ini
    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Cek apakah tanggal adalah hari ini
    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    // Cek apakah tanggal adalah bulan saat ini
    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentDate.getMonth();
    };

    // Load report folder link for a specific date and link
    const loadReportFolder = async (date: Date, linkId: number) => {
        const dateStr = date.toISOString().split('T')[0];
        const key = `${dateStr}-${linkId}`;

        // Don't reload if already loaded
        if (reportData[key]) {
            return;
        }

        setLoadingFiles(prev => ({ ...prev, [key]: true }));

        try {
            const response = await fetch(`/rekap/files?date=${dateStr}&link_id=${linkId}`);
            const data = await response.json();

            if (data.success && data.folder_link) {
                setReportData(prev => ({ ...prev, [key]: { folder_link: data.folder_link, title: data.link_title, is_public: data.is_public } }));
            } else {
                // No folder found or error
                setReportData(prev => ({ ...prev, [key]: { folder_link: null } }));
            }
        } catch (error) {
            console.error('Error loading report folder:', error);
            setReportData(prev => ({ ...prev, [key]: { folder_link: null } }));
        } finally {
            setLoadingFiles(prev => ({ ...prev, [key]: false }));
        }
    };

    // Check if date has folder link for a specific link
    const hasFolderLink = (date: Date, linkId: number): boolean => {
        const dateStr = date.toISOString().split('T')[0];
        const key = `${dateStr}-${linkId}`;
        const data = reportData[key];
        return data && data.folder_link !== null;
    };

    // Get available links for a date (only if has folder link)
    const getAvailableLinks = (date: Date): ReportLink[] => {
        return availableLinks.filter(link => {
            // Only show if selected and has folder link
            return selectedLinkIds.includes(link.id) && hasFolderLink(date, link.id);
        });
    };

    // Auto-scan report links on page load - using same logic as scan button
    useEffect(() => {
        const autoScanAll = async () => {
            if (reportLinks.length > 0) {
                try {
                    const response = await fetch('/rekap/auto-scan', {
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
                        }
                    }
                } catch (error) {
                    console.error('Error auto-scanning report links:', error);
                }
            }
        };

        autoScanAll();
    }, [reportLinks]);

    // Pre-load folder links for all dates in current month
    useEffect(() => {
        const loadMonthFolders = async () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1; // JavaScript month is 0-based, API expects 1-based

            setLoadingReports(true);
            try {
                const response = await fetch(`/rekap/month?year=${year}&month=${month}`);
                const data = await response.json();

                if (data.success && data.reports) {
                    // Update reportData with all dates from the month
                    const newReportData: Record<string, ReportData> = {};
                    for (const [dateStr, reports] of Object.entries(data.reports)) {
                        const reportsByLink = reports as Record<string, { title: string; folder_link: string; is_public: boolean }>;
                        for (const [linkId, reportInfo] of Object.entries(reportsByLink)) {
                            const key = `${dateStr}-${linkId}`;
                            newReportData[key] = {
                                folder_link: reportInfo.folder_link,
                                title: reportInfo.title,
                                is_public: reportInfo.is_public,
                            };
                        }
                    }
                    setReportData(prev => ({ ...prev, ...newReportData }));
                }
            } catch (error) {
                console.error('Error loading month reports:', error);
            } finally {
                setLoadingReports(false);
            }
        };

        if (reportLinks.length > 0) {
            loadMonthFolders();
        } else {
            setLoadingReports(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate]);

    // Handle checkbox change for links
    const handleLinkChange = (linkId: number, checked: boolean) => {
        // Prevent unchecking if it's the only selected link
        if (!checked && selectedLinkIds.length === 1) {
            return;
        }

        if (checked) {
            setSelectedLinkIds([...selectedLinkIds, linkId]);
        } else {
            setSelectedLinkIds(selectedLinkIds.filter(id => id !== linkId));
        }
    };

    // Initialize: update selected links when available links change
    useEffect(() => {
        setSelectedLinkIds(availableLinks.map(link => link.id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableLinks.length]);

    // Nama hari dalam minggu
    const weekDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    return (
        <>
            <Head title="Rekap Data" />
            <div className="min-h-screen bg-background flex flex-col">
                <AppNavbar navItems={navItems} />

                <div className="container mx-auto px-4 py-4 md:py-8 pt-20 md:pt-24 flex-1">
                    {/* Header - Mobile Optimized */}
                    <div className="mb-4 md:mb-6">
                        {/* Mobile: Stacked Layout */}
                        <div className="md:hidden space-y-4">
                            {/* Top Row: Back Button + Title */}
                            <div className="flex items-center gap-3">
                                <Link href="/">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span className="sr-only">Kembali ke Layanan</span>
                                    </Button>
                                </Link>
                                <div className="flex-1">
                                    <h1 className="text-xl font-bold text-foreground">
                                        Rekap Data
                                    </h1>
                                    <p className="text-xs text-muted-foreground">
                                        Kalender Rekap Bulanan
                                    </p>
                                </div>
                            </div>

                            {/* Report Link Checkboxes - Mobile */}
                            <Card className="p-4">
                                <h3 className="text-sm font-semibold mb-3 text-foreground">
                                    Jenis Laporan
                                </h3>
                                <div className="space-y-2">
                                    {availableLinks.map((link) => (
                                        <div key={link.id} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`mobile-link-${link.id}`}
                                                checked={selectedLinkIds.includes(link.id)}
                                                onCheckedChange={(checked) =>
                                                    handleLinkChange(link.id, checked as boolean)
                                                }
                                            />
                                            <Label htmlFor={`mobile-link-${link.id}`} className="text-sm font-medium cursor-pointer flex-1">
                                                {link.title}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Month Navigation */}
                            <div className="flex items-center justify-between gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToToday}
                                    className="h-8 px-3 text-xs"
                                >
                                    Hari Ini
                                </Button>
                                <div className="flex items-center gap-1 rounded-lg border border-border bg-card flex-1 justify-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => navigateMonth('prev')}
                                        className="h-8 w-8"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                    </Button>
                                    <div className="px-2 py-1.5 text-xs font-semibold capitalize text-center min-w-[120px]">
                                        {monthYear}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => navigateMonth('next')}
                                        className="h-8 w-8"
                                    >
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Desktop: Original Layout */}
                        <div className="hidden md:flex relative items-center justify-between">
                            {/* Tombol Kembali - Kiri */}
                            <Link href="/">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="sr-only">Kembali ke Layanan</span>
                                </Button>
                            </Link>

                            {/* Judul - Tengah */}
                            <div className="absolute left-1/2 -translate-x-1/2 text-center">
                                <h1 className="text-3xl font-bold text-foreground">
                                    Rekap Data
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Kalender Rekap Bulanan
                                </p>
                            </div>

                            {/* Navigation - Kanan */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToToday}
                                    className="h-9 px-4"
                                >
                                    Hari Ini
                                </Button>
                                <div className="flex items-center gap-1 rounded-lg border border-border bg-card">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => navigateMonth('prev')}
                                        className="h-9 w-9"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <div className="px-4 py-2 text-sm font-semibold capitalize">
                                        {monthYear}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => navigateMonth('next')}
                                        className="h-9 w-9"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Layout dengan Sidebar Kiri untuk Checkbox */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Sidebar Kiri - Checkbox (Desktop) */}
                        <div className="hidden md:block w-64 flex-shrink-0">
                            <Card className="p-4 sticky top-24">
                                <h3 className="text-sm font-semibold mb-4 text-foreground">
                                    Jenis Laporan
                                </h3>
                                <div className="space-y-3">
                                    {availableLinks.map((link) => (
                                        <div key={link.id} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`desktop-link-${link.id}`}
                                                checked={selectedLinkIds.includes(link.id)}
                                                onCheckedChange={(checked) =>
                                                    handleLinkChange(link.id, checked as boolean)
                                                }
                                            />
                                            <Label htmlFor={`desktop-link-${link.id}`} className="text-sm font-medium cursor-pointer flex-1">
                                                {link.title}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Konten Utama - Kalender */}
                        <div className="flex-1 min-w-0">

                    {/* Calendar Month View - Desktop */}
                    <Card className="hidden md:block overflow-hidden gap-0 p-0">
                        {/* Week Days Header */}
                        <div className="grid grid-cols-7 border-b border-border">
                            {weekDays.map((day, index) => (
                                <div
                                    key={index}
                                    className="border-r border-border p-3 text-center text-sm font-semibold last:border-r-0"
                                >
                                    {day.substring(0, 3).toUpperCase()}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7">
                            {getCalendarDays.map((date, index) => {
                                const today = isToday(date);
                                const currentMonth = isCurrentMonth(date);
                                const availableLinks = getAvailableLinks(date);
                                const filteredLinks = availableLinks.filter(link =>
                                    selectedLinkIds.includes(link.id)
                                );

                                return (
                                    <div
                                        key={index}
                                        className={`min-h-[120px] border-b border-r border-border p-2 last:border-r-0 ${
                                            !currentMonth ? 'bg-muted' : ''
                                        }`}
                                    >
                                        {/* Date Number */}
                                        <div
                                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                                                today
                                                    ? 'bg-primary text-primary-foreground'
                                                    : currentMonth
                                                      ? 'text-foreground'
                                                      : 'text-muted-foreground'
                                            }`}
                                        >
                                            {date.getDate()}
                                        </div>

                                        {/* Report Links */}
                                        <div className="space-y-1 mt-1">
                                            {loadingReports && currentMonth ? (
                                                <Skeleton className="h-6 w-full rounded" />
                                            ) : filteredLinks.map((link) => {
                                                const dateStr = date.toISOString().split('T')[0];
                                                const key = `${dateStr}-${link.id}`;
                                                const data = reportData[key];
                                                const isLoading = loadingFiles[key];
                                                const hasFolder = data && data.folder_link !== null;

                                                return (
                                                    <Popover key={link.id} onOpenChange={(open: boolean) => {
                                                        if (open && !data && !isLoading) {
                                                            loadReportFolder(date, link.id);
                                                        }
                                                    }}>
                                                        <PopoverTrigger asChild>
                                                            <button
                                                                className={`w-full truncate rounded px-1.5 py-0.5 text-xs transition-colors cursor-pointer text-left ${
                                                                    link.is_public
                                                                        ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30'
                                                                        : 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30'
                                                                }`}
                                                            >
                                                                {isLoading ? (
                                                                    <span className="text-xs">Memuat...</span>
                                                                ) : (
                                                                    <span className="font-medium">
                                                                        {data?.title || link.title}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-80" align="start">
                                                            <div className="space-y-3">
                                                                <div className="font-semibold text-sm">
                                                                    {data?.title || link.title}
                                                                </div>
                                                                {isLoading ? (
                                                                    <div className="text-sm text-muted-foreground">Memuat...</div>
                                                                ) : hasFolder ? (
                                                                    <a
                                                                        href={data.folder_link!}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors p-2 rounded hover:bg-muted"
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                        <span className="flex-1">Buka Folder PDF</span>
                                                                        <Download className="h-4 w-4" />
                                                                    </a>
                                                                ) : (
                                                                    <div className="text-sm text-muted-foreground">
                                                                        Tidak ada folder untuk tanggal ini
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Calendar Grid View - Mobile (Compact) */}
                    <Card className="md:hidden overflow-hidden gap-0 p-0">
                        {/* Week Days Header */}
                        <div className="grid grid-cols-7 border-b border-border">
                            {weekDays.map((day, index) => (
                                <div
                                    key={index}
                                    className="border-r border-border p-1.5 text-center text-xs font-semibold last:border-r-0"
                                >
                                    {day.substring(0, 1).toUpperCase()}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7">
                            {getCalendarDays.map((date, index) => {
                                const today = isToday(date);
                                const currentMonth = isCurrentMonth(date);
                                const availableLinks = getAvailableLinks(date);
                                const filteredLinks = availableLinks.filter(link =>
                                    selectedLinkIds.includes(link.id)
                                );

                                return (
                                    <div
                                        key={index}
                                        className={`min-h-[60px] border-b border-r border-border p-1 last:border-r-0 ${
                                            !currentMonth ? 'bg-muted' : ''
                                        }`}
                                    >
                                        {/* Date Number */}
                                        <div
                                            className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium mb-0.5 ${
                                                today
                                                    ? 'bg-primary text-primary-foreground'
                                                    : currentMonth
                                                      ? 'text-foreground'
                                                      : 'text-muted-foreground'
                                            }`}
                                        >
                                            {date.getDate()}
                                        </div>

                                        {/* Report Dots Indicator */}
                                        {loadingReports && currentMonth ? (
                                            <div className="w-full flex justify-center items-center mt-0.5">
                                                <Skeleton className="h-1.5 w-1.5 rounded-full" />
                                            </div>
                                        ) : filteredLinks.length > 0 && (
                                            <Popover onOpenChange={(open: boolean) => {
                                                if (open) {
                                                    // Load all links that haven't been loaded yet
                                                    filteredLinks.forEach((link) => {
                                                        const dateStr = date.toISOString().split('T')[0];
                                                        const key = `${dateStr}-${link.id}`;
                                                        const data = reportData[key];
                                                        const isLoading = loadingFiles[key];
                                                        if (!data && !isLoading) {
                                                            loadReportFolder(date, link.id);
                                                        }
                                                    });
                                                }
                                            }}>
                                                <PopoverTrigger asChild>
                                                    <button className="w-full flex flex-wrap gap-0.5 justify-center items-center mt-0.5">
                                                        {filteredLinks.map((link) => (
                                                            <div
                                                                key={link.id}
                                                                className={`h-1.5 w-1.5 rounded-full ${
                                                                    link.is_public
                                                                        ? 'bg-green-500'
                                                                        : 'bg-blue-500'
                                                                }`}
                                                            ></div>
                                                        ))}
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80" align="start">
                                                    <div className="space-y-3">
                                                        <div className="font-semibold text-sm mb-2">
                                                            Laporan {date.toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric',
                                                            })}
                                                        </div>
                                                        <div className="space-y-2">
                                                            {filteredLinks.map((link) => {
                                                                const dateStr = date.toISOString().split('T')[0];
                                                                const key = `${dateStr}-${link.id}`;
                                                                const data = reportData[key];
                                                                const isLoading = loadingFiles[key];
                                                                const hasFolder = data && data.folder_link !== null;

                                                                return (
                                                                    <div key={link.id} className="border-b border-border pb-2 last:border-b-0 last:pb-0">
                                                                        <div className="font-medium text-sm mb-1.5">
                                                                            {data?.title || link.title}
                                                                        </div>
                                                                        {isLoading ? (
                                                                            <div className="text-xs text-muted-foreground">Memuat...</div>
                                                                        ) : hasFolder ? (
                                                                            <a
                                                                                href={data.folder_link!}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors p-1.5 rounded hover:bg-muted"
                                                                            >
                                                                                <FileText className="h-3 w-3" />
                                                                                <span className="flex-1">Buka Folder PDF</span>
                                                                                <Download className="h-3 w-3" />
                                                                            </a>
                                                                        ) : (
                                                                            <div className="text-xs text-muted-foreground">
                                                                                Tidak ada folder untuk tanggal ini
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                        </div>
                    </div>
                </div>
                <AppFooter />
            </div>
        </>
    );
}

