"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import api from "@/lib/axios";

interface AcceptedJob {
    id: number;
    job_id: number;
    job_title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    accepted_at: string;
    start_date?: string;
    color?: string;
    initials?: string;
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export default function JobHistoryPage() {
    const { isLoading, isAuthenticated } = useAuth({ redirect: true });
    const [jobs, setJobs] = useState<AcceptedJob[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Job History | AVAA";
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchJobHistory = async () => {
            try {
                const res = await api.get("/applications?status=accepted");
                setJobs(res.data?.data || res.data || []);
            } catch (err) {
                console.error("Failed to fetch job history", err);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchJobHistory();
    }, [isAuthenticated]);

    if (isLoading) return null;

    return (
        <div className="min-h-screen bg-[#f5f7fa] pt-8 px-6 lg:px-10 pb-16">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[28px] font-bold text-[#1a1a1a] mb-1">Job History</h1>
                <p className="text-[15px] text-[#5a6a75]">A record of all jobs you have been accepted for.</p>
            </div>

            {/* Stats Card */}
            {!loading && jobs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
                        <p className="text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-1">Total Accepted</p>
                        <p className="text-3xl font-bold text-[#1e3a4f]">{jobs.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
                        <p className="text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-1">Most Recent</p>
                        <p className="text-[15px] font-bold text-[#1a1a1a]">{jobs[0]?.job_title || "—"}</p>
                        <p className="text-[12px] text-[#5a6a75]">{jobs[0]?.company || ""}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
                        <p className="text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-1">Companies</p>
                        <p className="text-3xl font-bold text-[#1e3a4f]">
                            {new Set(jobs.map((j) => j.company)).size}
                        </p>
                    </div>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7EB0AB]" />
                </div>
            ) : jobs.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[#e5e7eb]">
                    <div className="w-16 h-16 rounded-full bg-[#e6f7f2] flex items-center justify-center mb-4">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7EB0AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">No accepted jobs yet</h3>
                    <p className="text-sm text-[#5a6a75]">Jobs you are accepted for will be recorded here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            className="bg-white rounded-2xl border border-[#e5e7eb] p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
                        >
                            {/* Avatar */}
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                style={{ backgroundColor: job.color || "#7EB0AB" }}
                            >
                                {job.initials || job.company?.slice(0, 2).toUpperCase() || "JB"}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                    <h3 className="text-[15px] font-bold text-[#1a1a1a]">{job.job_title}</h3>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        Accepted
                                    </span>
                                </div>
                                <p className="text-[13px] text-[#5a6a75]">
                                    {job.company}
                                    {job.location && <> &bull; {job.location}</>}
                                    {job.type && (
                                        <span className="ml-2 px-2 py-0.5 rounded-full bg-[#f0f2f5] text-[11px] font-semibold text-[#5a6a75]">
                                            {job.type}
                                        </span>
                                    )}
                                </p>
                                <div className="flex flex-wrap gap-4 mt-1.5 text-[12px] text-[#9ca3af]">
                                    <span>Accepted {formatDate(job.accepted_at)}</span>
                                    {job.start_date && <span>Starts {formatDate(job.start_date)}</span>}
                                    {job.salary && (
                                        <span className="text-[#7EB0AB] font-semibold">{job.salary}</span>
                                    )}
                                </div>
                            </div>

                            {/* Badge */}
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
