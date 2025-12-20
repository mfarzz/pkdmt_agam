import AppFooter from '@/components/app-footer';
import AppNavbar from '@/components/app-navbar';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, BookOpen, FileEdit, FileText, UserPlus, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface BencanaProps {
    excelFile?: {
        id: number;
        file_name: string;
        file_path: string;
        original_name: string;
        file_size: number;
        mime_type: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
    };
    activeDisasterName?: string;
}

const menuItems = (excelFile?: BencanaProps['excelFile']) => [
    {
        title: 'Informasi Umum',
        description: 'Akses informasi umum tentang Kabupaten Agam',
        fullDescription: 'Halaman ini menyediakan akses ke berbagai informasi umum tentang Kabupaten Agam, termasuk infografis, data statistik, dan informasi penting lainnya yang relevan dengan penanganan bencana dan manajemen Disaster Medical Team.',
        href: '/infografis',
        icon: FileText,
    },
    {
        title: 'Pendaftaran DMT',
        description: 'Formulir pendaftaran Disaster Medical Team',
        fullDescription: 'Formulir pendaftaran untuk tim Disaster Medical Team (DMT) yang ingin terlibat dalam penanganan bencana. Tim dapat mendaftarkan diri dengan mengisi data lengkap termasuk kapasitas layanan, komposisi anggota tim, dan dokumen pendukung yang diperlukan.',
        href: '/pendaftaran-dmt',
        icon: UserPlus,
    },
    {
        title: 'Panduan Layanan EMT MDS',
        description: 'Panduan penggunaan layanan EMT MDS',
        fullDescription: 'Panduan lengkap untuk menggunakan layanan Emergency Medical Team - Minimum Data Set (EMT MDS). Panduan ini mencakup cara pengisian data, standar pelaporan, dan prosedur operasional yang harus diikuti oleh tim medis.',
        href: '/panduan-emt',
        icon: BookOpen,
    },
    {
        title: 'Notulensi Rapat Koordinasi',
        description: 'Notulensi rapat koordinasi',
        fullDescription: 'Akses ke notulensi dan dokumentasi dari berbagai rapat koordinasi yang telah dilaksanakan. Notulensi ini mencakup pembahasan strategi penanganan bencana, koordinasi antar tim, dan keputusan-keputusan penting yang telah diambil.',
        href: '/notulensi',
        icon: Users,
    },
    {
        title: 'Pengisian Laporan',
        description: 'Download file Excel untuk pengisian laporan.',
        descriptionHighlight: 'Pengisian dilakukan hanya oleh admin.',
        fullDescription: 'Fitur ini memungkinkan admin untuk mengunduh file Excel template yang digunakan untuk pengisian laporan. File Excel ini berisi format standar yang harus diikuti untuk memastikan konsistensi data dan kemudahan dalam pengolahan laporan selanjutnya.',
        href: excelFile ? `/laporan-excel/download` : '#',
        icon: FileEdit,
    },
    {
        title: 'Rekap Data',
        description: 'Lihat rekap dan statistik data',
        fullDescription: 'Halaman rekap data menyediakan ringkasan dan statistik lengkap dari semua data yang telah dikumpulkan. Termasuk data tim DMT, laporan kegiatan, dan berbagai metrik penting lainnya yang dapat digunakan untuk evaluasi dan perencanaan selanjutnya.',
        href: '/rekap',
        icon: BarChart3,
    },
];

export default function Bencana({ excelFile, activeDisasterName }: BencanaProps) {
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
    
    const toggleExpand = (index: number) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
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
            <Head title="Pusat Komando Disaster Medical Team Kabupaten Agam" />
            <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
                <AppNavbar navItems={navItems} />

                <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 relative z-10 pt-24 flex-1">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Pusat Komando Disaster Medical Team
                        </h1>
                        <p className="mt-2 text-lg text-muted-foreground">
                            {activeDisasterName || 'Kabupaten Agam'}
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <div className="space-y-4">
                            {menuItems(excelFile).map((item, index) => {
                                const Icon = item.icon;
                                const isExpanded = expandedItems.has(index);

                                const cardContent = (
                                    <Card className="w-full transition-all hover:shadow-md">
                                                    <CardHeader>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                                                                <Icon className="h-5 w-5 text-primary" />
                                                            </div>
                                                    <div className="flex-1 min-w-0">
                                                            <CardTitle className="text-lg">
                                                                {item.title}
                                                            </CardTitle>
                                                        <CardDescription className="mt-1">
                                                            {item.description}
                                                            {item.descriptionHighlight && (
                                                                <span className="block mt-1 font-semibold text-primary">
                                                                    {item.descriptionHighlight}
                                                                </span>
                                                            )}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        toggleExpand(index);
                                                    }}
                                                    className="flex-shrink-0"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                                    </CardHeader>
                                        {isExpanded && (
                                            <CardContent className="pt-0">
                                                <p className="text-sm text-muted-foreground">
                                                    {item.fullDescription}
                                                </p>
                                            </CardContent>
                                                    )}
                                                </Card>
                                );

                                if (item.href === '#') {
                                    return (
                                        <div key={item.title} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}>
                                            <div className="opacity-60 cursor-not-allowed">
                                                {cardContent}
                                            </div>
                                        </div>
                                    );
                                }

                                if (item.href.startsWith('http')) {
                                    return (
                                        <a
                                            key={item.title}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block animate-fade-in-up"
                                            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                                        >
                                            {cardContent}
                                        </a>
                                    );
                                }

                                return (
                                            <Link
                                        key={item.title}
                                                href={item.href}
                                        className="block animate-fade-in-up"
                                        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                                    >
                                        {cardContent}
                                            </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <AppFooter />
            </div>
        </>
    );
}

