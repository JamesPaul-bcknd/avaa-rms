'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import JobTable from "./JobTable";
import ApplicantsTable from "./ApplicantsTable";
import InterviewsPage from "./InterviewsPage";
import ManageJobs from "./ManageJobs";
import UserPage from "./UserPage";
import HrMessages from "./HrMessages";
import AccountProfile from "./AccountProfile"; // Import the new component
import api from "@/lib/axios";

export default function Home() {
  const searchParams = useSearchParams();
  
  // 1. Added "profile" to the view union type
  const [view, setView] = useState<"list" | "details" | "interviews" | "jobs" | "users" | "messages" | "profile">("list");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobCount, setJobCount] = useState<number>(0);

  // State to store all scheduled interviews
  const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([]);

  // Handle URL parameters on mount
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'messages') {
      setView('messages');
    }
  }, [searchParams]);

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

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        const response = await api.get('/jobs/interviews');
        setScheduledInterviews(response.data?.data ?? []);
      } catch (error) {
        console.error('Failed to load interviews', error);
      }
    };

    if (view === 'interviews') {
      loadInterviews();
    }
  }, [view]);

  return (
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <Sidebar setView={setView} currentView={view} />

      <main className="flex-1 p-4 md:p-8 pt-16 lg:pt-8">
        {/* 1. Dashboard View */}
        {view === "list" && (
          <>
            <Header 
              title="HR Dashboard" 
              jobCount={jobCount} 
              onNavigateProfile={() => setView("profile")} // Connected the dropdown click
            />
            <JobTable onView={handleViewJob} onJobCountChange={setJobCount} />
          </>
        )}

        {/* 2. Manage Jobs View */}
        {view === "jobs" && (
          <ManageJobs />
        )}

        {/* 3. Users View */}
        {view === "users" && (
          <UserPage />
        )}

        {/* 4. Job Details View */}
        {view === "details" && (
          <ApplicantsTable
            job={selectedJob}
            onBack={() => setView("list")}
            onScheduleSuccess={handleScheduleSuccess}
          />
        )}

        {/* 5. Interviews View */}
        {view === "interviews" && (
          <InterviewsPage
            interviews={scheduledInterviews}
            onDecision={handleInterviewDecision}
          />
        )}

        {/* 6. Messages View */}
        {view === "messages" && (
          <HrMessages initialUserId={searchParams.get('userId')} />
        )}

        {/* 7. Account Profile View - Added rendering logic */}
        {view === "profile" && (
          <AccountProfile onBack={() => setView("list")} />
        )}
      </main>
    </div>
  );
}