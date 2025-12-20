import AppFooter from '@/components/app-footer';
import AppNavbar from '@/components/app-navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, FileText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface NotulensiItem {
    sheet_id: string;
    sheet_link: string;
    tab_name: string;
    link_title: string | null;
}

interface NotulensiLink {
    id: number;
    title: string;
    gdrive_url: string;
}

interface NotulensiProps {
    notulensiLinks?: NotulensiLink[];
    activeDisasterName?: string;
}

export default function Notulensi({ notulensiLinks = [], activeDisasterName }: NotulensiProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [notulensiData, setNotulensiData] = useState<Record<string, NotulensiItem[]>>({});
    const [loadingNotulensi, setLoadingNotulensi] = useState(false);

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

    // Helper function to format date as YYYY-MM-DD in local timezone
    const formatDateLocal = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Check if date has notulensi
    const hasNotulensi = (date: Date): boolean => {
        const dateStr = formatDateLocal(date);
        const data = notulensiData[dateStr];
        return data && data.length > 0;
    };

    // Get notulensi items for a date
    const getNotulensiForDate = (date: Date): NotulensiItem[] => {
        const dateStr = formatDateLocal(date);
        return notulensiData[dateStr] || [];
    };

    // Get color for notulensi based on index
    const getNotulensiColor = (index: number): { bg: string; text: string; dot: string; hover: string } => {
        const colors = [
            { bg: 'bg-blue-500/20', text: 'text-blue-700', dot: 'bg-blue-500', hover: 'hover:bg-blue-500/30' },
            { bg: 'bg-green-500/20', text: 'text-green-700', dot: 'bg-green-500', hover: 'hover:bg-green-500/30' },
            { bg: 'bg-purple-500/20', text: 'text-purple-700', dot: 'bg-purple-500', hover: 'hover:bg-purple-500/30' },
            { bg: 'bg-orange-500/20', text: 'text-orange-700', dot: 'bg-orange-500', hover: 'hover:bg-orange-500/30' },
            { bg: 'bg-pink-500/20', text: 'text-pink-700', dot: 'bg-pink-500', hover: 'hover:bg-pink-500/30' },
            { bg: 'bg-cyan-500/20', text: 'text-cyan-700', dot: 'bg-cyan-500', hover: 'hover:bg-cyan-500/30' },
            { bg: 'bg-yellow-500/20', text: 'text-yellow-700', dot: 'bg-yellow-500', hover: 'hover:bg-yellow-500/30' },
            { bg: 'bg-indigo-500/20', text: 'text-indigo-700', dot: 'bg-indigo-500', hover: 'hover:bg-indigo-500/30' },
        ];
        return colors[index % colors.length];
    };

    // Auto-scan all sheets on page load - using same logic as admin page
    useEffect(() => {
        const scanKey = 'notulensi_auto_scanned';
        if (sessionStorage.getItem(scanKey)) {
            return;
        }

        const autoScanAll = async () => {
            if (notulensiLinks.length > 0) {
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
                        }
                    }
                } catch (error) {
                    console.error('Error auto-scanning sheets:', error);
                }
            }
        };

        autoScanAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Pre-load notulensi for all dates in current month
    useEffect(() => {
        const loadMonthNotulensi = async () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1; // JavaScript month is 0-based, API expects 1-based

            setLoadingNotulensi(true);
            try {
                const response = await fetch(`/notulensi/month?year=${year}&month=${month}`);
                const data = await response.json();

                if (data.success && data.notulensi) {
                    // Update notulensiData with all dates from the month
                    const newNotulensiData: Record<string, NotulensiItem[]> = {};
                    for (const [dateStr, notulensiItems] of Object.entries(data.notulensi)) {
                        // notulensiItems can be array or single object (for backward compatibility)
                        const items = Array.isArray(notulensiItems)
                            ? notulensiItems
                            : [notulensiItems];
                        newNotulensiData[dateStr] = items as NotulensiItem[];
                    }
                    setNotulensiData(prev => ({ ...prev, ...newNotulensiData }));
                }
            } catch (error) {
                console.error('Error loading month notulensi:', error);
            } finally {
                setLoadingNotulensi(false);
            }
        };

        if (notulensiLinks.length > 0) {
            loadMonthNotulensi();
        } else {
            setLoadingNotulensi(false);
        }
    }, [currentDate, notulensiLinks.length]);

    const weekDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    return (
        <>
            <Head title="Notulensi Rapat Koordinasi" />
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
                                        Notulensi Rapat Koordinasi
                                    </h1>
                                    <p className="text-xs text-muted-foreground">
                                        {activeDisasterName ? `Kalender Notulensi ${activeDisasterName}` : 'Kalender Notulensi Bulanan'}
                                    </p>
                                </div>
                            </div>

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
                                    Notulensi Rapat Koordinasi
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {activeDisasterName ? `Kalender Notulensi ${activeDisasterName}` : 'Kalender Notulensi Bulanan'}
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

                    {notulensiLinks.length === 0 && (
                        <Card className="p-6 mb-6">
                            <p className="text-center text-muted-foreground">
                                Link Google Sheet belum dikonfigurasi. Silakan hubungi admin.
                            </p>
                        </Card>
                    )}

                    {notulensiLinks.length > 0 && (
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
                                        const hasNotulensiForDate = hasNotulensi(date);
                                        const notulensiItems = getNotulensiForDate(date);

                                        return (
                                            <div
                                                key={index}
                                                className={`min-h-[120px] border-b border-r border-border p-2 last:border-r-0 ${!currentMonth ? 'bg-muted' : ''
                                                    }`}
                                            >
                                                {/* Date Number */}
                                                <div
                                                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${today
                                                        ? 'bg-primary text-primary-foreground'
                                                        : currentMonth
                                                            ? 'text-foreground'
                                                            : 'text-muted-foreground'
                                                        }`}
                                                >
                                                    {date.getDate()}
                                                </div>

                                                {/* Notulensi Links */}
                                                {loadingNotulensi && currentMonth ? (
                                                    <div className="mt-1 space-y-1">
                                                        <Skeleton className="h-6 w-full rounded" />
                                                    </div>
                                                ) : hasNotulensiForDate && notulensiItems.length > 0 && (
                                                    <div className="mt-1 space-y-1">
                                                        {notulensiItems.map((item, itemIndex) => {
                                                            const color = getNotulensiColor(itemIndex);
                                                            return (
                                                                <Popover key={itemIndex}>
                                                                    <PopoverTrigger asChild>
                                                                        <button
                                                                            className={`w-full truncate rounded px-1.5 py-0.5 text-xs transition-colors cursor-pointer text-left ${color.bg} ${color.text} ${color.hover}`}
                                                                        >
                                                                            <span className="font-medium">
                                                                                {item.link_title || 'Notulensi'}
                                                                            </span>
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-80" align="start">
                                                                        <div className="space-y-3">
                                                                            <div className="font-semibold text-sm">
                                                                                {item.link_title && (
                                                                                    <div className="text-muted-foreground text-xs mb-1">
                                                                                        {item.link_title}
                                                                                    </div>
                                                                                )}
                                                                                Notulensi {item.tab_name}
                                                                            </div>
                                                                            <a
                                                                                href={item.sheet_link || '#'}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors p-2 rounded hover:bg-muted"
                                                                            >
                                                                                <FileText className="h-4 w-4" />
                                                                                <span className="flex-1">Buka Notulensi</span>
                                                                                <ExternalLink className="h-4 w-4" />
                                                                            </a>
                                                                        </div>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            );
                                                        })}
                                                    </div>
                                                )}
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
                                        const hasNotulensiForDate = hasNotulensi(date);
                                        const notulensiItems = getNotulensiForDate(date);

                                        return (
                                            <div
                                                key={index}
                                                className={`min-h-[60px] border-b border-r border-border p-1 last:border-r-0 ${!currentMonth ? 'bg-muted' : ''
                                                    }`}
                                            >
                                                {/* Date Number */}
                                                <div
                                                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium mb-0.5 ${today
                                                        ? 'bg-primary text-primary-foreground'
                                                        : currentMonth
                                                            ? 'text-foreground'
                                                            : 'text-muted-foreground'
                                                        }`}
                                                >
                                                    {date.getDate()}
                                                </div>

                                                {/* Notulensi Dot Indicator */}
                                                {loadingNotulensi && currentMonth ? (
                                                    <div className="w-full flex justify-center items-center mt-0.5">
                                                        <Skeleton className="h-1.5 w-1.5 rounded-full" />
                                                    </div>
                                                ) : hasNotulensiForDate && notulensiItems.length > 0 && (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button className="w-full flex flex-wrap gap-0.5 justify-center items-center mt-0.5">
                                                                {notulensiItems.map((item, itemIndex) => {
                                                                    const color = getNotulensiColor(itemIndex);
                                                                    return (
                                                                        <div
                                                                            key={itemIndex}
                                                                            className={`h-1.5 w-1.5 rounded-full ${color.dot}`}
                                                                        ></div>
                                                                    );
                                                                })}
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-80" align="start">
                                                            <div className="space-y-3">
                                                                <div className="font-semibold text-sm mb-2">
                                                                    Notulensi {date.toLocaleDateString('id-ID', {
                                                                        day: 'numeric',
                                                                        month: 'long',
                                                                        year: 'numeric',
                                                                    })}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {notulensiItems.map((item, itemIndex) => (
                                                                        <div key={itemIndex} className="border-b border-border pb-2 last:border-b-0 last:pb-0">
                                                                            <div className="font-medium text-sm mb-1.5">
                                                                                {item.link_title && (
                                                                                    <div className="text-muted-foreground text-xs mb-1">
                                                                                        {item.link_title}
                                                                                    </div>
                                                                                )}
                                                                                Notulensi {item.tab_name}
                                                                            </div>
                                                                            <a
                                                                                href={item.sheet_link || '#'}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors p-1.5 rounded hover:bg-muted"
                                                                            >
                                                                                <FileText className="h-3 w-3" />
                                                                                <span className="flex-1">Buka Notulensi</span>
                                                                                <ExternalLink className="h-3 w-3" />
                                                                            </a>
                                                                        </div>
                                                                    ))}
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
                    )}
                </div>
                <AppFooter />
            </div>
        </>
    );
}

