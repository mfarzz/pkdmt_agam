import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { login } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { Activity, BookOpen, Calendar, CheckCircle, FileText, Image as ImageIcon, LogIn, Shield, Users } from 'lucide-react';
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
        const duration = 2000;
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
            description: 'Akses data & dokumentasi kejadian bencana terkini.',
            href: '/infografis',
            icon: ImageIcon,
            color: 'bg-orange-100 text-orange-600',
            hoverColor: 'group-hover:bg-orange-600 group-hover:text-white',
        },
        {
            title: 'Pendaftaran DMT',
            description: 'Gabung Disaster Medical Team (DMT) Kab. Agam.',
            href: '/pendaftaran-dmt',
            icon: Users,
            color: 'bg-blue-100 text-blue-600',
            hoverColor: 'group-hover:bg-blue-600 group-hover:text-white',
        },
        {
            title: 'Panduan Layanan',
            description: 'Prosedur & standar operasional EMT MDS.',
            href: '/panduan-emt',
            icon: BookOpen,
            color: 'bg-green-100 text-green-600',
            hoverColor: 'group-hover:bg-green-600 group-hover:text-white',
        },
        {
            title: 'Notulensi Rapat',
            description: 'Arsip hasil koordinasi penanggulangan.',
            href: '/notulensi',
            icon: FileText,
            color: 'bg-amber-100 text-amber-600',
            hoverColor: 'group-hover:bg-amber-600 group-hover:text-white',
        },
        {
            title: 'Dokumen & Laporan',
            description: 'Rekapitulasi laporan harian & dokumen penting.',
            href: '/rekap',
            icon: Calendar,
            color: 'bg-red-100 text-red-600',
            hoverColor: 'group-hover:bg-red-600 group-hover:text-white',
        },
    ];

    const partners = [
        { name: 'Pemkab Agam', image: '/image/Logo_Agam_Regency.png' },
        { name: 'Universitas Andalas', image: '/image/Logo_Unand.png' },
        { name: 'Universitas Brawijaya', image: '/image/Logo_Universitas_Brawijaya.png' },
        { name: 'RS Khusus Kanker', image: '/image/RSKKA.png' },
        { name: 'Dinas Kesehatan', image: '/image/DKK.png' },
    ];

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-orange-200 selection:text-orange-900">
            <Head title="Beranda - HEOC Kabupaten Agam" />

            {/* Navbar / Header */}
            <header className="absolute top-0 left-0 right-0 z-50 py-6">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {/* Optional Logo Placeholder */}
                        {/* <img src="/logo.png" alt="HEOC Logo" className="h-10 w-auto" /> */}
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-md">HEOC</h1>
                            <span className="text-xs font-medium text-orange-100/90 tracking-wider uppercase">Kabupaten Agam</span>
                        </div>
                    </div>
                    <Link href={login()}>
                        <Button variant="secondary" className="bg-white/90 hover:bg-white text-orange-700 hover:text-orange-800 font-semibold shadow-lg backdrop-blur-sm transition-all hover:scale-105">
                            <LogIn className="h-4 w-4 mr-2" />
                            Masuk Sistem
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative px-4 pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-red-600"></div>

                {/* Abstract Patterns */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                    </svg>
                </div>
                <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-yellow-400/20 blur-3xl"></div>

                <div className="container relative mx-auto z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-6 backdrop-blur-md border border-white/20 animate-fade-in-up">
                        <Activity className="h-4 w-4" />
                        <span>Siaga Bencana 24/7</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight drop-shadow-sm animate-fade-in-up [animation-delay:100ms]">
                        Health Emergency <br className="hidden md:block" />
                        <span className="text-orange-100">Operation Center</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-orange-50 mb-10 leading-relaxed font-light animate-fade-in-up [animation-delay:200ms]">
                        Pusat kendali dan koordinasi penanggulangan krisis kesehatan Kabupaten Agam.
                        Cepat, Tanggap, dan Terintegrasi.
                    </p>

                    {/* Stats Cards (Floating) */}
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 max-w-2xl mx-auto animate-fade-in-up [animation-delay:300ms]">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white hover:bg-white/20 transition-colors">
                            <div className="text-4xl lg:text-5xl font-bold mb-1">{countBencana}</div>
                            <div className="text-sm text-orange-100 font-medium uppercase tracking-widest opacity-80">Total Bencana</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white hover:bg-white/20 transition-colors">
                            <div className="text-4xl lg:text-5xl font-bold mb-1">{countTim}</div>
                            <div className="text-sm text-orange-100 font-medium uppercase tracking-widest opacity-80">Tim Siaga</div>
                        </div>
                    </div>
                </div>

                {/* Wave Separator */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg className="fill-background w-full h-12 lg:h-24" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </section>

            {/* Features / Quick Access Section */}
            <section className="py-20 bg-background relative z-10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Layanan & Informasi Utama</h2>
                        <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full"></div>
                        <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
                            Akses cepat ke berbagai fitur dan informasi penanggulangan bencana.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className="group relative"
                                >
                                    <div className="absolute inset-0 bg-orange-500/5 rounded-2xl transform transition-transform group-hover:scale-105 group-hover:bg-orange-500/10"></div>
                                    <Card className="h-full border-0 shadow-sm hover:shadow-xl transition-all duration-300 relative bg-card/80 backdrop-blur-sm overflow-hidden group-hover:-translate-y-1">
                                        <CardContent className="p-6 flex flex-col items-center text-center h-full">
                                            <div className={`mb-4 p-4 rounded-2xl transition-all duration-300 ${item.color} ${item.hoverColor} shadow-inner`}>
                                                <Icon className="h-8 w-8" />
                                            </div>
                                            <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {item.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Why Us / Info Section (Optional Filler) */}
            <section className="py-16 bg-gradient-to-b from-orange-50 to-white dark:from-stone-900 dark:to-background">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="w-full md:w-1/2">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800">
                                <img
                                    src="image/landing/bencana.jpg"
                                    alt="Medical Team"
                                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                    <p className="text-white font-medium italic">"Kesiapsiagaan adalah kunci keselamatan."</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wide">
                                <Shield className="h-3 w-3" />
                                Misi Kemanusiaan
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                                Bersinergi Untuk <span className="text-primary">Agam Lebih Tangguh</span>
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                HEOC memfasilitasi koordinasi cepat antar instansi kesehatan dan relawan dalam situasi darurat, memastikan respon yang efektif dan efisien demi keselamatan masyarakat.
                            </p>
                            <ul className="space-y-3 mt-4">
                                {['Respon Cepat 24 Jam', 'Tim Medis Terlatih', 'Integrasi Data Real-time'].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners / Didukung Oleh */}
            <section className="py-12 border-t border-border bg-background">
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
    );
}


