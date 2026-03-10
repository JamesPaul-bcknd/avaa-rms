"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import AuthPromptModal from "@/components/AuthPromptModal";
import { messagesApi } from "@/lib/messages";
import api from "@/lib/axios";

import { Job } from "./types";
import TopBar from "./components/TopBar";
import FilterSidebar from "./components/FilterSidebar";
import JobCard from "./components/JobCard";
import JobDetailPanel from "./components/JobDetailPanel";
import ApplyModal from "./components/ApplyModal";
import LogoutConfirmModal from "./components/LogoutConfirmModal";

import {
  Edit, Search, MoreVertical, Paperclip, Image as ImageIcon,
  Smile, Send, Ban, Flag, ArrowLeft, X
} from "lucide-react";

export default function UserDashboardPage() {
  const { isLoading, isAuthenticated, user } = useAuth({ redirect: false });

  // ── State ────────────────────────────────────────────────
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"grid" | "details">("grid");
  const [lastSelectedJob, setLastSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeDateFilter, setActiveDateFilter] = useState("All Time");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [bookmarked, setBookmarked] = useState<number[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [visibleIds, setVisibleIds] = useState<number[]>([]);
  const prevFilteredIds = useRef<number[]>([]);

  // ── Messages state ────────────────────────────────────────
  const [activeChatIndex, setActiveChatIndex] = useState(0);
  const [messageMenuOpen, setMessageMenuOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedReportOption, setSelectedReportOption] = useState("inappropriate");

  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Derived user info ─────────────────────────────────────
  const userName = user?.name || "User";
  const userInitials = userName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "U";
  const userEmail = user?.email || "";
  const profileImageUrl = user?.profile_image_url || null;

  const allTags = jobs.length > 0 ? Array.from(new Set(jobs.flatMap((j) => j.tags || []))) : [];
  const companies = jobs.length > 0 ? Array.from(new Set(jobs.map((j) => j.company))).sort() : [];

  // ── Effects ───────────────────────────────────────────────
  useEffect(() => {
    const recruiterId = searchParams.get("recruiterId");
    if (recruiterId && isAuthenticated) {
      router.push(`/user/messages?userId=${recruiterId}`);
    }
  }, [searchParams, isAuthenticated, router]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await messagesApi.getUnreadCount();
          setUnreadCount(response.data.unread_count);
        } catch (error) {
          console.error("Failed to fetch unread count:", error);
        }
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/jobs`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const formattedJobs = result.data.map((job: any) => ({
            ...job,
            tags: job.tags || [],
            whatYoullDo: job.what_youll_do || job.whatYoullDo || [],
            whyCompany: job.why_company || job.whyCompany || [],
            timeAgo: job.time_ago || job.timeAgo || "Just now",
          }));
          setJobs(formattedJobs);
          if (formattedJobs.length > 0) setSelectedJob(formattedJobs[0]);
        } else {
          setJobs([]);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => { document.title = "Dashboard | AVAA"; }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUserBookmarks = async () => {
      try {
        const response = await api.get("/bookmarks");
        setBookmarked(response.data);
      } catch (error) {
        console.error("Could not load bookmarks", error);
      }
    };
    fetchUserBookmarks();
  }, [isAuthenticated]);

  // ── Filtering ─────────────────────────────────────────────
  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter((job) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        (job.tags || []).some((tag: string) => tag.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    if (activeDateFilter !== "All Time") {
      const jobDate = job?.timeAgo || "";
      if (activeDateFilter === "Today") {
        const isToday = jobDate.includes("h ago") || jobDate.includes("m ago") || jobDate === "Just now";
        if (!isToday) return false;
      }
    }
    if (selectedSkills.length > 0) {
      if (!selectedSkills.every((skill) => (job.tags || []).includes(skill))) return false;
    }
    if (selectedCompanies.length > 0) {
      if (!selectedCompanies.includes(job.company)) return false;
    }
    return true;
  });

  useEffect(() => {
    if (!Array.isArray(filteredJobs)) return;
    const newIds = filteredJobs.map((j) => j.id);
    const removed = prevFilteredIds.current.filter((id) => !newIds.includes(id));
    if (removed.length > 0) setVisibleIds((prev) => prev.filter((id) => !removed.includes(id)));
    newIds.forEach((id, i) => {
      setTimeout(() => setVisibleIds((prev) => (prev.includes(id) ? prev : [...prev, id])), i * 60);
    });
    prevFilteredIds.current = newIds;
    if (selectedJob && !newIds.includes(selectedJob.id)) setSelectedJob(null);
  }, [searchQuery, selectedSkills, selectedCompanies, activeDateFilter, filteredJobs, selectedJob]);

  useEffect(() => {
    setVisibleIds([]);
    jobs.forEach((job, i) => {
      setTimeout(() => setVisibleIds((prev) => [...prev, job.id]), i * 80);
    });
    prevFilteredIds.current = jobs.map((j) => j.id);
  }, [jobs]);

  // ── Handlers ──────────────────────────────────────────────
  const handleSelectJob = (job: Job) => {
    if (job.id === lastSelectedJob?.id && activeView === "details") return;
    setLastSelectedJob(job);
    setSelectedJob(job);
    setActiveView("details");
  };

  const handleClearSelection = () => {
    if (activeView === "grid") return;
    setActiveView("grid");
    setTimeout(() => setSelectedJob(null), 500);
  };

  const toggleSkill = (skill: string) => setSelectedSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  const toggleCompany = (company: string) => setSelectedCompanies((prev) => prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]);

  const toggleBookmark = async (jobId: number) => {
    const numericId = Number(jobId);
    try {
      setBookmarked((prev) => {
        const isCurrentlySaved = prev.map(Number).includes(numericId);
        return isCurrentlySaved ? prev.filter((id) => Number(id) !== numericId) : [...prev, numericId];
      });
      const response = await api.post(`/jobs/${numericId}/bookmark`);
      const isSavedOnServer = response.data.saved;
      setBookmarked((prev) => {
        const exists = prev.map(Number).includes(numericId);
        if (isSavedOnServer && !exists) return [...prev, numericId];
        if (!isSavedOnServer && exists) return prev.filter((id) => Number(id) !== numericId);
        return prev;
      });
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      setBookmarked((prev) => prev.filter((id) => Number(id) !== numericId));
    }
  };

  const clearFilters = () => { setSelectedSkills([]); setSelectedCompanies([]); setSearchQuery(""); };
  const returnToChat = () => { setIsComposing(false); setIsReporting(false); };

  if (isLoading) return null;

  // ── Messages UI ───────────────────────────────────────────
  const MessagesView = () => (
    <div
      className="flex overflow-hidden rounded-2xl border border-[#e5e7eb] shadow-sm bg-white"
      style={{ height: "calc(100vh - 160px)" }}
    >
      {/* Left: Conversations list */}
      <aside className="w-[270px] bg-[#1a232f] text-white flex flex-col shrink-0 rounded-l-2xl">
        <div className="px-5 pt-6 pb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-white">Messages</h2>
          <button
            onClick={() => { setIsComposing(true); setIsReporting(false); }}
            className="p-1.5 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Edit size={14} />
          </button>
        </div>

        <div className="px-4 mb-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." className="w-full bg-[#2a3441] text-sm text-white rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#7EB0AB]/50 placeholder-gray-400" />
          </div>
        </div>

        <div className="px-4 flex gap-2 mb-3">
          <button className="px-4 py-1 bg-[#7EB0AB] text-white text-xs font-semibold rounded-md">All</button>
          <button className="px-4 py-1 bg-[#4b5563] text-gray-300 text-xs font-semibold rounded-md hover:bg-gray-600 transition-colors">Archived</button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          <button
            onClick={() => { setActiveChatIndex(0); returnToChat(); }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${activeChatIndex === 0 && !isComposing && !isReporting ? "bg-[#24303f]" : "hover:bg-white/5"}`}
          >
            <div className="w-10 h-10 rounded-lg bg-[#7EB0AB] text-white flex items-center justify-center text-sm font-bold shrink-0">TN</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold truncate text-white">HR Team @ TechFlow</p>
                <span className="text-[10px] text-gray-400 shrink-0 ml-1">2h ago</span>
              </div>
              <p className="text-xs truncate text-gray-400 mt-0.5">The hiring manager viewed you...</p>
            </div>
          </button>

          <button
            onClick={() => { setActiveChatIndex(1); returnToChat(); }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${activeChatIndex === 1 && !isComposing && !isReporting ? "bg-[#24303f]" : "hover:bg-white/5"}`}
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
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-[14px] font-bold text-[#1a1a1a] w-[90px] shrink-0">New message</span>
                <input type="text" placeholder="Type a name or multiple names" className="flex-1 px-4 py-2 border border-[#e5e7eb] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#7EB0AB] placeholder-gray-400 text-[#1a1a1a]" />
              </div>
              <div className="flex justify-between items-center sm:ml-[106px]">
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 border border-[#e5e7eb] rounded-full bg-white">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Alice" className="w-7 h-7 rounded-full object-cover" />
                    <span className="text-[12px] font-bold text-[#1a1a1a]">Alice Wendy</span>
                    <button className="text-gray-400 hover:text-gray-700 ml-1"><X size={14} /></button>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#7EB0AB] hover:bg-[#6a9e99] text-white text-sm font-semibold rounded-xl transition-colors shrink-0 ml-4">Create Group</button>
              </div>
            </div>
            <div className="flex-1 bg-white" />
            <div className="px-5 py-3.5 border-t border-[#f0f2f5] flex items-center gap-3">
              <button className="p-1.5 text-[#9ca3af] hover:text-[#5a6a75] rounded-full transition-colors"><Paperclip size={18} /></button>
              <button className="p-1.5 text-[#9ca3af] hover:text-[#5a6a75] rounded-full transition-colors"><ImageIcon size={18} /></button>
              <input type="text" placeholder="Write a message..." className="flex-1 text-[14px] bg-transparent text-[#1a1a1a] placeholder-gray-400 focus:outline-none" />
              <button className="p-1.5 text-[#9ca3af] hover:text-[#5a6a75] rounded-full transition-colors"><Smile size={18} /></button>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#7EB0AB] hover:bg-[#6a9e99] text-white shadow-sm"><Send size={15} className="ml-0.5" /></button>
            </div>
          </>

        ) : isReporting ? (
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <button onClick={returnToChat} className="flex items-center gap-2 text-sm font-bold text-[#7EB0AB] hover:text-[#6a9e99] mb-6 transition-colors">
              <ArrowLeft size={16} /> Back to Messages
            </button>
            <div className="max-w-xl">
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-1">Report Safety Concern</h2>
              <p className="text-[13px] text-[#5a6a75] mb-6">Reports are handled confidentially by our trust and safety team.</p>
              <div className="flex items-center gap-3 p-4 border border-[#e5e7eb] rounded-xl mb-8">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Alex" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-[13px] font-bold text-[#1a1a1a]">Reporting: Alex Thompson</p>
                  <p className="text-[11px] text-[#5a6a75]">Senior Project Manager</p>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                {[
                  { value: "inappropriate", label: "Inappropriate behavior", desc: "Unprofessional language, harassment, or offensive communication." },
                  { value: "spam", label: "Spam or automated content", desc: "Unsolicited marketing, bots, or excessive repetitive messages." },
                  { value: "scam", label: "Suspicious job offer or scam", desc: 'Asking for bank details, external payments, or "get rich quick" schemes.' },
                ].map((opt) => (
                  <label key={opt.value} className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer border transition-colors ${selectedReportOption === opt.value ? "border-[#7EB0AB] bg-[#e6f7f2]" : "border-[#e5e7eb] hover:bg-[#f5f7fa]"}`}>
                    <input type="radio" name="report" value={opt.value} checked={selectedReportOption === opt.value} onChange={(e) => setSelectedReportOption(e.target.value)} className="mt-0.5 w-4 h-4 text-[#7EB0AB] focus:ring-[#7EB0AB]" />
                    <div>
                      <p className="text-[13px] font-bold text-[#1a1a1a]">{opt.label}</p>
                      <p className="text-[12px] text-[#5a6a75]">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <textarea className="w-full border border-[#e5e7eb] rounded-xl p-3.5 text-[13px] text-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#7EB0AB] resize-none h-24 mb-6 placeholder-gray-400" placeholder="Additional details (optional)..." />
              <div className="flex justify-end gap-3">
                <button onClick={returnToChat} className="px-5 py-2 border border-[#e5e7eb] rounded-xl text-sm font-bold text-[#5a6a75] hover:bg-[#f5f7fa] transition-colors">Cancel</button>
                <button onClick={returnToChat} className="px-5 py-2 bg-[#7EB0AB] hover:bg-[#6a9e99] text-white rounded-xl text-sm font-bold transition-colors">Submit Report</button>
              </div>
            </div>
          </div>

        ) : (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#f0f2f5]">
              <div className="flex items-center gap-3">
                {activeChatIndex === 0 ? (
                  <div className="w-9 h-9 rounded-full bg-[#1e3a4f] text-white flex items-center justify-center text-sm font-bold">TN</div>
                ) : (
                  <div className="w-9 h-9 rounded-full overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Anne" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-[14px] font-bold text-[#1a1a1a]">{activeChatIndex === 0 ? "HR Team @ TechFlow" : "Anne Smith"}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setMessageMenuOpen(!messageMenuOpen)} className="p-2 text-[#9ca3af] hover:bg-[#f0f2f5] rounded-full transition-colors">
                  <MoreVertical size={17} />
                </button>
                {messageMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMessageMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-[#e5e7eb] rounded-xl shadow-lg z-50 py-1.5">
                      <button onClick={() => { setIsBlockModalOpen(true); setMessageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-[#5a6a75] hover:bg-[#f5f7fa] hover:text-[#1a1a1a]"><Ban size={14} className="text-[#9ca3af]" /> Block</button>
                      <button onClick={() => { setIsReporting(true); setMessageMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-[#5a6a75] hover:bg-[#f5f7fa] hover:text-[#1a1a1a]"><Flag size={14} className="text-[#9ca3af]" /> Report</button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-[#f9fafb]">
              <div className="flex justify-center">
                <span className="px-3 py-1 bg-white border border-[#e5e7eb] text-[#9ca3af] text-[10px] font-semibold uppercase tracking-wide rounded-full">Today</span>
              </div>
              {activeChatIndex === 0 ? (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden mt-1">
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div className="px-4 py-3 text-[13px] leading-relaxed bg-white border border-[#e5e7eb] shadow-sm rounded-2xl rounded-tl-sm text-[#1a1a1a]">
                      Hi John, thank you for applying for the position. We were quite impressed with your previous work.
                    </div>
                    <p className="text-[10px] text-[#9ca3af] px-1">09:15 AM</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden mt-1">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Anne" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div className="px-4 py-3 text-[13px] leading-relaxed bg-white border border-[#e5e7eb] shadow-sm rounded-2xl rounded-tl-sm text-[#1a1a1a]">
                      Did you see the new brief for AI integration? I think we should discuss it soon.
                    </div>
                    <p className="text-[10px] text-[#9ca3af] px-1">06:30 AM</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-5 py-3.5 border-t border-[#f0f2f5] flex items-center gap-3 bg-white">
              <button className="p-1.5 text-[#9ca3af] hover:text-[#5a6a75] rounded-full transition-colors"><Paperclip size={17} /></button>
              <button className="p-1.5 text-[#9ca3af] hover:text-[#5a6a75] rounded-full transition-colors"><ImageIcon size={17} /></button>
              <input type="text" placeholder="Write a message..." className="flex-1 text-[14px] bg-transparent text-[#1a1a1a] placeholder-gray-400 focus:outline-none" />
              <button className="p-1.5 text-[#9ca3af] hover:text-[#5a6a75] rounded-full transition-colors"><Smile size={17} /></button>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#7EB0AB] hover:bg-[#6a9e99] text-white shadow-sm"><Send size={15} className="ml-0.5" /></button>
            </div>
          </>
        )}
      </div>

      {/* Block modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-[320px] p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4 border border-red-100"><Ban size={24} strokeWidth={1.5} /></div>
            <h2 className="text-[17px] font-bold text-[#1a1a1a] mb-2">Block this Person?</h2>
            <p className="text-[12px] text-[#5a6a75] mb-6">They won't be able to message you anymore.</p>
            <div className="w-full flex flex-col gap-2">
              <button onClick={() => setIsBlockModalOpen(false)} className="w-full py-2.5 bg-[#7EB0AB] hover:bg-[#6a9e99] text-white text-[14px] font-bold rounded-xl transition-colors">Block</button>
              <button onClick={() => setIsBlockModalOpen(false)} className="w-full py-2.5 text-[#5a6a75] text-[14px] font-bold hover:bg-[#f5f7fa] rounded-xl transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f7fa] page-enter overflow-x-hidden pt-20">

      {/* ─── Navbar ─── */}
      <TopBar
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
        userName={userName}
        userEmail={userEmail}
        userInitials={userInitials}
        profileImageUrl={profileImageUrl}
        onSignOutClick={() => setShowLogoutConfirm(true)}
      />

      {/* ─── Messages View ─── */}
      {/* Rendered when navigated from UserSidebar → /user/messages route */}
      {/* For inline usage on this page, the sidebar handles routing */}

      {/* ─── Main Content Wrapper (sliding panels) ─── */}
      <div className="w-full overflow-hidden relative">
        <div
          className="flex w-[200%] transition-transform duration-500 ease-in-out"
          style={{ transform: activeView === "grid" ? "translateX(0)" : "translateX(-50%)" }}
        >
          {/* ─── View 1: Grid ─── */}
          <div className="w-[50%] flex-shrink-0 max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 lg:hidden">
              <div>
                <h1 className="text-2xl md:text-[28px] font-bold text-[#1a1a1a] mb-1">Find Your Next Role</h1>
                <p className="text-sm md:text-[15px] text-[#5a6a75]">Browse open positions from top companies</p>
              </div>
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-sm font-semibold text-[#1a1a1a] shadow-sm hover:bg-[#f9fafb] transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                Filters
              </button>
            </div>

            <div className="flex gap-8">
              <FilterSidebar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeDateFilter={activeDateFilter}
                onDateFilterChange={setActiveDateFilter}
                allTags={allTags}
                selectedSkills={selectedSkills}
                onToggleSkill={toggleSkill}
                companies={companies}
                selectedCompanies={selectedCompanies}
                onToggleCompany={toggleCompany}
                hasActiveFilters={selectedSkills.length > 0 || selectedCompanies.length > 0 || !!searchQuery.trim()}
                onClearFilters={clearFilters}
                isJobSelected={!!selectedJob}
                showAllSkills={showAllSkills}
                onToggleShowAllSkills={() => setShowAllSkills((v) => !v)}
                showAllCompanies={showAllCompanies}
                onToggleShowAllCompanies={() => setShowAllCompanies((v) => !v)}
              />

              <main className="min-w-0 transition-all duration-200 flex-1">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7EB0AB]"></div>
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#e5e7eb] shadow-sm">
                    <div className="text-center max-w-md px-6">
                      <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">No jobs found</h3>
                      <p className="text-[#5a6a75] mb-6">We couldn&apos;t find any job listings in the database right now.</p>
                      {(searchQuery || selectedSkills.length > 0 || selectedCompanies.length > 0) && (
                        <button onClick={clearFilters} className="text-[#7EB0AB] font-semibold hover:underline transition-all">Clear filters and try again</button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {filteredJobs.map((job, index) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSelected={selectedJob?.id === job.id}
                        isBookmarked={bookmarked.map(Number).includes(Number(job.id))}
                        onSelect={() => handleSelectJob(job)}
                        onBookmark={(e) => {
                          e.stopPropagation();
                          if (isAuthenticated) { toggleBookmark(job.id); } else { setShowAuthPrompt(true); }
                        }}
                        delay={index * 50}
                        visible={visibleIds.includes(job.id)}
                      />
                    ))}
                  </div>
                )}
              </main>
            </div>
          </div>

          {/* ─── View 2: Job Details ─── */}
          <div className="w-[50%] flex-shrink-0 max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
            {lastSelectedJob && (
              <JobDetailPanel
                job={lastSelectedJob}
                filteredJobs={filteredJobs}
                isBookmarked={bookmarked.map(Number).includes(Number(lastSelectedJob.id))}
                isAuthenticated={isAuthenticated}
                onBack={handleClearSelection}
                onSelectJob={handleSelectJob}
                onToggleBookmark={() => toggleBookmark(lastSelectedJob.id)}
                onApply={() => setShowApplyModal(true)}
                onMessage={(recruiterId, recruiterName) => {
                  // Messages handled by sidebar navigation to /user/messages
                  router.push(`/user/messages?userId=${recruiterId}`);
                }}
                onAuthRequired={() => setShowAuthPrompt(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* ─── Modals ─── */}
      {showApplyModal && selectedJob && (
        <ApplyModal job={selectedJob} onClose={() => setShowApplyModal(false)} />
      )}

      <LogoutConfirmModal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} />
      <AuthPromptModal isOpen={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} />
    </div>
  );
}