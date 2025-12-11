export default function AppFooter() {
    const logos = [
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
    ];

    // Duplicate logos for seamless infinite scroll
    const duplicatedLogos = [...logos, ...logos];

    return (
        <footer className="border-t border-border bg-card mt-auto">
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Mitra Section */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-foreground mb-4 text-center">
                        Didukung Oleh
                    </h3>
                    
                    {/* Carousel Container */}
                    <div className="overflow-hidden relative w-full">
                        <div className="flex animate-scroll hover:pause-scroll gap-12 items-center w-max">
                            {duplicatedLogos.map((logo, index) => (
                                <div
                                    key={`${logo.name}-${index}`}
                                    className="flex items-center justify-center h-20 w-40 flex-shrink-0"
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

                {/* Copyright */}
                <div className="pt-6 border-t border-border">
                    <p className="text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Pusat Komando Disaster Medical Team Kabupaten Agam. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

