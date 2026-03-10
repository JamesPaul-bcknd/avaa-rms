'use client';
import { useState } from 'react';
import {
  LayoutGrid,
  Users,
  Briefcase,
  UserPlus,
  MessageSquare,
  LogOut,
  Menu,
  X,
  PanelLeftClose
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

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
    { name: 'Manage Jobs', icon: Briefcase, view: 'jobs' as const },
    { name: 'Interview', icon: UserPlus, view: 'interviews' as const },
    { name: 'Messages', icon: MessageSquare, view: 'messages' as const },
  ];

  const handleNav = (view: "list" | "details" | "interviews" | "jobs" | "users" | "messages") => {
    setView(view);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 text-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 5L35 30H5L20 5Z" fill="#7EB0AB" opacity="0.8" />
            <path d="M20 15L28 28H12L20 15Z" fill="#2d4e56" />
          </svg>
          <span className="font-bold text-xl tracking-tight text-[#2d4e56]">AVAA</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1 text-slate-500 hover:text-slate-800">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Mobile drawer ── */}
      <div className={`lg:hidden fixed top-0 left-0 z-40 h-full w-64 bg-white text-slate-500 flex flex-col pt-16 transform transition-transform duration-300 shadow-2xl ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="flex-1 space-y-1.5 px-4 mt-6">
          {menuItems.map((item) => {
            const isActive = currentView === item.view || (item.view === 'list' && currentView === 'details');
            return (
              <div
                key={item.name}
                onClick={() => handleNav(item.view)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl cursor-pointer transition-colors ${isActive
                    ? 'bg-[#7EB0AB] text-white font-semibold shadow-sm'
                    : 'hover:bg-slate-50 hover:text-slate-800 font-medium text-slate-500'
                  }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[14px]">{item.name}</span>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div
            className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl cursor-pointer text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors font-medium"
            onClick={() => logout('/')}
          >
            <LogOut size={20} />
            <span className="text-[14px]">Sign Out</span>
          </div>
        </div>
      </div>

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex w-[260px] shrink-0 h-screen bg-white flex-col sticky top-0 border-r border-slate-200 z-30">

        {/* Logo Section */}
        <div className="flex items-center justify-between px-6 py-7 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('list')}>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M20 5L35 30H5L20 5Z" fill="#7EB0AB" opacity="0.9" />
              <path d="M20 15L28 28H12L20 15Z" fill="#2d4e56" />
            </svg>
            <div className="flex flex-col pt-1">
              <span className="text-[22px] font-black text-[#2d4e56] leading-none tracking-tight">AVAA</span>
              <span className="text-[6px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">AutoPilot Virtual Assistant</span>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <PanelLeftClose size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = currentView === item.view || (item.view === 'list' && currentView === 'details');
            return (
              <div
                key={item.name}
                onClick={() => handleNav(item.view)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-[14px] cursor-pointer transition-all duration-200 ${isActive
                    ? 'bg-[#7EB0AB] text-white font-semibold shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
                  }`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "text-slate-400"} />
                <span className="text-[14px]">{item.name}</span>
              </div>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-slate-100 mt-auto">
          <div
            className="flex items-center gap-3.5 px-4 py-3 rounded-[14px] cursor-pointer text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors font-medium"
            onClick={() => logout('/')}
          >
            <LogOut size={18} className="text-slate-400" />
            <span className="text-[14px]">Sign Out</span>
          </div>
        </div>

      </div>
    </>
  );
};

export default Sidebar;