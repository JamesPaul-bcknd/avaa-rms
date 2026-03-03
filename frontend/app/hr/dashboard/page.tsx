"use client";

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import JobTable from './components/JobTable';
import ApplicantsTable from './components/ApplicantsTable';

export default function HRDashboardPage() {
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    document.title = 'HR Dashboard | AVAA';
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-4 md:p-8 mt-14 lg:mt-0">
          <div className="max-w-6xl mx-auto">
            
            {/* 3. Header */}
            <Header />

            {/* 4. Conditional View Toggle */}
            {!selectedJob ? (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Active Job Postings</h2>
                </div>
                {/* Show the table of 6 jobs */}
                <JobTable onView={(job) => setSelectedJob(job)} />
              </div>
            ) : (
              /* Show Applicants when a job is "Viewed" */
              <ApplicantsTable 
                job={selectedJob} 
                onBack={() => setSelectedJob(null)} 
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}