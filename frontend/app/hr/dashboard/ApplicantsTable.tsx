"use client";
import React, { useEffect, useState } from 'react';
import { ChevronLeft, Search, MapPin, Clock, X, Check, FileText } from 'lucide-react';
import InterviewModal from './InterviewModal';
import RejectModal from './RejectModal';
import ApplicationStatusModal from './ApplicationStatusModal';
import api from '@/lib/axios';

// Defining the interface to match what page.tsx is sending
interface ApplicantsTableProps {
  job: any;
  onBack: () => void;
  onScheduleSuccess: (newInterview: any) => void;
}

interface JobApplication {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  cover_letter?: string;
  why_interested?: string;
  experience?: string;
  cv_path?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
}

const ApplicantsTable = ({ job, onBack, onScheduleSuccess }: ApplicantsTableProps) => {
  const [modalType, setModalType] = useState<'none' | 'accept' | 'reject'>('none');
  const [selectedApplicant, setSelectedApplicant] = useState<{ name: string; email: string; id: number } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!job?.id) {
      setApplicants([]);
      setLoading(false);
      return;
    }

    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/jobs/${job.id}/applications`);
        setApplicants(response.data?.data ?? []);
      } catch (err) {
        console.error('Failed to load applicants', err);
        setError('Unable to load applicants right now.');
        setApplicants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [job?.id]);

  const handleAccept = (app: JobApplication) => {
    setSelectedApplicant({ name: app.full_name, email: app.email, id: app.id });
    setModalType('accept');
  };
  
  const handleReject = (app: JobApplication) => {
    setSelectedApplicant({ name: app.full_name, email: app.email, id: app.id });
    setModalType('reject');
  };

  const confirmStatusUpdate = async () => {
    if (!selectedApplicant || modalType === 'none') return;
    
    setIsUpdating(true);
    try {
      await updateApplicationStatus(selectedApplicant.id, modalType as 'accepted' | 'rejected');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateApplicationStatus = async (applicationId: number, status: 'accepted' | 'rejected') => {
    try {
      await api.put(`/jobs/applications/${applicationId}/status`, { status });
      
      // Update local state
      setApplicants(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status }
            : app
        )
      );
      
      handleClose();
    } catch (error) {
      console.error('Failed to update application status:', error);
      // You could show an error message here
    }
  };
  
  const handleClose = () => { 
    setModalType('none'); 
    setSelectedApplicant(null); 
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().split('T')[0];
  };

  const getStatusDisplay = (status: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'accepted':
        return {
          text: 'Accepted',
          className: 'px-3 py-1.5 bg-[#dcfce7] text-[#166534] rounded-full text-[10px] font-black uppercase tracking-widest'
        };
      case 'rejected':
        return {
          text: 'Rejected',
          className: 'px-3 py-1.5 bg-[#fef2f2] text-[#dc2626] rounded-full text-[10px] font-black uppercase tracking-widest'
        };
      default:
        return {
          text: 'Pending',
          className: 'px-3 py-1.5 bg-[#fef08a] text-[#854d0e] rounded-full text-[10px] font-black uppercase tracking-widest'
        };
    }
  };

  return (
    <div className="relative">
      <div className="animate-in fade-in duration-500">

        {/* --- Header Section --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors shrink-0">
              <ChevronLeft size={26} />
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className={`w-11 h-11 ${job?.color || 'bg-teal-500'} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0`}>
                {job?.id || 'TN'}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{job?.title || 'Job Title'}</h2>
                  <span className="px-2 py-0.5 bg-[#e2e8f0] text-slate-600 rounded-lg text-xs font-bold uppercase tracking-tight shrink-0">Full-time</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job?.location || '—'}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {job?.date || ''}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl text-sm w-full sm:w-60 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* --- Desktop Table --- */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Applicants</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4">Date Applied</th>
                <th className="px-5 py-4">Curriculum Vitae</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-sm text-slate-400">Loading applicants…</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-sm text-red-400">{error}</td>
                </tr>
              )}
              {!loading && !error && applicants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-sm text-slate-400">No applicants yet for this job.</td>
                </tr>
              )}
              {!loading && !error && applicants.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700 text-sm">{app.full_name}</div>
                    <div className="text-xs text-slate-400">{app.email}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={getStatusDisplay(app.status).className}>
                      {getStatusDisplay(app.status).text}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500 font-semibold whitespace-nowrap">{formatDate(app.created_at)}</td>
                  <td className="px-5 py-4 text-xs text-slate-600 font-medium">
                    {app.cv_path ? (
                      <a 
                        href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/storage/${app.cv_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-800 underline flex items-center gap-1"
                      >
                        <FileText size={14} />
                        View CV
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {app.status === 'pending' ? (
                      <div className="flex justify-center gap-5">
                        <button 
                          onClick={() => handleReject(app)} 
                          className="text-red-500 hover:scale-125 transition-transform duration-200"
                          title="Reject Application"
                        >
                          <X size={22} strokeWidth={4} />
                        </button>
                        <button 
                          onClick={() => handleAccept(app)} 
                          className="text-emerald-500 hover:scale-125 transition-transform duration-200"
                          title="Accept Application"
                        >
                          <Check size={22} strokeWidth={4} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-xs text-gray-400">
                        {app.status === 'accepted' ? 'Accepted' : 'Rejected'}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- Mobile View --- */}
        <div className="md:hidden bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
          {loading && (
            <div className="p-4 text-center text-sm text-slate-400">Loading applicants…</div>
          )}
          {!loading && error && (
            <div className="p-4 text-center text-sm text-red-400">{error}</div>
          )}
          {!loading && !error && applicants.length === 0 && (
            <div className="p-4 text-center text-sm text-slate-400">No applicants yet for this job.</div>
          )}
          {!loading && !error && applicants.map((app) => (
            <div key={app.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-700 text-sm">{app.full_name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{app.email}</div>
                </div>
                <span className={getStatusDisplay(app.status).className}>
                  {getStatusDisplay(app.status).text}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
                <span>Applied: <span className="font-semibold">{formatDate(app.created_at)}</span></span>
                <span className="flex items-center gap-1 text-slate-400">
                  {app.cv_path ? (
                    <a 
                      href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/storage/${app.cv_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-800 underline flex items-center gap-1"
                    >
                      <FileText size={12} />
                      View CV
                    </a>
                  ) : (
                    <>
                      <FileText size={12} />
                      Not provided
                    </>
                  )}
                </span>
              </div>
              <div className="flex gap-3">
                {app.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleReject(app)} 
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 bg-red-50 text-red-500 font-semibold text-xs hover:bg-red-100"
                    >
                      <X size={14} strokeWidth={3} /> Reject
                    </button>
                    <button 
                      onClick={() => handleAccept(app)} 
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 font-semibold text-xs hover:bg-emerald-100"
                    >
                      <Check size={14} strokeWidth={3} /> Accept
                    </button>
                  </>
                ) : (
                  <div className="flex-1 text-center text-xs text-gray-400 py-2">
                    {app.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Modals --- */}
      <ApplicationStatusModal
        isOpen={modalType !== 'none'}
        onClose={handleClose}
        onConfirm={confirmStatusUpdate}
        action={modalType as 'accept' | 'reject'}
        applicantName={selectedApplicant?.name ?? ''}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default ApplicantsTable;