"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import JobTable from "./JobTable";
import ApplicantsTable from "./ApplicantsTable";
import InterviewsPage from "./InterviewsPage"; // We will create this below

export default function Home() {
  const [view, setView] = useState<"list" | "details" | "interviews">("list");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  
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

      <main className="flex-1 p-4 md:p-8">
        {view === "list" && (
          <>
            <Header title="HR Dashboard" />
            <JobTable onView={handleViewJob} />
          </>
        )}

        {view === "details" && (
          <ApplicantsTable 
            job={selectedJob} 
            onBack={() => setView("list")} 
            onScheduleSuccess={handleScheduleSuccess} 
          />
        )}

        {view === "interviews" && (
          <InterviewsPage interviews={scheduledInterviews} />
        )}
      </main>
    </div>
  );
}