"use client";

import React from 'react';
import { X, FileText, Eye, MessageCircle } from 'lucide-react';

interface ViewApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: any;
  onMessageClick?: () => void;
}

export default function ViewApplicantModal({ isOpen, onClose, applicant, onMessageClick }: ViewApplicantModalProps) {
  if (!isOpen || !applicant) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Cover */}
        <div className="h-32 bg-[#6ebea3] rounded-t-2xl relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-8">
          {/* Profile Picture & Name */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-14 mb-8 relative z-10">
            <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-white shrink-0 shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&q=80" 
                alt="Applicant Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex items-center gap-3 pb-2">
              <h2 className="text-2xl font-bold text-slate-800">{applicant.name}</h2>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
            </div>
          </div>

          {/* Section 1: Personal Information */}
          <div className="border border-slate-100 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">1</div>
              <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10">
              <div><p className="text-xs text-slate-400 mb-1">Full Name</p><p className="font-semibold text-slate-800 text-sm">{applicant.name}</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Email</p><p className="font-semibold text-slate-800 text-sm">{applicant.email}</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Phone Number</p><p className="font-semibold text-slate-800 text-sm">+1 (555) 234-5678</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Location</p><p className="font-semibold text-slate-800 text-sm">San Francisco, CA</p></div>
            </div>
          </div>

          {/* Section 2: Professional Experience */}
          <div className="border border-slate-100 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">2</div>
              <h3 className="text-lg font-bold text-slate-800">Professional Experience</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10 mb-6">
              <div><p className="text-xs text-slate-400 mb-1">Current Job Title</p><p className="font-semibold text-slate-800 text-sm">{applicant.role}</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Years of Experience</p><p className="font-semibold text-slate-800 text-sm">6 years</p></div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2">Why are you a good fit?</p>
              <p className="text-sm text-slate-800 font-medium leading-relaxed">I'm a good fit because I'm organized, detail-oriented, and proactive.</p>
            </div>
          </div>

          {/* Section 3: Resume */}
          <div className="border border-slate-100 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">3</div>
              <h3 className="text-lg font-bold text-slate-800">Resume</h3>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded border border-slate-200 text-slate-400"><FileText size={20} /></div>
                <div><p className="text-sm font-semibold text-slate-800">{applicant.cv}</p><p className="text-xs text-slate-400">2.4 MB</p></div>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-700 transition-colors"><Eye size={20} /></button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onMessageClick}
              className="px-6 py-2.5 rounded-lg bg-[#53968b] hover:bg-[#437d73] text-white text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <MessageCircle size={16} />
              Message
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}