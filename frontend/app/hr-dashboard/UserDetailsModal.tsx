"use client";

import React from 'react';
import { X, FileText, Eye } from 'lucide-react';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const UserDetailsModal = ({ isOpen, onClose, user }: UserDetailsModalProps) => {
  if (!isOpen || !user) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header Section --- */}
        <div className="relative h-28 sm:h-32 bg-[#6b908c] shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 sm:right-6 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white transition-colors"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
          
          {/* Responsive Profile Header */}
          <div className="absolute -bottom-12 sm:-bottom-10 left-6 sm:left-12 flex items-center sm:items-end gap-3 sm:gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl border-4 border-white shadow-lg overflow-hidden bg-slate-100 shrink-0">
              <img 
                src={`https://i.pravatar.cc/150?u=${user.id}`} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 bg-white sm:bg-white/10 p-2 rounded-xl sm:backdrop-blur-md shadow-sm sm:shadow-none translate-y-2 sm:translate-y-0">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-800 sm:text-slate-800">{user.name}</h2>
              <span className="w-fit px-2 py-0.5 sm:px-3 sm:py-1 bg-emerald-100 text-emerald-600 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                {user.status}
              </span>
            </div>
          </div>
        </div>

        {/* --- Scrollable Content --- */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-16 sm:pt-16 space-y-8 custom-scrollbar">
          
          {/* Section 1: Personal Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] sm:text-xs font-bold text-slate-400 shrink-0">1</span>
              <h3 className="font-bold text-slate-700 text-sm sm:text-base">Personal Information</h3>
            </div>
            {/* grid-cols-1 for mobile, grid-cols-2 for tablet/desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pl-10 sm:pl-11">
              <div>
                <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-300 tracking-wider">Full Name</p>
                <p className="text-sm font-bold text-slate-700">{user.name}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-300 tracking-wider">Email</p>
                <p className="text-sm font-bold text-slate-700 break-all">{user.name.toLowerCase().replace(' ', '.')}@email.com</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-300 tracking-wider">Phone Number</p>
                <p className="text-sm font-bold text-slate-700">+1 (555) 234-5678</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-300 tracking-wider">Location</p>
                <p className="text-sm font-bold text-slate-700">San Francisco, CA</p>
              </div>
            </div>
          </div>

          {/* Section 2: Experience */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] sm:text-xs font-bold text-slate-400 shrink-0">2</span>
              <h3 className="font-bold text-slate-700 text-sm sm:text-base">Professional Experience</h3>
            </div>
            <div className="pl-10 sm:pl-11 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-300 tracking-wider">Current Job Title</p>
                  <p className="text-sm font-bold text-slate-700">{user.role}</p>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-300 tracking-wider">Company</p>
                  <p className="text-sm font-bold text-slate-700">CloudScale</p>
                </div>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-300 tracking-wider mb-2">Skills & Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {['Technical Writing', 'Notion', 'Project Coordination', 'CRM'].map(skill => (
                    <span key={skill} className="px-2.5 py-1.5 bg-slate-50 text-slate-500 border border-slate-100 rounded-lg text-[10px] sm:text-[11px] font-bold italic">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Resume */}
          <div className="space-y-4 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] sm:text-xs font-bold text-slate-400 shrink-0">3</span>
              <h3 className="font-bold text-slate-700 text-sm sm:text-base">Resume</h3>
            </div>
            <div className="pl-10 sm:pl-11">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400 shrink-0">
                    <FileText size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs font-bold text-slate-700 truncate">{user.name.replace(' ', '_')}_Resume.pdf</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium">2.4 MB</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                  <Eye size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Footer Action --- */}
        <div className="p-4 sm:p-6 border-t border-slate-50 flex justify-end shrink-0 bg-white sm:rounded-b-[32px]">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;