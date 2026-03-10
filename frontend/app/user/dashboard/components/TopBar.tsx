"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface TopBarProps {
    isAuthenticated: boolean;
    isLoading: boolean;
    userName: string;
    userEmail: string;
    userInitials: string;
    profileImageUrl: string | null;
    onSignOutClick: () => void;
}

export default function TopBar({
    isAuthenticated,
    isLoading,
    userName,
    userEmail,
    userInitials,
    profileImageUrl,
    onSignOutClick,
}: TopBarProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 left-64 right-0 z-30 bg-white border-b border-[#e5e7eb] px-6 lg:px-10">
            <div className="flex items-center justify-end h-16">
                {isAuthenticated && (
                    <div className="flex items-center gap-2">
                        {/* Notification bell */}
                        <button className="p-2 text-[#5a6a75] hover:text-[#1a1a1a] hover:bg-[#f0f2f5] rounded-full transition-colors relative">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <div className="absolute top-2 right-2 w-[6px] h-[6px] bg-red-500 rounded-full border border-white" />
                        </button>

                        <div className="w-px h-5 bg-[#e5e7eb] mx-1" />

                        {/* Profile dropdown */}
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="w-9 h-9 rounded-full flex items-center justify-center border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] hover:border-[#7EB0AB] transition-all bg-[#e6f7f2] font-bold text-[#7EB0AB] text-sm"
                                style={profileImageUrl ? { backgroundImage: `url(${profileImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                            >
                                {!profileImageUrl && userInitials}
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-[#e5e7eb] overflow-hidden z-50">
                                    {/* User header */}
                                    <div className="p-4 border-b border-[#e5e7eb] flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center border border-[#7EB0AB] bg-[#e6f7f2] text-[#7EB0AB] font-bold"
                                            style={profileImageUrl ? { backgroundImage: `url(${profileImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                                        >
                                            {!profileImageUrl && userInitials}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[13px] font-bold text-[#1a1a1a] truncate">{userName}</span>
                                            <span className="text-[11px] text-[#5a6a75] truncate">{userEmail}</span>
                                        </div>
                                    </div>

                                    <div className="py-1.5">
                                        <Link
                                            href="/user/profile"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            Account
                                        </Link>
                                        <Link
                                            href="/user/settings"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors border-b border-[#f0f2f5]"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="3" />
                                                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                                            </svg>
                                            Settings
                                        </Link>
                                        <div className="p-2">
                                            <button
                                                onClick={() => { setShowProfileMenu(false); onSignOutClick(); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-[#1a1a1a] hover:bg-red-50 hover:text-red-500 transition-colors"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                                    <polyline points="16 17 21 12 16 7" />
                                                    <line x1="21" y1="12" x2="9" y2="12" />
                                                </svg>
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!isAuthenticated && !isLoading && (
                    <Link
                        href="/signin"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: "#7EB0AB" }}
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
}