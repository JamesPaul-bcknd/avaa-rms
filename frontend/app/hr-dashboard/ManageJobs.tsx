"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Plus, MoreVertical, ChevronDown,
  CheckCircle2, Trash2, X, AlertTriangle,
  BarChart3, Edit2, Calendar
} from 'lucide-react';

import CreateJobModal from './CreateJobModal';
import api from '@/lib/axios';
import JobMetricsModal from './JobMetricsModal';

interface Job {
  id: number;
  title: string;
  location: string;
  company: string;
  status: string;
  apps: number;
  date: string;
  type: string;
  techStack: string[];
  description: string;
  doList?: string[];
  whyList?: string[];
  initials?: string;
  color?: string;
  recruiter_name?: string;
  recruiter_role?: string;
}

const ManageJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openStatusId, setOpenStatusId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [metricsJob, setMetricsJob] = useState<Job | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setOpenStatusId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs/my-jobs');
        const apiJobs = response.data?.data ?? [];
        const mapped: Job[] = apiJobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          location: job.location,
          company: job.company,
          status: 'Active',
          apps: job.applications_count ?? 0,
          date: job.created_at ? job.created_at.substring(0, 10) : '',
          type: job.type || 'Full-time',
          techStack: Array.isArray(job.tags) ? job.tags : [],
          description: job.description,
          doList: Array.isArray(job.what_youll_do) ? job.what_youll_do : [],
          whyList: Array.isArray(job.why_company) ? job.why_company : [],
          initials: job.initials,
          color: job.color,
          recruiter_name: job.recruiter_name,
          recruiter_role: job.recruiter_role,
        }));
        setJobs(mapped);
      } catch (error) {
        console.error('Failed to load jobs', error);
      }
    };
    fetchJobs();
  }, []);

  const handleOpenEdit = (job: Job) => {
    setSelectedJob(job);
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleOpenMetrics = (job: Job) => {
    setMetricsJob(job);
    setOpenMenuId(null);
  };

  const handleUpdate = async () => {
    if (!selectedJob) return;
    try {
      const response = await api.put(`/jobs/${selectedJob.id}`, {
        title: selectedJob.title,
        company: selectedJob.company,
        location: selectedJob.location,
        type: selectedJob.type || 'Full-time',
        salary: '',
        description: selectedJob.description,
        tags: selectedJob.techStack || [],
        what_youll_do: selectedJob.doList || [],
        why_company: selectedJob.whyList || [],
        initials: selectedJob.initials || selectedJob.company?.substring(0, 2)?.toUpperCase(),
        color: selectedJob.color || '#7EB0AB',
        time_ago: 'Just now',
      });
      const u = response.data?.data;
      setJobs(prev => prev.map(j => j.id === selectedJob.id ? {
        ...j, title: u.title, company: u.company, location: u.location,
        description: u.description,
        techStack: Array.isArray(u.tags) ? u.tags : [],
        type: u.type || j.type,
      } : j));
      setIsEditModalOpen(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (err) { console.error(err); }
  };

  const updateStatus = (id: number, val: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: val } : j));
    setOpenStatusId(null);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      await api.delete(`/jobs/${jobToDelete}`);
      setJobs(prev => prev.filter(j => j.id !== jobToDelete));
    } catch (err) { console.error(err); }
    finally { setJobToDelete(null); }
  };

  const handleCreateJob = async (formData: any) => {
    try {
      const response = await api.post('/jobs', {
        title: formData.title || 'Untitled Role',
        company: formData.company || 'New Company',
        location: formData.location || 'Remote',
        type: 'Full-time',
        salary: formData.salary || '',
        description: formData.description || '',
        tags: formData.skills || [],
        what_youll_do: [],
        why_company: [],
        initials: (formData.company || 'NJ').substring(0, 2).toUpperCase(),
        color: '#7EB0AB',
        time_ago: 'Just now',
      });
      const job = response.data?.data;
      setJobs(prev => [{
        id: job.id, title: job.title, company: job.company,
        location: job.location, status: formData.status || 'Active',
        apps: 0, date: (job.created_at || '').substring(0, 10),
        type: job.type || 'Full-time',
        techStack: Array.isArray(job.tags) ? job.tags : [],
        description: job.description, doList: [], whyList: [],
        initials: job.initials, color: job.color,
        recruiter_name: job.recruiter_name, recruiter_role: job.recruiter_role,
      }, ...prev]);
      setIsCreateModalOpen(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (err) { console.error(err); }
  };

  const filteredJobs = jobs.filter(job => {
    const matchTab = activeTab === 'All' || job.status === activeTab;
    const matchSearch = !searchQuery.trim() ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="w-full space-y-5 relative">

      {/* ── Header bar ── */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex w-full lg:w-auto bg-white border border-slate-100 p-1 rounded-xl shadow-sm">
          {['All', 'Active', 'Inactive'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 lg:flex-none px-7 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab ? 'bg-[#53968b] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}>{tab}</button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input type="text" placeholder="Search jobs..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#53968b]/20 focus:border-[#53968b] transition-all placeholder-slate-400" />
          </div>
          <button onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#53968b] text-white rounded-xl font-bold text-sm hover:bg-[#437d73] transition-all shadow-sm active:scale-95 whitespace-nowrap">
            <Plus size={17} strokeWidth={3} /> Add Job
          </button>
        </div>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/60">
              <th className="px-8 py-4">User</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Applications</th>
              <th className="px-6 py-4">Posted Date</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredJobs.length === 0 ? (
              <tr><td colSpan={6} className="px-8 py-16 text-center text-slate-400 text-sm">No jobs found.</td></tr>
            ) : filteredJobs.map(job => (
              <tr key={job.id} className="hover:bg-slate-50/40 transition-colors">

                {/* Title + location */}
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0"
                      style={{ backgroundColor: job.color || '#2d5a61' }}>
                      {job.initials || job.title.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{job.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{job.location}</p>
                    </div>
                  </div>
                </td>

                {/* Company */}
                <td className="px-6 py-4 text-sm font-semibold text-slate-500">{job.company}</td>

                {/* Status pill */}
                <td className="px-6 py-4 relative">
                  <button onClick={() => setOpenStatusId(openStatusId === job.id ? null : job.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                      job.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                    }`}>
                    <CheckCircle2 size={12} className={job.status === 'Active' ? 'fill-emerald-500 text-white' : 'fill-amber-500 text-white'} />
                    <span className="text-[10px] font-extrabold uppercase tracking-wide">{job.status}</span>
                    <ChevronDown size={11} className="opacity-50" />
                  </button>
                  {openStatusId === job.id && (
                    <div ref={statusRef} className="absolute left-6 top-12 w-28 bg-white border border-slate-100 rounded-xl shadow-xl z-[60] py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      <button onClick={() => updateStatus(job.id, 'Active')} className="w-full text-left px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50">Active</button>
                      <button onClick={() => updateStatus(job.id, 'Inactive')} className="w-full text-left px-4 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50">Inactive</button>
                    </div>
                  )}
                </td>

                {/* Apps */}
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-bold text-slate-600">{job.apps}</span>
                </td>

                {/* Date */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-[13px] text-slate-400">
                    <Calendar size={13} className="text-slate-300" />{job.date}
                  </div>
                </td>

                {/* ⋮ Option menu */}
                <td className="px-8 py-4 text-right relative">
                  <button onClick={() => setOpenMenuId(openMenuId === job.id ? null : job.id)}
                    className={`p-2 rounded-lg transition-all ${
                      openMenuId === job.id ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}>
                    <MoreVertical size={17} />
                  </button>

                  {openMenuId === job.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                      <div ref={menuRef}
                        className="absolute right-6 top-11 w-44 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">

                        {/* Header label */}
                        <div className="px-4 pt-3 pb-1.5 border-b border-slate-100">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Option Menu</p>
                        </div>

                        {/* Edit */}
                        <button onClick={() => handleOpenEdit(job)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                          <Edit2 size={14} className="text-slate-400" /> Edit
                        </button>

                        {/* Metrics */}
                        <button onClick={() => handleOpenMetrics(job)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                          <BarChart3 size={14} className="text-slate-400" /> Metrics
                        </button>

                        <div className="mx-4 border-t border-slate-100" />

                        {/* Delete */}
                        <button onClick={() => { setJobToDelete(job.id); setOpenMenuId(null); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} className="text-red-400" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        {filteredJobs.map(job => (
          <div key={job.id} className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm"
                  style={{ backgroundColor: job.color || '#2d5a61' }}>
                  {job.initials || job.title.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-sm">{job.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{job.location}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                job.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}>{job.status}</span>
            </div>
            <div className="flex justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-600">{job.company}</span>
              <span className="text-slate-400">{job.apps} apps · {job.date}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleOpenEdit(job)} className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[11px] font-semibold hover:bg-slate-50">
                <Edit2 size={14} className="text-slate-400" /> Edit
              </button>
              <button onClick={() => handleOpenMetrics(job)} className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[11px] font-semibold hover:bg-slate-50">
                <BarChart3 size={14} className="text-slate-400" /> Metrics
              </button>
              <button onClick={() => setJobToDelete(job.id)} className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-red-100 bg-red-50 text-red-500 text-[11px] font-semibold hover:bg-red-100">
                <Trash2 size={14} className="text-red-400" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Metrics Modal ── */}
      {metricsJob && (
        <JobMetricsModal
          job={{ id: metricsJob.id, title: metricsJob.title, location: metricsJob.location, status: metricsJob.status }}
          onClose={() => setMetricsJob(null)}
        />
      )}

      {/* ── Delete Confirm ── */}
      {jobToDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-8 shadow-2xl max-w-sm w-full text-center space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-500 border border-red-200">
              <AlertTriangle size={26} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Delete this job?</h3>
              <p className="text-slate-500 text-sm mt-1">This will permanently remove the posting and all associated data.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setJobToDelete(null)} className="flex-1 py-2.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 shadow-md">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Modal ── */}
      {isCreateModalOpen && (
        <CreateJobModal onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateJob} />
      )}

      {/* ── Edit Modal ── */}
      {isEditModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="h-24 bg-gradient-to-r from-[#4c8479] to-[#6ebea3] relative">
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                <X size={18} className="text-white" />
              </button>
            </div>
            <div className="px-8 pb-8">
              <div className="flex items-center gap-4 -mt-7 mb-6">
                <div className="w-14 h-14 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: selectedJob.color || '#4c8479' }}>
                  {selectedJob.initials || selectedJob.title.substring(0, 2).toUpperCase()}
                </div>
                <div className="pt-4">
                  <p className="font-bold text-slate-800 text-base leading-tight">{selectedJob.company}</p>
                  <p className="text-[12px] text-slate-400">{selectedJob.location}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Job Title</label>
                  <input className="mt-1 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-[#4c8479] focus:ring-1 focus:ring-[#4c8479]/30"
                    value={selectedJob.title} onChange={e => setSelectedJob({ ...selectedJob, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea rows={4} className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 resize-none focus:outline-none focus:border-[#4c8479] focus:ring-1 focus:ring-[#4c8479]/30"
                    value={selectedJob.description} onChange={e => setSelectedJob({ ...selectedJob, description: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50">Close</button>
                <button onClick={handleUpdate} className="px-6 py-2.5 bg-[#4c8479] text-white rounded-xl text-sm font-bold hover:bg-[#3d6e64] shadow-sm">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Success ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-8 shadow-2xl max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="mx-auto w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-200">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Saved!</h3>
            <p className="text-slate-500 text-sm">Job listing updated successfully.</p>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700">Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;