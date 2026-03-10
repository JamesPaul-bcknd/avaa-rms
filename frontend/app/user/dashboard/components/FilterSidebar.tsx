"use client";

import { DATE_FILTERS } from "../types";

interface FilterSidebarProps {
    searchQuery: string;
    onSearchChange: (v: string) => void;
    activeDateFilter: string;
    onDateFilterChange: (v: string) => void;
    allTags: string[];
    selectedSkills: string[];
    onToggleSkill: (s: string) => void;
    companies: string[];
    selectedCompanies: string[];
    onToggleCompany: (c: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    isJobSelected: boolean;
    showAllSkills: boolean;
    onToggleShowAllSkills: () => void;
    showAllCompanies: boolean;
    onToggleShowAllCompanies: () => void;
}

export default function FilterSidebar({
    searchQuery,
    onSearchChange,
    activeDateFilter,
    onDateFilterChange,
    allTags,
    selectedSkills,
    onToggleSkill,
    companies,
    selectedCompanies,
    onToggleCompany,
    hasActiveFilters,
    onClearFilters,
    isJobSelected,
    showAllSkills,
    onToggleShowAllSkills,
    showAllCompanies,
    onToggleShowAllCompanies,
}: FilterSidebarProps) {
    return (
        <aside
            className={`hidden lg:block flex-shrink-0 ${isJobSelected ? "w-[200px]" : "w-[240px]"} transition-all duration-300`}
        >
            {/* Desktop Header */}
            <div className="mb-6 pb-6 border-b border-[#e5e7eb]">
                <h1
                    className={`${isJobSelected ? "text-2xl" : "text-[28px]"} font-bold text-[#1a1a1a] mb-2 leading-tight transition-all`}
                >
                    Find Your Next Role
                </h1>
                <p className="text-[14px] text-[#5a6a75] leading-relaxed">
                    Browse open positions from top companies
                </p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#9ca3af"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-[#d1d5db] rounded-lg text-sm text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all"
                />
            </div>

            {/* Date Posted */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">
                    Date Posted
                </h3>
                <div className="flex flex-wrap gap-2">
                    {DATE_FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => onDateFilterChange(filter)}
                            style={{
                                transition:
                                    "background-color 0.2s ease, color 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease",
                                transform:
                                    activeDateFilter === filter
                                        ? "scale(1.05)"
                                        : "scale(1)",
                                boxShadow:
                                    activeDateFilter === filter
                                        ? "0 2px 8px rgba(30,58,79,0.18)"
                                        : "none",
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium ${activeDateFilter === filter
                                ? "bg-[#1e3a4f] text-white"
                                : "bg-white border border-[#d1d5db] text-[#5a6a75] hover:bg-[#f0f2f5]"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Skills / Tags Filter */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">
                    Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                    {(showAllSkills ? allTags : allTags.slice(0, 6)).map((skill) => (
                        <button
                            key={skill}
                            onClick={() => onToggleSkill(skill)}
                            style={{
                                transition:
                                    "background-color 0.2s ease, color 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease",
                                transform: selectedSkills.includes(skill)
                                    ? "scale(1.07)"
                                    : "scale(1)",
                                boxShadow: selectedSkills.includes(skill)
                                    ? "0 2px 8px rgba(126,176,171,0.25)"
                                    : "none",
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium ${selectedSkills.includes(skill)
                                ? "bg-[#7EB0AB] text-white"
                                : "bg-white border border-[#d1d5db] text-[#5a6a75] hover:bg-[#f0f2f5]"
                                }`}
                        >
                            {skill}
                        </button>
                    ))}
                </div>

                {allTags.length > 6 && (
                    <button
                        onClick={onToggleShowAllSkills}
                        className="mt-2 text-xs font-medium text-[#7EB0AB] hover:text-[#6A9994] transition-colors"
                    >
                        {showAllSkills ? "Show Less" : `+${allTags.length - 6} more`}
                    </button>
                )}
            </div>

            {/* Company */}
            <div>
                <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">
                    Company
                </h3>
                <div className="space-y-2">
                    {(showAllCompanies ? companies : companies.slice(0, 4)).map(
                        (company) => (
                            <label
                                key={company}
                                className="flex items-center gap-2.5 cursor-pointer group"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedCompanies.includes(company)}
                                    onChange={() => onToggleCompany(company)}
                                    className="w-4 h-4 rounded border-[#d1d5db] text-[#7EB0AB] focus:ring-[#7EB0AB] accent-[#7EB0AB]"
                                />
                                <span className="text-sm text-[#5a6a75] group-hover:text-[#1a1a1a] transition-colors">
                                    {company}
                                </span>
                            </label>
                        ),
                    )}
                </div>

                {companies.length > 4 && (
                    <button
                        onClick={onToggleShowAllCompanies}
                        className="mt-2 text-xs font-medium text-[#7EB0AB] hover:text-[#6A9994] transition-colors"
                    >
                        {showAllCompanies ? "Show Less" : `+${companies.length - 4} more`}
                    </button>
                )}
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <button
                    onClick={onClearFilters}
                    style={{
                        transition: "opacity 0.3s ease, transform 0.3s ease",
                    }}
                    className="mt-5 w-full px-3 py-2 rounded-lg text-xs font-semibold text-[#5a6a75] border border-[#d1d5db] hover:bg-[#f0f2f5] hover:text-[#1a1a1a] transition-colors flex items-center justify-center gap-1.5"
                >
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Clear Filters
                </button>
            )}
        </aside>
    );
}
