"use client";

import React from 'react';
import Image from 'next/image';
import { X, FileText, Eye, MessageCircle } from 'lucide-react';
import { HrUser } from '@/lib/hrProfiles';
import { useRouter } from 'next/navigation';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: HrUser | null;
}

const UserDetailsModal = ({ isOpen, onClose, user }: UserDetailsModalProps) => {
  const router = useRouter();

  if (!isOpen || !user) return null;

  const handleMessageUser = () => {
    onClose();
    router.push('/hr-dashboard?view=messages&userId=' + user.id);
  };

  // Fallback skills matching the design if user doesn't have any
  const defaultSkills = ["Executive Support", "Calendar Management", "Project Coordination", "CRM (Salesforce)", "Expense Tracking", "Technical Writing", "Notion & Slack"];
  const displaySkills = user.skills && user.skills.length > 0 ? user.skills : defaultSkills;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-200 custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* --- Header Banner --- */}
        <div className="h-32 bg-gradient-to-r from-[#4c8479] to-[#6ebea3] rounded-t-2xl relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-8">
          
          {/* --- Profile Overlap --- */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-8 relative z-10">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-slate-100 shrink-0 shadow-sm">
              {user.profile_image_url ? (
                <Image 
                  src={user.profile_image_url} 
                  alt={user.name} 
                  width={96} 
                  height={96} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#53968b] flex items-center justify-center text-white font-bold text-2xl">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 pb-1">
              <h2 className="text-[22px] font-bold text-slate-800">{user.name}</h2>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>

          {/* --- Section 1: Personal Information --- */}
          <div className="border border-slate-100 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">1</div>
              <h3 className="text-base font-bold text-slate-800">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10">
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-1 tracking-wide">Full Name</p>
                <p className="font-semibold text-slate-800 text-[14px]">{user.name}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-1 tracking-wide">Email</p>
                <p className="font-semibold text-slate-800 text-[14px] truncate">{user.email}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-1 tracking-wide">Phone Number</p>
                <p className="font-semibold text-slate-800 text-[14px]">{user.phone || '+1 (555) 234-5678'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-1 tracking-wide">Location</p>
                <p className="font-semibold text-slate-800 text-[14px]">{user.location || 'San Francisco, CA'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-1 tracking-wide">Linkedin Url</p>
                <p className="font-semibold text-slate-800 text-[14px]">linkedin.com/{user.name.split(' ')[0].toLowerCase()}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-1 tracking-wide">Portfolio Link</p>
                <p className="font-semibold text-slate-800 text-[14px]">{user.name.replace(' ', '').toLowerCase()}.com</p>
              </div>
            </div>
          </div>

          {/* --- Section 2: Professional Experience --- */}
          <div className="border border-slate-100 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">2</div>
              <h3 className="text-base font-bold text-slate-800">Professional Experience</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10 mb-6">
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-1 tracking-wide">Current Job Title</p>
                <p className="font-semibold text-slate-800 text-[14px]">{user.position || 'Virtual Assistant'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-1 tracking-wide">Company</p>
                <p className="font-semibold text-slate-800 text-[14px]">CloudScale</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-1 tracking-wide">Years of Experience</p>
                <p className="font-semibold text-slate-800 text-[14px]">6 years</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-[11px] text-slate-400 font-medium mb-3 tracking-wide">Skills & Expertise</p>
              <div className="flex flex-wrap gap-2">
                {displaySkills.map((skill, index) => (
                  <span key={index} className="px-3 py-1.5 bg-emerald-50/50 text-[#53968b] border border-[#53968b]/30 rounded-full text-[11px] font-semibold tracking-wide">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-2 tracking-wide">Why are you a good fit?</p>
              <p className="text-[13px] text-slate-800 font-medium leading-relaxed">
                I'm a good fit because I'm organized, detail-oriented, and proactive. I communicate with clarity, manage tasks efficiently, and anticipate needs to ensure executives can focus on high-level priorities.
              </p>
            </div>
          </div>

          {/* --- Section 3: Resume --- */}
          <div className="border border-slate-100 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">3</div>
              <h3 className="text-base font-bold text-slate-800">Resume</h3>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 shadow-sm">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-800">{user.name.replace(' ', '_')}_Resume.pdf</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">2.4 MB</p>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-[#53968b] hover:bg-emerald-50 rounded-lg transition-colors">
                <Eye size={20} />
              </button>
            </div>
          </div>

          {/* --- Actions Footer --- */}
          <div className="flex justify-end gap-3 pt-2">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button 
              onClick={handleMessageUser}
              className="px-6 py-2.5 rounded-lg bg-[#6ebea3] hover:bg-[#5bad92] text-white text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm active:scale-95"
            >
              <MessageCircle size={16} />
              Message
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;