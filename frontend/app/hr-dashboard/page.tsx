'use client';

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Notifications from "./Notifications";
import { useAuth } from '@/lib/useAuth';
import {
  LayoutDashboard, Users, Briefcase, CalendarDays, LogOut,
  Search, MessageSquare, Bell, MoreHorizontal, Eye, X, Check,
  TrendingUp, FileText, Menu, MessageCircle, ArrowLeft, Edit,
  MoreVertical, Paperclip, Image as ImageIcon, Smile, Send,
  BellOff, Archive, Ban, Flag, Trash2
} from "lucide-react";

// --- Sub-components ---
import Sidebar from "./Sidebar";
import Header from "./Header";
import ApplicantsTable from "./ApplicantsTable";
import InterviewsPage from "./InterviewsPage";
import ManageJobs from "./ManageJobs";
import UserPage from "./UserPage";

// --- Mock Data for Dashboard ---
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
  const router = useRouter(); // <-- Used to fix URL syncing
  const { logout } = useAuth();

  // --- State ---
  const [view, setView] = useState<"list" | "details" | "interviews" | "jobs" | "users" | "messages" | "settings" | "notifications">("list");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobCount, setJobCount] = useState<number>(mockJobs.length);
  const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([]);

  // UI States for Messages
  const [messageMenuOpen, setMessageMenuOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedReportOption, setSelectedReportOption] = useState("inappropriate");

  // --- Effects & Handlers ---
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'messages') {
      setView('messages');
    }
  }, [searchParams]);

  // Navigate to ApplicantsTable UI when Eye icon is clicked
  const handleGoToApplicants = (job: any) => {
    setSelectedJob(job);
    setView("details"); 
  };

  const handleScheduleSuccess = (newInterview: any) => {
    setScheduledInterviews((prev) => [...prev, newInterview]);
  };

  // Navigating back to main chat resets compose/report states
  const returnToChat = () => {
    setIsComposing(false);
    setIsReporting(false);
  };


  // ==========================================
  // RENDER: MESSAGES VIEW (FULL SCREEN)
  // ==========================================
  if (view === "messages") {
    return (
      <div className="flex h-screen w-full bg-[#e8f1ef] font-sans overflow-hidden">
        {/* Messages Sidebar (Dark) */}
        <aside className="w-[340px] bg-[#1a232f] text-white flex flex-col shrink-0">
          <div className="flex items-center gap-3 px-6 py-8">
            <div className="flex items-center justify-center w-8 h-8 bg-emerald-500/20 rounded">
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-b-[14px] border-b-emerald-400 border-r-[8px] border-r-transparent relative top-[-2px]"></div>
            </div>
            <span className="text-xl font-semibold tracking-wide text-gray-100">Recruiter</span>
          </div>

          <div className="px-6 flex items-center justify-between mb-6">
            <button 
              onClick={() => { setView('list'); router.push('/hr-dashboard'); }} // FIXED ROUTING
              className="flex items-center gap-3 text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeft size={22} />
              <h2 className="text-xl font-semibold">Messages</h2>
            </button>
            <button
              onClick={() => { setIsComposing(true); setIsReporting(false); }}
              className="p-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Edit size={16} />
            </button>
          </div>

          <div className="px-6 mb-5">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." className="w-full bg-[#2a3441] text-sm text-white rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder-gray-400" />
            </div>
          </div>

          <div className="px-6 flex gap-3 mb-4">
            <button className="px-6 py-1.5 bg-[#7EB0AB] text-white text-xs font-medium rounded-md shadow-sm">All</button>
            <button className="px-6 py-1.5 bg-[#4b5563] text-gray-300 text-xs font-medium rounded-md hover:bg-gray-600 transition-colors">Archived</button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <button
              onClick={returnToChat}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-left transition-colors ${!isComposing && !isReporting ? 'bg-[#24303f]' : 'hover:bg-white/5'}`}
            >
              <div className="w-11 h-11 rounded-lg bg-[#53968b] text-white flex items-center justify-center text-sm font-semibold shadow-sm">TN</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-semibold truncate text-white">HR Team @ TechFlow</p>
                  <span className="text-[11px] text-gray-400 shrink-0 ml-2">2h ago</span>
                </div>
                <p className="text-xs truncate text-gray-300">The hiring manager viewed you...</p>
              </div>
            </button>
            <button
              onClick={returnToChat}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-left hover:bg-white/5 transition-colors"
            >
              <div className="w-11 h-11 rounded-full overflow-hidden shrink-0"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Anne" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-semibold truncate text-gray-200">Anne Smith</p>
                  <span className="text-[11px] text-gray-400 shrink-0 ml-2">6h ago</span>
                </div>
                <p className="text-xs truncate text-gray-400">Did you see the new brief for AI...</p>
              </div>
            </button>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col relative min-w-0">
          <div className="absolute top-4 right-6 flex items-center gap-4 z-20">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#7EB0AB] hover:bg-[#689893] text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
              <MessageSquare size={16} /> Messages
            </button>
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <Bell size={20} /><span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#e8f1ef]"></span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm"><img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="User" className="w-full h-full object-cover" /></div>
          </div>

          <div className="flex-1 flex flex-col mt-20 mx-6 mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden z-10">

            {isComposing ? (
              // COMPOSE NEW MESSAGE UI
              <>
                <div className="px-8 py-6 border-b border-gray-50 flex flex-col gap-5">
                  <div className="flex items-center gap-6">
                    <span className="text-[15px] font-bold text-slate-800 w-[100px] shrink-0">New message</span>
                    <input type="text" placeholder="Type a name or multiple names" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#53968b] placeholder-gray-400 text-slate-800" />
                  </div>
                  <div className="flex justify-between items-start sm:ml-[124px]">
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-3 px-3 py-1.5 border border-gray-200 rounded-full shadow-sm bg-white">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Alice Wendy" className="w-8 h-8 rounded-full object-cover" />
                        <div className="flex flex-col"><span className="text-[13px] font-bold text-slate-700 leading-tight">Alice Wendy</span><span className="text-[10px] text-gray-400 leading-tight">Wendy12@gmail.com</span></div>
                        <button className="text-gray-400 hover:text-gray-700 ml-1 transition-colors"><X size={16} /></button>
                      </div>
                      <div className="flex items-center gap-3 px-3 py-1.5 border border-gray-200 rounded-full shadow-sm bg-white">
                        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Alice Johnson" className="w-8 h-8 rounded-full object-cover" />
                        <div className="flex flex-col"><span className="text-[13px] font-bold text-slate-700 leading-tight">Alice Johnson</span><span className="text-[10px] text-gray-400 leading-tight">Alicej@gmail.com</span></div>
                        <button className="text-gray-400 hover:text-gray-700 ml-1 transition-colors"><X size={16} /></button>
                      </div>
                    </div>
                    <button className="px-5 py-2.5 bg-[#7EB0AB] hover:bg-[#689893] text-white text-sm font-medium rounded-lg transition-colors shadow-sm shrink-0 ml-4">Create Group</button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-white"></div>
                <div className="px-6 py-4 bg-white border-t border-gray-50 flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-400 shrink-0">
                    <button className="p-2 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"><Paperclip size={20} /></button>
                    <button className="p-2 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"><ImageIcon size={20} /></button>
                  </div>
                  <input type="text" placeholder="Write a message..." className="flex-1 text-[15px] bg-transparent text-slate-800 placeholder-gray-400 focus:outline-none" />
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"><Smile size={20} /></button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#53968b] hover:bg-[#438278] text-white shadow-sm ml-1"><Send size={18} className="ml-0.5" /></button>
                  </div>
                </div>
              </>

            ) : isReporting ? (
              // REPORT FEATURE UI
              <div className="flex-1 overflow-y-auto px-8 lg:px-14 py-10 bg-white">
                <button onClick={returnToChat} className="flex items-center gap-2 text-sm font-bold text-[#53968b] hover:text-[#437d73] mb-8 transition-colors"><ArrowLeft size={18} /> Back to Messages</button>
                <div className="max-w-2xl">
                  <h2 className="text-[22px] font-bold text-slate-800 mb-2">Report Safety Concern</h2>
                  <p className="text-[13px] text-gray-500 mb-8">Your safety is our priority. Reports are handled confidentially by our trust and safety team.</p>
                  <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl mb-10">
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Alex Thompson" className="w-11 h-11 rounded-full object-cover shadow-sm" />
                    <div>
                      <p className="text-[14px] font-bold text-slate-800">Reporting: Alex Thompson</p>
                      <p className="text-[12px] text-gray-500 mt-0.5">Senior Project Manager</p>
                    </div>
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-800 mb-4">What's the main reason for your report?</h3>
                  <div className="space-y-3 mb-10">
                    {/* Simplified Radio Options for brevity */}
                    <label className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-colors ${selectedReportOption === 'inappropriate' ? 'border-[#53968b] bg-emerald-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="report" value="inappropriate" checked={selectedReportOption === 'inappropriate'} onChange={(e) => setSelectedReportOption(e.target.value)} className="mt-0.5 w-4 h-4 text-[#53968b] focus:ring-[#53968b] border-gray-300" />
                      <div className="flex flex-col"><span className="text-[14px] font-bold text-slate-800 mb-0.5">Inappropriate behavior</span><span className="text-[13px] text-gray-500">Unprofessional language, harassment, or offensive communication style.</span></div>
                    </label>
                  </div>
                  <h3 className="text-[14px] font-bold text-slate-800 mb-3">Additional details (Optional)</h3>
                  <textarea className="w-full border border-gray-200 rounded-xl p-4 text-[14px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#53968b] resize-none h-28 mb-2 placeholder-gray-400" placeholder="Please provide more context or specific examples to help us investigate..."></textarea>
                  <p className="text-[12px] text-gray-400 mb-8">Maximum 1000 characters.</p>
                  <div className="flex justify-end gap-3 mb-10">
                    <button onClick={returnToChat} className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={returnToChat} className="px-6 py-2.5 bg-[#7EB0AB] hover:bg-[#689893] text-white rounded-lg text-sm font-bold transition-colors shadow-sm">Submit Report</button>
                  </div>
                </div>
              </div>

            ) : (
              // EXISTING CHAT UI
              <>
                <div className="px-8 py-5 flex items-center justify-between border-b border-gray-50 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1e3a4f] text-white flex items-center justify-center text-sm font-bold shadow-sm">TN</div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-800">HR Team @ TechFlow</p>
                      <div className="flex items-center gap-1.5 mt-0.5"><span className="w-2 h-2 rounded-full bg-[#22c55e]"></span><span className="text-[11px] font-bold text-[#16a34a] uppercase tracking-wider">Online</span></div>
                    </div>
                  </div>
                  <div className="relative">
                    <button onClick={() => setMessageMenuOpen(!messageMenuOpen)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors"><MoreVertical size={20} /></button>
                    {messageMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMessageMenuOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-50 py-2">
                          <button onClick={() => { setIsBlockModalOpen(true); setMessageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"><Ban size={16} className="text-gray-400" /> Block</button>
                          <button onClick={() => { setIsReporting(true); setMessageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"><Flag size={16} className="text-gray-400" /> Report</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 bg-white">
                  <div className="flex justify-center mb-8"><span className="px-4 py-1 bg-gray-50 border border-gray-100 text-gray-500 text-[11px] font-semibold tracking-wide uppercase rounded-full">Today</span></div>
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden shadow-sm mt-1"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" /></div>
                    <div className="flex flex-col gap-1.5 max-w-[70%] items-start">
                      <div className="px-5 py-3.5 text-[14px] leading-relaxed shadow-sm bg-white border border-gray-100 rounded-2xl rounded-tl-sm text-slate-700">Hi John, thank you for applying for the position. We were quite impressed with your previous work.</div>
                      <p className="text-[11px] text-gray-400 font-medium px-1 text-left">09:15 AM</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-white border-t border-gray-50 flex items-center gap-4">
                  <input type="text" placeholder="Write a message..." className="flex-1 text-[15px] bg-transparent text-slate-800 placeholder-gray-400 focus:outline-none" />
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#53968b] hover:bg-[#438278] text-white shadow-sm ml-1"><Send size={18} className="ml-0.5" /></button>
                </div>
              </>
            )}
          </div>
        </main>

        {isBlockModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[24px] w-full max-w-[360px] p-8 shadow-2xl relative flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-5 border border-red-100"><Ban size={28} strokeWidth={1.5} /></div>
              <h2 className="text-[20px] font-bold text-slate-800 mb-2">Block this Person</h2>
              <div className="w-full flex flex-col gap-3 mt-4">
                <button onClick={() => setIsBlockModalOpen(false)} className="w-full py-3 bg-[#7EB0AB] hover:bg-[#689893] text-white text-[15px] font-bold rounded-xl transition-colors shadow-sm">Block</button>
                <button onClick={() => setIsBlockModalOpen(false)} className="w-full py-3 text-slate-600 text-[15px] font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER: DASHBOARD VIEW (NEW CLEAN UI)
  // ==========================================
  return (
    <div className="flex h-screen w-full bg-[#f4f7f6] font-sans overflow-hidden">

      <Sidebar setView={setView} currentView={view} />

      <main className="flex-1 overflow-y-auto flex flex-col relative">

        <Header
          title={view === "list" ? "Dashboard" : view === "details" ? "Job Details" : view === "jobs" ? "Manage Jobs" : view === "users" ? "Users" : view === "interviews" ? "Interviews" : "Dashboard"}
          jobCount={view === "list" ? jobCount : undefined}
          onMessagesClick={() => {
            setView("messages");
            router.push("/hr-dashboard?view=messages");
          }}
          onNotificationsClick={() => setView("notifications")}
        />

        <div className="p-6 lg:p-10 flex-1">
          {view === "notifications" && <Notifications />}

          {/* MAIN DASHBOARD: Posted Jobs & Eye Icons Only */}
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
                      <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-white">
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
                              className="p-2.5 text-slate-400 hover:text-[#53968b] hover:bg-emerald-50 rounded-xl transition-all focus:outline-none"
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

          {/* Sub-Components injected dynamically */}
          {view === "jobs" && <ManageJobs />}
          {view === "users" && <UserPage />}
          
          {/* Detailed Applicants Table (with 3-dots inside it) */}
          {view === "details" && (
            <ApplicantsTable 
              job={selectedJob} 
              onBack={() => setView("list")} 
              onScheduleSuccess={handleScheduleSuccess} 
              onMessageClick={() => {
                setView("messages");
                router.push("/hr-dashboard?view=messages");
              }}
            />
          )}
          
          {view === "interviews" && <InterviewsPage interviews={scheduledInterviews} />}

        </div>
      </main>
    </div>
  );
}