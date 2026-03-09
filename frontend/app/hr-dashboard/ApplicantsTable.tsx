"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  MoreHorizontal, Eye, X, Check, Clock, CheckCircle2
} from 'lucide-react';

// --- Imported Modals ---
import UserDetailsModal from './UserDetailsModal'; // <-- CHANGED TO USE YOUR NEW MODAL
import ApproveApplicantModal from './ApproveApplicantModal';
import RejectApplicantModal from './RejectApplicantModal';

interface ApplicantsTableProps {
  job: any;
  onBack: () => void;
  onScheduleSuccess: (interview: any) => void;
  onMessageClick: () => void;
}

export default function ApplicantsTable({ job, onBack, onScheduleSuccess, onMessageClick }: ApplicantsTableProps) {
  // Hardcoded Data 
  const [applicants, setApplicants] = useState([
    { id: 1, name: "John Doe", role: "Technical Product Manager", email: "john.doe@email.com", cv: "AJohnsonCV.pdf", date: "2026-01-20", status: "Pending", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&q=80" },
    { id: 2, name: "Sarah Chen", role: "UI/UX Designer", email: "sarah.chen@email.com", cv: "BSmithCV.pdf", date: "2026-02-10", status: "Pending", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&q=80" },
    { id: 3, name: "Alice Johnson", role: "Frontend Developer", email: "alice.j@email.com", cv: "CDavisCV.pdf", date: "2026-02-01", status: "Pending", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&q=80" },
  ]);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [activeApplicant, setActiveApplicant] = useState<any>(null);

  // Modal States
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  
  // Success Message State
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openMenu = (id: number) => setOpenMenuId(openMenuId === id ? null : id);

  const handleAction = (action: 'view' | 'approve' | 'reject', applicant: any) => {
    setActiveApplicant(applicant);
    setOpenMenuId(null);
    if (action === 'view') setIsViewOpen(true);
    if (action === 'approve') setIsApproveOpen(true);
    if (action === 'reject') setIsRejectOpen(true);
  };

  // --- Handlers from Modals ---
  const handleApproveSubmit = (details: any) => {
    setApplicants(prev => prev.map(a => a.id === activeApplicant.id ? { ...a, status: 'Approved' } : a));
    onScheduleSuccess({
      id: Date.now(),
      candidateName: activeApplicant.name,
      role: job?.title || activeApplicant.role,
      date: details.date,
      interviewer: details.interviewer,
      status: 'Upcoming'
    });
    setIsApproveOpen(false);
    setSuccessMessage(`An email with the scheduled meeting has been sent to ${activeApplicant.email}.`);
    setIsSuccessOpen(true);
  };

  const handleRejectSubmit = (message: string) => {
    setApplicants(prev => prev.map(a => a.id === activeApplicant.id ? { ...a, status: 'Rejected' } : a));
    setIsRejectOpen(false);
    setSuccessMessage(`The message for rejection has been sent to ${activeApplicant.name}.`);
    setIsSuccessOpen(true);
  };

  const displayJob = job || { initials: 'TN', title: 'Senior Frontend Developer', location: 'San Francisco, CA', posted: '2d ago', type: 'Full-time' };

  // Format the applicant data to fit the expected HrUser structure of UserDetailsModal
  const mappedUser = activeApplicant ? {
    id: String(activeApplicant.id),
    name: activeApplicant.name,
    email: activeApplicant.email,
    position: activeApplicant.role,
    profile_image_url: activeApplicant.avatar,
    phone: '+1 (555) 234-5678', // Mock data to fill out the modal
    location: 'San Francisco, CA', // Mock data to fill out the modal
    created_at: activeApplicant.date,
    updated_at: activeApplicant.date
  } : null;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Applicants</h1>
          <p className="text-[13px] text-slate-500 mt-1">{applicants.length} Applicants</p>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-bold text-slate-500">
          <button onClick={onBack} className="hover:text-[#53968b] transition-colors">Dashboard</button>
          <span>›</span>
          <span className="text-slate-800">Applicants</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-visible">
        <div className="bg-[#6ebea3] h-28 rounded-t-[24px] relative">
          <button onClick={onBack} className="absolute right-6 top-6 text-white/80 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        {/* Job Details Overlapping Banner */}
        <div className="px-8 pb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 relative z-10">
          <div className="flex items-end gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#4ade80] flex items-center justify-center text-white text-2xl font-bold shadow-sm border-4 border-white shrink-0">
              {displayJob.initials}
            </div>
            <div className="pb-1">
              <h2 className="text-2xl font-extrabold text-slate-800 leading-tight">{displayJob.title}</h2>
              <div className="flex items-center gap-3 mt-2 text-[12px] font-bold text-slate-500">
                <span className="flex items-center gap-1.5"><span className="text-base leading-none">📍</span> {displayJob.location}</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 flex items-center gap-1.5"><Clock size={12}/> {displayJob.posted || '2d ago'}</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 uppercase tracking-wider">{displayJob.type}</span>
              </div>
            </div>
          </div>
          <button onClick={onBack} className="text-[#53968b] font-bold text-sm hover:underline pb-2">View all Jobs →</button>
        </div>

        {/* Table */}
        <div className="w-full overflow-visible pb-16">
          <table className="w-full text-left">
            <thead className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Name</th>
                <th className="px-6 py-5 text-center">Curriculum Vitae</th>
                <th className="px-6 py-5 text-center">Date Applied</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {applicants.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        <img src={app.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-[14px]">{app.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{app.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-[13px] font-medium text-slate-500">{app.cv}</td>
                  <td className="px-6 py-4 text-center text-[13px] font-medium text-slate-500">{app.date}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
                      app.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      app.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  
                  {/* 3-DOTS ACTION */}
                  <td className="px-8 py-4 text-right relative">
                    <button 
                      onClick={() => openMenu(app.id)}
                      className={`p-2 rounded-xl transition-colors focus:outline-none ${openMenuId === app.id ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {openMenuId === app.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                        <div ref={menuRef} className="absolute right-8 top-12 w-36 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                          <button onClick={() => handleAction('view', app)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <Eye size={16} className="text-slate-400" /> View
                          </button>
                          <button onClick={() => handleAction('reject', app)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <X size={16} className="text-slate-400" /> Reject
                          </button>
                          <button onClick={() => handleAction('approve', app)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <Check size={16} className="text-emerald-500" /> Approved
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* EXTERNALLY CALLED MODALS                     */}
      {/* ========================================== */}
      
      {/* The Reused UserDetailsModal */}
      <UserDetailsModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        user={mappedUser as any} 
      />

      <ApproveApplicantModal 
        isOpen={isApproveOpen} 
        onClose={() => setIsApproveOpen(false)} 
        applicant={activeApplicant} 
        onApprove={handleApproveSubmit}
      />

      <RejectApplicantModal 
        isOpen={isRejectOpen} 
        onClose={() => setIsRejectOpen(false)} 
        applicant={activeApplicant} 
        onReject={handleRejectSubmit}
      />

      {/* Success Confirmation Modal */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-8 shadow-2xl max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-200 shadow-inner">
              <CheckCircle2 size={36} strokeWidth={2.5} className="fill-emerald-100 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[20px] font-bold text-slate-800">Action Completed</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed px-2">{successMessage}</p>
            </div>
            <button 
              onClick={() => setIsSuccessOpen(false)} 
              className="w-full mt-4 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all active:scale-95 shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}