"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface HeaderProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  userName: string;
  userEmail: string;
  userInitials: string;
  profileImageUrl?: string | null;
  unreadCount: number;
  setShowLogoutConfirm: (show: boolean) => void;
}

export default function Header({
  isAuthenticated,
  isLoading,
  userName,
  userEmail,
  userInitials,
  profileImageUrl,
  unreadCount,
  setShowLogoutConfirm,
}: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-[#e5e7eb] px-6 lg:px-10">
      <div className="flex items-center justify-between h-20 max-w-[1400px] mx-auto">
        <Link href="/user/dashboard" className="flex items-center">
          <Image
            src="/AVAA Banner Borderless 1.png"
            alt="AVAA Logo"
            width={110}
            height={35}
            className="object-contain"
          />
        </Link>

        <div className="flex items-center gap-3">
          {/* Jobs Tab */}
          <Link
            href="/user/dashboard"
            className={`flex items-center gap-1.5 px-3 lg:px-5 py-2.5 rounded-lg text-[15px] font-semibold transition-all ${
              isActive("/user/dashboard")
                ? "text-white shadow-sm"
                : "text-[#1a1a1a] border border-[#e5e7eb] bg-white hover:bg-[#f9fafb]"
            }`}
            style={isActive("/user/dashboard") ? { background: "#7EB0AB" } : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 3H8l-2 4h12l-2-4z" />
            </svg>
            Jobs
          </Link>

          {/* Saved Jobs Tab */}
          <Link
            href="/user/saved-jobs"
            className={`flex items-center gap-2 px-3 lg:px-5 py-2.5 rounded-lg border text-[15px] font-semibold transition-all ${
              isActive("/user/saved-jobs")
                ? "text-white border-[#7EB0AB] shadow-sm"
                : "text-[#1a1a1a] border-[#e5e7eb] bg-white hover:bg-[#f9fafb]"
            }`}
            style={isActive("/user/saved-jobs") ? { background: "#7EB0AB" } : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
            <span className="hidden sm:inline">Saved Jobs</span>
          </Link>

          {/* Messages Tab */}
          <Link
            href="/user/messages"
            className={`flex items-center gap-2 px-3 lg:px-5 py-2.5 rounded-lg border text-[15px] font-semibold transition-all relative ${
              isActive("/user/messages")
                ? "text-white border-[#7EB0AB] shadow-sm"
                : "text-[#1a1a1a] border-[#e5e7eb] bg-white hover:bg-[#f9fafb]"
            }`}
            style={isActive("/user/messages") ? { background: "#7EB0AB" } : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
              <polyline points="3 7 12 13 21 7" />
            </svg>
            <span className="hidden sm:inline">Messages</span>
            {unreadCount > 0 && (
              <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                isActive("/user/messages") ? "bg-white text-[#7EB0AB]" : "bg-red-500 text-white"
              }`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {isAuthenticated && (
            <>
              <div className="relative mx-1">
                <button className="p-2 text-[#5a6a75] hover:text-[#1a1a1a] hover:bg-[#f0f2f5] rounded-full transition-colors relative">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <div className="absolute top-2 right-2.5 w-[7px] h-[7px] bg-red-500 rounded-full border-2 border-white"></div>
                </button>
              </div>

              <div className="w-px h-6 bg-[#e5e7eb] mx-1"></div>

              <div className="relative mx-1" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] hover:border-[#7EB0AB] transition-all ml-1 bg-[#e6f7f2] font-bold text-[#7EB0AB]"
                  style={profileImageUrl ? { backgroundImage: `url(${profileImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                >
                  {!profileImageUrl && userInitials}
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-[#e5e7eb] overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-[#e5e7eb] flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center border border-[#7EB0AB] bg-[#e6f7f2] text-[#7EB0AB] font-bold text-lg"
                        style={profileImageUrl ? { backgroundImage: `url(${profileImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                      >
                        {!profileImageUrl && userInitials}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[14px] font-bold text-[#1a1a1a] truncate">{userName}</span>
                        <span className="text-[12px] font-medium text-[#5a6a75] truncate">{userEmail}</span>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link href="/user/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors group">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5a6a75] group-hover:text-[#7EB0AB]">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                        Account
                      </Link>
                      <button className="w-full flex items-center justify-between px-4 py-2.5 text-[14px] font-semibold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors group text-left">
                        <div className="flex items-center gap-3">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5a6a75] group-hover:text-[#7EB0AB]">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                          </svg>
                          Dark Mode
                        </div>
                      </button>
                      <Link href="/user/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors group border-b border-[#f0f2f5]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5a6a75] group-hover:text-[#7EB0AB]">
                          <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                        </svg>
                        Settings
                      </Link>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            setShowLogoutConfirm(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-bold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors group"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#5a6a75] group-hover:text-[#7EB0AB]">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {!isAuthenticated && !isLoading && (
            <Link
              href="/signin"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "#7EB0AB" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}