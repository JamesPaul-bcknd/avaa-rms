"use client";
import React, { useState } from 'react';
import { MoreHorizontal, User, CheckCircle, XCircle, CheckCircle2 } from 'lucide-react';

interface Interview {
  id: number;
  candidateName: string;
  role: string;
  date: string;
  interviewer: string;
  status: string;
}

const InterviewsPage = ({
  interviews: initialInterviews,
  onApprove
}: {
  interviews: Interview[];
  onApprove?: (candidate: any) => void
}) => {
  const [interviews, setInterviews] = useState(initialInterviews);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; type: 'Approved' | 'Rejected' | ''; name: string }>({
    isOpen: false,
    type: '',
    name: ''
  });

  const stats = [
    { label: "Today's Total", value: interviews.length, color: "bg-[#2d5a61]" },
    { label: "Pending Feedback", value: 2, color: "bg-[#94b3af]" },
    { label: "Upcoming", value: 12, color: "bg-[#a3a3a3]" },
  ];

  const handleAction = (type: 'Approved' | 'Rejected', interview: Interview) => {
    setActiveMenu(null);

    if (type === 'Approved') {
      if (onApprove) {
        onApprove({
          id: Date.now(),
          name: interview.candidateName,
          position: interview.role,
          status: 'Active'
        });
      }
    }

    setInterviews(prev => prev.filter(item => item.id !== interview.id));
    setSuccessModal({ isOpen: true, type, name: interview.candidateName });
  };

  return (
    <div className="w-full space-y-6 relative">

      {/* Header Section */}
      <div className="px-2 py-4 border-b border-slate-100 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Scheduled Interviews</h2>
      </div>

      {/* Stats Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.color} text-white p-6 rounded-xl flex-1 shadow-sm`}>
            <p className="text-sm font-medium opacity-90">{stat.label}</p>
            <p className="text-4xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-visible border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Candidate Name</th>
              <th className="px-6 py-5 text-center">Date & Time</th>
              <th className="px-6 py-5 text-center">Interviewer</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {interviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  No pending interviews.
                </td>
              </tr>
            ) : (
              interviews.map((interview) => (
                <tr key={interview.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-400 p-2.5 rounded-xl text-white shadow-sm shrink-0">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-sm leading-tight">{interview.candidateName}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{interview.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-500 font-medium text-center text-sm">{interview.date}</td>
                  <td className="px-6 py-5 text-slate-600 font-semibold text-center text-sm">{interview.interviewer}</td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-flex items-center bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                      {interview.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === interview.id ? null : interview.id)}
                      className={`p-2 rounded-lg transition-all ${activeMenu === interview.id ? 'bg-slate-100 text-slate-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {activeMenu === interview.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                        <div className="absolute right-8 top-12 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <button
                            onClick={() => handleAction('Approved', interview)}
                            className="w-full px-4 py-3 text-left text-sm font-semibold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors"
                          >
                            <CheckCircle size={15} /> Approve
                          </button>
                          <hr className="border-slate-50 mx-2" />
                          <button
                            onClick={() => handleAction('Rejected', interview)}
                            className="w-full px-4 py-3 text-left text-sm font-semibold text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                          >
                            <XCircle size={15} /> Reject
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        {interviews.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No pending interviews.</div>
        ) : (
          interviews.map((interview) => (
            <div key={interview.id} className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-400 p-2.5 rounded-xl text-white shadow-sm shrink-0">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-[15px] leading-tight truncate">{interview.candidateName}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{interview.role}</p>
                  </div>
                </div>
                <span className="shrink-0 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  {interview.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-medium text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span>{interview.date}</span>
                <span className="font-bold text-slate-600">{interview.interviewer}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleAction('Approved', interview)}
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 font-semibold text-[11px] hover:bg-emerald-100 shadow-sm transition-colors"
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button
                  onClick={() => handleAction('Rejected', interview)}
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-500 font-semibold text-[11px] hover:bg-red-100 shadow-sm transition-colors"
                >
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Success Modal */}
      {successModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in duration-200">
            <div className="flex justify-center mb-5">
              <div className={`${successModal.type === 'Approved' ? 'bg-emerald-100 text-emerald-500 border border-emerald-200' : 'bg-red-100 text-red-500 border border-red-200'} w-16 h-16 rounded-full flex items-center justify-center`}>
                {successModal.type === 'Approved' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Decision Recorded</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed px-2">
              <span className="font-bold text-slate-700">{successModal.name}</span> has been <br />
              <span className={`font-black uppercase tracking-wider ${successModal.type === 'Approved' ? 'text-emerald-600' : 'text-red-500'}`}>
                {successModal.type === 'Rejected' ? 'Deleted' : successModal.type}
              </span>.
            </p>
            <button
              onClick={() => setSuccessModal({ ...successModal, isOpen: false })}
              className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all active:scale-95 shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewsPage;