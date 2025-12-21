import { Head, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, FileText, Users, Calendar, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LandingProps {
    totalBencana?: number;
    totalTim?: number;
}

export default function Landing({ totalBencana = 0, totalTim = 0 }: LandingProps) {
    const [countBencana, setCountBencana] = useState(0);
    const [countTim, setCountTim] = useState(0);

    // Count up animation
    useEffect(() => {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const stepDuration = duration / steps;

        const animateCount = (target: number, setter: (value: number) => void) => {
            let current = 0;
            const increment = target / steps;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    setter(target);
                    clearInterval(timer);
                } else {
                    setter(Math.floor(current));
                }
            }, stepDuration);
        };

        animateCount(totalBencana, setCountBencana);
        animateCount(totalTim, setCountTim);
    }, [totalBencana, totalTim]);

    const menuItems = [
        {
            title: 'Informasi Umum',
            description: 'Akses informasi umum tentang bencana',
            href: '/infografis',
            icon: ImageIcon,
            color: 'text-purple-600',
        },
        {
            title: 'Pendaftaran DMT',
            description: 'Formulir pendaftaran Disaster Medical Team',
            href: '/pendaftaran-dmt',
            icon: Users,
            color: 'text-blue-600',
        },
        {
            title: 'Panduan Layanan EMT MDS',
            description: 'Panduan penggunaan layanan EMT MDS',
            href: '/panduan-emt',
            icon: BookOpen,
            color: 'text-green-600',
        },
        {
            title: 'Notulensi Rapat',
            description: 'Notulensi rapat koordinasi',
            href: '/notulensi',
            icon: FileText,
            color: 'text-orange-600',
        },
        {
            title: 'Dokumen & Laporan',
            description: 'Akses dokumen dan laporan harian',
            href: '/rekap',
            icon: Calendar,
            color: 'text-indigo-600',
        },
    ];

    return (
        <>
            <Head title="Beranda - HEOC (Health Emergency Operation Center)" />
            <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col">
                {/* Background Pattern */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-200" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>
                </div>

                <div className="relative z-10 container mx-auto px-4 py-4 lg:py-6 flex-1 flex flex-col overflow-hidden">
                    <div className="w-full mx-auto flex-1 flex flex-col overflow-hidden">
                        {/* Welcome Section */}
                        <div className="mb-4">
                            <h1 className="text-3xl lg:text-4xl font-bold text-black dark:text-blue-100 leading-tight">
                                Selamat Datang di
                                <br />
                                <span className="text-red-900">HEOC Kabupaten Agam</span>
                                <br />
                                <span className="text-base lg:text-lg font-normal text-gray-600 dark:text-gray-400 mt-1 block">
                                    (Health Emergency Operation Center Kabupaten Agam)
                                </span>
                            </h1>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 flex flex-col overflow-hidden">

                            {/* Quick Access Menu */}
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="inline-grid grid-cols-5 gap-2">
                                    {menuItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="group"
                                            >
                                                <Card className="hover:shadow-md transition-all cursor-pointer flex items-center justify-center">
                                                    <CardContent className="p-2 flex flex-col items-center justify-center gap-1 h-full w-full">
                                                        <div className={`p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors ${item.color}`}>
                                                            <Icon className="h-8 w-8" />
                                                        </div>
                                                        <h3 className="font-semibold text-[14px] leading-tight text-center text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 px-1">
                                                            {item.title}
                                                        </h3>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Statistics Section - Below Quick Access */}
                                <div className="flex justify-center mt-6">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="text-center">
                                            <p className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100">
                                                {countBencana}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                Total Bencana
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100">
                                                {countTim}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                Total Tim DMT
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Didukung Oleh Section - Full Width */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 mb-4">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">
                            Didukung Oleh
                        </h3>
                        {/* Carousel Container */}
                        <div className="overflow-hidden relative w-full">
                            <div className="flex animate-scroll hover:pause-scroll gap-12 items-center w-max">
                                {[
                                    {
                                        name: 'Pemerintah Kabupaten Agam',
                                        image: '/image/Logo_Agam_Regency.png',
                                        alt: 'Logo Pemerintah Kabupaten Agam',
                                    },
                                    {
                                        name: 'Universitas Andalas',
                                        image: '/image/Logo_Unand.png',
                                        alt: 'Logo Universitas Andalas',
                                    },
                                    {
                                        name: 'Universitas Brawijaya',
                                        image: '/image/Logo_Universitas_Brawijaya.png',
                                        alt: 'Logo Universitas Brawijaya',
                                    },
                                    {
                                        name: 'Rumah Sakit Khusus Kanker Agam',
                                        image: '/image/RSKKA.png',
                                        alt: 'Logo RSKKA',
                                    },
                                    {
                                        name: 'Dinas Kesehatan Kabupaten',
                                        image: '/image/DKK.png',
                                        alt: 'Logo DKK',
                                    },
                                ].concat([
                                    {
                                        name: 'Pemerintah Kabupaten Agam',
                                        image: '/image/Logo_Agam_Regency.png',
                                        alt: 'Logo Pemerintah Kabupaten Agam',
                                    },
                                    {
                                        name: 'Universitas Andalas',
                                        image: '/image/Logo_Unand.png',
                                        alt: 'Logo Universitas Andalas',
                                    },
                                    {
                                        name: 'Universitas Brawijaya',
                                        image: '/image/Logo_Universitas_Brawijaya.png',
                                        alt: 'Logo Universitas Brawijaya',
                                    },
                                    {
                                        name: 'Rumah Sakit Khusus Kanker Agam',
                                        image: '/image/RSKKA.png',
                                        alt: 'Logo RSKKA',
                                    },
                                    {
                                        name: 'Dinas Kesehatan Kabupaten',
                                        image: '/image/DKK.png',
                                        alt: 'Logo DKK',
                                    },
                                ]).map((logo, index) => (
                                    <div
                                        key={`${logo.name}-${index}`}
                                        className="flex items-center justify-center h-15 w-30 flex-shrink-0"
                                    >
                                        <img
                                            src={logo.image}
                                            alt={logo.alt}
                                            className="max-h-full max-w-full object-contain opacity-80 hover:opacity-100 transition-opacity"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Full Width */}
                <footer className="pt-4 border-t border-gray-200 dark:border-gray-700 w-full flex-shrink-0 mb-4">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                            Copyright © {new Date().getFullYear()} HEOC (Health Emergency Operation Center) - Kabupaten Agam
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

