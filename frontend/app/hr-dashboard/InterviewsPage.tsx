"use client";
import React, { useState, useMemo } from 'react';
import { MoreHorizontal, User, CheckCircle, XCircle, CheckCircle2, Calendar, Video, ExternalLink, Filter, Search } from 'lucide-react';

interface Interview {
  id: number;
  candidateName: string;
  role: string;
  date: string;
  time?: string;
  interviewer: string;
  type?: string;
  googleMeetLink?: string;
  status: string;
}

const InterviewsPage = ({
  interviews: initialInterviews,
  onApprove
}: {
  interviews: Interview[];
  onApprove?: (candidate: any) => void;
}) => {
  const [interviews, setInterviews] = useState(initialInterviews);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "custom">("all");
  const [customDate, setCustomDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    type: 'Approved' | 'Rejected' | '';
    name: string;
  }>({ isOpen: false, type: '', name: '' });

  // ── Sync when parent pushes new interviews ────────────────
  React.useEffect(() => {
    setInterviews(initialInterviews);
  }, [initialInterviews]);

  // ── Date helpers ──────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parseDate = (dateStr: string) => {
    // handles "2026-02-19 10:00", "2026-02-19", etc.
    return new Date(dateStr.split(' ')[0]);
  };

  const filteredInterviews = useMemo(() => {
    return interviews.filter((iv) => {
      const d = parseDate(iv.date);
      d.setHours(0, 0, 0, 0);

      if (dateFilter === "today") {
        if (d.getTime() !== today.getTime()) return false;
      } else if (dateFilter === "week") {
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        if (!(d >= today && d <= weekEnd)) return false;
      } else if (dateFilter === "custom" && customDate) {
        const custom = new Date(customDate);
        custom.setHours(0, 0, 0, 0);
        if (d.getTime() !== custom.getTime()) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          iv.candidateName.toLowerCase().includes(q) ||
          iv.role.toLowerCase().includes(q) ||
          iv.interviewer.toLowerCase().includes(q) ||
          (iv.type || "").toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [interviews, dateFilter, customDate, searchQuery]);

  const todayCount = interviews.filter(iv => parseDate(iv.date).toDateString() === today.toDateString()).length;
  const upcomingCount = interviews.filter(iv => { const d = parseDate(iv.date); d.setHours(0, 0, 0, 0); return d > today; }).length;
  const totalCount = interviews.length;

  const handleAction = (type: 'Approved' | 'Rejected', interview: Interview) => {
    setActiveMenu(null);
    if (type === 'Approved' && onApprove) {
      onApprove({
        id: Date.now(),
        name: interview.candidateName,
        position: interview.role,
        status: 'Active'
      });
    }
    setInterviews(prev => prev.filter(item => item.id !== interview.id));
    setSuccessModal({ isOpen: true, type, name: interview.candidateName });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr.split(' ')[0]);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (iv: Interview) => {
    if (iv.time) return iv.time;
    const parts = iv.date.split(' ');
    return parts[1] || '—';
  };

  return (
    <div className="w-full space-y-6 relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 py-4 border-b border-slate-100 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Scheduled Interviews</h2>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2d5a61] text-white rounded-full text-[11px] font-bold">
              <Calendar size={11} /> Today: {todayCount}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#94b3af] text-white rounded-full text-[11px] font-bold">
              Upcoming: {upcomingCount}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-[11px] font-bold">
              Total: {totalCount}
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, role, interviewer..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#4c8479] focus:ring-1 focus:ring-[#4c8479] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <XCircle size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 mr-1">
          <Filter size={15} />
          <span className="text-[13px] font-bold text-slate-600">Filter by date:</span>
        </div>
        {[
          { key: "all", label: "All" },
          { key: "today", label: "Today" },
          { key: "week", label: "Next 7 days" },
          { key: "custom", label: "Pick date" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setDateFilter(f.key as any)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${dateFilter === f.key
                ? "bg-[#4c8479] text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
          >
            {f.label}
          </button>
        ))}
        {dateFilter === "custom" && (
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="ml-1 px-3 py-1.5 border border-[#4c8479]/40 rounded-lg text-[13px] font-medium text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#4c8479] cursor-pointer"
          />
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-visible border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Candidate</th>
              <th className="px-6 py-5 text-center">Date & Time</th>
              <th className="px-6 py-5 text-center">Type</th>
              <th className="px-6 py-5 text-center">Interviewer</th>
              <th className="px-6 py-5 text-center">Meet Link</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredInterviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-400">
                  No interviews found for this filter.
                </td>
              </tr>
            ) : (
              filteredInterviews.map((interview) => (
                <tr key={interview.id} className="hover:bg-slate-50/50 transition-colors">

                  {/* Candidate */}
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

                  {/* Date & Time */}
                  <td className="px-6 py-5 text-center">
                    <p className="text-sm font-semibold text-slate-700">{formatDate(interview.date)}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{formatTime(interview)}</p>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${interview.type === 'Online Interview'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-600'
                      }`}>
                      {interview.type === 'Online Interview' && <Video size={11} />}
                      {interview.type || 'Interview'}
                    </span>
                  </td>

                  {/* Interviewer */}
                  <td className="px-6 py-5 text-slate-600 font-semibold text-center text-sm">
                    {interview.interviewer}
                  </td>

                  {/* Meet Link */}
                  <td className="px-6 py-5 text-center">
                    {interview.googleMeetLink ? (
                      <a
                        href={interview.googleMeetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e6f7f2] text-[#4c8479] rounded-lg text-[11px] font-bold hover:bg-[#d0ede7] transition-colors"
                      >
                        <Video size={12} /> Join Meet
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-slate-300 text-[11px] font-medium">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5 text-center">
                    <span className="inline-flex items-center bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                      {interview.status}
                    </span>
                  </td>

                  {/* Actions */}
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

      {/* Mobile Cards */}
      <div className="md:hidden bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        {filteredInterviews.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No interviews found for this filter.</div>
        ) : (
          filteredInterviews.map((interview) => (
            <div key={interview.id} className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-400 p-2.5 rounded-xl text-white shadow-sm shrink-0">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-[15px] leading-tight">{interview.candidateName}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{interview.role}</p>
                  </div>
                </div>
                <span className="shrink-0 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  {interview.status}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(interview.date)} · {formatTime(interview)}</span>
                  <span className="font-bold text-slate-600">{interview.interviewer}</span>
                </div>
                {interview.type && (
                  <span className={`w-fit px-2 py-0.5 rounded-full text-[10px] font-bold ${interview.type === 'Online Interview' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>{interview.type}</span>
                )}
                {interview.googleMeetLink && (
                  <a
                    href={interview.googleMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[#4c8479] font-bold hover:underline w-fit"
                  >
                    <Video size={12} /> Join Google Meet <ExternalLink size={10} />
                  </a>
                )}
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
              <span className="font-bold text-slate-700">{successModal.name}</span> has been{' '}
              <span className={`font-black uppercase tracking-wider ${successModal.type === 'Approved' ? 'text-emerald-600' : 'text-red-500'}`}>
                {successModal.type === 'Rejected' ? 'Rejected' : successModal.type}
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