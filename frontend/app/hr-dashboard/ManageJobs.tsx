"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Plus, MoreVertical,
  ChevronDown, CheckCircle2, Trash2, X, AlertTriangle, Eye, Power, BarChart3
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
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openStatusId, setOpenStatusId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [metricsJob, setMetricsJob] = useState<Job | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setOpenStatusId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load jobs from backend
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

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
    setOpenStatusId(null);
  };

  const handleOpenView = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    setIsEditing(false);
    setOpenMenuId(null);
  };

  const handleOpenMetrics = (job: Job) => {
    setMetricsJob(job);
    setOpenMenuId(null);
  };

  const handleUpdate = async () => {
    if (!selectedJob) return;

    const payload = {
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
    };

    try {
      const response = await api.put(`/jobs/${selectedJob.id}`, payload);
      const updatedJob = response.data?.data;
      setJobs(prev => prev.map(j => (j.id === selectedJob.id ? {
        ...j,
        title: updatedJob.title,
        company: updatedJob.company,
        location: updatedJob.location,
        description: updatedJob.description,
        techStack: Array.isArray(updatedJob.tags) ? updatedJob.tags : [],
        doList: Array.isArray(updatedJob.what_youll_do) ? updatedJob.what_youll_do : [],
        whyList: Array.isArray(updatedJob.why_company) ? updatedJob.why_company : [],
        type: updatedJob.type || j.type,
      } : j)));
      setIsModalOpen(false);
      setIsEditing(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error('Failed to update job', error);
    }
  };

  const updateStatus = (id: number, newStatus: string) => {
    setJobs(prev => prev.map(j =>
      j.id === id ? { ...j, status: newStatus } : j
    ));
    setOpenStatusId(null);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;

    try {
      await api.delete(`/jobs/${jobToDelete}`);
      setJobs(prev => prev.filter(j => j.id !== jobToDelete));
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error('Failed to delete job', error);
    } finally {
      setJobToDelete(null);
      setOpenMenuId(null);
    }
  };

  const handleCreateJob = async (formData: any) => {
    const payload = {
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
    };

    try {
      const response = await api.post('/jobs', payload);
      const job = response.data?.data;
      const newJob: Job = {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        status: formData.status || 'Active',
        apps: 0,
        date: job.created_at ? job.created_at.substring(0, 10) : new Date().toISOString().split('T')[0],
        type: job.type || 'Full-time',
        techStack: Array.isArray(job.tags) ? job.tags : [],
        description: job.description,
        doList: Array.isArray(job.what_youll_do) ? job.what_youll_do : [],
        whyList: Array.isArray(job.why_company) ? job.why_company : [],
        initials: job.initials,
        color: job.color,
        recruiter_name: job.recruiter_name,
        recruiter_role: job.recruiter_role,
      };
      setJobs([newJob, ...jobs]);
      setIsCreateModalOpen(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error('Failed to create job', error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'All') return true;
    return job.status === activeTab;
  });

  return (
    <div className="w-full space-y-6 relative">

      {/* Filter & Action Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[20px] shadow-sm border border-slate-100">
        <div className="flex w-full lg:w-auto bg-slate-50 border border-slate-100 p-1 rounded-xl shadow-inner">
          {['All', 'Active', 'Inactive'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-[#53968b] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search job..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#53968b]/20 transition-all placeholder-slate-400"
            />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#a3e6d3] text-[#136052] rounded-xl font-bold text-sm hover:bg-[#8cdbc5] transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} strokeWidth={3} /> Add Job
          </button>
        </div>
      </div>

      {/* Jobs Table — Desktop */}
      {/* FIXED OVERFLOW ISSUE HERE: Changed overflow-hidden to overflow-visible so menu can pop out */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible pb-12">
        <div className="w-full overflow-visible">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-5">User</th>
                <th className="px-6 py-5">Company</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-center">Applications</th>
                <th className="px-6 py-5">Posted Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#2d4e56] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {job.id}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700 text-sm leading-tight">{job.title}</div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">{job.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-500">{job.company}</td>

                  {/* INTERACTIVE STATUS COLUMN */}
                  <td className="px-6 py-5 relative">
                    <button
                      onClick={() => setOpenStatusId(openStatusId === job.id ? null : job.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full w-fit border transition-all active:scale-95 group ${job.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                        }`}
                    >
                      <CheckCircle2 size={13} className={job.status === 'Active' ? "fill-emerald-600 text-white" : "fill-amber-600 text-white"} />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider">{job.status}</span>
                      <ChevronDown size={12} className="ml-0.5 opacity-40 group-hover:opacity-100" />
                    </button>

                    {openStatusId === job.id && (
                      <div ref={statusRef} className="absolute left-6 top-14 w-32 bg-white border border-slate-100 rounded-xl shadow-xl z-[60] py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <button
                          onClick={() => updateStatus(job.id, 'Active')}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          Active
                        </button>
                        <button
                          onClick={() => updateStatus(job.id, 'Inactive')}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          Inactive
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-5 text-center"><span className="text-[13px] font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{job.apps}</span></td>
                  <td className="px-6 py-5 text-[13px] text-slate-400 font-semibold">{job.date}</td>

                  {/* FIXED ACTION MENU DROPDOWN */}
                  <td className="px-8 py-5 text-right relative">
                    <button onClick={() => toggleMenu(job.id)} className={`p-2 rounded-lg transition-all ${openMenuId === job.id ? 'bg-slate-100 text-slate-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                      <MoreVertical size={18} />
                    </button>
                    {openMenuId === job.id && (
                      <div ref={menuRef} className="absolute right-8 top-12 w-44 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <button onClick={() => handleOpenView(job)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                          <Eye size={14} className="text-slate-400" /> View / Edit
                        </button>
                        <button
                          onClick={() => handleOpenMetrics(job)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <BarChart3 size={14} className="text-slate-400" /> Metrics
                        </button>
                        <button onClick={() => updateStatus(job.id, job.status === 'Active' ? 'Inactive' : 'Active')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                          <Power size={14} className="text-slate-400" /> Mark as {job.status === 'Active' ? 'Inactive' : 'Active'}
                        </button>
                        <hr className="my-1 border-slate-50 mx-2" />
                        <button
                          onClick={() => { setJobToDelete(job.id); setOpenMenuId(null); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} className="text-red-400" /> Delete Job
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jobs — Mobile Card List */}
      <div className="md:hidden bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
        {filteredJobs.map((job) => (
          <div key={job.id} className="p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#2d4e56] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                  {job.id}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-700 text-[15px] truncate leading-tight">{job.title}</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">{job.location}</div>
                </div>
              </div>
              <span className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${job.status === 'Active'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                {job.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-600">{job.company}</span>
              <span className="text-slate-400">{job.apps} applicants · {job.date}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleOpenView(job)}
                className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-[11px] hover:bg-slate-50 shadow-sm"
              >
                <Eye size={16} className="text-slate-400" /> View
              </button>
              <button
                onClick={() => handleOpenMetrics(job)}
                className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-[11px] hover:bg-slate-50 shadow-sm"
              >
                <BarChart3 size={16} className="text-slate-400" /> Metrics
              </button>
              <button
                onClick={() => updateStatus(job.id, job.status === 'Active' ? 'Inactive' : 'Active')}
                className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-[11px] hover:bg-slate-50 shadow-sm"
              >
                <Power size={16} className="text-slate-400" /> Toggle
              </button>
              <button
                onClick={() => setJobToDelete(job.id)}
                className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border border-red-100 bg-red-50 text-red-500 font-semibold text-[11px] hover:bg-red-100 shadow-sm"
              >
                <Trash2 size={16} className="text-red-400" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* METRICS MODAL */}
      {metricsJob && (
        <JobMetricsModal
          job={{
            id: metricsJob.id,
            title: metricsJob.title,
            location: metricsJob.location,
            status: metricsJob.status,
          }}
          onClose={() => setMetricsJob(null)}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {jobToDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-8 shadow-2xl max-w-sm w-full text-center space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 border border-red-200">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Are you sure?</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-2">
                This action cannot be undone. This will permanently delete the job posting and all associated data.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setJobToDelete(null)}
                className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <CreateJobModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateJob}
        />
      )}

      {/* VIEW / EDIT MODAL */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all">
              <X size={20} />
            </button>

            <div className="p-8 pb-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-[#53968b] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm shrink-0">
                  {selectedJob.id}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between pr-10">
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{selectedJob.company}</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2 bg-[#53968b] text-white rounded-full text-xs font-bold shadow-md hover:bg-[#437d73] transition-all uppercase tracking-wide"
                      >
                        Edit Details
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><span className="text-base leading-none">📍</span> {selectedJob.location}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1.5"><span className="text-base leading-none">🕒</span> Posted {selectedJob.date}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-[#53968b]">{selectedJob.type}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 max-h-[65vh] overflow-y-auto">
              <div className="border border-slate-200 rounded-[24px] p-8 space-y-8 relative bg-white">

                {/* Tech Stack */}
                <div className="text-center border-b border-slate-100 pb-8">
                  <h3 className="text-[13px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Tech Stack Requirements</h3>
                  <div className="flex justify-center flex-wrap gap-2 items-center">
                    {selectedJob.techStack?.length > 0 ? (
                      selectedJob.techStack.map((tech: string, index: number) => (
                        <span key={index} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-2 shadow-sm">
                          {tech}
                          {isEditing && <X size={14} className="cursor-pointer hover:text-red-500 opacity-50 hover:opacity-100 transition-opacity" />}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic">No specific tech stack listed.</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[13px] font-extrabold text-slate-400 uppercase tracking-widest">Position Title</h4>
                  {isEditing ? (
                    <input
                      className="w-full p-3.5 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#53968b]/30 focus:border-[#53968b] outline-none font-bold text-slate-700 shadow-sm transition-all"
                      value={selectedJob.title}
                      onChange={(e) => setSelectedJob({ ...selectedJob, title: e.target.value })}
                    />
                  ) : (
                    <p className="text-slate-800 text-lg font-bold">{selectedJob.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-[13px] font-extrabold text-slate-400 uppercase tracking-widest">Job Description</h4>
                  {isEditing ? (
                    <textarea
                      rows={6}
                      className="w-full p-4 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#53968b]/30 focus:border-[#53968b] outline-none resize-none leading-relaxed text-slate-700 shadow-sm transition-all"
                      value={selectedJob.description}
                      onChange={(e) => setSelectedJob({ ...selectedJob, description: e.target.value })}
                    />
                  ) : (
                    <p className="text-slate-600 text-sm leading-loose bg-slate-50 p-5 rounded-xl border border-slate-100">{selectedJob.description || "No description provided."}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-6 border-t border-slate-100">
                    <button
                      onClick={handleUpdate}
                      className="px-10 py-3 bg-[#53968b] text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-[#437d73] transition-all hover:scale-105 active:scale-95"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Feedback Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-8 shadow-2xl max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-200">
              <CheckCircle2 size={32} className="fill-emerald-100" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Update Successful!</h3>
              <p className="text-slate-500 text-sm">The job listing has been updated successfully.</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full mt-2 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Great, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;