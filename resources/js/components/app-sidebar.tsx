import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavGroup, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle, FileCheck, FileSpreadsheet as FileExcel, FileSpreadsheet, FileText, Home, Image, LayoutGrid, Link2, Users, LayoutDashboard, BookOpen } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavGroups: NavGroup[] = [
    {
        title: 'Pengaturan Sistem',
        items: [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutDashboard,
                roles: ['admin', 'superadmin'],
            },
            {
                title: 'Manajemen User',
                href: '/manajemen-user',
                icon: LayoutGrid,
                roles: ['superadmin'],
            },
            {
                title: 'Kelola Bencana',
                href: '/kelola-bencana',
                icon: AlertTriangle,
                roles: ['superadmin'],
            },
        ],
    },
    {
        title: 'Konten Publik',
        items: [
            {
                title: 'Kelola Infografis',
                href: '/kelola-infografis',
                icon: Image,
                roles: ['superadmin'],
            },
            {
                title: 'Kelola Pendaftaran',
                href: '/kelola-pendaftaran',
                icon: FileCheck,
                roles: ['superadmin'],
            },
        ],
    },
    {
        title: 'Dokumen & Laporan',
        items: [
            {
                title: 'Kelola Notulensi',
                href: '/kelola-notulensi',
                icon: FileSpreadsheet,
                roles: ['superadmin'],
            },
            {
                title: 'Kelola File Excel Laporan',
                href: '/kelola-laporan-excel',
                icon: FileExcel,
                roles: ['admin', 'superadmin'],
            },
            {
                title: 'Kelola Report',
                href: '#',
                icon: FileText,
                roles: ['admin', 'superadmin'],
                items: [
                    {
                        title: 'Report Mingguan',
                        href: '/kelola-report-mingguan',
                    },
                    {
                        title: 'Report DMT',
                        href: '/kelola-report-dmt',
                    },
                    {
                        title: 'Report HEOC',
                        href: '/kelola-report-heoc',
                    },
                ],
            },
        ],
    },
    {
        title: 'Bantuan',
        items: [
            {
                title: 'Panduan',
                href: '/panduan',
                icon: BookOpen,
                roles: ['admin', 'superadmin'],
            },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user?.role as string || 'admin';

    const filteredNavGroups = mainNavGroups.map(group => ({
        ...group,
        items: group.items.filter(item => !item.roles || item.roles.includes(userRole))
    })).filter(group => group.items.length > 0);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <div className="px-2 py-2">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={{ children: 'Ke Beranda' }}>
                                <Link href="/" prefetch>
                                    <Home />
                                    <span>Ke Beranda</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
                <NavMain groups={filteredNavGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
