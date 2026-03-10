"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface UserTabNavProps {
    unreadCount?: number;
}

const TAB_ITEMS = [
    {
        label: "Jobs",
        href: "/user/dashboard",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 3H8l-2 4h12l-2-4z" />
            </svg>
        ),
    },
    {
        label: "Saved Jobs",
        href: "/user/saved-jobs",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
        ),
    },
    {
        label: "Messages",
        href: "/user/messages",
        badge: true,
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
        ),
    },
    {
        label: "Apply History",
        href: "/user/apply-history",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
    },
];

export default function UserTabNav({ unreadCount = 0 }: UserTabNavProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/user/dashboard") return pathname === "/user/dashboard" || pathname === "/user";
        return pathname.startsWith(href);
    };

    return (
        <div className="fixed top-16 left-64 right-0 z-20 bg-white border-b border-[#e5e7eb] px-6 lg:px-10">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {TAB_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex items-center gap-2 px-4 py-3.5 text-[13px] font-semibold whitespace-nowrap transition-all group border-b-2 ${active
                                    ? "text-[#1e3a4f] border-[#7EB0AB]"
                                    : "text-[#5a6a75] border-transparent hover:text-[#1a1a1a] hover:border-[#d1e9e7]"
                                }`}
                        >
                            <span className={`flex-shrink-0 transition-colors ${active ? "text-[#7EB0AB]" : "text-[#9ca3af] group-hover:text-[#5a6a75]"}`}>
                                {item.icon}
                            </span>
                            {item.label}
                            {/* Unread badge for Messages */}
                            {item.badge && unreadCount > 0 && (
                                <span className="ml-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}