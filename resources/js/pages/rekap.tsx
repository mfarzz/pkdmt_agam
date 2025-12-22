import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, FileText, Calendar } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface ReportData {
    id?: number;
    file_path?: string | null;
    file_name?: string | null;
    file_size?: number | null;
}

interface ReportWeek {
    id: number;
    week_start_date: string;
    week_end_date: string;
    week_number: number;
    year: number;
    week_period: string;
    file_path: string | null;
    file_name: string | null;
    file_size: number | null;
    description: string | null;
    is_dmt: boolean;
}

interface RekapProps {
    weeklyReports?: ReportWeek[];
    activeDisasterName?: string;
    excelFile?: {
        file_name: string;
        file_path: string;
        updated_at: string;
    } | null;
}

export default function Rekap({ weeklyReports = [], activeDisasterName, excelFile }: RekapProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const isAuthenticated = !!auth?.user;

    const [currentDate, setCurrentDate] = useState(new Date());

    // Helper function to format date as YYYY-MM-DD without timezone conversion
    const formatDateLocal = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Static report types
    const reportTypes = [
        { id: 'DMT', title: 'DMT', is_dmt: true },
        { id: 'HEOC', title: 'HEOC (EMT CC)', is_dmt: false },
        { id: 'WEEKLY', title: 'Weekly', is_dmt: false },
    ];

    // Initialize selected types (both by default)
    const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>(['DMT', 'HEOC', 'WEEKLY']);
    const [reportData, setReportData] = useState<Record<string, any>>({});
    const [loadingReports, setLoadingReports] = useState(false);

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

    // Pre-load report data for all dates in current month
    useEffect(() => {
        const loadMonthReports = async () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1; // JavaScript month is 0-based, API expects 1-based

            setLoadingReports(true);
            try {
                const response = await fetch(`/rekap/month?year=${year}&month=${month}`);
                const data = await response.json();

                if (data.success && data.reports) {
                    setReportData(data.reports);
                }
            } catch (error) {
                console.error('Error loading month reports:', error);
            } finally {
                setLoadingReports(false);
            }
        };

        loadMonthReports();
    }, [currentDate]);

    // Handle checkbox change for types
    const handleTypeChange = (typeId: string, checked: boolean) => {
        if (!checked && selectedTypeIds.length === 1) {
            return;
        }

        if (checked) {
            setSelectedTypeIds([...selectedTypeIds, typeId]);
        } else {
            setSelectedTypeIds(selectedTypeIds.filter(id => id !== typeId));
        }
    };

    // Nama hari dalam minggu
    const weekDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    return (
        <>
            <Head title="Rekap Data" />
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
                                Rekap Data
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {activeDisasterName ? `Kalender Rekap ${activeDisasterName}` : 'Kalender Rekap Bulanan'}
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


                    {/* Report Type Checkboxes - Mobile */}
                    {/* Report Type Checkboxes - Mobile */}
                    <div className="md:hidden mb-6 space-y-4">
                        <Card className="p-4">
                            <h3 className="text-sm font-semibold mb-3 text-foreground">
                                Jenis Laporan
                            </h3>
                            <div className="space-y-2">
                                {reportTypes.map((type) => (
                                    <div key={type.id} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`mobile-type-${type.id}`}
                                            checked={selectedTypeIds.includes(type.id)}
                                            onCheckedChange={(checked) =>
                                                handleTypeChange(type.id, checked as boolean)
                                            }
                                        />
                                        <Label htmlFor={`mobile-type-${type.id}`} className="text-sm font-medium cursor-pointer flex-1">
                                            {type.title}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {excelFile && (
                            <a href="/laporan-excel/download" target="_blank" rel="noopener noreferrer" className="block">
                                <Button variant="outline" className="w-full gap-2 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20 bg-card">
                                    <Download className="h-4 w-4" />
                                    Download Rekap Excel
                                </Button>
                            </a>
                        )}
                    </div>

                    {/* Layout dengan Sidebar Kiri untuk Checkbox */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Sidebar Kiri - Checkbox (Desktop) */}
                        <div className="hidden md:block w-64 flex-shrink-0">
                            <div className="sticky top-24 space-y-4">
                                <Card className="p-4">
                                    <h3 className="text-sm font-semibold mb-4 text-foreground">
                                        Jenis Laporan
                                    </h3>
                                    <div className="space-y-3">
                                        {reportTypes.map((type) => (
                                            <div key={type.id} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`desktop-type-${type.id}`}
                                                    checked={selectedTypeIds.includes(type.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleTypeChange(type.id, checked as boolean)
                                                    }
                                                />
                                                <Label htmlFor={`desktop-type-${type.id}`} className="text-sm font-medium cursor-pointer flex-1">
                                                    {type.title}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                {excelFile && (
                                    <Card className="p-4 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10">
                                        <a href="/laporan-excel/download" target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm" className="w-full gap-2 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20 bg-background">
                                                <Download className="h-4 w-4" />
                                                Download Excel
                                            </Button>
                                        </a>
                                        <p className="text-[10px] text-muted-foreground mt-2 text-center">
                                            Update: {new Date(excelFile.updated_at).toLocaleDateString('id-ID')}
                                        </p>
                                    </Card>
                                )}
                            </div>
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
                                        const dateStr = formatDateLocal(date);
                                        const today = isToday(date);
                                        const currentMonth = isCurrentMonth(date);
                                        const dayReports = reportData[dateStr] || {};

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

                                                {/* Report Links */}
                                                <div className="space-y-1 mt-1">
                                                    {loadingReports && currentMonth ? (
                                                        <Skeleton className="h-6 w-full rounded" />
                                                    ) : (
                                                        <>
                                                            {/* Daily Reports */}
                                                            {selectedTypeIds.map((typeId) => {
                                                                const reports = dayReports[typeId];
                                                                if (!reports || reports.length === 0) return null;

                                                                return (
                                                                    <Popover key={typeId}>
                                                                        <PopoverTrigger asChild>
                                                                            <button
                                                                                className={`w-full truncate rounded px-1.5 py-0.5 text-xs transition-colors cursor-pointer text-left ${typeId === 'DMT'
                                                                                    ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30'
                                                                                    : 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30'
                                                                                    }`}
                                                                            >
                                                                                <span className="font-medium">
                                                                                    {typeId} ({reports.length})
                                                                                </span>
                                                                            </button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="w-80" align="start">
                                                                            <div className="space-y-3">
                                                                                <div className="font-semibold text-sm">
                                                                                    Report {typeId} - {dateStr}
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    {reports.map((report: any) => (
                                                                                        <a
                                                                                            key={report.id}
                                                                                            href={`/report-dates/${report.id}/download`}
                                                                                            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors p-2 rounded hover:bg-muted"
                                                                                        >
                                                                                            <FileText className="h-4 w-4" />
                                                                                            <span className="flex-1 truncate">
                                                                                                {report.file_name}
                                                                                            </span>
                                                                                            <Download className="h-4 w-4" />
                                                                                        </a>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                );
                                                            })}

                                                            {/* Weekly Reports */}
                                                            {selectedTypeIds.includes('WEEKLY') && dayReports['_weekly'] && (
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <button
                                                                            className="w-full truncate rounded px-1.5 py-0.5 text-xs transition-colors cursor-pointer text-left bg-purple-500/20 text-purple-700 hover:bg-purple-500/30"
                                                                        >
                                                                            <span className="font-medium flex items-center gap-1">
                                                                                <Calendar className="h-3 w-3" />
                                                                                Minggu {dayReports['_weekly'].week_number}
                                                                            </span>
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-80" align="start">
                                                                        <div className="space-y-3">
                                                                            <div className="font-semibold text-sm">
                                                                                Report Mingguan - Minggu {dayReports['_weekly'].week_number} ({dayReports['_weekly'].year})
                                                                            </div>
                                                                            <div className="text-sm text-muted-foreground">
                                                                                Periode: {dayReports['_weekly'].week_period}
                                                                            </div>
                                                                            {dayReports['_weekly'].link ? (
                                                                                <a
                                                                                    href={dayReports['_weekly'].link}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors p-2 rounded hover:bg-muted"
                                                                                >
                                                                                    <FileText className="h-4 w-4" />
                                                                                    <span className="flex-1">Buka File PDF</span>
                                                                                    <Download className="h-4 w-4" />
                                                                                </a>
                                                                            ) : (
                                                                                <div className="text-sm text-muted-foreground">
                                                                                    Tidak ada file untuk minggu ini
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            )}
                                                        </>
                                                    )}
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
                                        const dateStr = formatDateLocal(date);
                                        const today = isToday(date);
                                        const currentMonth = isCurrentMonth(date);
                                        const dayReports = reportData[dateStr] || {};

                                        const hasAnyReport = selectedTypeIds.some(typeId => {
                                            const reports = dayReports[typeId];
                                            return (reports && reports.length > 0) || dayReports['_weekly'];
                                        });

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

                                                {/* Report Dots Indicator */}
                                                {loadingReports && currentMonth ? (
                                                    <div className="w-full flex justify-center items-center mt-0.5">
                                                        <Skeleton className="h-1.5 w-1.5 rounded-full" />
                                                    </div>
                                                ) : hasAnyReport && (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button className="w-full flex flex-wrap gap-0.5 justify-center items-center mt-0.5">
                                                                {selectedTypeIds.map((typeId) => {
                                                                    if (typeId === 'WEEKLY') {
                                                                        if (dayReports['_weekly']) {
                                                                            return (
                                                                                <div
                                                                                    key="weekly-dot"
                                                                                    className="h-1.5 w-1.5 rounded-full bg-purple-500"
                                                                                ></div>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    }

                                                                    const reports = dayReports[typeId];
                                                                    if (reports && reports.length > 0) {
                                                                        return (
                                                                            <div
                                                                                key={`${typeId}-dot`}
                                                                                className={`h-1.5 w-1.5 rounded-full ${typeId === 'DMT' ? 'bg-green-500' : 'bg-blue-500'}`}
                                                                            ></div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })}
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
                                                                <div className="space-y-4">
                                                                    {/* Weekly Report (Unified) */}
                                                                    {selectedTypeIds.includes('WEEKLY') && dayReports['_weekly'] && (
                                                                        <div className="bg-purple-50 p-2 rounded border border-purple-100">
                                                                            <div className="font-medium text-sm mb-1 flex items-center gap-1 text-purple-700">
                                                                                <Calendar className="h-4 w-4" />
                                                                                Report Mingguan - Minggu {dayReports['_weekly'].week_number}
                                                                            </div>
                                                                            <div className="text-xs text-muted-foreground mb-2">
                                                                                Periode: {dayReports['_weekly'].week_period}
                                                                            </div>
                                                                            {dayReports['_weekly'].link && (
                                                                                <a
                                                                                    href={dayReports['_weekly'].link}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex items-center gap-2 text-xs text-purple-700 hover:text-purple-900 transition-colors font-medium"
                                                                                >
                                                                                    <FileText className="h-4 w-4" />
                                                                                    <span>Buka Report Mingguan</span>
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {selectedTypeIds.map((typeId) => {
                                                                        if (typeId === 'WEEKLY') return null;
                                                                        const reports = dayReports[typeId];

                                                                        if (!reports?.length) return null;

                                                                        return (
                                                                            <div key={typeId} className="space-y-2">
                                                                                <div className="font-medium text-sm border-b pb-1">
                                                                                    {typeId}
                                                                                </div>

                                                                                {/* Daily */}
                                                                                {reports?.map((report: any) => (
                                                                                    <a
                                                                                        key={report.id}
                                                                                        href={`/report-dates/${report.id}/download`}
                                                                                        className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors p-1.5 rounded hover:bg-muted"
                                                                                    >
                                                                                        <FileText className="h-3 w-3" />
                                                                                        <span className="flex-1 truncate">{report.file_name}</span>
                                                                                        <Download className="h-3 w-3" />
                                                                                    </a>
                                                                                ))}
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
