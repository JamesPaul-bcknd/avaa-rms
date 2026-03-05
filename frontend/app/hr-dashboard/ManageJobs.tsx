"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import {
  Search, Plus, Bell, MoreVertical,
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
}

const ManageJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openStatusId, setOpenStatusId] = useState<number | null>(null); // State for Status Dropdown
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
        const response = await api.get('/jobs');
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
    setOpenStatusId(null); // Close status if menu opens
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
    <div className="w-full space-y-6 p-2 relative">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-700">Manage Jobs</h1>
        <div className="flex items-center gap-3">
          <div className="relative p-2 text-slate-400">
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
          <Image
            src="https://avatar.iran.liara.run/public/boy"
            width={36}
            height={36}
            className="rounded-full border border-slate-200 shadow-sm"
            alt="Profile"
          />
        </div>
      </div>

      {/* Filter & Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex bg-white border border-slate-100 p-1 rounded-xl shadow-sm">
          {['All', 'Active', 'Inactive'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-[#8abeb2] text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search job..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#8abeb2]/20"
            />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#a7f3d0] text-[#065f46] rounded-xl font-bold text-sm hover:bg-[#86efac] transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} /> Add Job
          </button>
        </div>
      </div>

      {/* Jobs Table — Desktop */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[13px] font-semibold text-slate-400 border-b border-slate-50">
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
                      <div className="w-11 h-11 rounded-xl bg-[#2d4e56] flex items-center justify-center text-white font-bold text-xs">
                        {job.id}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700 text-sm">{job.title}</div>
                        <div className="text-xs text-slate-400 font-medium">{job.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">{job.company}</td>

                  {/* INTERACTIVE STATUS COLUMN */}
                  <td className="px-6 py-5 relative">
                    <button
                      onClick={() => setOpenStatusId(openStatusId === job.id ? null : job.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full w-fit border transition-all active:scale-95 group ${job.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                        }`}
                    >
                      <CheckCircle2 size={14} className={job.status === 'Active' ? "fill-emerald-600 text-white" : "fill-amber-600 text-white"} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{job.status}</span>
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

                  <td className="px-6 py-5 text-center"><span className="text-sm font-bold text-slate-600">{job.apps}</span></td>
                  <td className="px-6 py-5 text-sm text-slate-400 font-medium">{job.date}</td>

                  <td className="px-8 py-5 text-right relative">
                    <button onClick={() => toggleMenu(job.id)} className={`p-2 rounded-lg transition-all ${openMenuId === job.id ? 'bg-slate-100 text-slate-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                      <MoreVertical size={18} />
                    </button>
                    {openMenuId === job.id && (
                      <div ref={menuRef} className="absolute right-8 top-14 w-44 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <button onClick={() => handleOpenView(job)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                          <Eye size={14} className="text-slate-400" /> View / Edit
                        </button>
                        <button
                          onClick={() => handleOpenMetrics(job)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <BarChart3 size={14} className="text-slate-400" /> Metrics
                        </button>
                        <button onClick={() => updateStatus(job.id, job.status === 'Active' ? 'Inactive' : 'Active')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                          <Power size={14} className="text-slate-400" /> Mark as {job.status === 'Active' ? 'Inactive' : 'Active'}
                        </button>
                        <hr className="my-1 border-slate-50" />
                        <button
                          onClick={() => { setJobToDelete(job.id); setOpenMenuId(null); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
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
      <div className="md:hidden bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        {filteredJobs.map((job) => (
          <div key={job.id} className="p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2d4e56] flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {job.id}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-700 text-sm truncate">{job.title}</div>
                  <div className="text-xs text-slate-400 font-medium">{job.location}</div>
                </div>
              </div>
              <span className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${job.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                {job.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
              <span>{job.company}</span>
              <span className="text-slate-400">{job.apps} applicants · {job.date}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleOpenView(job)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs hover:bg-slate-100"
              >
                <Eye size={13} /> View / Edit
              </button>
              <button
                onClick={() => handleOpenMetrics(job)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs hover:bg-slate-100"
              >
                <BarChart3 size={13} /> Metrics
              </button>
              <button
                onClick={() => updateStatus(job.id, job.status === 'Active' ? 'Inactive' : 'Active')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs hover:bg-slate-100"
              >
                <Power size={13} /> Toggle
              </button>
              <button
                onClick={() => setJobToDelete(job.id)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-100 bg-red-50 text-red-500 font-semibold text-xs hover:bg-red-100"
              >
                <Trash2 size={13} />
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
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Are you sure?</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                This action cannot be undone. This will permanently delete the job posting and all associated data.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setJobToDelete(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
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
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 p-1.5 rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
              <X size={20} />
            </button>

            <div className="p-8 pb-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-emerald-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                  {selectedJob.id}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">{selectedJob.company}</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-1.5 bg-[#4ade80] text-white rounded-full text-sm font-bold shadow-md hover:bg-emerald-500 transition-all mr-12"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-slate-400 text-sm font-medium">
                    <span>📍 {selectedJob.location}</span>
                    <span>🕒 Posted {selectedJob.date}</span>
                    <span className="bg-slate-100 px-3 py-0.5 rounded-full text-[10px] uppercase font-bold text-slate-500">{selectedJob.type}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 pt-2 max-h-[70vh] overflow-y-auto">
              <div className="border border-slate-200 rounded-[24px] p-8 space-y-8 relative">

                {/* Tech Stack */}
                <div className="text-center border-b border-slate-100 pb-6">
                  <h3 className="text-sm font-bold text-slate-700 mb-4">Tech Stack Requirements</h3>
                  <div className="flex justify-center flex-wrap gap-2 items-center">
                    {selectedJob.techStack?.map((tech: string, index: number) => (
                      <span key={index} className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-2">
                        {tech}
                        {isEditing && <X size={12} className="cursor-pointer hover:text-red-500" />}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800">Position</h4>
                  {isEditing ? (
                    <input
                      className="w-full p-2 text-sm border rounded-lg bg-slate-50 focus:ring-1 focus:ring-emerald-400 outline-none font-medium"
                      value={selectedJob.title}
                      onChange={(e) => setSelectedJob({ ...selectedJob, title: e.target.value })}
                    />
                  ) : (
                    <p className="text-slate-500 text-sm font-medium italic">*{selectedJob.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800">Description</h4>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      className="w-full p-3 text-sm border rounded-xl bg-slate-50 focus:ring-1 focus:ring-emerald-400 outline-none resize-none leading-relaxed"
                      value={selectedJob.description}
                      onChange={(e) => setSelectedJob({ ...selectedJob, description: e.target.value })}
                    />
                  ) : (
                    <p className="text-slate-500 text-sm leading-relaxed">{selectedJob.description}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleUpdate}
                      className="px-8 py-2 bg-[#4ade80] text-white rounded-full text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95"
                    >
                      Submit
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-[24px] p-8 shadow-2xl max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={32} className="fill-emerald-100" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Update Successful!</h3>
              <p className="text-slate-500 text-sm">The job list has been updated successfully.</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
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