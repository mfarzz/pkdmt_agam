import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

    const partners = [
        { name: 'Pemkab Agam', image: '/image/Logo_Agam_Regency.png' },
        { name: 'Universitas Andalas', image: '/image/Logo_Unand.png' },
        { name: 'Universitas Brawijaya', image: '/image/Logo_Universitas_Brawijaya.png' },
        { name: 'RS Khusus Kanker', image: '/image/RSKKA.png' },
        { name: 'Dinas Kesehatan', image: '/image/DKK.png' },
    ];


    return (
        <>
            <Head title="Panduan Layanan EMT DMS" />
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
                            Panduan Layanan EMT MDS
                        </h1>
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

