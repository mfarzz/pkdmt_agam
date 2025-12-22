import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Disaster {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Auth {
    user: User;
    activeDisaster?: {
        id: number;
        name: string;
    };
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    roles?: string[];
    items?: Omit<NavItem, 'items' | 'icon' | 'roles'>[]; // Submenus don't have icons or nested items
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    disasters_list: Disaster[];
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
export interface ReportFile {
    id: number;
    file_name: string;
    file_path: string | null;
    file_size: number | null;
}

export interface ReportGroup {
    date: string;
    files: ReportFile[];
}
