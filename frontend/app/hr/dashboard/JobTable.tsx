"use client";

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import api from '@/lib/axios';

interface JobRow {
  id: number;
  title: string;
  location: string;
  company: string;
  status: string;
  apps: number;
  date: string;
  color?: string;
}

interface JobTableProps {
  onView: (job: any) => void;
  onJobCountChange?: (count: number) => void;
}

const JobTable = ({ onView, onJobCountChange }: JobTableProps) => {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/jobs');
        const apiJobs = response.data?.data ?? [];
        const mapped: JobRow[] = apiJobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          location: job.location,
          company: job.company,
          status: job.status || 'Active',
          apps: job.active_applications_count ?? job.applications_count ?? 0,
          date: job.created_at ? job.created_at.substring(0, 10) : '',
          color: job.color,
        }));
        // Filter to only show jobs with at least 1 applicant
        const withApplicants = mapped.filter((job) => (job.apps ?? 0) > 0);
        setJobs(withApplicants);
        onJobCountChange?.(withApplicants.length);
      } catch (error) {
        console.error('Failed to load jobs', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);
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
            {jobs.length > 0 ? jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: job.color || '#0f766e' }}
                    >
                      {typeof job.id === 'number' ? job.id.toString().padStart(2, '0') : job.id}
                    </div>
                    <div>
                      <div className="font-bold text-slate-700">{job.title}</div>
                      <div className="text-xs text-gray-400">{`${job.company} - ${job.location}`}</div>
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
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                  {loading ? 'Loading jobs…' : 'No jobs with applicants yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card list ── */}
      <div className="md:hidden divide-y divide-gray-100">
        {jobs.length > 0 ? jobs.map((job) => (
          <div key={job.id} className="p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5"
                style={{ backgroundColor: job.color || '#0f766e' }}
              >
                {typeof job.id === 'number' ? job.id.toString().padStart(2, '0') : job.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-700 text-sm leading-tight">{job.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${job.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-500 text-white'}`}>
                    {job.status}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{`${job.company} - ${job.location}`}</div>
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
        )) : (
          <div className="p-6 text-center text-sm text-gray-400">
            {loading ? 'Loading jobs…' : 'No jobs with applicants yet.'}
          </div>
        )}
      </div>

    </div>
  );
};

export default JobTable;