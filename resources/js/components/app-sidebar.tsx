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
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { AlertTriangle, FileSpreadsheet as FileExcel, FileSpreadsheet, FileText, Home, Image, LayoutGrid, Link2, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Manajemen User',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Kelola Bencana',
        href: '/kelola-bencana',
        icon: AlertTriangle,
    },
    {
        title: 'Kelola DMT',
        href: '/kelola-dmt',
        icon: Users,
    },
    {
        title: 'Kelola Infografis',
        href: '/kelola-infografis',
        icon: Image,
    },
    {
        title: 'Kelola Link',
        href: '/kelola-link',
        icon: Link2,
    },
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
