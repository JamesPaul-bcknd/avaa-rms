'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Briefcase, Calendar, LogOut, Menu, X, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

type SidebarView = "list" | "details" | "interviews" | "jobs" | "users" | "profile";

interface SidebarProps {
  setView?: (view: SidebarView) => void;
  currentView?: SidebarView;
}

const Sidebar = ({ setView, currentView }: SidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, view: 'list' as const },
    { name: 'Users', icon: Users, view: 'users' as const },
    { name: 'Manage Jobs', icon: Briefcase, view: 'jobs' as const },
    { name: 'Interview', icon: Calendar, view: 'interviews' as const },
  ];

  const handleNav = (view: SidebarView) => {
    if (setView) {
      setView(view);
    } else {
      const qs =
        view === "list" ? "" : `?view=${encodeURIComponent(String(view))}`;
      router.push(`/hr-dashboard${qs}`);
    }
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <img src="/icon.png" alt="AVAA" className="h-8" />
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-500">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          {/* Logo Area - Removed background container and invert class */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <img src="/icon.png" alt="Logo" className="w-10 h-10 object-contain" />
              <span className="font-bold text-2xl tracking-tight text-slate-800">AVAA</span>
            </div>
            <button className="hidden lg:block text-gray-400 hover:text-slate-600">
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const active = currentView ?? "list";
              const isActive = active === item.view || (item.view === 'list' && active === 'details');
              return (
                <button
                  key={item.name}
                  onClick={() => handleNav(item.view)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                    ? 'bg-[#84b3af] text-white shadow-md shadow-teal-100' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-slate-700'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-slate-600'} />
                  <span className="font-medium text-sm">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="pt-6 border-t border-gray-50">
            <button 
              onClick={() => logout('/')}
              className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;