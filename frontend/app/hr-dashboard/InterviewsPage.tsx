"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { MoreHorizontal, User, CheckCircle, XCircle, CheckCircle2 } from 'lucide-react';
import Header from './Header'; // Import your Header component
import api from '@/lib/axios';

interface Interview {
  id: number;
  candidateName: string;
  role: string;
  date: string;
  interviewer: string;
  status: string;
}

const InterviewsPage = ({
  onApprove,
  onDecision
}: {
  onApprove?: (candidate: any) => void;
  onDecision?: (interviewId: number) => void;
}) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; type: 'Approved' | 'Rejected' | ''; name: string }>({
    isOpen: false,
    type: '',
    name: ''
  });

  // Fetch interviews from backend
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/interviews'); // Make sure this matches your Laravel route
      setInterviews(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const parseInterviewDate = (value: string): Date | null => {
    const directParse = new Date(value);
    if (!Number.isNaN(directParse.getTime())) return directParse;
    const dateOnlyParse = new Date(`${value}T00:00:00`);
    return Number.isNaN(dateOnlyParse.getTime()) ? null : dateOnlyParse;
  };

  const stats = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    let todaysTotal = 0;
    let pendingFeedback = 0;
    let upcoming = 0;

    interviews.forEach((interview) => {
      const interviewDate = parseInterviewDate(interview.date);
      if (!interviewDate) return;

      if (interviewDate >= startOfToday && interviewDate < endOfToday) todaysTotal += 1;
      else if (interviewDate < startOfToday) pendingFeedback += 1;
      else upcoming += 1;
    });

    return [
      { label: "Today's Total", value: todaysTotal, color: 'bg-[#2d5a61]' },
      { label: 'Pending Feedback', value: pendingFeedback, color: 'bg-[#94b3af]' },
      { label: 'Upcoming', value: upcoming, color: 'bg-[#a3a3a3]' },
    ];
  }, [interviews]);

  const handleAction = async (type: 'Approved' | 'Rejected', interview: Interview) => {
    setActiveMenu(null);

    try {
      if (type === 'Approved') {
        await api.post(`/jobs/interviews/${interview.id}/approve`);
        onApprove?.({
          id: interview.id,
          name: interview.candidateName,
          position: interview.role,
          status: 'Active'
        });
      } else {
        await api.post(`/jobs/interviews/${interview.id}/reject`, { reason: 'Rejected after interview.' });
      }

      setInterviews(prev => prev.filter(item => item.id !== interview.id));
      onDecision?.(interview.id);
      setSuccessModal({ isOpen: true, type, name: interview.candidateName });
    } catch (error) {
      console.error('Failed to update interview status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400">Loading interviews...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <Header title="Scheduled Interviews" />

      {/* Stats Section */}
      <div className="flex flex-wrap gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.color} text-white p-5 sm:p-6 rounded-2xl flex-1 min-w-[130px] shadow-lg`}>
            <p className="text-sm font-medium opacity-90">{stat.label}</p>
            <p className="text-3xl sm:text-4xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-visible border border-slate-100">
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
            {interviews.map(interview => (
              <tr key={interview.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="bg-emerald-400 p-2 rounded-lg text-white"><User size={20} /></div>
                  <div>
                    <p className="font-bold text-slate-700">{interview.candidateName}</p>
                    <p className="text-xs text-slate-400">{interview.role}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">{interview.date}</td>
                <td className="px-6 py-4 text-slate-700 font-semibold">{interview.interviewer}</td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">{interview.status}</span>
                </td>
                <td className="px-6 py-4 text-center relative">
                  <button onClick={() => setActiveMenu(activeMenu === interview.id ? null : interview.id)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreHorizontal className="text-gray-400 cursor-pointer" />
                  </button>
                  {activeMenu === interview.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <button onClick={() => handleAction('Approved', interview)} className="w-full px-4 py-3 text-left text-sm font-semibold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2">
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button onClick={() => handleAction('Rejected', interview)} className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50">
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
        {interviews.length === 0 && <div className="p-10 text-center text-slate-400">No pending interviews.</div>}
      </div>

      {/* Mobile View & Success Modal remain unchanged */}
      {/* ... your existing mobile card list and modal code ... */}
    </div>
  );
};

export default InterviewsPage;