"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";

interface UserSidebarProps {
    unreadCount?: number;
}

const NAV_ITEMS = [
    {
        label: "Jobs",
        href: "/user/dashboard",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 3H8l-2 4h12l-2-4z" />
            </svg>
        ),
    },
    {
        label: "Saved Jobs",
        href: "/user/saved-jobs",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
        ),
    },
    {
        label: "Messages",
        href: "/user/messages",
        badge: true,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
        ),
    },
    {
        label: "Apply History",
        href: "/user/apply-history",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        ),
    },
    {
        label: "Job History",
        href: "/user/job-history",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
    },
];

const BOTTOM_ITEMS = [
    {
        label: "Profile",
        href: "/user/profile",
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
    {
        label: "Settings",
        href: "/user/settings",
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
        ),
    },
];

export default function UserSidebar({ unreadCount = 0 }: UserSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth({ redirect: false });

    const userName = user?.name || "User";
    const userInitials = userName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "U";
    const profileImageUrl = user?.profile_image_url || null;

    const isActive = (href: string) => {
        if (href === "/user/dashboard") return pathname === "/user/dashboard" || pathname === "/user";
        return pathname.startsWith(href);
    };

    const handleSignOut = () => {
        localStorage.removeItem("token");
        router.push("/signin");
    };

    return (
        <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-[#e5e7eb] flex flex-col z-40 shadow-sm">
            {/* Logo */}
            <div className="px-5 pt-6 pb-5 border-b border-[#f0f2f5]">
                <Link href="/user/dashboard">
                    <Image
                        src="/AVAA Banner Borderless 1.png"
                        alt="AVAA"
                        width={110}
                        height={35}
                        className="object-contain"
                    />
                </Link>
            </div>

            {/* Navigation label */}
            <div className="px-5 pt-5 pb-2">
                <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">Navigation</span>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all group ${
                                active
                                    ? "bg-[#e6f7f2] text-[#1e3a4f]"
                                    : "text-[#5a6a75] hover:bg-[#f5f7fa] hover:text-[#1a1a1a]"
                            }`}
                        >
                            <span className={`flex-shrink-0 transition-colors ${active ? "text-[#7EB0AB]" : "text-[#9ca3af] group-hover:text-[#5a6a75]"}`}>
                                {item.icon}
                            </span>
                            {item.label}
                            {/* Unread badge for Messages */}
                            {item.badge && unreadCount > 0 && (
                                <span className="ml-auto min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                            {/* Active dot (only when no badge) */}
                            {active && !(item.badge && unreadCount > 0) && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7EB0AB]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Divider */}
            <div className="mx-5 border-t border-[#f0f2f5]" />

            {/* Account Items */}
            <div className="px-3 pt-3 pb-3 space-y-0.5">
                <div className="px-3 pb-2">
                    <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">Account</span>
                </div>
                {BOTTOM_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all group ${
                                active
                                    ? "bg-[#e6f7f2] text-[#1e3a4f]"
                                    : "text-[#5a6a75] hover:bg-[#f5f7fa] hover:text-[#1a1a1a]"
                            }`}
                        >
                            <span className={`flex-shrink-0 transition-colors ${active ? "text-[#7EB0AB]" : "text-[#9ca3af] group-hover:text-[#5a6a75]"}`}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    );
                })}
            </div>

            {/* User Card + Sign Out */}
            <div className="px-3 pb-5 pt-2 border-t border-[#f0f2f5]">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#f8fafc] border border-[#e5e7eb]">
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[#7EB0AB] font-bold text-sm bg-[#e6f7f2] border border-[#7EB0AB]/30 flex-shrink-0"
                        style={profileImageUrl ? { backgroundImage: `url(${profileImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                    >
                        {!profileImageUrl && userInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-[#1a1a1a] truncate">{userName}</p>
                        <p className="text-[11px] text-[#9ca3af] truncate">{user?.email || ""}</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        title="Sign Out"
                        className="p-1.5 rounded-lg text-[#9ca3af] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
}