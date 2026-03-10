'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from '@/lib/useAuth';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarDays,
  LogOut,
  Search,
  MessageSquare,
  Bell,
  MoreHorizontal,
  Eye,
  X,
  Check,
  TrendingUp,
  FileText,
  Menu,
  MessageCircle,
  ArrowLeft,
  Edit,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Send,
  BellOff,
  Archive,
  Ban,
  Flag,
  Trash2
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
  const { logout } = useAuth();

  // --- State ---
  const [view, setView] = useState<"list" | "details" | "interviews" | "jobs" | "users" | "messages">("list");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobCount, setJobCount] = useState<number>(mockJobs.length);
  const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageMenuOpen, setMessageMenuOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isReporting, setIsReporting] = useState(false); // STATE FOR REPORT UI
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false); // STATE FOR BLOCK MODAL
  const [selectedReportOption, setSelectedReportOption] = useState("inappropriate"); // State for radio buttons

  // --- Effects & Handlers ---
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'messages') {
      setView('messages');
    }
  }, [searchParams]);

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleScheduleSuccess = (newInterview: any) => {
    setScheduledInterviews((prev) => [...prev, newInterview]);
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
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
            <button onClick={() => setView('list')} className="flex items-center gap-3 text-white hover:text-gray-300 transition-colors">
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

          {/* Global Right Action Buttons */}
          <div className="absolute top-4 right-6 flex items-center gap-4 z-20">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#7EB0AB] hover:bg-[#689893] text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
              <MessageSquare size={16} /> Messages
            </button>
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <Bell size={20} /><span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#e8f1ef]"></span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm"><img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="User" className="w-full h-full object-cover" /></div>
          </div>

          {/* Chat Window Container */}
          <div className="flex-1 flex flex-col mt-20 mx-6 mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden z-10">

            {isComposing ? (
              // ==========================================
              // COMPOSE NEW MESSAGE UI
              // ==========================================
              <>
                {/* Header for New Message */}
                <div className="px-8 py-6 border-b border-gray-50 flex flex-col gap-5">
                  <div className="flex items-center gap-6">
                    <span className="text-[15px] font-bold text-slate-800 w-[100px] shrink-0">New message</span>
                    <input
                      type="text"
                      placeholder="Type a name or multiple names"
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#53968b] placeholder-gray-400 text-slate-800"
                    />
                  </div>

                  {/* Tags and Create Button */}
                  <div className="flex justify-between items-start sm:ml-[124px]">
                    <div className="flex flex-wrap gap-3">
                      {/* Tag 1: Alice Wendy */}
                      <div className="flex items-center gap-3 px-3 py-1.5 border border-gray-200 rounded-full shadow-sm bg-white">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Alice Wendy" className="w-8 h-8 rounded-full object-cover" />
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-slate-700 leading-tight">Alice Wendy</span>
                          <span className="text-[10px] text-gray-400 leading-tight">Wendy12@gmail.com</span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-700 ml-1 transition-colors"><X size={16} /></button>
                      </div>

                      {/* Tag 2: Alice Johnson */}
                      <div className="flex items-center gap-3 px-3 py-1.5 border border-gray-200 rounded-full shadow-sm bg-white">
                        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Alice Johnson" className="w-8 h-8 rounded-full object-cover" />
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-slate-700 leading-tight">Alice Johnson</span>
                          <span className="text-[10px] text-gray-400 leading-tight">Alicej@gmail.com</span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-700 ml-1 transition-colors"><X size={16} /></button>
                      </div>
                    </div>

                    <button className="px-5 py-2.5 bg-[#7EB0AB] hover:bg-[#689893] text-white text-sm font-medium rounded-lg transition-colors shadow-sm shrink-0 ml-4">
                      Create Group
                    </button>
                  </div>
                </div>

                {/* Empty Chat Area */}
                <div className="flex-1 overflow-y-auto bg-white"></div>

                {/* Input Area (Disabled style) */}
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
              // ==========================================
              // REPORT FEATURE UI
              // ==========================================
              <div className="flex-1 overflow-y-auto px-8 lg:px-14 py-10 bg-white">
                <button
                  onClick={returnToChat}
                  className="flex items-center gap-2 text-sm font-bold text-[#53968b] hover:text-[#437d73] mb-8 transition-colors"
                >
                  <ArrowLeft size={18} /> Back to Messages
                </button>

                <div className="max-w-2xl">
                  <h2 className="text-[22px] font-bold text-slate-800 mb-2">Report Safety Concern</h2>
                  <p className="text-[13px] text-gray-500 mb-8">Your safety is our priority. Reports are handled confidentially by our trust and safety team.</p>

                  {/* Reported User Profile Card */}
                  <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl mb-10">
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Alex Thompson" className="w-11 h-11 rounded-full object-cover shadow-sm" />
                    <div>
                      <p className="text-[14px] font-bold text-slate-800">Reporting: Alex Thompson</p>
                      <p className="text-[12px] text-gray-500 mt-0.5">Senior Project Manager</p>
                    </div>
                  </div>

                  <h3 className="text-[15px] font-bold text-slate-800 mb-4">What's the main reason for your report?</h3>

                  <div className="space-y-3 mb-10">
                    {/* Option 1 */}
                    <label className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-colors ${selectedReportOption === 'inappropriate' ? 'border-[#53968b] bg-emerald-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="report"
                        value="inappropriate"
                        checked={selectedReportOption === 'inappropriate'}
                        onChange={(e) => setSelectedReportOption(e.target.value)}
                        className="mt-0.5 w-4 h-4 text-[#53968b] focus:ring-[#53968b] border-gray-300"
                      />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-slate-800 mb-0.5">Inappropriate behavior</span>
                        <span className="text-[13px] text-gray-500">Unprofessional language, harassment, or offensive communication style.</span>
                      </div>
                    </label>

                    {/* Option 2 */}
                    <label className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-colors ${selectedReportOption === 'spam' ? 'border-[#53968b] bg-emerald-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="report"
                        value="spam"
                        checked={selectedReportOption === 'spam'}
                        onChange={(e) => setSelectedReportOption(e.target.value)}
                        className="mt-0.5 w-4 h-4 text-[#53968b] focus:ring-[#53968b] border-gray-300"
                      />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-slate-800 mb-0.5">Spam or automated content</span>
                        <span className="text-[13px] text-gray-500">Unsolicited marketing, bots, or excessive repetitive messages.</span>
                      </div>
                    </label>

                    {/* Option 3 */}
                    <label className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-colors ${selectedReportOption === 'scam' ? 'border-[#53968b] bg-emerald-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="report"
                        value="scam"
                        checked={selectedReportOption === 'scam'}
                        onChange={(e) => setSelectedReportOption(e.target.value)}
                        className="mt-0.5 w-4 h-4 text-[#53968b] focus:ring-[#53968b] border-gray-300"
                      />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-slate-800 mb-0.5">Suspicious job offer or scam</span>
                        <span className="text-[13px] text-gray-500">Asking for bank details, external payments, or "get rich quick" schemes.</span>
                      </div>
                    </label>

                    {/* Option 4 */}
                    <label className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-colors ${selectedReportOption === 'identity1' ? 'border-[#53968b] bg-emerald-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="report"
                        value="identity1"
                        checked={selectedReportOption === 'identity1'}
                        onChange={(e) => setSelectedReportOption(e.target.value)}
                        className="mt-0.5 w-4 h-4 text-[#53968b] focus:ring-[#53968b] border-gray-300"
                      />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-slate-800 mb-0.5">Identity theft or faking profile</span>
                        <span className="text-[13px] text-gray-500">Using a fake name, photo, or pretending to represent a company they don't.</span>
                      </div>
                    </label>

                    {/* Option 5 */}
                    <label className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-colors ${selectedReportOption === 'identity2' ? 'border-[#53968b] bg-emerald-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="report"
                        value="identity2"
                        checked={selectedReportOption === 'identity2'}
                        onChange={(e) => setSelectedReportOption(e.target.value)}
                        className="mt-0.5 w-4 h-4 text-[#53968b] focus:ring-[#53968b] border-gray-300"
                      />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-slate-800 mb-0.5">Identity theft or faking profile</span>
                        <span className="text-[13px] text-gray-500">None of the above matches my specific concern.</span>
                      </div>
                    </label>
                  </div>

                  <h3 className="text-[14px] font-bold text-slate-800 mb-3">Additional details (Optional)</h3>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl p-4 text-[14px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#53968b] resize-none h-28 mb-2 placeholder-gray-400"
                    placeholder="Please provide more context or specific examples to help us investigate..."
                  ></textarea>
                  <p className="text-[12px] text-gray-400 mb-8">Maximum 1000 characters.</p>

                  <div className="flex justify-end gap-3 mb-10">
                    <button
                      onClick={returnToChat}
                      className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={returnToChat} // For demo purposes, submitting returns to chat
                      className="px-6 py-2.5 bg-[#7EB0AB] hover:bg-[#689893] text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                    >
                      Submit Report
                    </button>
                  </div>
                </div>
              </div>

            ) : (
              // ==========================================
              // EXISTING CHAT UI
              // ==========================================
              <>
                {/* Header */}
                <div className="px-8 py-5 flex items-center justify-between border-b border-gray-50 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1e3a4f] text-white flex items-center justify-center text-sm font-bold shadow-sm">TN</div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-800">HR Team @ TechFlow</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span><span className="text-[11px] font-bold text-[#16a34a] uppercase tracking-wider">Online</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button onClick={() => setMessageMenuOpen(!messageMenuOpen)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                      <MoreVertical size={20} />
                    </button>

                    {/* Messages Option Menu */}
                    {messageMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMessageMenuOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-50 py-2">
                          <div className="px-4 py-2 border-b border-gray-50 mb-1">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Option Menu</span>
                          </div>
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"><BellOff size={16} className="text-gray-400" /> Mute Notification</button>
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"><Archive size={16} className="text-gray-400" /> Archive Conversation</button>
                          <div className="h-px bg-gray-100 my-1 mx-4"></div>

                          {/* TRIGGER BLOCK MODAL */}
                          <button
                            onClick={() => { setIsBlockModalOpen(true); setMessageMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                          >
                            <Ban size={16} className="text-gray-400" /> Block
                          </button>

                          {/* TRIGGER REPORT UI */}
                          <button
                            onClick={() => { setIsReporting(true); setMessageMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                          >
                            <Flag size={16} className="text-gray-400" /> Report
                          </button>

                          <div className="h-px bg-gray-100 my-1 mx-4"></div>
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"><Trash2 size={16} className="text-red-400" /> Delete Conversation</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Chat Bubbles */}
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 bg-white">
                  <div className="flex justify-center mb-8">
                    <span className="px-4 py-1 bg-gray-50 border border-gray-100 text-gray-500 text-[11px] font-semibold tracking-wide uppercase rounded-full">Today</span>
                  </div>

                  {/* Bubble 1: Incoming */}
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden shadow-sm mt-1">
                      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" />
                    </div>
                    <div className="flex flex-col gap-1.5 max-w-[70%] items-start">
                      <div className="px-5 py-3.5 text-[14px] leading-relaxed shadow-sm bg-white border border-gray-100 rounded-2xl rounded-tl-sm text-slate-700">
                        Hi John, thank you for applying for the Senior Executive VA position. We've reviewed your portfolio and were quite impressed with your previous work at TechFlow.
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium px-1 text-left">09:15 AM</p>
                    </div>
                  </div>

                  {/* Bubble 2: Outgoing */}
                  <div className="flex gap-3 justify-end">
                    <div className="flex flex-col gap-1.5 max-w-[70%] items-end">
                      <div className="px-5 py-3.5 text-[14px] leading-relaxed shadow-sm bg-[#7EB0AB] text-white rounded-2xl rounded-tr-sm">
                        Thank you so much! I'm really excited about the possibility of joining TechFlow. I'm available for the interview slot tomorrow at 2 PM as suggested.
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium px-1 text-right">10:42 AM</p>
                    </div>
                  </div>

                  {/* Bubble 3: Incoming */}
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden shadow-sm mt-1">
                      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" />
                    </div>
                    <div className="flex flex-col gap-1.5 max-w-[70%] items-start">
                      <div className="px-5 py-3.5 text-[14px] leading-relaxed shadow-sm bg-white border border-gray-100 rounded-2xl rounded-tl-sm text-slate-700">
                        Perfect. I've sent over the official calendar invite and the preliminary offer document for your review before our call.
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium px-1 text-left">10:45 AM</p>
                    </div>
                  </div>
                </div>

                {/* Input Area */}
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
            )}
          </div>
        </main>

        {/* ========================================== */}
        {/* BLOCKED CONFIRMATION MODAL OVERLAY */}
        {/* ========================================== */}
        {isBlockModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[24px] w-full max-w-[360px] p-8 shadow-2xl relative flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">

              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-5 border border-red-100">
                <Ban size={28} strokeWidth={1.5} />
              </div>

              <h2 className="text-[20px] font-bold text-slate-800 mb-2">Blocked this Person</h2>
              <p className="text-[13px] text-gray-500 mb-8 px-4">Are you sure you want to blocked this Person?</p>

              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => setIsBlockModalOpen(false)}
                  className="w-full py-3 bg-[#7EB0AB] hover:bg-[#689893] text-white text-[15px] font-bold rounded-xl transition-colors shadow-sm"
                >
                  Blocked
                </button>
                <button
                  onClick={() => setIsBlockModalOpen(false)}
                  className="w-full py-3 text-slate-600 text-[15px] font-bold hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // RENDER: DASHBOARD VIEW (DEFAULT)
  // ==========================================
  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] font-sans overflow-hidden">

      <Sidebar setView={setView} currentView={view} />

      <main className="flex-1 overflow-y-auto flex flex-col relative">

        <Header
          title={view === "list" ? "Dashboard" : view === "details" ? "Job Details" : view}
          jobCount={jobCount}
          
        />

        <div className="p-6 lg:p-10 flex-1">

          {/* Dashboard Main Stats & Table */}
          {view === "list" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-10">
                {statsData.map((stat, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-100"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-emerald-500">
                        <stat.icon size={20} />
                      </div>
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-xs font-semibold">
                        <TrendingUp size={12} />
                        {stat.trend}
                      </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.title}</h3>
                    <p className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.subtitle}</p>
                  </div>
                ))}
              </div>

              {/* Job Applicants Table */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-800">Job Applicants</h2>
                  <p className="text-sm text-slate-400">{jobCount} total jobs</p>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="text-xs font-semibold text-slate-400 border-b border-slate-100 bg-slate-50/50">
                        <th className="px-6 py-4 font-medium">Job</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Applications</th>
                        <th className="px-6 py-4 font-medium">Posted</th>
                        <th className="px-6 py-4 font-medium text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {mockJobs.map((job) => (
                        <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-none">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded flex items-center justify-center text-white font-semibold text-xs shrink-0 ${job.colorClass}`}>
                                {job.initials}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-700">{job.title}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{job.company} - {job.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${job.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                              }`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600">{job.applications}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium">{job.posted}</td>
                          <td className="px-6 py-4 text-center">

                            {/* Actions Dropdown */}
                            <div className="relative inline-block text-left">
                              <button
                                onClick={() => toggleMenu(job.id)}
                                className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none"
                              >
                                <MoreHorizontal size={18} />
                              </button>

                              {openMenuId === job.id && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                                  <div className="absolute right-0 mt-2 w-36 origin-top-right bg-white border border-slate-100 rounded-lg shadow-lg z-50 py-1">
                                    <button
                                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                      onClick={() => handleViewJob(job)}
                                    >
                                      <Eye size={16} className="text-slate-400" />
                                      View
                                    </button>
                                    <button
                                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                      onClick={() => setOpenMenuId(null)}
                                    >
                                      <X size={16} className="text-slate-400" />
                                      Reject
                                    </button>
                                    <button
                                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                      onClick={() => setOpenMenuId(null)}
                                    >
                                      <Check size={16} className="text-emerald-500" />
                                      Approved
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>

                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Sub-Components injected dynamically */}
          {view === "jobs" && <ManageJobs />}
          {view === "users" && <UserPage />}
          {view === "details" && (
            <ApplicantsTable job={selectedJob} onBack={() => setView("list")} onScheduleSuccess={handleScheduleSuccess} />
          )}
          {view === "interviews" && <InterviewsPage interviews={scheduledInterviews} />}

        </div>
      </main>

      {/* ── Applicant Modal Overlay ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">

            <div className="h-32 bg-[#4c8479] rounded-t-2xl relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-8 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-14 mb-8 relative z-10">
                <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-white shrink-0 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
                    alt="Applicant Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-3 pb-2">
                  <h2 className="text-2xl font-bold text-slate-800">John Doe</h2>
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-xs font-semibold">
                    Active
                  </span>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">1</div>
                  <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10">
                  <div><p className="text-xs text-slate-400 mb-1">Full Name</p><p className="font-semibold text-slate-800 text-sm">John Doe</p></div>
                  <div><p className="text-xs text-slate-400 mb-1">Email</p><p className="font-semibold text-slate-800 text-sm">john.doe@email.com</p></div>
                  <div><p className="text-xs text-slate-400 mb-1">Phone Number</p><p className="font-semibold text-slate-800 text-sm">+1 (555) 234-5678</p></div>
                  <div><p className="text-xs text-slate-400 mb-1">Location</p><p className="font-semibold text-slate-800 text-sm">San Francisco, CA</p></div>
                  <div><p className="text-xs text-slate-400 mb-1">Linkedin Url</p><p className="font-semibold text-slate-800 text-sm">linkedin.com/johndoe</p></div>
                  <div><p className="text-xs text-slate-400 mb-1">Portfolio Link</p><p className="font-semibold text-slate-800 text-sm">johndoe.com</p></div>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">2</div>
                  <h3 className="text-lg font-bold text-slate-800">Professional Experience</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10 mb-6">
                  <div><p className="text-xs text-slate-400 mb-1">Current Job Title</p><p className="font-semibold text-slate-800 text-sm">Virtual Assistant</p></div>
                  <div><p className="text-xs text-slate-400 mb-1">Company</p><p className="font-semibold text-slate-800 text-sm">CloudScale</p></div>
                  <div><p className="text-xs text-slate-400 mb-1">Years of Experience</p><p className="font-semibold text-slate-800 text-sm">6 years</p></div>
                </div>
                <div className="mb-6">
                  <p className="text-xs text-slate-400 mb-3">Skills & Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {["Executive Support", "Calendar Management", "Project Coordination", "CRM (Salesforce)", "Expense Tracking", "Technical Writing", "Notion & Slack"].map((skill) => (
                      <span key={skill} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-2">Why are you a good fit?</p>
                  <p className="text-sm text-slate-800 font-medium leading-relaxed">
                    I'm a good fit because I'm organized, detail-oriented, and proactive. I communicate with clarity, manage tasks efficiently, and anticipate needs to ensure executives can focus on high-level priorities.
                  </p>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">3</div>
                  <h3 className="text-lg font-bold text-slate-800">Resume</h3>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded border border-slate-200 text-slate-400"><FileText size={20} /></div>
                    <div><p className="text-sm font-semibold text-slate-800">John_Doe_Resume.pdf</p><p className="text-xs text-slate-400">2.4 MB</p></div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-700 transition-colors"><Eye size={20} /></button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setView("messages");
                  }}
                  className="px-6 py-2.5 rounded-lg bg-[#53968b] hover:bg-[#437d73] text-white text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <MessageCircle size={16} />
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}