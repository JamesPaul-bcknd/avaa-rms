'use client';
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import JobTable from "./JobTable";
import ApplicantsTable from "./ApplicantsTable";
import InterviewsPage from "./InterviewsPage";
import ManageJobs from "./ManageJobs";
import UserPage from "./UserPage";
import HrMessages from "./HrMessages";

export default function Home() {
  const [view, setView] = useState<"list" | "details" | "interviews" | "jobs" | "users" | "messages">("list");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobCount, setJobCount] = useState<number>(0);

  // State to store all scheduled interviews
  const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([]);

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setView("details");
  };

  const handleScheduleSuccess = (newInterview: any) => {
    setScheduledInterviews((prev) => [...prev, newInterview]);
  };

  return (
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <Sidebar setView={setView} currentView={view} />

      <main className="flex-1 p-4 md:p-8 pt-16 lg:pt-8">
        {/* 1. Dashboard View */}
        {view === "list" && (
          <>
            <Header title="HR Dashboard" jobCount={jobCount} />
            <JobTable onView={handleViewJob} onJobCountChange={setJobCount} />
          </>
        )}

        {/* 2. Manage Jobs View */}
        {view === "jobs" && (
          <ManageJobs />
        )}

        {/* 3. Users View - Now using the UserPage component */}
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
          <InterviewsPage interviews={scheduledInterviews} />
        )}

        {/* 6. Messages View */}
        {view === "messages" && (
          <HrMessages />
        )}
      </main>
    </div>
  );
}