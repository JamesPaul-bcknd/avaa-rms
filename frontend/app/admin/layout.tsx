'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Settings,
    LogOut,
    Loader2,
    Search,
    Bell,
    CircleUser,
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
    const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
                    setAdminUser({ name: res.data.name || 'Admin', email: res.data.email || '' });
                    setAuthChecked(true);
                }
            })
            .catch(() => {
                localStorage.removeItem('token');
                router.replace('/signin');
            });
    }, [isLoginPage, router]);

    // Close profile menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
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

    const currentPage = pageTitles[pathname] || { title: 'Admin', subtitle: '' };

    return (
        <div className="flex min-h-screen bg-[#f5f7fa]">
            {/* ─── Sidebar ─── */}
            <aside
                className="fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col z-30 transition-all duration-300 ease-in-out overflow-hidden"
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
                        <span className="text-lg font-bold text-gray-900 tracking-tight whitespace-nowrap">AVAA</span>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed((v) => !v)}
                        className={`p-1.5 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors flex-shrink-0 ${sidebarCollapsed ? '' : 'ml-auto'}`}
                        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {sidebarCollapsed ? <PanelLeftOpen size={16} className="text-gray-400" /> : <PanelLeftClose size={16} className="text-gray-400" />}
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
                                            ? `w-10 h-10 justify-center ${isActive ? 'bg-[#7EB0AB]/15 text-[#7EB0AB]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`
                                            : `px-3 py-2.5 ${isActive ? 'bg-[#7EB0AB] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
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
                        <p className={`font-semibold text-gray-400 uppercase tracking-wider ${sidebarCollapsed ? 'text-[9px] mb-2' : 'text-[11px] px-3 mb-2'}`}>System</p>
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
                                                ? `w-10 h-10 justify-center ${isActive ? 'bg-[#7EB0AB]/15 text-[#7EB0AB]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`
                                                : `px-3 py-2.5 ${isActive ? 'bg-[#7EB0AB] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
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

                {/* Sign Out */}
                <div className={`pb-5 transition-all duration-300 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        title={sidebarCollapsed ? 'Sign Out' : undefined}
                        className={`flex items-center gap-3 py-2.5 rounded-lg w-full text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${sidebarCollapsed ? 'justify-center px-0' : 'px-3'}`}
                    >
                        <LogOut size={18} className="flex-shrink-0" />
                        {!sidebarCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* ─── Main Content Area ─── */}
            <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out" style={{ marginLeft: sidebarWidth }}>
                {/* Top Header Bar */}
                <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{currentPage.title}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{currentPage.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 w-56 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3CD894]/40 focus:border-[#3CD894] transition-all duration-200"
                            />
                        </div>

                        {/* Notification Bell */}
                        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#3CD894] rounded-full"></span>
                        </button>

                        {/* Avatar + Profile Menu */}
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setShowProfileMenu((v) => !v)}
                                className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden cursor-pointer ring-2 ring-gray-100 focus:outline-none focus:ring-[#3CD894]/40"
                            >
                                <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">
                                        {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                                    </span>
                                </div>
                            </button>

                            {/* Profile Popout */}
                            {showProfileMenu && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* User Info */}
                                    <div className="p-5 flex items-center gap-3">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center flex-shrink-0 ring-2 ring-gray-100">
                                            <span className="text-white text-xl font-bold">
                                                {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{adminUser?.name || 'Admin'}</p>
                                            <p className="text-xs text-gray-500 truncate">{adminUser?.email || ''}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-semibold rounded-full">Admin</span>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="border-t border-gray-100">
                                        <a
                                            href="/admin/settings"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <CircleUser size={18} className="text-gray-400" />
                                            Account
                                        </a>
                                        <a
                                            href="/admin/settings"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Settings size={18} className="text-gray-400" />
                                            Settings
                                        </a>
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-gray-100">
                                        <button
                                            onClick={() => { setShowProfileMenu(false); setShowLogoutModal(true); }}
                                            className="flex items-center gap-3 px-5 py-3 w-full text-sm text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut size={18} />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
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
