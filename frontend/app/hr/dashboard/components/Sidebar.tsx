"use client";
import { useState } from 'react';
import { LayoutDashboard, Users, Briefcase, Calendar, LogOut, Menu, X } from 'lucide-react';

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true },
    { name: 'Users', icon: Users },
    { name: 'Manage Jobs', icon: Briefcase },
    { name: 'Jobs', icon: Briefcase },
    { name: 'Interviews', icon: Calendar },
  ];

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#1e2632] text-white">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="w-7 h-7 bg-teal-500 rounded-md flex items-center justify-center text-sm">▲</div>
          HR Panel
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1 text-gray-400 hover:text-white">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div className={`lg:hidden fixed top-0 left-0 z-40 h-full w-64 bg-[#1e2632] text-gray-400 flex flex-col p-6 pt-16 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="flex-1 space-y-2 mt-4">
          {menuItems.map((item) => (
            <div
              key={item.name}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${item.active ? 'bg-slate-800 text-green-400' : 'hover:bg-slate-800 hover:text-white'
                }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:text-white mt-auto">
          <LogOut size={20} />
          <span>Sign Out</span>
        </div>
      </div>

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex w-64 shrink-0 h-screen bg-[#1e2632] text-gray-400 flex-col p-6 sticky top-0">
        <div className="flex items-center gap-2 mb-12 text-white font-bold text-xl">
          <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">▲</div>
          HR Panel
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <div
              key={item.name}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${item.active ? 'bg-slate-800 text-green-400' : 'hover:bg-slate-800 hover:text-white'
                }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:text-white mt-auto">
          <LogOut size={20} />
          <span>Sign Out</span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;