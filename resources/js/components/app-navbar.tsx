import { useState } from 'react';
import {
    Navbar,
    NavBody,
    NavItems,
    MobileNav,
    NavbarLogo,
    NavbarButton,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu,
} from '@/components/ui/resizable-navbar';

import { store as login } from '@/routes/login';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { LogOut, User } from 'lucide-react';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';

interface NavItem {
    name: string;
    link: string;
}

interface AppNavbarProps {
    navItems: NavItem[];
    loginButtonText?: string;
    loginButtonHref?: string;
    onLoginClick?: () => void;
}

export default function AppNavbar({
    navItems,
    loginButtonText = 'Login',
    loginButtonHref,
    onLoginClick,
}: AppNavbarProps) {
    const defaultLoginHref = loginButtonHref || login.url();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const isAuthenticated = !!auth?.user;
    const user = auth?.user;

    const handleMobileMenuClose = () => {
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <Navbar>
            <NavBody>
                <NavbarLogo />
                <NavItems items={navItems} />
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-9 w-9 rounded-full p-0"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={user?.avatar}
                                            alt={user?.name || ''}
                                        />
                                        <AvatarFallback className="bg-neutral-200 text-black">
                                            {getInitials(user?.name || '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user?.name || ''}</span>
                                            {user?.email && (
                                                <span className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" className="w-full cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            {onLoginClick ? (
                                <NavbarButton
                                    variant="secondary"
                                    onClick={onLoginClick}
                                    as="button"
                                >
                                    {loginButtonText}
                                </NavbarButton>
                            ) : (
                                <NavbarButton variant="secondary" href={defaultLoginHref}>
                                    {loginButtonText}
                                </NavbarButton>
                            )}
                        </>
                    )}
                </div>
            </NavBody>

            <MobileNav>
                <MobileNavHeader>
                    <NavbarLogo />
                    <MobileNavToggle
                        isOpen={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    />
                </MobileNavHeader>
                <MobileNavMenu
                    isOpen={isMobileMenuOpen}
                    onClose={handleMobileMenuClose}
                >
                    {navItems.map((item, idx) => {
                        const currentPath = typeof window !== 'undefined' ? window.location.pathname : page.url.split('?')[0];
                        const isActive = currentPath === item.link || (item.link !== '/' && currentPath.startsWith(item.link));
                        return (
                        <a
                            key={`mobile-link-${idx}`}
                            href={item.link}
                            onClick={handleMobileMenuClose}
                                className={cn(
                                    "relative block px-2 py-2 rounded-md transition-colors",
                                    isActive ? "text-primary font-semibold bg-primary/10" : "text-neutral-600"
                                )}
                        >
                                <span>{item.name}</span>
                        </a>
                        );
                    })}
                    <div className="flex w-full flex-col gap-4">
                        {isAuthenticated ? (
                            <>
                                <div className="flex items-center gap-2 px-2 py-2 border-b">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={user?.avatar}
                                            alt={user?.name || ''}
                                        />
                                        <AvatarFallback className="bg-neutral-200 text-black">
                                            {getInitials(user?.name || '')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{user?.name || ''}</span>
                                        {user?.email && (
                                            <span className="text-xs text-muted-foreground">
                                                {user.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard"
                                    onClick={handleMobileMenuClose}
                                    className="w-full"
                                >
                                    <NavbarButton
                                        variant="primary"
                                        className="w-full"
                                        as="button"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </NavbarButton>
                                </Link>
                                <NavbarButton
                                    onClick={() => {
                                        handleMobileMenuClose();
                                        handleLogout();
                                    }}
                                    variant="primary"
                                    className="w-full bg-red-600 hover:bg-red-700"
                                    as="button"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </NavbarButton>
                            </>
                        ) : (
                            <>
                                {onLoginClick ? (
                                    <NavbarButton
                                        onClick={() => {
                                            handleMobileMenuClose();
                                            onLoginClick();
                                        }}
                                        variant="primary"
                                        className="w-full"
                                        as="button"
                                    >
                                        {loginButtonText}
                                    </NavbarButton>
                                ) : (
                                    <NavbarButton
                                        onClick={handleMobileMenuClose}
                                        variant="primary"
                                        className="w-full"
                                        href={defaultLoginHref}
                                    >
                                        {loginButtonText}
                                    </NavbarButton>
                                )}
                            </>
                        )}
                    </div>
                </MobileNavMenu>
            </MobileNav>
        </Navbar>
    );
}

