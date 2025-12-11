import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppNavbar from '@/components/app-navbar';
import AppFooter from '@/components/app-footer';

export default function PanduanEmt() {
    const navItems = [
        {
            name: 'Beranda',
            link: '/',
        },
        {
            name: 'Informasi',
            link: '/informasi',
        },
        {
            name: 'Layanan',
            link: '/',
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
                    <div className="max-w-7xl mx-auto mt-10">
                        <div className="w-full overflow-x-auto">
                            <img
                                src="/image/flowchart.svg"
                                alt="Flowchart Sistem Kebencanaan"
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                </div>
                <AppFooter />
            </div>
        </>
    );
}

