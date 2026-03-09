'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, MessageSquare, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  // Added jobCount to fix the TypeScript error in page.tsx
  jobCount?: number; 
  onNavigateProfile?: () => void;
}

const Header = ({ 
  title = "Dashboard", 
  subtitle, // Removed default here to handle it dynamically
  jobCount = 0,
  onNavigateProfile 
}: HeaderProps) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dynamic subtitle logic based on jobCount
  const displaySubtitle = subtitle || (jobCount > 0 
    ? `Welcome back Recruiter, you have ${jobCount} active jobs today.`
    : "Welcome back Recruiter, here's what's happening today.");

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
        <p className="text-sm text-gray-400 mt-1">{displaySubtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#60a39d] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search jobs..."
            className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl w-full md:w-64 focus:ring-2 focus:ring-[#84b3af]/20 transition-all outline-none text-sm"
          />
        </div>

        {/* Action Icons */}
        <button className="relative p-2.5 bg-white border border-gray-100 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-2">
          <MessageSquare size={20} />
          <span className="text-sm font-semibold pr-1">Messages</span>
        </button>

        <button className="relative p-2.5 bg-white border border-gray-100 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile with Dropdown */}
        <div className="relative" ref={menuRef}>
          <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-[#84b3af]/30 transition-all"
          >
            <img 
              src={user?.profile_image_url || `https://ui-avatars.com/api/?name=${user?.full_name || 'Recruiter'}&background=60a39d&color=fff`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white rounded-[22px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-[200] animate-in fade-in zoom-in duration-150">
              
              {/* User Info Section */}
              <div className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 border border-slate-100">
                  <img 
                    src={user?.profile_image_url || `https://ui-avatars.com/api/?name=${user?.full_name || 'Recruiter'}&background=60a39d&color=fff`} 
                    alt="Menu Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-[15px] font-bold text-slate-800 truncate leading-tight">
                    {user?.full_name || "Guest User"}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {user?.email || "No email provided"}
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-slate-100 mx-2" />

              {/* Menu Actions */}
              <div className="p-2">
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    onNavigateProfile?.();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors group"
                >
                  <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                    <User size={18} className="text-slate-500" />
                  </div>
                  <span className="text-sm font-semibold">Account Profile</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors group">
                  <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                    <Settings size={18} className="text-slate-500" />
                  </div>
                  <span className="text-sm font-semibold">Settings</span>
                </button>

                {/* Sign Out */}
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout?.();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors group mt-1"
                >
                  <div className="p-1.5 bg-red-50 rounded-lg group-hover:bg-white transition-colors">
                    <LogOut size={18} className="text-red-500" />
                  </div>
                  <span className="text-sm font-semibold">Sign Out</span>
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