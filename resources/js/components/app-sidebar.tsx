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
import { type NavGroup } from '@/types';
import { Link } from '@inertiajs/react';
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
    },
    {
        title: 'Manajemen User',
        href: '/manajemen-user',
        icon: LayoutGrid,
    },
    {
        title: 'Kelola Bencana',
        href: '/kelola-bencana',
        icon: AlertTriangle,
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
    },
    {
                title: 'Kelola Pendaftaran',
                href: '/kelola-pendaftaran',
                icon: FileCheck,
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
    },
    {
        title: 'Kelola File Excel Laporan',
        href: '/kelola-laporan-excel',
        icon: FileExcel,
    },
    {
        title: 'Kelola Report',
        href: '/kelola-report',
        icon: FileText,
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
            },
        ],
    },
];

export function AppSidebar() {
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
                <NavMain groups={mainNavGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
