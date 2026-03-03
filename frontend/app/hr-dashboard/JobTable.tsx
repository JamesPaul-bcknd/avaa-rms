"use client";

import { Eye } from 'lucide-react';

const jobs = [
  { id: 'TN', title: 'Senior Frontend Developer', location: 'TechNova - San Francisco, CA', status: 'Active', apps: 52, date: '2026-02-07', color: 'bg-teal-500' },
  { id: 'DS', title: 'Backend Engineer', location: 'TechNova - San Francisco, CA', status: 'Active', apps: 31, date: '2026-02-06', color: 'bg-slate-800' },
  { id: 'CH', title: 'UX/UI Designer', location: 'TechNova - San Francisco, CA', status: 'Active', apps: 43, date: '2026-02-05', color: 'bg-emerald-400' },
  { id: 'CS', title: 'DevOps Engineer', location: 'TechNova - San Francisco, CA', status: 'Active', apps: 19, date: '2026-02-04', color: 'bg-slate-700' },
  { id: 'IT', title: 'Product Manager', location: 'TechNova - San Francisco, CA', status: 'Active', apps: 20, date: '2026-02-03', color: 'bg-emerald-500' },
  { id: 'AP', title: 'Data Scientist', location: 'TechNova - San Francisco, CA', status: 'Closed', apps: 12, date: '2026-02-02', color: 'bg-slate-900' },
];

interface JobTableProps {
  onView: (job: any) => void;
}

const JobTable = ({ onView }: JobTableProps) => {
  // Centralized button class for easier maintenance
  const viewBtnClass = `
    flex items-center justify-center gap-2 px-3 py-1.5 
    bg-white text-slate-600 rounded-lg text-xs font-bold 
    border border-slate-200 
    transition-all duration-200 ease-in-out
    hover:bg-slate-800 hover:text-white hover:border-slate-800 
    hover:shadow-md hover:-translate-y-0.5 
    active:scale-95 active:translate-y-0
  `;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Desktop table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-xs font-semibold text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Job</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Applications</th>
              <th className="px-6 py-4">Posted</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {jobs.map((job) => (
              <tr key={job.title} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${job.color} flex items-center justify-center text-white font-bold text-xs shrink-0 transition-transform group-hover:scale-110`}>
                      {job.id}
                    </div>
                    <div>
                      <div className="font-bold text-slate-700">{job.title}</div>
                      <div className="text-xs text-gray-400">{job.location}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${job.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-500 text-white'}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                  {job.apps} <span className="text-gray-300 ml-1 text-xs font-normal">applicants</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">{job.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => onView(job)}
                      className={viewBtnClass}
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card list ── */}
      <div className="md:hidden divide-y divide-gray-100">
        {jobs.map((job) => (
          <div key={job.title} className="p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${job.color} flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5`}>
                {job.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-700 text-sm leading-tight">{job.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${job.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-500 text-white'}`}>
                    {job.status}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{job.location}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span><span className="font-semibold text-slate-600">{job.apps}</span> applicants</span>
              <span className="text-gray-400">{job.date}</span>
            </div>

            <button
              onClick={() => onView(job)}
              className={`${viewBtnClass} w-full py-2.5`}
            >
              <Eye size={14} />
              View Applicants
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default JobTable;