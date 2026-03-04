'use client';
import Link from 'next/link';
import Image from "next/image";
import { Search, MessageSquare, Bell } from 'lucide-react';

// 1. Define an interface for the Header props
interface HeaderProps {
  title?: string; // Optional, defaults to "Job Applicants" if not provided
}

// 2. Update the Header to accept the props
const Header = ({ title = "Job Applicants" }: HeaderProps) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        {/* Use the title prop here */}
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="text-sm text-gray-500 font-medium">6 total jobs</p>
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

        <Link
          href="/user/messages"
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-slate-700 font-medium hover:bg-gray-50 whitespace-nowrap"
        >
          <MessageSquare size={18} />
          <span className="hidden sm:inline">Messages</span>
        </Link>

        <div className="relative p-2 text-slate-600 cursor-pointer">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </div>

        <Image
          src="https://avatar.iran.liara.run/public/boy"
          width={40}
          height={40}
          className="rounded-full border border-gray-200"
          alt="Profile"
        />
      </div>
    </header>
  );
};

export default Header;