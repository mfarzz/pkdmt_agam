import { useEffect, useRef } from 'react';

export default function AppLogoCarousel() {
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

    // Duplicate logos untuk infinite scroll
    const duplicatedLogos = [...logos, ...logos];

    return (
        <div className="w-full overflow-hidden border-b border-border bg-card/50 backdrop-blur-sm py-3">
            <div className="relative">
                {/* Gradient overlay untuk efek fade di ujung */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-card/50 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-card/50 to-transparent z-10 pointer-events-none"></div>

                {/* Carousel Container */}
                <div className="flex animate-scroll">
                    {duplicatedLogos.map((logo, index) => (
                        <div
                            key={`${logo.name}-${index}`}
                            className="flex-shrink-0 mx-6 flex items-center justify-center"
                            style={{ minWidth: '120px' }}
                        >
                            <img
                                src={logo.image}
                                alt={logo.alt}
                                className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

