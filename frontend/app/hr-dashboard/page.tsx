'use client';

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Notifications from "./Notifications";
import { useAuth } from '@/lib/useAuth';
import {
  Users, Briefcase, Eye, X, TrendingUp, FileText,
  ArrowLeft, Edit, MoreVertical, Paperclip, Image as ImageIcon,
  Smile, Send, Ban, Flag, Search
} from "lucide-react";

// --- Sub-components ---
import Sidebar from "./Sidebar";
import Header from "./Header";
import ApplicantsTable from "./ApplicantsTable";
import InterviewsPage from "./InterviewsPage";
import ManageJobs from "./ManageJobs";
import UserPage from "./UserPage";

// --- Mock Data ---
const statsData = [
  { title: 'Active Users', value: '100', trend: '+12%', subtitle: 'Users currently active', icon: Users },
  { title: 'Job Posted', value: '6', trend: '+8%', subtitle: 'Open positions available', icon: Briefcase },
  { title: 'Applications', value: '200', trend: '+8%', subtitle: 'Submitted this month', icon: FileText },
  { title: 'Total Visits', value: '10,800', trend: '+18%', subtitle: 'Visits recorded this month', icon: Eye },
];

const mockJobs = [
  { id: '1', initials: 'TN', title: 'Senior Frontend Developer', company: 'TechNova', location: 'San Francisco, CA', status: 'Active', applications: 52, posted: '2026-02-07', colorClass: 'bg-emerald-400' },
  { id: '2', initials: 'DS', title: 'Backend Engineer', company: 'TechNova', location: 'San Francisco, CA', status: 'Active', applications: 31, posted: '2026-02-06', colorClass: 'bg-slate-800' },
  { id: '3', initials: 'CH', title: 'UX/UI Designer', company: 'TechNova', location: 'San Francisco, CA', status: 'Active', applications: 43, posted: '2026-02-05', colorClass: 'bg-teal-400' },
  { id: '4', initials: 'CS', title: 'DevOps Engineer', company: 'TechNova', location: 'San Francisco, CA', status: 'Active', applications: 19, posted: '2026-02-04', colorClass: 'bg-slate-800' },
  { id: '5', initials: 'IT', title: 'Product Manager', company: 'TechNova', location: 'San Francisco, CA', status: 'Active', applications: 20, posted: '2026-02-03', colorClass: 'bg-emerald-500' },
  { id: '6', initials: 'AP', title: 'Data Scientist', company: 'TechNova', location: 'San Francisco, CA', status: 'Inactive', applications: 12, posted: '2026-02-02', colorClass: 'bg-slate-900' },
];

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { logout } = useAuth();

  const [view, setView] = useState<"list" | "details" | "interviews" | "jobs" | "users" | "messages" | "notifications">("list");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobCount] = useState<number>(mockJobs.length);
  const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([]);

  // Messages UI state
  const [messageMenuOpen, setMessageMenuOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedReportOption, setSelectedReportOption] = useState("inappropriate");
  const [activeChatIndex, setActiveChatIndex] = useState(0);

  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'messages') setView('messages');
  }, [searchParams]);

  const handleGoToApplicants = (job: any) => {
    setSelectedJob(job);
    setView("details");
  };

  const handleScheduleSuccess = (newInterview: any) => {
    setScheduledInterviews((prev) => [...prev, {
      id: newInterview.id || Date.now(),
      candidateName: newInterview.candidateName,
      role: newInterview.role,
      date: newInterview.date,
      time: newInterview.time,
      interviewer: newInterview.interviewer,
      type: newInterview.type,
      googleMeetLink: newInterview.googleMeetLink,  // ← this is the key one
      status: "Active"
    }]);
  };

  const returnToChat = () => {
    setIsComposing(false);
    setIsReporting(false);
  };

  // ── Messages panel (rendered inside main layout) ──────────────────────────
  const MessagesView = () => (
    <div className="flex h-full overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white" style={{ height: 'calc(100vh - 140px)' }}>

      {/* Left: Conversations list */}
      <aside className="w-[280px] bg-[#1a232f] text-white flex flex-col shrink-0 rounded-l-2xl">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Messages</h2>
          <button
            onClick={() => { setIsComposing(true); setIsReporting(false); }}
            className="p-1.5 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Edit size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 mb-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#2a3441] text-sm text-white rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-4 flex gap-2 mb-3">
          <button className="px-4 py-1 bg-[#7EB0AB] text-white text-xs font-semibold rounded-md">All</button>
          <button className="px-4 py-1 bg-[#4b5563] text-gray-300 text-xs font-semibold rounded-md hover:bg-gray-600 transition-colors">Archived</button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {/* Chat 1 */}
          <button
            onClick={() => { setActiveChatIndex(0); returnToChat(); }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${activeChatIndex === 0 && !isComposing && !isReporting ? 'bg-[#24303f]' : 'hover:bg-white/5'}`}
          >
            <div className="w-10 h-10 rounded-lg bg-[#53968b] text-white flex items-center justify-center text-sm font-bold shrink-0">TN</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold truncate text-white">HR Team @ TechFlow</p>
                <span className="text-[10px] text-gray-400 shrink-0 ml-1">2h ago</span>
              </div>
              <p className="text-xs truncate text-gray-400 mt-0.5">The hiring manager viewed you...</p>
            </div>
          </button>

          {/* Chat 2 */}
          <button
            onClick={() => { setActiveChatIndex(1); returnToChat(); }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${activeChatIndex === 1 && !isComposing && !isReporting ? 'bg-[#24303f]' : 'hover:bg-white/5'}`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Anne" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold truncate text-gray-200">Anne Smith</p>
                <span className="text-[10px] text-gray-400 shrink-0 ml-1">6h ago</span>
              </div>
              <p className="text-xs truncate text-gray-400 mt-0.5">Did you see the new brief for AI...</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Right: Chat area */}
      <div className="flex-1 flex flex-col min-w-0 rounded-r-2xl overflow-hidden bg-white">

        {isComposing ? (
          <>
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-[14px] font-bold text-slate-800 w-[90px] shrink-0">New message</span>
                <input type="text" placeholder="Type a name or multiple names" className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#53968b] placeholder-gray-400 text-slate-800" />
              </div>
              <div className="flex justify-between items-center sm:ml-[106px]">
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full bg-white">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Alice" className="w-7 h-7 rounded-full object-cover" />
                    <span className="text-[12px] font-bold text-slate-700">Alice Wendy</span>
                    <button className="text-gray-400 hover:text-gray-700 ml-1"><X size={14} /></button>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#7EB0AB] hover:bg-[#689893] text-white text-sm font-semibold rounded-lg transition-colors shrink-0 ml-4">Create Group</button>
              </div>
            </div>
            <div className="flex-1 bg-white" />
            <div className="px-5 py-3.5 bg-white border-t border-gray-100 flex items-center gap-3">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"><Paperclip size={18} /></button>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"><ImageIcon size={18} /></button>
              <input type="text" placeholder="Write a message..." className="flex-1 text-[14px] bg-transparent text-slate-800 placeholder-gray-400 focus:outline-none" />
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"><Smile size={18} /></button>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#53968b] hover:bg-[#438278] text-white shadow-sm"><Send size={16} className="ml-0.5" /></button>
            </div>
          </>

        ) : isReporting ? (
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <button onClick={returnToChat} className="flex items-center gap-2 text-sm font-bold text-[#53968b] hover:text-[#437d73] mb-6 transition-colors">
              <ArrowLeft size={16} /> Back to Messages
            </button>
            <div className="max-w-xl">
              <h2 className="text-xl font-bold text-slate-800 mb-1">Report Safety Concern</h2>
              <p className="text-[13px] text-gray-500 mb-6">Reports are handled confidentially by our trust and safety team.</p>
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl mb-8">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Alex" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-[13px] font-bold text-slate-800">Reporting: Alex Thompson</p>
                  <p className="text-[11px] text-gray-500">Senior Project Manager</p>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                {[
                  { value: 'inappropriate', label: 'Inappropriate behavior', desc: 'Unprofessional language, harassment, or offensive communication.' },
                  { value: 'spam', label: 'Spam or automated content', desc: 'Unsolicited marketing, bots, or excessive repetitive messages.' },
                  { value: 'scam', label: 'Suspicious job offer or scam', desc: 'Asking for bank details, external payments, or "get rich quick" schemes.' },
                ].map((opt) => (
                  <label key={opt.value} className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer border transition-colors ${selectedReportOption === opt.value ? 'border-[#53968b] bg-emerald-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="report" value={opt.value} checked={selectedReportOption === opt.value} onChange={(e) => setSelectedReportOption(e.target.value)} className="mt-0.5 w-4 h-4 text-[#53968b] focus:ring-[#53968b]" />
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">{opt.label}</p>
                      <p className="text-[12px] text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <textarea className="w-full border border-gray-200 rounded-xl p-3.5 text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#53968b] resize-none h-24 mb-6 placeholder-gray-400" placeholder="Additional details (optional)..." />
              <div className="flex justify-end gap-3">
                <button onClick={returnToChat} className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={returnToChat} className="px-5 py-2 bg-[#7EB0AB] hover:bg-[#689893] text-white rounded-lg text-sm font-bold transition-colors">Submit Report</button>
              </div>
            </div>
          </div>

        ) : (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                {activeChatIndex === 0 ? (
                  <div className="w-9 h-9 rounded-full bg-[#1e3a4f] text-white flex items-center justify-center text-sm font-bold">TN</div>
                ) : (
                  <div className="w-9 h-9 rounded-full overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Anne" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-[14px] font-bold text-slate-800">{activeChatIndex === 0 ? 'HR Team @ TechFlow' : 'Anne Smith'}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                    <span className="text-[10px] font-bold text-[#16a34a] uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setMessageMenuOpen(!messageMenuOpen)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                  <MoreVertical size={18} />
                </button>
                {messageMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMessageMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5">
                      <button onClick={() => { setIsBlockModalOpen(true); setMessageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"><Ban size={15} className="text-gray-400" /> Block</button>
                      <button onClick={() => { setIsReporting(true); setMessageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"><Flag size={15} className="text-gray-400" /> Report</button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              <div className="flex justify-center">
                <span className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-semibold uppercase tracking-wide rounded-full">Today</span>
              </div>
              {activeChatIndex === 0 ? (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden mt-1">
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div className="px-4 py-3 text-[13px] leading-relaxed bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm text-slate-700">
                      Hi John, thank you for applying for the position. We were quite impressed with your previous work.
                    </div>
                    <p className="text-[10px] text-gray-400 px-1">09:15 AM</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden mt-1">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Anne" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div className="px-4 py-3 text-[13px] leading-relaxed bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm text-slate-700">
                      Did you see the new brief for AI integration? I think we should discuss it soon.
                    </div>
                    <p className="text-[10px] text-gray-400 px-1">06:30 AM</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-5 py-3.5 bg-white border-t border-gray-100 flex items-center gap-3">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"><Paperclip size={18} /></button>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"><ImageIcon size={18} /></button>
              <input type="text" placeholder="Write a message..." className="flex-1 text-[14px] bg-transparent text-slate-800 placeholder-gray-400 focus:outline-none" />
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"><Smile size={18} /></button>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#53968b] hover:bg-[#438278] text-white shadow-sm"><Send size={16} className="ml-0.5" /></button>
            </div>
          </>
        )}
      </div>

      {/* Block modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-[340px] p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4 border border-red-100"><Ban size={26} strokeWidth={1.5} /></div>
            <h2 className="text-[18px] font-bold text-slate-800 mb-2">Block this Person?</h2>
            <p className="text-[12px] text-gray-500 mb-6">They won't be able to message you anymore.</p>
            <div className="w-full flex flex-col gap-2">
              <button onClick={() => setIsBlockModalOpen(false)} className="w-full py-2.5 bg-[#7EB0AB] hover:bg-[#689893] text-white text-[14px] font-bold rounded-xl transition-colors">Block</button>
              <button onClick={() => setIsBlockModalOpen(false)} className="w-full py-2.5 text-slate-600 text-[14px] font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ==========================================
  // MAIN RENDER — sidebar + header always visible
  // ==========================================
  return (
    <div className="flex h-screen w-full bg-[#f4f7f6] font-sans overflow-hidden">

      <Sidebar setView={setView} currentView={view} />

      <main className="flex-1 overflow-y-auto flex flex-col">

        <Header
          title={
            view === "list" ? "Dashboard" :
              view === "details" ? "Job Details" :
                view === "jobs" ? "Manage Jobs" :
                  view === "users" ? "Users" :
                    view === "interviews" ? "Interviews" :
                      view === "messages" ? "Messages" : "Dashboard"
          }
          jobCount={view === "list" ? jobCount : undefined}
          onNotificationsClick={() => setView("notifications")}
        />

        <div className="p-6 lg:p-8 flex-1 overflow-hidden">

          {/* ── Messages ── */}
          {view === "messages" && <MessagesView />}

          {/* ── Notifications ── */}
          {view === "notifications" && <Notifications />}

          {/* ── Dashboard ── */}
          {view === "list" && (
            <div className="animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
                {statsData.map((stat, index) => (
                  <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#7EB0AB]"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-[#7EB0AB]">
                        <stat.icon size={22} strokeWidth={2.5} />
                      </div>
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[11px] font-bold">
                        <TrendingUp size={12} /> {stat.trend}
                      </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-semibold mb-1">{stat.title}</h3>
                    <p className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</p>
                    <p className="text-xs text-slate-400 font-medium">{stat.subtitle}</p>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h2 className="text-[22px] font-bold text-slate-800 tracking-tight">Posted Jobs</h2>
                <p className="text-[13px] font-medium text-slate-500 mt-1">{jobCount} total jobs</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-visible">
                <div className="w-full overflow-x-auto pb-12">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <th className="px-8 py-5">Job</th>
                        <th className="px-6 py-5 text-center">Status</th>
                        <th className="px-6 py-5 text-center">Applications</th>
                        <th className="px-6 py-5 text-center">Posted</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-50">
                      {mockJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm ${job.colorClass}`}>
                                {job.initials}
                              </div>
                              <div>
                                <p className="font-bold text-slate-700 text-[15px]">{job.title}</p>
                                <p className="text-[12px] font-medium text-slate-400 mt-0.5">{job.company} - {job.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${job.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center font-bold text-slate-600">{job.applications}</td>
                          <td className="px-6 py-5 text-center text-slate-500 font-semibold text-[13px]">{job.posted}</td>
                          <td className="px-8 py-5 text-right">
                            <button
                              onClick={() => handleGoToApplicants(job)}
                              className="p-2.5 text-slate-400 hover:text-[#53968b] hover:bg-emerald-50 rounded-xl transition-all"
                              title="View Applicants"
                            >
                              <Eye size={20} strokeWidth={2} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {view === "jobs" && <ManageJobs />}
          {view === "users" && <UserPage />}
          {view === "details" && (
            <ApplicantsTable
              job={selectedJob}
              onBack={() => setView("list")}
              onScheduleSuccess={handleScheduleSuccess}
              onMessageClick={() => setView("messages")}
            />
          )}
          {view === "interviews" && <InterviewsPage interviews={scheduledInterviews} />}
        </div>
      </main>
    </div>
  );
}