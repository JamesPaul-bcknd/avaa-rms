'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Settings,
    LogOut,
    Loader2,
    Search,
    Bell,
    UserCircle2,
    Moon,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';
import api from '@/lib/axios';
import Image from 'next/image';
import LogoutModal from '@/components/modals/LogoutModal';

const mainNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
];

const systemNavItems = [
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

// Map of route to page title
const pageTitles: Record<string, { title: string; subtitle: string }> = {
    '/admin/dashboard': { title: 'Dashboard', subtitle: "Welcome back Admin, here's what's happening today." },
    '/admin/users': { title: 'Users', subtitle: 'Manage all registered users.' },
    '/admin/jobs': { title: 'Jobs', subtitle: 'Manage all job postings.' },
    '/admin/settings': { title: 'Settings', subtitle: 'Configure system settings.' },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    const [adminUser, setAdminUser] = useState<{ name: string; email: string; role?: string; profile_image_url?: string | null } | null>(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const sidebarWidth = sidebarCollapsed ? 68 : 220;

    // Don't show sidebar on login page
    const isLoginPage = pathname === '/signin';

    useEffect(() => {
        if (isLoginPage) {
            setAuthChecked(true);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/signin');
            return;
        }

        // Verify token with backend
        api.post('/admin/me', {}, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (res.data.role !== 'admin') {
                    localStorage.removeItem('token');
                    router.replace('/signin');
                } else {
                    setAdminUser({
                        name: res.data.name || 'Admin',
                        email: res.data.email || '',
                        role: res.data.role || 'admin',
                        profile_image_url: res.data.profile_image_url || null,
                    });
                    setAuthChecked(true);
                }
            })
            .catch(() => {
                localStorage.removeItem('token');
                router.replace('/signin');
            });
    }, [isLoginPage, router]);

    useEffect(() => {
        const storedTheme = localStorage.getItem('admin-theme');
        if (storedTheme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('admin-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('admin-theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const handleOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (!authChecked) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
                <Loader2 className="h-8 w-8 animate-spin text-[#3CD894]" />
            </div>
        );
    }

    const handleLogout = async () => {
        if (logoutLoading) return;
        setLogoutLoading(true);
        const token = localStorage.getItem('token');
        try {
            await api.post('/admin/logout', {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch {
            // Continue with local cleanup even if API fails
        } finally {
            localStorage.removeItem('token');
            setShowLogoutModal(false);
            setLogoutLoading(false);
            router.push('/signin');
        }
    };

    const currentPage = (pathname ? pageTitles[pathname] : undefined) || { title: 'Admin', subtitle: '' };

    return (
        <div className={`flex min-h-screen ${isDarkMode ? 'bg-[#111827]' : 'bg-[#f5f7fa]'}`}>
            {/* ─── Sidebar ─── */}
            <aside
                className={`fixed left-0 top-0 h-full border-r flex flex-col z-30 transition-all duration-300 ease-in-out overflow-hidden ${isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-gray-200'}`}
                style={{ width: sidebarWidth }}
            >
                {/* Logo */}
                <div className={`flex items-center transition-all duration-300 ${sidebarCollapsed ? 'flex-col gap-3 px-3 py-5' : 'gap-2.5 px-5 py-5'}`}>
                    <Image
                        src="/avaa_logo.png"
                        alt="AVAA Logo"
                        width={36}
                        height={36}
                        className="rounded-lg flex-shrink-0"
                    />
                    {!sidebarCollapsed && (
                        <span className={`text-lg font-bold tracking-tight whitespace-nowrap ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>AVAA</span>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed((v) => !v)}
                        className={`p-1.5 rounded-md border cursor-pointer transition-colors flex-shrink-0 ${sidebarCollapsed ? '' : 'ml-auto'} ${isDarkMode ? 'border-slate-600 hover:bg-slate-800' : 'border-gray-200 hover:bg-gray-50'}`}
                        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {sidebarCollapsed ? <PanelLeftOpen size={16} className={isDarkMode ? 'text-slate-300' : 'text-gray-400'} /> : <PanelLeftClose size={16} className={isDarkMode ? 'text-slate-300' : 'text-gray-400'} />}
                    </button>
                </div>

                {/* Main Navigation */}
                <nav className={`flex-1 pt-2 transition-all duration-300 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
                    <div className={sidebarCollapsed ? 'flex flex-col items-center gap-2' : 'space-y-1'}>
                        {mainNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    title={sidebarCollapsed ? item.name : undefined}
                                    className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 ${sidebarCollapsed
                                            ? `w-10 h-10 justify-center ${isActive ? 'bg-[#7EB0AB]/15 text-[#7EB0AB]' : `${isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-slate-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}`
                                            : `px-3 py-2.5 ${isActive ? 'bg-[#7EB0AB] text-white shadow-sm' : `${isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-slate-100' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}`
                                        }`}
                                >
                                    <Icon size={sidebarCollapsed ? 20 : 18} className="flex-shrink-0" />
                                    {!sidebarCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                                </a>
                            );
                        })}
                    </div>

                    {/* System Section */}
                    <div className={sidebarCollapsed ? 'mt-6 flex flex-col items-center' : 'mt-8'}>
                        <p className={`font-semibold uppercase tracking-wider ${sidebarCollapsed ? 'text-[9px] mb-2' : 'text-[11px] px-3 mb-2'} ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>System</p>
                        <div className={sidebarCollapsed ? 'flex flex-col items-center gap-2' : 'space-y-1'}>
                            {systemNavItems.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        title={sidebarCollapsed ? item.name : undefined}
                                        className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 ${sidebarCollapsed
                                                ? `w-10 h-10 justify-center ${isActive ? 'bg-[#7EB0AB]/15 text-[#7EB0AB]' : `${isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-slate-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}`
                                                : `px-3 py-2.5 ${isActive ? 'bg-[#7EB0AB] text-white shadow-sm' : `${isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-slate-100' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}`
                                            }`}
                                    >
                                        <Icon size={sidebarCollapsed ? 20 : 18} className="flex-shrink-0" />
                                        {!sidebarCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {/* Bottom Profile */}
                <div className={`pb-5 transition-all duration-300 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
                    {sidebarCollapsed ? (
                        <div className="flex flex-col items-center gap-2">
                            {adminUser?.profile_image_url ? (
                                <Image src={adminUser.profile_image_url} alt={adminUser.name} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7EB0AB]/25 text-xs font-bold text-[#2f5f5a]">
                                    {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                                </div>
                            )}
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className={`rounded-md p-2 ${isDarkMode ? 'text-slate-300 hover:bg-red-900/20 hover:text-red-300' : 'text-gray-500 hover:bg-red-50 hover:text-red-600'}`}
                                title="Sign Out"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="relative" ref={profileMenuRef}>
                            {showProfileMenu && (
                                <div className={`mb-3 rounded-2xl border shadow-xl ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                                    <div className="flex items-center gap-3 p-4">
                                        {adminUser?.profile_image_url ? (
                                            <Image src={adminUser.profile_image_url} alt={adminUser.name || 'Admin'} width={52} height={52} className="h-13 w-13 rounded-full object-cover" />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7EB0AB]/25 text-sm font-bold text-[#2f5f5a]">
                                                {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className={`truncate text-base font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{adminUser?.name || 'Admin'}</p>
                                            <p className={`truncate text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Chief Systems Administrator</p>
                                        </div>
                                    </div>

                                    <div className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} py-1`}>
                                        <button
                                            onClick={() => { setShowProfileMenu(false); router.push('/admin/settings#profile'); }}
                                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-base font-medium ${isDarkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}
                                        >
                                            <UserCircle2 size={18} />
                                            View Profile
                                        </button>
                                        <button
                                            onClick={() => { setShowProfileMenu(false); router.push('/admin/settings#account'); }}
                                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-base font-medium ${isDarkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}
                                        >
                                            <Settings size={18} />
                                            Account Settings
                                        </button>
                                        <div className={`flex items-center justify-between px-4 py-2.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                            <span className="flex items-center gap-3 text-base font-medium">
                                                <Moon size={18} />
                                                Dark Mode
                                            </span>
                                            <button
                                                onClick={() => setIsDarkMode((value) => !value)}
                                                className={`h-6 w-11 rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-[#7EB0AB]' : 'bg-slate-300'}`}
                                            >
                                                <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} p-3`}>
                                        <button
                                            onClick={() => { setShowProfileMenu(false); setShowLogoutModal(true); }}
                                            className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-base font-semibold ${isDarkMode ? 'border-red-900/40 bg-red-900/20 text-red-300' : 'border-red-100 bg-red-50 text-red-600'}`}
                                        >
                                            <LogOut size={18} />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setShowProfileMenu((value) => !value)}
                                className={`w-full rounded-xl border px-3 py-2.5 shadow-sm ${isDarkMode ? 'border-slate-700 bg-slate-900 hover:bg-slate-800' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-2.5">
                                    {adminUser?.profile_image_url ? (
                                        <Image src={adminUser.profile_image_url} alt={adminUser.name || 'Admin'} width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                                    ) : (
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7EB0AB]/25 text-xs font-bold text-[#2f5f5a]">
                                            {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1 text-left">
                                        <p className={`truncate text-base font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{adminUser?.name || 'Admin'}</p>
                                        <p className={`truncate text-[12px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Chief Systems Administrator</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* ─── Main Content Area ─── */}
            <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out" style={{ marginLeft: sidebarWidth }}>
                {/* Top Header Bar */}
                <header className={`sticky top-0 z-20 border-b px-8 py-4 flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <div>
                        <h1 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>{currentPage.title}</h1>
                        <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{currentPage.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className={`pl-9 pr-4 py-2 w-56 rounded-lg border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3CD894]/40 focus:border-[#3CD894] transition-all duration-200 ${isDarkMode ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-gray-200 bg-gray-50 text-gray-900'}`}
                            />
                        </div>

                        {/* Notification Bell */}
                        <button className={`relative p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100'}`}>
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#3CD894] rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                isLoading={logoutLoading}
            />
        </div>
    );
}
