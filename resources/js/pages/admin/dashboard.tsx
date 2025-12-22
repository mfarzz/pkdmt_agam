import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Stethoscope, CheckCircle, XCircle, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    success?: string;
    statistics?: {
        total_aktif: number;
        total_selesai: number;
        total_tim: number;
    };
    aggregateData?: {
        kapasitas: {
            rawat_jalan: number;
            rawat_inap: number;
            operasi_mayor: number;
            operasi_minor: number;
        };
        tenaga_medis: {
            dokter_umum: number;
            perawat: number;
            bidan: number;
            apoteker: number;
            psikolog: number;
            staf_logistik: number;
            staf_administrasi: number;
            petugas_keamanan: number;
        };
    };
    jenisLayananData?: Array<{ name: string; count: number }>;
    activeDisasterName?: string;
}

export default function Dashboard({ success, statistics, aggregateData, jenisLayananData = [], activeDisasterName }: DashboardProps) {
    const [isLoading, setIsLoading] = useState(true);
    const { url } = usePage();

    // Show skeleton while data is loading
    useEffect(() => {
        // Check if we have data, if not show skeleton
        const hasData = statistics !== undefined || aggregateData !== undefined;

        if (hasData) {
            // Data is available, hide skeleton after a brief moment for smooth transition
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 300);

            return () => clearTimeout(timer);
        } else {
            // No data yet, keep showing skeleton
            setIsLoading(true);
        }
    }, [statistics, aggregateData, url]);

    // Show skeleton while loading
    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    {/* Header Skeleton */}
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>

                    {/* Statistics Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-4 rounded" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-16 mb-2" />
                                    <Skeleton className="h-3 w-32" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Charts Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-48 mb-2" />
                                    <Skeleton className="h-4 w-64" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-[300px] w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Additional Chart Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-56 mb-2" />
                            <Skeleton className="h-4 w-72" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[300px] w-full" />
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Success Message */}
                {success && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm font-medium text-green-700">
                        {success}
                    </div>
                )}

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {activeDisasterName ? `Overview sistem untuk ${activeDisasterName}` : 'Overview sistem BECARES'}
                    </p>
                </div>

                {/* Statistics Cards */}
                {statistics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Tim
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statistics.total_tim}</div>
                                <p className="text-xs text-muted-foreground">
                                    Total Disaster Medical Team
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Tim Aktif
                                </CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{statistics.total_aktif}</div>
                                <p className="text-xs text-muted-foreground">
                                    Tim yang sedang bertugas
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Tim Selesai
                                </CardTitle>
                                <XCircle className="h-4 w-4 text-gray-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-600">{statistics.total_selesai}</div>
                                <p className="text-xs text-muted-foreground">
                                    Tim yang telah menyelesaikan tugas
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Visualization Section */}
                {aggregateData && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Kapasitas Layanan Chart */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-primary" />
                                        <CardTitle>Kapasitas Layanan</CardTitle>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Total kapasitas layanan dari tim DMT aktif
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={[
                                                {
                                                    name: 'Rawat Jalan',
                                                    value: aggregateData.kapasitas.rawat_jalan,
                                                    unit: 'pasien/hari',
                                                },
                                                {
                                                    name: 'Rawat Inap',
                                                    value: aggregateData.kapasitas.rawat_inap,
                                                    unit: 'pasien/hari',
                                                },
                                                {
                                                    name: 'Operasi Mayor',
                                                    value: aggregateData.kapasitas.operasi_mayor,
                                                    unit: 'kasus/hari',
                                                },
                                                {
                                                    name: 'Operasi Minor',
                                                    value: aggregateData.kapasitas.operasi_minor,
                                                    unit: 'kasus/hari',
                                                },
                                            ]}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value: number | undefined, name: string | undefined, props: any) => [
                                                    `${value ?? 0} ${props.payload.unit}`,
                                                    props.payload.name,
                                                ]}
                                            />
                                            <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Tenaga Medis Chart */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Stethoscope className="h-5 w-5 text-primary" />
                                        <CardTitle>Tenaga Medis & Staf</CardTitle>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Total tenaga medis dan staf dari semua tim DMT
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={[
                                                { name: 'Dokter Umum', value: aggregateData.tenaga_medis.dokter_umum },
                                                { name: 'Perawat', value: aggregateData.tenaga_medis.perawat },
                                                { name: 'Bidan', value: aggregateData.tenaga_medis.bidan },
                                                { name: 'Apoteker', value: aggregateData.tenaga_medis.apoteker },
                                                { name: 'Psikolog', value: aggregateData.tenaga_medis.psikolog },
                                                { name: 'Staf Logistik', value: aggregateData.tenaga_medis.staf_logistik },
                                                { name: 'Staf Admin', value: aggregateData.tenaga_medis.staf_administrasi },
                                                { name: 'Petugas Keamanan', value: aggregateData.tenaga_medis.petugas_keamanan },
                                            ]}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <Tooltip formatter={(value: number | undefined) => [`${value ?? 0} orang`, 'Jumlah']} />
                                            <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Jenis Layanan Tersedia Chart */}
                        {jenisLayananData && jenisLayananData.length > 0 && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-primary" />
                                        <CardTitle>Jenis Layanan yang Tersedia</CardTitle>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Frekuensi jenis layanan yang tersedia dari tim DMT aktif
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={jenisLayananData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="name"
                                                angle={-45}
                                                textAnchor="end"
                                                height={100}
                                                interval={0}
                                            />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value: number | undefined) => [`${value ?? 0} tim`, 'Jumlah Tim']}
                                            />
                                            <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
