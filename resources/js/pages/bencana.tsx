import AppFooter from '@/components/app-footer';
import AppNavbar from '@/components/app-navbar';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, BookOpen, FileEdit, FileText, UserPlus, Users } from 'lucide-react';

interface BencanaProps {
    registrationLink?: {
        id: number;
        name: string;
        url: string;
        description: string | null;
    };
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

const menuItems = (registrationLink?: BencanaProps['registrationLink'], excelFile?: BencanaProps['excelFile']) => [
    {
        title: 'Informasi Umum',
        description: 'Akses informasi umum tentang Kabupaten Agam',
        href: '/infografis',
        icon: FileText,
    },
    {
        title: registrationLink?.name || 'Link Registrasi',
        description: registrationLink?.description || 'Daftar akun baru untuk mengakses sistem',
        href: registrationLink?.url || '#',
        icon: UserPlus,
    },
    {
        title: 'Panduan Layanan EMT MDS',
        description: 'Panduan penggunaan layanan EMT MDS',
        href: '/panduan-emt',
        icon: BookOpen,
    },
    {
        title: 'Notulensi Rapat Koordinasi',
        description: 'Notulensi rapat koordinasi',
        href: '/notulensi',
        icon: Users,
    },
    {
        title: 'Pengisian Laporan',
        description: 'Download file Excel untuk pengisian laporan.',
        descriptionHighlight: 'Pengisian dilakukan hanya oleh admin.',
        href: excelFile ? `/laporan-excel/download` : '#',
        icon: FileEdit,
    },
    {
        title: 'Rekap Data',
        description: 'Lihat rekap dan statistik data',
        href: '/rekap',
        icon: BarChart3,
    },
];

export default function Bencana({ registrationLink, excelFile, activeDisasterName }: BencanaProps) {
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

                    <div className="relative max-w-4xl mx-auto">
                        {/* Garis vertikal utama di tengah */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-primary/30 hidden md:block"></div>

                        <div className="relative space-y-8 md:space-y-12">
                            {menuItems(registrationLink, excelFile).map((item, index) => {
                                const Icon = item.icon;
                                const items = menuItems(registrationLink);
                                const isLast = index === items.length - 1;
                                const isEven = index % 2 === 0;

                                return (
                                    <div
                                        key={item.title}
                                        className={`relative flex items-center animate-fade-in-up ${isEven ? 'md:justify-start' : 'md:justify-end'
                                            }`}
                                        style={{
                                            animationDelay: `${index * 150}ms`,
                                            animationFillMode: 'both',
                                        }}
                                    >
                                        {/* Garis horizontal untuk menghubungkan ke garis vertikal */}
                                        {!isLast && (
                                            <div
                                                className={`hidden md:block absolute top-1/2 h-0.5 bg-primary/30 -translate-y-1/2 -z-10 ${isEven
                                                    ? 'left-1/2 right-0'
                                                    : 'left-0 right-1/2'
                                                    }`}
                                            ></div>
                                        )}

                                        {/* Nomor urut di tengah */}
                                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold border-4 border-background shadow-md">
                                            {index + 1}
                                        </div>

                                        {item.href === '#' ? (
                                            <div className={`w-full md:w-80 ${isEven ? 'md:mr-auto' : 'md:ml-auto'
                                                }`}>
                                                <Card className="w-full opacity-60 cursor-not-allowed relative animate-fade-in-up" style={{ animationDelay: `${index * 150 + 100}ms`, animationFillMode: 'both' }}>
                                                    <CardHeader>
                                                        <div className="mb-2 flex items-center gap-3">
                                                            <div className="rounded-lg bg-primary/10 p-2">
                                                                <Icon className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <CardTitle className="text-lg">
                                                                {item.title}
                                                            </CardTitle>
                                                        </div>
                                                        <CardDescription>
                                                            {item.description}
                                                            {item.descriptionHighlight && (
                                                                <span className="block mt-1 font-semibold text-primary">
                                                                    {item.descriptionHighlight}
                                                                </span>
                                                            )}
                                                        </CardDescription>
                                                    </CardHeader>

                                                    {/* Garis di bawah card untuk mobile */}
                                                    {!isLast && (
                                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-primary/30 md:hidden"></div>
                                                    )}
                                                </Card>
                                            </div>
                                        ) : item.href.startsWith('http') || item.href.startsWith('/') ? (
                                            <a
                                                href={item.href}
                                                target={item.href.startsWith('http') ? '_blank' : undefined}
                                                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                className={`w-full md:w-80 ${isEven ? 'md:mr-auto' : 'md:ml-auto'
                                                    }`}
                                            >
                                                <Card className="w-full transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer relative animate-fade-in-up" style={{ animationDelay: `${index * 150 + 100}ms`, animationFillMode: 'both' }}>
                                                    <CardHeader>
                                                        <div className="mb-2 flex items-center gap-3">
                                                            <div className="rounded-lg bg-primary/10 p-2">
                                                                <Icon className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <CardTitle className="text-lg">
                                                                {item.title}
                                                            </CardTitle>
                                                        </div>
                                                        <CardDescription>
                                                            {item.description}
                                                            {item.descriptionHighlight && (
                                                                <span className="block mt-1 font-semibold text-primary">
                                                                    {item.descriptionHighlight}
                                                                </span>
                                                            )}
                                                        </CardDescription>
                                                    </CardHeader>

                                                    {/* Garis di bawah card untuk mobile */}
                                                    {!isLast && (
                                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-primary/30 md:hidden"></div>
                                                    )}
                                                </Card>
                                            </a>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className={`w-full md:w-80 ${isEven ? 'md:mr-auto' : 'md:ml-auto'
                                                    }`}
                                            >
                                                <Card className="w-full transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer relative animate-fade-in-up" style={{ animationDelay: `${index * 150 + 100}ms`, animationFillMode: 'both' }}>
                                                    <CardHeader>
                                                        <div className="mb-2 flex items-center gap-3">
                                                            <div className="rounded-lg bg-primary/10 p-2">
                                                                <Icon className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <CardTitle className="text-lg">
                                                                {item.title}
                                                            </CardTitle>
                                                        </div>
                                                        <CardDescription>
                                                            {item.description}
                                                            {item.descriptionHighlight && (
                                                                <span className="block mt-1 font-semibold text-primary">
                                                                    {item.descriptionHighlight}
                                                                </span>
                                                            )}
                                                        </CardDescription>
                                                    </CardHeader>

                                                    {/* Garis di bawah card untuk mobile */}
                                                    {!isLast && (
                                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-primary/30 md:hidden"></div>
                                                    )}
                                                </Card>
                                            </Link>
                                        )}
                                    </div>
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

