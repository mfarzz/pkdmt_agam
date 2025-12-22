import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface NotulensiImage {
    id: number;
    image_path: string;
    image_name: string;
    description: string | null;
    file_size: number;
    mime_type: string;
}

interface NotulensiItem {
    type: 'spreadsheet' | 'image';
    sheet_id?: string;
    sheet_link?: string;
    tab_name?: string;
    link_title?: string | null;
    images?: NotulensiImage[];
    count?: number;
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

    const partners = [
        { name: 'Pemkab Agam', image: '/image/Logo_Agam_Regency.png' },
        { name: 'Universitas Andalas', image: '/image/Logo_Unand.png' },
        { name: 'Universitas Brawijaya', image: '/image/Logo_Universitas_Brawijaya.png' },
        { name: 'RS Khusus Kanker', image: '/image/RSKKA.png' },
        { name: 'Dinas Kesehatan', image: '/image/DKK.png' },
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
                <div className="container mx-auto px-4 py-4 md:py-8 flex-1">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href="/">
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Kembali ke Beranda</span>
                            </Button>
                        </Link>
                    </div>
                    <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold text-foreground">
                                Notulensi Rapat Koordinasi
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {activeDisasterName ? `Kalender Notulensi ${activeDisasterName}` : 'Kalender Notulensi Bulanan'}
                            </p>
                        </div>
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
                                                                                {item.type === 'spreadsheet' 
                                                                                    ? `📊 ${item.link_title || 'Notulensi'}`
                                                                                    : `🖼️ Notulensi Gambar${item.count && item.count > 1 ? ` (${item.count})` : ''}`
                                                                                }
                                                                            </span>
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
                                                                            {item.type === 'spreadsheet' ? (
                                                                                <>
                                                                                    <div className="font-medium text-sm mb-1.5">
                                                                                        {item.link_title && (
                                                                                            <div className="text-muted-foreground text-xs mb-1">
                                                                                                {item.link_title}
                                                                                            </div>
                                                                                        )}
                                                                                        📊 Notulensi Spreadsheet
                                                                                        {item.tab_name && ` - ${item.tab_name}`}
                                                                                    </div>
                                                                                    <a
                                                                                        href={item.sheet_link || '#'}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors p-2 rounded hover:bg-muted"
                                                                                    >
                                                                                        <FileText className="h-4 w-4" />
                                                                                        <span className="flex-1">Buka Spreadsheet</span>
                                                                                        <ExternalLink className="h-4 w-4" />
                                                                                    </a>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <div className="font-medium text-sm mb-1.5">
                                                                                        🖼️ Notulensi Gambar
                                                                                        {item.count && item.count > 1 && ` (${item.count} gambar)`}
                                                                                    </div>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            // Open image gallery modal
                                                                                            const modal = document.createElement('div');
                                                                                            modal.className = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4';
                                                                                            modal.onclick = (e) => {
                                                                                                if (e.target === modal) {
                                                                                                    document.body.removeChild(modal);
                                                                                                }
                                                                                            };
                                                                                            
                                                                                            const gallery = document.createElement('div');
                                                                                            gallery.className = 'max-w-4xl max-h-[90vh] overflow-auto bg-background rounded-lg p-4';
                                                                                            
                                                                                            const header = document.createElement('div');
                                                                                            header.className = 'flex justify-between items-center mb-4';
                                                                                            header.innerHTML = `
                                                                                                <h3 class="text-lg font-semibold">Notulensi Gambar - ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                                                                                                <button class="text-muted-foreground hover:text-foreground" onclick="this.closest('.fixed').remove()">✕</button>
                                                                                            `;
                                                                                            
                                                                                            const imagesContainer = document.createElement('div');
                                                                                            imagesContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
                                                                                            
                                                                                            item.images?.forEach((img, imgIndex) => {
                                                                                                const imgDiv = document.createElement('div');
                                                                                                imgDiv.className = 'space-y-2';
                                                                                                imgDiv.innerHTML = `
                                                                                                    <img src="${img.image_path}" alt="${img.image_name}" class="w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity" onclick="window.open('${img.image_path}', '_blank')" />
                                                                                                    ${img.description ? `<p class="text-xs text-muted-foreground">${img.description}</p>` : ''}
                                                                                                `;
                                                                                                imagesContainer.appendChild(imgDiv);
                                                                                            });
                                                                                            
                                                                                            gallery.appendChild(header);
                                                                                            gallery.appendChild(imagesContainer);
                                                                                            modal.appendChild(gallery);
                                                                                            document.body.appendChild(modal);
                                                                                        }}
                                                                                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors p-2 rounded hover:bg-muted w-full"
                                                                                    >
                                                                                        <ImageIcon className="h-4 w-4" />
                                                                                        <span className="flex-1">Lihat Gambar</span>
                                                                                    </button>
                                                                                </>
                                                                            )}
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
                                                                <div className="space-y-3">
                                                                    {notulensiItems.map((item, itemIndex) => (
                                                                        <div key={itemIndex} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                                                                            {item.type === 'spreadsheet' ? (
                                                                                <>
                                                                                    <div className="font-medium text-sm mb-1.5">
                                                                                        {item.link_title && (
                                                                                            <div className="text-muted-foreground text-xs mb-1">
                                                                                                {item.link_title}
                                                                                            </div>
                                                                                        )}
                                                                                        📊 Notulensi Spreadsheet
                                                                                        {item.tab_name && ` - ${item.tab_name}`}
                                                                                    </div>
                                                                                    <a
                                                                                        href={item.sheet_link || '#'}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors p-1.5 rounded hover:bg-muted"
                                                                                    >
                                                                                        <FileText className="h-3 w-3" />
                                                                                        <span className="flex-1">Buka Spreadsheet</span>
                                                                                        <ExternalLink className="h-3 w-3" />
                                                                                    </a>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <div className="font-medium text-sm mb-1.5">
                                                                                        🖼️ Notulensi Gambar
                                                                                        {item.count && item.count > 1 && ` (${item.count} gambar)`}
                                                                                    </div>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            // Open image gallery modal
                                                                                            const modal = document.createElement('div');
                                                                                            modal.className = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4';
                                                                                            modal.onclick = (e) => {
                                                                                                if (e.target === modal) {
                                                                                                    document.body.removeChild(modal);
                                                                                                }
                                                                                            };
                                                                                            
                                                                                            const gallery = document.createElement('div');
                                                                                            gallery.className = 'max-w-4xl max-h-[90vh] overflow-auto bg-background rounded-lg p-4';
                                                                                            
                                                                                            const header = document.createElement('div');
                                                                                            header.className = 'flex justify-between items-center mb-4';
                                                                                            header.innerHTML = `
                                                                                                <h3 class="text-lg font-semibold">Notulensi Gambar - ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                                                                                                <button class="text-muted-foreground hover:text-foreground" onclick="this.closest('.fixed').remove()">✕</button>
                                                                                            `;
                                                                                            
                                                                                            const imagesContainer = document.createElement('div');
                                                                                            imagesContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
                                                                                            
                                                                                            item.images?.forEach((img, imgIndex) => {
                                                                                                const imgDiv = document.createElement('div');
                                                                                                imgDiv.className = 'space-y-2';
                                                                                                imgDiv.innerHTML = `
                                                                                                    <img src="${img.image_path}" alt="${img.image_name}" class="w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity" onclick="window.open('${img.image_path}', '_blank')" />
                                                                                                    ${img.description ? `<p class="text-xs text-muted-foreground">${img.description}</p>` : ''}
                                                                                                `;
                                                                                                imagesContainer.appendChild(imgDiv);
                                                                                            });
                                                                                            
                                                                                            gallery.appendChild(header);
                                                                                            gallery.appendChild(imagesContainer);
                                                                                            modal.appendChild(gallery);
                                                                                            document.body.appendChild(modal);
                                                                                        }}
                                                                                        className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors p-1.5 rounded hover:bg-muted w-full"
                                                                                    >
                                                                                        <ImageIcon className="h-3 w-3" />
                                                                                        <span className="flex-1">Lihat Gambar</span>
                                                                                    </button>
                                                                                </>
                                                                            )}
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

                {/* Partners / Didukung Oleh */}
                <section className="py-12 border-t border-border bg-background mt-auto">
                    <div className="container mx-auto px-4 text-center">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">Didukung Oleh</h3>

                        <div className="overflow-hidden relative w-full group">
                            <div className="flex animate-scroll hover:pause-scroll gap-12 items-center w-max">
                                {[...partners, ...partners, ...partners].map((logo, index) => (
                                    <div
                                        key={`${logo.name}-${index}`}
                                        className="flex items-center justify-center h-16 w-32 flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100"
                                    >
                                        <img
                                            src={logo.image}
                                            alt={logo.name}
                                            className="max-h-full max-w-full object-contain drop-shadow-sm"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                            {/* Gradient Masks for carousel */}
                            <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
                            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8 bg-card border-t border-border">
                    <div className="container mx-auto px-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Copyright © {new Date().getFullYear()} <span className="font-semibold text-primary">HEOC Kabupaten Agam</span>. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

