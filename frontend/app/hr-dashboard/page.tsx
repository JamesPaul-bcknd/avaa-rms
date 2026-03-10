'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import JobTable from "./JobTable";
import ApplicantsTable from "./ApplicantsTable";
import InterviewsPage from "./InterviewsPage";
import ManageJobs from "./ManageJobs";
import UserPage from "./UserPage";
import AccountProfile from "./AccountProfile";
import api from "@/lib/axios";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [view, setView] = useState<"list" | "details" | "interviews" | "jobs" | "users" | "profile">("list");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobCount, setJobCount] = useState<number>(0);

  const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);

  // Load jobs from DB
  const loadJobs = async () => {
    try {
      const res = await api.get("/job-postings"); // Make sure your Laravel route returns job_postings
      setJobs(res.data.data || []);
      setJobCount(res.data.data?.length || 0);
    } catch (err) {
      console.error("Failed to load jobs", err);
    }
  };

  // Load interviews from DB
  const loadInterviews = async () => {
    try {
      setLoadingInterviews(true);
      const response = await api.get("/jobs/interviews"); // Laravel route returns scheduled interviews
      setScheduledInterviews(response.data?.data ?? []);
    } catch (error) {
      console.error("Failed to load interviews", error);
    } finally {
      setLoadingInterviews(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (!viewParam) return;
    if (viewParam === "list") setView("list");
    else if (viewParam === "users") setView("users");
    else if (viewParam === "jobs") setView("jobs");
    else if (viewParam === "interviews") setView("interviews");
    else if (viewParam === "profile") setView("profile");
  }, [searchParams]);

  useEffect(() => {
    if (view === "interviews") loadInterviews();
  }, [view]);

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setView("details");
  };

  const handleScheduleSuccess = (newInterview: any) => {
    setScheduledInterviews((prev) => {
      const withoutExisting = prev.filter((item) => item.id !== newInterview.id);
      return [newInterview, ...withoutExisting];
    });
  };

  const handleInterviewDecision = (interviewId: number) => {
    setScheduledInterviews((prev) => prev.filter((item) => item.id !== interviewId));
  };

  return (
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <Sidebar setView={setView} currentView={view} />

      <main className="flex-1 p-4 md:p-8 pt-16 lg:pt-8">
        {view === "list" && (
          <>
            <Header
              title="HR Dashboard"
              jobCount={jobCount}
              onNavigateProfile={() => setView("profile")}
              onNavigateMessages={() => router.push("/hr-dashboard/messages")}
            />
            <JobTable onView={handleViewJob} jobs={jobs} onJobCountChange={setJobCount} />
          </>
        )}

        {view === "jobs" && <ManageJobs jobs={jobs} />}

        {view === "users" && <UserPage />}

        {view === "details" && selectedJob && (
          <ApplicantsTable
            job={selectedJob}
            onBack={() => setView("list")}
            onScheduleSuccess={handleScheduleSuccess}
          />
        )}

        {view === "interviews" && (
          <InterviewsPage
            interviews={scheduledInterviews}
            loading={loadingInterviews}
            onDecision={handleInterviewDecision}
          />
        )}

        {view === "profile" && <AccountProfile onBack={() => setView("list")} />}
      </main>
    </div>
  );
}