import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppNavbar from '@/components/app-navbar';
import AppFooter from '@/components/app-footer';
import { useState } from 'react';

export default function PanduanEmt() {
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    const toggleExpand = (index: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedItems(newExpanded);
    };

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


    return (
        <>
            <Head title="Panduan Layanan EMT DMS" />
            <div className="min-h-screen bg-background flex flex-col">
                <AppNavbar navItems={navItems} />

                <div className="container mx-auto px-4 py-4 md:py-8 pt-20 md:pt-24 flex-1">
                    {/* Header */}
                    <div className="mb-6">
                        {/* Mobile: Stacked Layout */}
                        <div className="md:hidden space-y-4">
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
                                        Panduan Layanan EMT MDS
                                    </h1>
                                </div>
                            </div>
                        </div>

                        {/* Desktop: Original Layout */}
                        <div className="hidden md:flex relative items-center justify-between">
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

                            <div className="absolute left-1/2 -translate-x-1/2 text-center">
                                <h2 className="text-3xl font-bold text-foreground">
                                    Panduan Layanan EMT MDS
                                </h2>
                            </div>

                            <div className="w-9"></div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Flowchart */}
                        <div className="w-full overflow-x-auto">
                            <img
                                src="/image/flowchart.svg"
                                alt="Flowchart Sistem Kebencanaan"
                                className="w-full h-auto"
                            />
                        </div>

                        {/* Daftar Dokumen PDF */}
                        <div className="space-y-4">
                            <div className="mb-4">
                                <h3 className="text-xl font-semibold flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Dokumen Panduan dan Standar
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Klik untuk melihat deskripsi dan mengunduh dokumen panduan dan standar operasional untuk layanan EMT MDS
                                </p>
                            </div>

                            <div className="space-y-2">
                                {[
                                    {
                                        name: 'Standar minimal tenaga kesehatan Banjir.pdf',
                                        path: '/file/Standar minimal tenaga kesehatan Banjir.pdf',
                                        description: 'Dokumen standar minimal tenaga kesehatan yang diperlukan untuk penanganan bencana banjir, mencakup jenis tenaga, jumlah, dan kualifikasi yang dibutuhkan.',
                                    },
                                    {
                                        name: 'HEOC.pdf',
                                        path: '/file/HEOC.pdf',
                                        description: 'Health Emergency Operations Center (HEOC) - Panduan operasional pusat operasi darurat kesehatan untuk koordinasi dan manajemen respons kesehatan dalam situasi darurat.',
                                    },
                                    {
                                        name: 'Standar EMT.pdf',
                                        path: '/file/Standar EMT.pdf',
                                        description: 'Dokumen standar Emergency Medical Team (EMT) yang mengatur standar operasional, protokol, dan prosedur untuk tim medis darurat dalam penanganan bencana.',
                                    },
                                    {
                                        name: 'Tenaga Klaster Kesehatan.pdf',
                                        path: '/file/Tenaga Klaster Kesehatan.pdf',
                                        description: 'Panduan pengelolaan tenaga kesehatan dalam klaster kesehatan, termasuk struktur organisasi, pembagian tugas, dan koordinasi antar unit.',
                                    },
                                    {
                                        name: '10 pilar respons.pdf',
                                        path: '/file/10 pilar respons.pdf',
                                        description: 'Dokumen yang menjelaskan 10 pilar utama dalam respons kesehatan darurat, mencakup aspek-aspek kunci yang harus diperhatikan dalam penanganan bencana.',
                                    },
                                    {
                                        name: 'Jenis kebutuhan spesialis berdasar waktu.pdf',
                                        path: '/file/Jenis kebutuhan spesialis berdasar waktu.pdf',
                                        description: 'Panduan jenis kebutuhan tenaga spesialis yang diperlukan berdasarkan fase waktu penanganan bencana, dari fase darurat hingga pemulihan.',
                                    },
                                    {
                                        name: 'Panduan Singkat MDS Report.pdf',
                                        path: '/file/Panduan Singkat MDS Report.pdf',
                                        description: 'Panduan singkat untuk pengisian dan pelaporan MDS (Medical Data System) Report, termasuk format, prosedur, dan informasi yang harus dilaporkan.',
                                    },
                                ].map((file, index) => {
                                    const isExpanded = expandedItems.has(index);
                                    return (
                                        <div
                                            key={index}
                                            className="border border-border rounded-lg overflow-hidden"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(index)}
                                                className="w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors text-left"
                                            >
                                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-foreground">
                                                        {file.name}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {isExpanded ? (
                                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </button>
                                            {isExpanded && (
                                                <div className="px-4 pb-4 pt-0 border-t border-border">
                                                    <p className="text-sm text-muted-foreground mb-4 mt-4">
                                                        {file.description}
                                                    </p>
                                                    <a
                                                        href={file.path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        Buka Dokumen
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <AppFooter />
            </div>
        </>
    );
}

