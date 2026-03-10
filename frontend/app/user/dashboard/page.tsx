"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import AuthPromptModal from "@/components/AuthPromptModal";
import { messagesApi } from "@/lib/messages";
import api from "@/lib/axios";
import MessageModal from "@/components/messaging/MessageModal";

import { Job } from "./types";
import DashboardNavbar from "./components/TopBar";
import FilterSidebar from "./components/FilterSidebar";
import JobCard from "./components/JobCard";
import JobDetailPanel from "./components/JobDetailPanel";
import ApplyModal from "./components/ApplyModal";
import LogoutConfirmModal from "./components/LogoutConfirmModal";

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
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalRecruiter, setMessageModalRecruiter] = useState<{ id: number; name: string } | null>(null);
  const [visibleIds, setVisibleIds] = useState<number[]>([]);
  const prevFilteredIds = useRef<number[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Derived user info ─────────────────────────────────────
  const userName = user?.name || "User";
  const userInitials =
    userName
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";
  const userEmail = user?.email || "";
  const profileImageUrl = user?.profile_image_url || null;

  // ── Derived data ──────────────────────────────────────────
  const allTags =
    jobs.length > 0
      ? Array.from(new Set(jobs.flatMap((j) => j.tags || [])))
      : [];

  const companies =
    jobs.length > 0
      ? Array.from(new Set(jobs.map((j) => j.company))).sort()
      : [];

  // ── Effects ───────────────────────────────────────────────

  // Handle URL parameters for auto-navigation to messages
  useEffect(() => {
    const recruiterId = searchParams.get("recruiterId");
    if (recruiterId && isAuthenticated) {
      router.push(`/user/messages?userId=${recruiterId}`);
    }
  }, [searchParams, isAuthenticated, router]);

  // Fetch unread messages count (polls every 30s)
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

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/jobs`
        );
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

          if (formattedJobs.length > 0) {
            setSelectedJob(formattedJobs[0]);
          }
        } else {
          console.error("API returned success:false or invalid data format");
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

  useEffect(() => {
    document.title = "Dashboard | AVAA";
  }, []);

  // Fetch user bookmarks on auth
  useEffect(() => {
    const fetchUserBookmarks = async () => {
      try {
        const response = await api.get("/bookmarks");
        setBookmarked(response.data);
      } catch (error) {
        console.error("Could not load bookmarks", error);
      }
    };

    if (isAuthenticated) {
      fetchUserBookmarks();
    }
  }, [isAuthenticated]);

  // ── Filtering ────────────────────────────────────────────
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
        const isToday =
          jobDate.includes("h ago") ||
          jobDate.includes("m ago") ||
          jobDate === "Just now";
        if (!isToday) return false;
      }
    }

    if (selectedSkills.length > 0) {
      const matches = selectedSkills.every((skill) =>
        (job.tags || []).includes(skill)
      );
      if (!matches) return false;
    }

    if (selectedCompanies.length > 0) {
      if (!selectedCompanies.includes(job.company)) return false;
    }

    return true;
  });

  // Animate cards on filter change
  useEffect(() => {
    if (!Array.isArray(filteredJobs)) return;

    const newIds = filteredJobs.map((j) => j.id);
    const removed = prevFilteredIds.current.filter(
      (id) => !newIds.includes(id)
    );

    if (removed.length > 0) {
      setVisibleIds((prev) => prev.filter((id) => !removed.includes(id)));
    }

    newIds.forEach((id, i) => {
      setTimeout(() => {
        setVisibleIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      }, i * 60);
    });

    prevFilteredIds.current = newIds;

    if (selectedJob && !newIds.includes(selectedJob.id)) {
      setSelectedJob(null);
    }
  }, [searchQuery, selectedSkills, selectedCompanies, activeDateFilter, filteredJobs, selectedJob]);

  // Initial load animation
  useEffect(() => {
    setVisibleIds([]);
    jobs.forEach((job, i) => {
      setTimeout(() => {
        setVisibleIds((prev) => [...prev, job.id]);
      }, i * 80);
    });
    prevFilteredIds.current = jobs.map((j) => j.id);
  }, [jobs]);

  // ── Handlers ─────────────────────────────────────────────
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

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleCompany = (company: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : [...prev, company]
    );
  };

  const toggleBookmark = async (jobId: number) => {
    const numericId = Number(jobId);

    try {
      // Optimistic update
      setBookmarked((prev) => {
        const isCurrentlySaved = prev.map(Number).includes(numericId);
        return isCurrentlySaved
          ? prev.filter((id) => Number(id) !== numericId)
          : [...prev, numericId];
      });

      const response = await api.post(`/jobs/${numericId}/bookmark`);

      // Sync with server
      const isSavedOnServer = response.data.saved;
      setBookmarked((prev) => {
        const exists = prev.map(Number).includes(numericId);
        if (isSavedOnServer && !exists) return [...prev, numericId];
        if (!isSavedOnServer && exists)
          return prev.filter((id) => Number(id) !== numericId);
        return prev;
      });
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      setBookmarked((prev) => prev.filter((id) => Number(id) !== numericId));
    }
  };

  const clearFilters = () => {
    setSelectedSkills([]);
    setSelectedCompanies([]);
    setSearchQuery("");
  };

  if (isLoading) return null;

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f7fa] page-enter overflow-x-hidden pt-20">

      {/* ─── Navbar ─── */}
      <DashboardNavbar
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
        unreadCount={unreadCount}
        userName={userName}
        userEmail={userEmail}
        userInitials={userInitials}
        profileImageUrl={profileImageUrl}
        onSignOutClick={() => setShowLogoutConfirm(true)}
      />

      {/* ─── Main Content Wrapper (sliding panels) ─── */}
      <div className="w-full overflow-hidden relative">
        <div
          className="flex w-[200%] transition-transform duration-500 ease-in-out"
          style={{
            transform:
              activeView === "grid" ? "translateX(0)" : "translateX(-50%)",
          }}
        >
          {/* ─── View 1: Grid (Left half) ─── */}
          <div className="w-[50%] flex-shrink-0 max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
            {/* Mobile Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 lg:hidden">
              <div>
                <h1 className="text-2xl md:text-[28px] font-bold text-[#1a1a1a] mb-1">
                  Find Your Next Role
                </h1>
                <p className="text-sm md:text-[15px] text-[#5a6a75]">
                  Browse open positions from top companies
                </p>
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-sm font-semibold text-[#1a1a1a] shadow-sm hover:bg-[#f9fafb] transition-all"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                Filters
              </button>
            </div>

            <div className="flex gap-8">
              {/* ─── Left Sidebar ─── */}
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
                hasActiveFilters={
                  selectedSkills.length > 0 ||
                  selectedCompanies.length > 0 ||
                  !!searchQuery.trim()
                }
                onClearFilters={clearFilters}
                isJobSelected={!!selectedJob}
                showAllSkills={showAllSkills}
                onToggleShowAllSkills={() => setShowAllSkills((v) => !v)}
                showAllCompanies={showAllCompanies}
                onToggleShowAllCompanies={() => setShowAllCompanies((v) => !v)}
              />

              {/* ─── Job Cards Grid ─── */}
              <main className="min-w-0 transition-all duration-200 flex-1">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7EB0AB]"></div>
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#e5e7eb] shadow-sm">
                    <div className="text-center max-w-md px-6">
                      <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">
                        No jobs found
                      </h3>
                      <p className="text-[#5a6a75] mb-6">
                        We couldn&apos;t find any job listings in the database right now.
                      </p>
                      {(searchQuery ||
                        selectedSkills.length > 0 ||
                        selectedCompanies.length > 0) && (
                          <button
                            onClick={clearFilters}
                            className="text-[#7EB0AB] font-semibold hover:underline transition-all"
                          >
                            Clear filters and try again
                          </button>
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
                          if (isAuthenticated) {
                            toggleBookmark(job.id);
                          } else {
                            setShowAuthPrompt(true);
                          }
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

          {/* ─── View 2: Job Details (Right half) ─── */}
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
                  setMessageModalRecruiter({ id: recruiterId, name: recruiterName });
                  setShowMessageModal(true);
                }}
                onAuthRequired={() => setShowAuthPrompt(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* ─── Modals ─── */}
      {showApplyModal && selectedJob && (
        <ApplyModal
          job={selectedJob}
          onClose={() => setShowApplyModal(false)}
        />
      )}

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
      />

      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
      />

      <MessageModal
        isOpen={showMessageModal}
        onClose={() => {
          setShowMessageModal(false);
          setMessageModalRecruiter(null);
        }}
        recruiterId={messageModalRecruiter?.id || 0}
        recruiterName={messageModalRecruiter?.name || "Recruiter"}
      />
    </div>
  );
}
