"use client";
import React, { useState } from 'react';
import { ChevronLeft, Search, MapPin, Clock, X, Check, FileText } from 'lucide-react';
import InterviewModal from './InterviewModal';
import RejectModal from './RejectModal';

const ApplicantsTable = ({ job, onBack }: { job: any; onBack: () => void }) => {
  const [modalType, setModalType] = useState<'none' | 'accept' | 'reject'>('none');
  const [selectedApplicant, setSelectedApplicant] = useState<{ name: string; email: string } | null>(null);

  const applicants = [
    { name: 'Alice Johnson', email: 'alice@example.com', status: 'Pending', date: '2026-01-15', cv: 'AJohnsonCV.pdf' },
    { name: 'Bob Smith', email: 'bob@example.com', status: 'Pending', date: '2026-01-20', cv: 'BSmithCV.pdf' },
    { name: 'Carol Davis', email: 'carol@example.com', status: 'Pending', date: '2025-12-10', cv: 'CDavisCV.pdf' },
    { name: 'David Lee', email: 'david@example.com', status: 'Pending', date: '2026-02-01', cv: 'DLeeCV.pdf' },
    { name: 'Emma Wilson', email: 'emma@example.com', status: 'Pending', date: '2025-11-28', cv: 'EWilsonCV.pdf' },
    { name: 'Frank Brown', email: 'frank@example.com', status: 'Pending', date: '2025-12-22', cv: 'FBrownCV.pdf' },
  ];

  const handleAccept = (app: { name: string; email: string }) => { setSelectedApplicant(app); setModalType('accept'); };
  const handleReject = (app: { name: string; email: string }) => { setSelectedApplicant(app); setModalType('reject'); };
  const handleClose = () => { setModalType('none'); setSelectedApplicant(null); };

  return (
    <div className="relative">
      <div className="animate-in fade-in duration-500">

        {/* ── Page header ── */}
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
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{job?.title || 'TechNova'}</h2>
                  <span className="px-2 py-0.5 bg-[#e2e8f0] text-slate-600 rounded-lg text-xs font-bold uppercase tracking-tight shrink-0">Full-time</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><MapPin size={12} /> San Francisco, CA</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> 2d ago</span>
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

        {/* ── Desktop table (md and up) ── */}
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
              {applicants.map((app) => (
                <tr key={app.email} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700 text-sm">{app.name}</div>
                    <div className="text-xs text-slate-400">{app.email}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="px-3 py-1.5 bg-[#fef08a] text-[#854d0e] rounded-full text-[10px] font-black uppercase tracking-widest">
                      {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500 font-semibold whitespace-nowrap">{app.date}</td>
                  <td className="px-5 py-4 text-xs text-slate-600 font-medium">{app.cv}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-5">
                      <button onClick={() => handleReject(app)} className="text-red-500 hover:scale-125 transition-transform duration-200">
                        <X size={22} strokeWidth={4} />
                      </button>
                      <button onClick={() => handleAccept(app)} className="text-emerald-500 hover:scale-125 transition-transform duration-200">
                        <Check size={22} strokeWidth={4} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile card list (below md) ── */}
        <div className="md:hidden bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
          {applicants.map((app) => (
            <div key={app.email} className="p-4 flex flex-col gap-3">
              {/* Name + status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-700 text-sm">{app.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{app.email}</div>
                </div>
                <span className="px-2.5 py-1 bg-[#fef08a] text-[#854d0e] rounded-full text-[9px] font-black uppercase tracking-widest shrink-0">
                  {app.status}
                </span>
              </div>

              {/* Meta: date + cv */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
                <span>Applied: <span className="font-semibold">{app.date}</span></span>
                <span className="flex items-center gap-1 text-slate-400">
                  <FileText size={12} />{app.cv}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleReject(app)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 bg-red-50 text-red-500 font-semibold text-xs hover:bg-red-100 transition-colors"
                >
                  <X size={14} strokeWidth={3} /> Reject
                </button>
                <button
                  onClick={() => handleAccept(app)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 font-semibold text-xs hover:bg-emerald-100 transition-colors"
                >
                  <Check size={14} strokeWidth={3} /> Accept
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modals */}
      <InterviewModal
        isOpen={modalType === 'accept'}
        onClose={handleClose}
        applicantName={selectedApplicant?.name ?? ''}
      />
      <RejectModal
        isOpen={modalType === 'reject'}
        onClose={handleClose}
        applicant={selectedApplicant}
      />
    </div>
  );
};

export default ApplicantsTable;