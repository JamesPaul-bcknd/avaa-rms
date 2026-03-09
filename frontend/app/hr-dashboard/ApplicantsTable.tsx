"use client";
import React, { useEffect, useState, useRef } from 'react';
import { 
  ChevronLeft, MapPin, Clock, MoreHorizontal, 
  Eye, X, Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InterviewModal from './InterviewModal';
import RejectModal from './RejectModal';
import Header from './Header'; // Importing your shared Header component
import api from '@/lib/axios';

interface ApplicantsTableProps {
  job: any;
  onBack: () => void;
  onScheduleSuccess: (newInterview: any) => void;
}

interface JobApplication {
  id: number;
  user_id?: number | null;
  full_name: string;
  email: string;
  cv_path?: string;
  created_at?: string;
  status: string;
  role_applied?: string;
}

const ApplicantsTable = ({ job, onBack, onScheduleSuccess }: ApplicantsTableProps) => {
  const [modalType, setModalType] = useState<'none' | 'accept' | 'reject'>('none');
  const [selectedApplicant, setSelectedApplicant] = useState<{ id: number; userId?: number | null; name: string; email: string } | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  
  const menuRef = useRef<HTMLDivElement>(null);

  const placeholder: JobApplication = {
    id: 0,
    full_name: "John Doe",
    email: "john.doe@example.com",
    cv_path: "AJohnsonCV.pdf",
    created_at: "2026-01-20",
    status: "Pending",
    role_applied: "Technical Product Manager"
  };

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/jobs/${job.id}/applications`);
        const fetchedData = response.data?.data ?? [];
        setApplicants([placeholder, ...fetchedData]);
      } catch (err) {
        setApplicants([placeholder]);
      } finally {
        setLoading(false);
      }
    };
    if (job?.id) fetchApplicants();
  }, [job?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (type: 'accept' | 'reject', app: JobApplication) => {
    setSelectedApplicant({ id: app.id, userId: app.user_id, name: app.full_name, email: app.email });
    setModalType(type);
    setActiveMenuId(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* --- Unified Header --- */}
        <Header 
          title="Applicants" 
          subtitle={`${applicants.length} Applicants`} 
        />

        {/* --- Custom Breadcrumb logic below Header --- */}
        <div className="flex items-center gap-2 text-xs mb-6 -mt-4">
          <span className="cursor-pointer text-gray-400 hover:text-[#84b3af] transition-colors" onClick={onBack}>
            Dashboard
          </span>
          <ChevronLeft size={12} className="rotate-180 text-gray-300" />
          <span className="text-[#84b3af] font-semibold">Applicants</span>
        </div>

        {/* --- Main Card --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          {/* Teal Banner */}
          <div className="h-32 bg-[#84b3af] relative">
            <button 
              onClick={onBack}
              className="absolute top-6 right-8 text-white/70 hover:text-white transition-all p-2 hover:bg-white/10 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          {/* Job Info Header */}
          <div className="px-10 pb-10">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12 relative z-10">
              <div className={`w-28 h-28 sm:w-32 sm:h-32 bg-[#22c55e] rounded-[2rem] shadow-xl flex items-center justify-center text-white text-4xl font-black border-[6px] border-white`}>
                {job?.id || 'TN'}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight">{job?.company || 'TechNova'}</h2>
                  <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[11px] font-black uppercase tracking-widest">
                    Full-time
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-5 text-sm font-bold text-slate-400">
                  <span className="flex items-center gap-1.5"><MapPin size={16} className="text-[#84b3af]"/> {job?.location || 'San Francisco, CA'}</span>
                  <span className="flex items-center gap-1.5"><Clock size={16} className="text-[#84b3af]"/> 2d ago</span>
                </div>
              </div>
              <button className="text-[#84b3af] font-black text-sm hover:underline flex items-center gap-1.5 pb-2">
                View all Users <ChevronLeft size={16} className="rotate-180" />
              </button>
            </div>

            {/* --- Table --- */}
            <div className="mt-12 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-300 font-black border-b border-slate-50">
                    <th className="pb-6 text-left">Name</th>
                    <th className="pb-6 text-left">Curriculum Vitae</th>
                    <th className="pb-6 text-left">Date Applied</th>
                    <th className="pb-6 text-left">Status</th>
                    <th className="pb-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold">Loading applicants...</td></tr>
                  ) : (
                    applicants.map((app) => (
                      <tr key={app.id} className="group hover:bg-slate-50/50 transition-all">
                        <td className="py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100">
                              <img src={`https://ui-avatars.com/api/?name=${app.full_name}&background=84b3af&color=fff`} alt="" />
                            </div>
                            <div>
                              <div className="font-black text-slate-700 text-sm tracking-tight">{app.full_name}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                {app.role_applied || 'Technical Product Manager'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 text-xs text-slate-500 font-black hover:text-[#84b3af] cursor-pointer">{app.cv_path || 'AJohnsonCV.pdf'}</td>
                        <td className="py-6 text-xs text-slate-400 font-bold">
                          {app.created_at?.split('T')[0] || '2026-01-20'}
                        </td>
                        <td className="py-6">
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#fef9c3] text-[#a16207] rounded-full text-[10px] font-black uppercase tracking-widest">
                            <Clock size={12} strokeWidth={3} /> {app.status}
                          </span>
                        </td>
                        <td className="py-6 text-center relative">
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === app.id ? null : app.id)}
                            className="p-2 text-slate-300 hover:text-slate-800 transition-colors"
                          >
                            <MoreHorizontal size={24} />
                          </button>

                          <AnimatePresence>
                            {activeMenuId === app.id && (
                              <motion.div 
                                ref={menuRef}
                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-3 overflow-hidden"
                              >
                                <button className="w-full flex items-center gap-3 px-5 py-2.5 text-[11px] font-black text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wider">
                                  <Eye size={16} className="text-slate-400" /> View
                                </button>
                                <button 
                                  onClick={() => handleAction('reject', app)}
                                  className="w-full flex items-center gap-3 px-5 py-2.5 text-[11px] font-black text-red-500 hover:bg-red-50 transition-colors uppercase tracking-wider"
                                >
                                  <X size={16} /> Reject
                                </button>
                                <button 
                                  onClick={() => handleAction('accept', app)}
                                  className="w-full flex items-center gap-3 px-5 py-2.5 text-[11px] font-black text-[#84b3af] hover:bg-teal-50 transition-colors uppercase tracking-wider"
                                >
                                  <Check size={16} /> Approved
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- Modals --- */}
      <InterviewModal
        isOpen={modalType === 'accept'}
        onClose={() => setModalType('none')}
        applicantName={selectedApplicant?.name ?? ''}
        jobTitle={job?.title || 'Unknown Position'}
        onSchedule={async (data) => {
          if (!selectedApplicant) return;
          const response = await api.post(`/jobs/applications/${selectedApplicant.id}/approve`, data);
          onScheduleSuccess(response.data?.data?.interview || { ...data, id: selectedApplicant.id });
          setApplicants(prev => prev.filter(a => a.id !== selectedApplicant.id));
          setModalType('none');
        }}
      />

      <RejectModal
        isOpen={modalType === 'reject'}
        onClose={() => setModalType('none')}
        applicant={selectedApplicant}
        onSubmit={async (reason) => {
          if (!selectedApplicant) return;
          await api.post(`/jobs/applications/${selectedApplicant.id}/reject`, { reason });
          setApplicants(prev => prev.filter(a => a.id !== selectedApplicant.id));
          setModalType('none');
        }}
      />
    </div>
  );
};

export default ApplicantsTable;