"use client";

import { Job } from "../types";

interface JobDetailPanelProps {
    job: Job;
    filteredJobs: Job[];
    isBookmarked: boolean;
    isAuthenticated: boolean;
    onBack: () => void;
    onSelectJob: (job: Job) => void;
    onToggleBookmark: () => void;
    onApply: () => void;
    onMessage: (recruiterId: number, recruiterName: string) => void;
    onAuthRequired: () => void;
}

export default function JobDetailPanel({
    job,
    filteredJobs,
    isBookmarked,
    isAuthenticated,
    onBack,
    onSelectJob,
    onToggleBookmark,
    onApply,
    onMessage,
    onAuthRequired,
}: JobDetailPanelProps) {
    const recruiterId =
        job.recruiter_id || job.user_id || job.posted_by;
    const recruiterName = job.recruiter_name || "Recruiter";
    const recruiterInitials = job.recruiter_name
        ? job.recruiter_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "JD";
    const similarJobs = filteredJobs.filter((j) => j.id !== job.id);

    return (
        <div className="w-full pb-16">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-[#5a6a75] mb-6">
                <button
                    onClick={onBack}
                    className="hover:text-[#1e3a4f] transition-colors"
                >
                    Home
                </button>
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="9 18 15 12 9 6" />
                </svg>
                <span className="font-semibold text-[#1e3a4f]">
                    {job.position || job.title}
                </span>
            </div>

            {/* Two-column layout */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* ── Left Column: Main Job Card ── */}
                <div className="flex-1 w-full min-w-0">
                    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 lg:p-8">

                        {/* Job Header */}
                        <div className="flex flex-col sm:flex-row gap-5 items-start mb-5">
                            <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: job.color || "#7EB0AB" }}
                            >
                                {job.initials || "J"}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1.5">
                                    {job.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#5a6a75]">
                                    <span className="font-semibold text-[#1e3a4f]">{job.company}</span>
                                    <span className="flex items-center gap-1">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        {job.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        {job.timeAgo}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="px-3 py-1 bg-[#f0f2f5] text-[#5a6a75] text-xs font-semibold rounded-full border border-[#e5e7eb]">
                                        {job.type}
                                    </span>
                                    <span className="px-3 py-1 bg-[#e6f7f2] text-[#7EB0AB] text-xs font-semibold rounded-full border border-[#7EB0AB]/20">
                                        {job.salary}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Apply + Save Buttons */}
                        <div className="flex gap-3 mb-6">
                            <button
                                onClick={() => {
                                    if (isAuthenticated) {
                                        onApply();
                                    } else {
                                        onAuthRequired();
                                    }
                                }}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg shadow-md"
                                style={{ background: "linear-gradient(135deg, #7EB0AB, #6A9994)" }}
                            >
                                Apply Now
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isAuthenticated) {
                                        onToggleBookmark();
                                    } else {
                                        onAuthRequired();
                                    }
                                }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${isBookmarked
                                    ? "bg-[#1e3a4f] text-white border-[#1e3a4f]"
                                    : "bg-white text-[#1a1a1a] border-[#e5e7eb] hover:bg-[#f5f7fa]"
                                    }`}
                            >
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill={isBookmarked ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                                </svg>
                                Save Job
                            </button>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-7">
                            {(job.tags || []).map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-[#f0f2f5] text-[#5a6a75] border border-[#e5e7eb]"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Body Sections */}
                        <div className="space-y-7">
                            <section>
                                <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-2.5">Job Description</h3>
                                <p className="text-[14.5px] text-[#5a6a75] leading-relaxed">{job.description}</p>
                            </section>

                            <section>
                                <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-2.5">Responsibilities</h3>
                                <ul className="space-y-2">
                                    {(job.whatYoullDo || []).map((item, i) => (
                                        <li key={i} className="flex gap-2.5 text-[14.5px] text-[#5a6a75] leading-relaxed">
                                            <span className="text-[#7EB0AB] font-bold mt-0.5 flex-shrink-0">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-2.5">Qualifications</h3>
                                <ul className="space-y-2">
                                    {(job.whyCompany || []).map((item, i) => (
                                        <li key={i} className="flex gap-2.5 text-[14.5px] text-[#5a6a75] leading-relaxed">
                                            <span className="text-[#7EB0AB] font-bold mt-0.5 flex-shrink-0">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>

                        {/* Report Footer */}
                        <div className="mt-8 pt-4 border-t border-[#f0f2f5] flex items-center justify-between">
                            <span className="text-xs text-[#9ca3af]">Report this job posting</span>
                            <div className="flex items-center gap-2">
                                <button className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#5a6a75] hover:bg-[#f0f2f5] transition-colors">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                    </svg>
                                </button>
                                <button className="p-1.5 rounded-lg text-[#9ca3af] hover:text-red-400 hover:bg-red-50 transition-colors">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                        <line x1="4" y1="22" x2="4" y2="15" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── Right Column: Sidebar Panels ── */}
                <div className="w-full lg:w-[272px] flex-shrink-0 space-y-4">

                    {/* Meet the Recruiter */}
                    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
                        <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4">Meet the Recruiter</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border-2"
                                style={{
                                    backgroundColor: job.color || "#7EB0AB",
                                    borderColor: (job.color || "#7EB0AB") + "40",
                                }}
                            >
                                {recruiterInitials}
                            </div>
                            <div>
                                <p className="text-[14px] font-bold text-[#1a1a1a]">
                                    {job.recruiter_name || "Jane Doe"}
                                </p>
                                <p className="text-[12px] text-[#5a6a75]">
                                    {job.recruiter_role || "Senior Tech Talent Partner"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                if (recruiterId) {
                                    onMessage(recruiterId, recruiterName);
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#e5e7eb] text-sm font-semibold text-[#1a1a1a] hover:bg-[#f5f7fa] hover:border-[#7EB0AB] hover:text-[#7EB0AB] transition-all group"
                            disabled={!recruiterId}
                        >
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="group-hover:stroke-[#7EB0AB] transition-colors"
                            >
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                            </svg>
                            Message {job.recruiter_name?.split(" ")[0] || "Recruiter"}
                        </button>
                    </div>

                    {/* Similar Jobs */}
                    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
                        <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4">Similar Jobs</h3>
                        <div className="space-y-3">
                            {similarJobs.slice(0, 3).map((sj) => (
                                <button
                                    key={sj.id}
                                    onClick={() => onSelectJob(sj)}
                                    className="w-full text-left p-3 rounded-xl border border-[#f0f2f5] hover:border-[#7EB0AB]/40 hover:bg-[#f8fffe] transition-all group"
                                >
                                    <p className="text-[13px] font-bold text-[#1a1a1a] group-hover:text-[#1e3a4f] leading-snug mb-0.5">
                                        {sj.title}
                                    </p>
                                    <p className="text-[11px] text-[#9ca3af] mb-1.5">
                                        {sj.company} • {sj.location}
                                    </p>
                                    <p className="text-[12px] font-semibold text-[#7EB0AB]">{sj.salary}</p>
                                </button>
                            ))}
                            {similarJobs.length === 0 && (
                                <p className="text-xs text-[#9ca3af] text-center py-2">No similar jobs found</p>
                            )}
                        </div>
                        {similarJobs.length > 3 && (
                            <button
                                onClick={onBack}
                                className="mt-3 w-full py-2 rounded-xl border border-[#e5e7eb] text-sm font-semibold text-[#5a6a75] hover:bg-[#f5f7fa] hover:text-[#1a1a1a] transition-all"
                            >
                                View All
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
