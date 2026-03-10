"use client";

import { Job } from "../types";

// Animated job card wrapper
export default function JobCard({
    job,
    isSelected,
    isBookmarked,
    onSelect,
    onBookmark,
    delay,
    visible,
}: {
    job: Job;
    isSelected: boolean;
    isBookmarked: boolean;
    onSelect: () => void;
    onBookmark: (e: React.MouseEvent) => void;
    delay: number;
    visible: boolean;
}) {
    return (
        <div
            onClick={onSelect}
            style={{
                transitionDelay: `${delay}ms`,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transition:
                    "opacity 0.35s ease, transform 0.35s ease, box-shadow 0.2s ease, border-color 0.2s ease",
            }}
            className={`bg-white rounded-2xl border p-5 hover:shadow-lg group cursor-pointer ${isSelected
                ? "border-[#7EB0AB] shadow-md"
                : "border-[#e5e7eb] hover:border-[#c5ccd3]"
                }`}
        >
            {/* Top Row: Avatar + Bookmark */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: job.color }}
                    >
                        {job.initials}
                    </div>
                    <div>
                        <h3 className="text-[15px] font-bold text-[#1a1a1a] leading-tight">
                            {job.title}
                        </h3>
                        <p className="text-[13px] text-[#5a6a75]">{job.company}</p>
                    </div>
                </div>
                <button
                    onClick={onBookmark}
                    className="text-[#9ca3af] hover:text-[#1e3a4f] transition-colors p-1"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={isBookmarked ? "#1e3a4f" : "none"}
                        stroke={isBookmarked ? "#1e3a4f" : "currentColor"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                    </svg>
                </button>
            </div>

            {/* Meta Row */}
            <div className="flex items-center gap-3 mb-4 text-[13px] text-[#5a6a75]">
                <span className="flex items-center gap-1">
                    <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    {job.location}
                </span>
                <span className="flex items-center gap-1">
                    <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {job.timeAgo}
                </span>
                <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${job.type === "Full-time"
                        ? "bg-[#e6f7f2] text-[#7EB0AB]"
                        : "bg-[#fef3e2] text-[#b8860b]"
                        }`}
                >
                    {job.type}
                </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6 mt-1">
                {job.tags.slice(0, 3).map((tag) => (
                    <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#e5e7eb] text-[#5a6a75] border border-transparent hover:border-[#d1d5db] transition-colors"
                    >
                        {tag}
                    </span>
                ))}
                {job.tags.length > 3 && (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#f0f2f5] text-[#9ca3af]">
                        +{job.tags.length - 3}
                    </span>
                )}
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between border-t border-[#f0f2f5] pt-4 mt-auto">
                <div>
                    <span className="block text-[11px] font-medium text-[#9ca3af] mb-0.5">
                        Salary Range
                    </span>
                    <span className="text-[14px] font-bold text-[#1e3a4f] group-hover:text-[#7EB0AB] transition-colors">
                        {job.salary}
                    </span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect();
                    }}
                    className="flex justify-center flex-1 ml-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all shadow-sm"
                    style={{ background: "#7EB0AB" }}
                >
                    View Details
                </button>
            </div>
        </div>
    );
}
