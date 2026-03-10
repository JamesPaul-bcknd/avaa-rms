'use client';

import {
  Bell,
  Settings,
  LogOut
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title?: string;
  jobCount?: number;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
}

const Header = ({ title = "Dashboard", jobCount, onSettingsClick, onNotificationsClick }: HeaderProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  const router = useRouter();

  const userName = user?.name || 'Catherine';
  const userInitials = userName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'C';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout('/signin');
  };

  const handleSettingsClick = () => {
    setShowProfileMenu(false);
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      router.push('/hr-dashboard/profile');
    }
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between px-6 lg:px-10 py-5 bg-white border-b border-slate-100 gap-4 sticky top-0 z-20">

      {/* Left Side: Title & Subtitle */}
      <div>
        <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">{title}</h1>
        {title === "Dashboard" ? (
          <p className="text-[13px] text-slate-500 mt-0.5">Welcome back Admin, here's what's happening today.</p>
        ) : jobCount !== undefined ? (
          <p className="text-[13px] text-slate-500 font-medium mt-0.5">{jobCount} total {jobCount === 1 ? 'job' : 'jobs'}</p>
        ) : null}
      </div>

      {/* Right Side: Bell + Profile */}
      <div className="flex items-center gap-4">

        {/* Notification Bell */}
        <button
          onClick={onNotificationsClick}
          className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full focus:outline-none transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#53968b]/30 transition-all shadow-sm"
          >
            <div className="w-full h-full bg-[#53968b] flex items-center justify-center text-white text-[15px] font-bold">
              {userInitials}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#53968b] flex items-center justify-center text-white text-[15px] font-bold shrink-0 shadow-sm">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
                  <p className="text-xs font-medium text-slate-400 truncate">{user?.email || 'bauncatherine56@gmail.com'}</p>
                </div>
              </div>

              <div className="py-2">
                <button
                  onClick={handleSettingsClick}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-[#53968b] transition-colors"
                >
                  <Settings size={16} className="text-slate-400" />
                  Account Settings
                </button>

                <div className="border-t border-slate-50 my-1 mx-4"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} className="text-red-400" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;