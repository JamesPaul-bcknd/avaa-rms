'use client';
import { useState } from 'react';
import {
  LayoutGrid, // Using LayoutGrid for the 4-squares dashboard icon in the screenshot
  Users,
  BriefcaseBusiness, // Using BriefcaseBusiness for the specific briefcase in the screenshot
  UserRoundSearch, // Using this for the Interview/User search icon in the screenshot
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

// Allowed views based on your main layout
interface SidebarProps {
  setView: (view: "list" | "details" | "interviews" | "jobs" | "users" | "messages") => void;
  currentView: "list" | "details" | "interviews" | "jobs" | "users" | "messages";
}

const Sidebar = ({ setView, currentView }: SidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutGrid, view: 'list' as const },
    { name: 'Users', icon: Users, view: 'users' as const },
    { name: 'Manage Jobs', icon: BriefcaseBusiness, view: 'jobs' as const },
    { name: 'Interviews', icon: UserRoundSearch, view: 'interviews' as const },
  ];

  const handleNav = (view: "list" | "details" | "interviews" | "jobs" | "users" | "messages") => {
    setView(view);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#1e2632] text-white">
        <div className="flex items-center gap-3 font-semibold text-lg">
          {/* Logo (Matches Screenshot) */}
          <div className="flex items-center justify-center w-8 h-8 bg-[#53968b]/20 rounded">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-b-[14px] border-b-[#53968b] border-r-[8px] border-r-transparent relative top-[-2px]"></div>
          </div>
          Recruiter
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1 text-gray-400 hover:text-white">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Mobile drawer ── */}
      <div className={`lg:hidden fixed top-0 left-0 z-40 h-full w-64 bg-[#1f2937] text-gray-400 flex flex-col p-6 pt-16 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="flex-1 space-y-1.5 mt-4">
          {menuItems.map((item) => {
            const isActive = currentView === item.view || (item.view === 'list' && currentView === 'details');
            return (
              <div
                key={item.name}
                onClick={() => handleNav(item.view)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl cursor-pointer transition-colors ${isActive ? 'bg-[#2a3441] text-[#53968b] font-semibold' : 'hover:bg-white/5 hover:text-gray-200 font-medium'
                  }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[15px]">{item.name}</span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex w-[260px] shrink-0 h-screen bg-[#1f2937] text-[#94a3b8] flex-col p-5 sticky top-0 border-r border-[#1f2937]">

        {/* Logo Section */}
        <div className="flex items-center gap-3 px-3 py-6 mb-6 text-white font-bold text-xl tracking-wide cursor-pointer" onClick={() => handleNav('list')}>
          {/* SVG Logo matching your screenshots */}
          <div className="flex items-center justify-center w-9 h-9 bg-[#53968b]/10 rounded-lg">
            <div className="w-0 h-0 border-l-[9px] border-l-transparent border-b-[16px] border-b-[#53968b] border-r-[9px] border-r-transparent relative top-[-2px]"></div>
          </div>
          Recruiter
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            // Dashboard is active if view is 'list' or 'details'
            const isActive = currentView === item.view || (item.view === 'list' && currentView === 'details');

            return (
              <div
                key={item.name}
                onClick={() => handleNav(item.view)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl cursor-pointer transition-colors ${isActive
                    ? 'bg-[#2a3441] text-[#53968b] font-semibold shadow-sm'
                    : 'text-[#94a3b8] hover:bg-white/5 hover:text-gray-200 font-medium'
                  }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[15px]">{item.name}</span>
              </div>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div
          className="flex items-center gap-3.5 px-4 py-3.5 mt-auto rounded-xl cursor-pointer text-[#94a3b8] hover:bg-white/5 hover:text-white transition-colors font-medium"
          onClick={() => logout('/')}
        >
          <LogOut size={20} />
          <span className="text-[15px]">Sign Out</span>
        </div>

      </div>
    </>
  );
};

export default Sidebar;