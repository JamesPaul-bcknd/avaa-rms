'use client';
import Image from "next/image";
import { Search, MessageSquare, Bell, User, Settings, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';

// 1. Define an interface for the Header props
interface HeaderProps {
  title?: string; // Optional, defaults to "Job Applicants" if not provided
  jobCount?: number; // Optional job count to display
}

// 2. Update the Header to accept the props
const Header = ({ title = "Job Applicants", jobCount }: HeaderProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  const userName = user?.name || 'HR User';
  const userInitials = userName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'HR';

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

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    router.push('/hr/dashboard/profile');
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        {/* Use the title prop here */}
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {jobCount !== undefined && (
          <p className="text-sm text-gray-500 font-medium">{jobCount} total {jobCount === 1 ? 'job' : 'jobs'}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search jobs..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg w-full sm:w-56 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="relative p-2 text-slate-600 cursor-pointer">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer hover:border-teal-500 transition-colors"
          >
            {user?.profile_image_url ? (
              <Image
                src={user.profile_image_url}
                alt={userName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-teal-500 flex items-center justify-center text-white font-bold">
                {userInitials}
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
              {/* User Info Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-teal-500 flex items-center justify-center text-white font-bold shrink-0">
                  {user?.profile_image_url ? (
                    <Image
                      src={user.profile_image_url}
                      alt={userName}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userInitials
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'hr@example.com'}</p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={16} className="text-gray-400" />
                  View Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Settings size={16} className="text-gray-400" />
                  Settings
                </button>
                <div className="border-t border-gray-100 my-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
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