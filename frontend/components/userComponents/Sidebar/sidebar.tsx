"use client";

import { useState } from "react";

interface SidebarProps {
  selectedJob: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeDateFilter: string;
  setActiveDateFilter: (filter: string) => void;
  DATE_FILTERS: string[];
  allTags: string[];
  selectedSkills: string[];
  toggleSkill: (skill: string) => void;
  companies: string[];
  selectedCompanies: string[];
  toggleCompany: (company: string) => void;
  setSelectedSkills: (skills: string[]) => void;
  setSelectedCompanies: (companies: string[]) => void;
}

export default function Sidebar({
  selectedJob,
  searchQuery,
  setSearchQuery,
  activeDateFilter,
  setActiveDateFilter,
  DATE_FILTERS,
  allTags,
  selectedSkills,
  toggleSkill,
  companies,
  selectedCompanies,
  toggleCompany,
  setSelectedSkills,
  setSelectedCompanies,
}: SidebarProps) {
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);

  const hasActiveFilters = 
    selectedSkills.length > 0 || 
    selectedCompanies.length > 0 || 
    searchQuery.trim() !== "";

  return (
    <aside
      className={`hidden lg:block flex-shrink-0 ${
        selectedJob ? "w-[200px]" : "w-[240px]"
      } transition-all duration-300`}
    >
      {/* Sidebar Header */}
      <div className="mb-6 pb-6 border-b border-[#e5e7eb]">
        <h1
          className={`${
            selectedJob ? "text-2xl" : "text-[28px]"
          } font-bold text-[#1a1a1a] mb-2 leading-tight transition-all`}
        >
          Find Your Next Role
        </h1>
        <p className="text-[14px] text-[#5a6a75] leading-relaxed">
          Browse open positions from top companies
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 border border-[#d1d5db] rounded-lg text-sm text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all"
        />
      </div>

      {/* Date Posted Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Date Posted</h3>
        <div className="flex flex-wrap gap-2">
          {DATE_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveDateFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeDateFilter === filter
                  ? "bg-[#1e3a4f] text-white scale-105 shadow-md"
                  : "bg-white border border-[#d1d5db] text-[#5a6a75] hover:bg-[#f0f2f5]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {(showAllSkills ? allTags : allTags.slice(0, 6)).map((skill) => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedSkills.includes(skill)
                  ? "bg-[#7EB0AB] text-white scale-105 shadow-md"
                  : "bg-white border border-[#d1d5db] text-[#5a6a75] hover:bg-[#f0f2f5]"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
        {allTags.length > 6 && (
          <button
            onClick={() => setShowAllSkills(!showAllSkills)}
            className="mt-2 text-xs font-medium text-[#7EB0AB] hover:text-[#6A9994]"
          >
            {showAllSkills ? "Show Less" : `+${allTags.length - 6} more`}
          </button>
        )}
      </div>

      {/* Company Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Company</h3>
        <div className="space-y-2">
          {(showAllCompanies ? companies : companies.slice(0, 4)).map((company) => (
            <label key={company} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCompanies.includes(company)}
                onChange={() => toggleCompany(company)}
                className="w-4 h-4 rounded border-[#d1d5db] text-[#7EB0AB] accent-[#7EB0AB]"
              />
              <span className="text-sm text-[#5a6a75] group-hover:text-[#1a1a1a]">
                {company}
              </span>
            </label>
          ))}
        </div>
        {companies.length > 4 && (
          <button
            onClick={() => setShowAllCompanies(!showAllCompanies)}
            className="mt-2 text-xs font-medium text-[#7EB0AB] hover:text-[#6A9994]"
          >
            {showAllCompanies ? "Show Less" : `+${companies.length - 4} more`}
          </button>
        )}
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            setSelectedSkills([]);
            setSelectedCompanies([]);
            setSearchQuery("");
          }}
          className="mt-5 w-full px-3 py-2 rounded-lg text-xs font-semibold text-[#5a6a75] border border-[#d1d5db] hover:bg-[#f0f2f5] flex items-center justify-center gap-1.5 transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear Filters
        </button>
      )}
    </aside>
  );
}