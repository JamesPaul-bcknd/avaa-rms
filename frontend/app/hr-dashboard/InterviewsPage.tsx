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

// Added onApprove and onReject props to communicate with the parent/UserPage
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
      // 1. Move to Users Page via callback
      if (onApprove) {
        onApprove({
          id: Date.now(), // Generate a new ID for the user table
          name: interview.candidateName,
          position: interview.role,
          status: 'Active'
        });
      }
    }

    // 2. Remove from current Interview list (for both Approve and Reject)
    setInterviews(prev => prev.filter(item => item.id !== interview.id));
    
    // 3. Show Success Feedback
    setSuccessModal({ isOpen: true, type, name: interview.candidateName });
  };

  return (
    <div className="space-y-6 relative">
      <h1 className="text-gray-500 text-sm font-medium">Scheduled Interviews</h1>
      
      <div className="flex gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.color} text-white p-6 rounded-2xl w-48 shadow-lg`}>
            <p className="text-sm font-medium opacity-90">{stat.label}</p>
            <p className="text-4xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-visible">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">Candidate Name</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Interviewer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {interviews.map((interview) => (
              <tr key={interview.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-400 p-2 rounded-lg text-white">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">{interview.candidateName}</p>
                      <p className="text-xs text-slate-400">{interview.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">{interview.date}</td>
                <td className="px-6 py-4 text-slate-700 font-semibold">{interview.interviewer}</td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
                    {interview.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center relative">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === interview.id ? null : interview.id)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <MoreHorizontal className="text-gray-400 cursor-pointer" />
                  </button>

                  {activeMenu === interview.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <button 
                          onClick={() => handleAction('Approved', interview)}
                          className="w-full px-4 py-3 text-left text-sm font-semibold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button 
                          onClick={() => handleAction('Rejected', interview)}
                          className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {interviews.length === 0 && (
          <div className="p-10 text-center text-slate-400">No pending interviews.</div>
        )}
      </div>

      {successModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
              <div className={`${successModal.type === 'Approved' ? 'bg-emerald-100 text-emerald-500' : 'bg-red-100 text-red-500'} p-4 rounded-full`}>
                {successModal.type === 'Approved' ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Decision Recorded</h2>
            <p className="text-slate-500 mb-6">
              <span className="font-bold text-slate-700">{successModal.name}</span> has been <br/> 
              <span className={`font-black uppercase tracking-wider ${successModal.type === 'Approved' ? 'text-emerald-600' : 'text-red-600'}`}>
                {successModal.type === 'Rejected' ? 'Deleted' : successModal.type}
              </span>.
            </p>
            <button 
              onClick={() => setSuccessModal({ ...successModal, isOpen: false })}
              className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all shadow-lg"
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