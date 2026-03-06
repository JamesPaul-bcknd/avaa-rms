'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from '@/lib/useAuth';
import {
  MoreHorizontal,
  Eye,
  X,
  Check,
  TrendingUp,
  FileText,
  MessageCircle,
  Users,
  Briefcase,
  User,
  Calendar,
  Clock
} from "lucide-react";

// --- Sub-components ---
import Sidebar from "./Sidebar";
import Header from "./Header";
import ApplicantsTable from "./ApplicantsTable";
import InterviewsPage from "./InterviewsPage";
import ManageJobs from "./ManageJobs";
import UserPage from "./UserPage";
import Newmessage from "./Newmessage";
import ProfileSettings from "./profile/profilesettings";

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
  const [view, setView] = useState<"list" | "details" | "interviews" | "jobs" | "users" | "messages" | "settings">("list");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobCount, setJobCount] = useState<number>(mockJobs.length);
  const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [actionCandidate, setActionCandidate] = useState<any>(null);

  // Form States for Modals
  const [interviewDate, setInterviewDate] = useState('2025-02-19');
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [interviewType, setInterviewType] = useState('Online Interview');
  const [interviewer, setInterviewer] = useState('John Smith');
  const [rejectMessage, setRejectMessage] = useState('');

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

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // ── Modal Actions ──
  const openAcceptModal = (job: any) => {
    setActionCandidate({ name: "Alice Johnson", email: "alice@example.com", role: job.title });
    setIsAcceptOpen(true);
    setOpenMenuId(null);
  };

  const openRejectModal = (job: any) => {
    setActionCandidate({ name: "Alice Johnson", email: "alice@example.com", role: job.title });
    setIsRejectOpen(true);
    setOpenMenuId(null);
  };

  const handleScheduleInterview = () => {
    const newInterview = {
      id: Date.now(),
      candidateName: actionCandidate.name,
      role: actionCandidate.role,
      date: `${interviewDate} ${interviewTime}`,
      interviewer: interviewer,
      status: 'Upcoming'
    };

    setScheduledInterviews([...scheduledInterviews, newInterview]);
    setIsAcceptOpen(false);
    setView('interviews');
  };

  const handleSendRejection = () => {
    setIsRejectOpen(false);
    setRejectMessage('');
  };

  const handleScheduleSuccess = (newInterview: any) => {
    setScheduledInterviews((prev) => [...prev, newInterview]);
  };

  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] font-sans overflow-hidden">

      {/* --- SIDEBAR --- */}
      {view !== 'messages' && (
        <Sidebar setView={setView} currentView={view} />
      )}

      {/* ── Main Content Area ── */}
      <main className="flex-1 overflow-y-auto flex flex-col pt-14 lg:pt-0 relative">

        {/* --- HEADER --- */}
        {view !== 'messages' && (
          <Header
            title={
              view === "list" ? "Dashboard" :
                view === "details" ? "Job Details" :
                  view === "jobs" ? "Manage Jobs" :
                    view === "users" ? "Users" :
                      view === "interviews" ? "Interviews" :
                        "Dashboard"
            }
            jobCount={view === "list" ? jobCount : undefined}
            onMessagesClick={() => setView("messages")}
            onSettingsClick={() => setView("settings")}
          />
        )}

        {/* Dynamic View Container */}
        {view !== 'messages' && (
          <div className="p-6 lg:p-10 flex-1">

            {/* Dashboard View (Stats + Table) */}
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
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-visible pb-12">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Job Applicants</h2>
                    <p className="text-sm text-slate-400">{jobCount} total jobs</p>
                  </div>

                  <div className="w-full overflow-visible">
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
                      <tbody className="text-sm divide-y divide-slate-50">
                        {mockJobs.map((job) => (
                          <tr key={job.id} className="hover:bg-slate-50 transition-colors">
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
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${job.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
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
                                    <div className="absolute right-0 mt-2 w-36 origin-top-right bg-white border border-slate-100 rounded-lg shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                      <button
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                        onClick={() => handleViewJob(job)}
                                      >
                                        <Eye size={16} className="text-slate-400" />
                                        View
                                      </button>
                                      <button
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                        onClick={() => openRejectModal(job)}
                                      >
                                        <X size={16} className="text-slate-400" />
                                        Reject
                                      </button>
                                      <button
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                        onClick={() => openAcceptModal(job)}
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
            {view === "settings" && <ProfileSettings onBack={() => setView("list")} />}
          </div>
        )}

        {/* RENDER NEWMESSAGE COMPONENT (Takes full screen) */}
        {view === "messages" && <Newmessage onBack={() => setView('list')} />}

      </main>

      {/* ========================================== */}
      {/* MODAL 1: ACCEPT APPLICATION (WIDER/CLEANER) */}
      {/* ========================================== */}
      {isAcceptOpen && actionCandidate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-[600px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-8">

            {/* Header */}
            <div className="flex items-center justify-between p-6 px-8 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Accept Application</h2>
              <button onClick={() => setIsAcceptOpen(false)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-8">
              {/* Applicant Profile Box */}
              <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 bg-[#6ebea3] rounded-[20px] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <User size={36} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-[26px] font-bold text-slate-800 leading-tight">{actionCandidate.name}</h3>
                  <p className="text-[15px] font-medium text-slate-400 mt-0.5">{actionCandidate.email}</p>
                </div>
              </div>

              {/* Form Fields (Grid Layout for better alignment) */}
              <div className="space-y-5">

                {/* Interview Date Row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="text-[15px] font-bold text-slate-700 w-36 shrink-0">Interview Date:</label>
                  <div className="flex gap-3 flex-1">
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Calendar size={16} />
                      </div>
                      <input
                        type="date"
                        value={interviewDate}
                        onChange={e => setInterviewDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-[15px] font-medium text-slate-600 focus:outline-none focus:border-[#6ebea3] focus:ring-1 focus:ring-[#6ebea3] transition-all"
                      />
                    </div>
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Clock size={16} />
                      </div>
                      <input
                        type="time"
                        value={interviewTime}
                        onChange={e => setInterviewTime(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-[15px] font-medium text-slate-600 focus:outline-none focus:border-[#6ebea3] focus:ring-1 focus:ring-[#6ebea3] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Interview Type Row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="text-[15px] font-bold text-slate-700 w-36 shrink-0">Interview Type:</label>
                  <select
                    value={interviewType}
                    onChange={e => setInterviewType(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] font-medium text-slate-600 focus:outline-none focus:border-[#6ebea3] focus:ring-1 focus:ring-[#6ebea3] transition-all appearance-none"
                  >
                    <option>Online Interview</option>
                    <option>In-Person Interview</option>
                  </select>
                </div>

                {/* Interviewer Row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="text-[15px] font-bold text-slate-700 w-36 shrink-0">Interviewer:</label>
                  <select
                    value={interviewer}
                    onChange={e => setInterviewer(e.target.value)}
                    className="w-full sm:w-1/2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] font-medium text-slate-600 focus:outline-none focus:border-[#6ebea3] focus:ring-1 focus:ring-[#6ebea3] transition-all appearance-none"
                  >
                    <option>John Smith</option>
                    <option>Sarah Chen</option>
                    <option>Michael Scott</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 px-8 flex justify-end gap-3">
              <button
                onClick={() => setIsAcceptOpen(false)}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-[15px] font-bold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleScheduleInterview}
                className="px-6 py-3 rounded-xl bg-[#86C9B5] text-white text-[15px] font-bold hover:bg-[#6eab99] transition-colors shadow-md shadow-[#86C9B5]/20 active:scale-95"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: REJECT APPLICATION (WIDER/CLEANER) */}
      {/* ========================================== */}
      {isRejectOpen && actionCandidate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-[600px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-8">

            {/* Header */}
            <div className="flex items-center justify-between p-6 px-8 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Reject Application</h2>
              <button onClick={() => setIsRejectOpen(false)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-8 pb-6">
              {/* Applicant Profile Box */}
              <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 bg-[#6ebea3] rounded-[20px] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <User size={36} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-[26px] font-bold text-slate-800 leading-tight">{actionCandidate.name}</h3>
                  <p className="text-[15px] font-medium text-slate-400 mt-0.5">{actionCandidate.email}</p>
                </div>
              </div>

              {/* Message Box */}
              <div className="space-y-3">
                <label className="text-[15px] font-bold text-slate-800">Message</label>
                <textarea
                  rows={5}
                  value={rejectMessage}
                  onChange={e => setRejectMessage(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-4 text-[15px] text-slate-600 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none transition-all placeholder-slate-400"
                  placeholder="Type your rejection feedback here..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 px-8 flex justify-end gap-3">
              <button
                onClick={() => setIsRejectOpen(false)}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-[15px] font-bold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSendRejection}
                className="px-6 py-3 rounded-xl bg-[#ff4d4f] text-white text-[15px] font-bold hover:bg-[#e03133] transition-colors shadow-md shadow-red-500/20 active:scale-95"
              >
                Send Rejection
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── View Applicant Details Modal (Your Existing Modal) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
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