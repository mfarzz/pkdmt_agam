import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';

interface InfografisItem {
    id: number;
    file_id: string;
    file_name: string;
    file_url: string;
    thumbnail_url: string | null;
    file_size: number | null;
    mime_type: string;
}

interface InfografisProps {
    infografis?: {
        data: InfografisItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    activeDisasterName?: string;
}

export default function Infografis({ infografis, activeDisasterName }: InfografisProps) {
    const infografisData = infografis?.data || [];
    const paginationLinks = infografis?.links || [];

    const partners = [
        { name: 'Pemkab Agam', image: '/image/Logo_Agam_Regency.png' },
        { name: 'Universitas Andalas', image: '/image/Logo_Unand.png' },
        { name: 'Universitas Brawijaya', image: '/image/Logo_Universitas_Brawijaya.png' },
        { name: 'RS Khusus Kanker', image: '/image/RSKKA.png' },
        { name: 'Dinas Kesehatan', image: '/image/DKK.png' },
    ];

    // Auto-scan infografis folder on page load - using same logic as scan button
    useEffect(() => {
        // Check if already scanned in this session
        const scanKey = 'infografis_auto_scanned';
        if (sessionStorage.getItem(scanKey)) {
            return;
        }

        const autoScan = async () => {
            // Ambil CSRF token dari cookie (Laravel XSRF-TOKEN)
            const csrfToken = document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];

            try {
                const response = await fetch('/infografis/auto-scan', {
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
                        // Reload page to show updated data
                        window.location.reload();
                    }
                }
            } catch (error) {
                console.error('Error auto-scanning infografis:', error);
            }
        };

        autoScan();
    }, []);

    return (
        <>
            <Head title="Informasi Umum - HEOC" />
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
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-foreground">
                            Informasi Umum
                        </h1>
                        <p className="mt-2 text-lg text-muted-foreground">
                            {activeDisasterName ? `Infografis dan informasi penting tentang ${activeDisasterName}` : 'Infografis dan informasi penting tentang Kabupaten Agam'}
                        </p>
                    </div>

                    {infografisData.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Belum ada infografis tersedia.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {infografisData.map((item) => {
                                    const isPdf = item.mime_type === 'application/pdf';
                                    return (
                                        <div
                                            key={item.id}
                                            className="group"
                                        >
                                            <a
                                                href={`/infografis/${item.id}/preview`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="cursor-pointer block"
                                            >
                                                <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] bg-card">
                                                    <div className="aspect-video bg-muted relative overflow-hidden">
                                                        {isPdf ? (
                                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                                                                <div className="text-center p-4">
                                                                    <svg className="w-16 h-16 mx-auto text-red-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                                    </svg>
                                                                    <p className="text-xs text-muted-foreground font-medium">PDF</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={`/infografis/${item.id}/image`}
                                                                alt={item.file_name}
                                                                className="w-full h-full object-contain transition-transform group-hover:scale-105"
                                                                loading="lazy"
                                                                crossOrigin="anonymous"
                                                                referrerPolicy="no-referrer"
                                                                onError={(e) => {
                                                                    // Hide image if proxy fails to avoid CORS issues
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                }}
                                                            />
                                                        )}
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                            <div className="bg-black/50 rounded-full p-2">
                                                                <ExternalLink className="h-4 w-4 text-white" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4">
                                                        <p className="text-sm font-medium line-clamp-2 flex items-center gap-1" title={item.file_name}>
                                                            {item.file_name}
                                                            <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                                        </p>
                                                    </div>
                                                </div>
                                            </a>
                                            <div className="mt-2 flex justify-end">
                                                <a
                                                    href={`/infografis/${item.id}/download`}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    <Download className="h-3 w-3" />
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {infografis && infografis.last_page > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-2">
                                    {/* Previous Button */}
                                    {infografis.current_page > 1 && paginationLinks[0]?.url && (
                                        <Link
                                            href={paginationLinks[0].url}
                                            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
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
                                                >
                                                    {link.label}
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    {/* Next Button */}
                                    {infografis.current_page < infografis.last_page && paginationLinks[paginationLinks.length - 1]?.url && (
                                        <Link
                                            href={paginationLinks[paginationLinks.length - 1].url as string}
                                            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            Selanjutnya
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Link>
                                    )}
                                </div>
                            )}

                            {/* Pagination Info */}
                            {infografis && (
                                <div className="mt-4 text-center text-sm text-muted-foreground">
                                    Menampilkan {((infografis.current_page - 1) * infografis.per_page) + 1} - {Math.min(infografis.current_page * infografis.per_page, infografis.total)} dari {infografis.total} infografis
                                </div>
                            )}
                        </>
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

