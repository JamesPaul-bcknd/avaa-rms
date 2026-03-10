'use client';

import { useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  Award,
  ArrowLeft,
  BadgeDollarSign,
  Bell,
  Briefcase,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Clock3,
  Flame,
  Flag,
  Goal,
  Eye,
  MapPin,
  Phone,
  Mail,
  Search,
  Share2,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import api from '@/lib/axios';

type JobTypeFilter = 'all' | 'part-time' | 'full-time';
type SortMode = 'priority' | 'newest' | 'trending' | 'most-pay';
type PageView = 'list' | 'details' | 'applicants' | 'applicant-profile';
type ApplicantStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'interview';
type ApplicantSort = 'newest' | 'oldest' | 'name_asc' | 'name_desc';
type DateRange = 'all' | '7d' | '30d' | '90d';

interface JobItem {
  id: number;
  title: string;
  location: string;
  type: string;
  salary?: string | null;
  created_at?: string;
  applications_count?: number;
  active_applications_count?: number;
}

interface JobDetails {
  id: number;
  title: string;
  company?: string | null;
  location?: string | null;
  type?: string | null;
  salary?: string | null;
  description?: string | null;
  tags?: string[];
  what_youll_do?: string[];
  why_company?: string[];
  created_at?: string;
  recruiter?: {
    name?: string | null;
    role?: string | null;
    email?: string | null;
  };
  applicant_counts?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    interview: number;
  };
}

interface ApplicantItem {
  id: number;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  experience?: string | null;
  status: string;
  created_at?: string;
}

interface ApplicantsResponse {
  counts: Record<ApplicantStatus, number>;
  applicants: ApplicantItem[];
}

interface ApplicantTimelineItem {
  id: number;
  title: string;
  company?: string;
  period?: string;
  status?: string;
  summary?: string | null;
}

interface ApplicantCertificateItem {
  id: number;
  title: string;
  issuer?: string;
  year?: string;
}

interface ApplicantProfile {
  application_id: number;
  job_id: number;
  job_title?: string;
  name: string;
  headline?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  status: string;
  about?: string | null;
  skills: string[];
  experience_text?: string | null;
  linkedin?: string | null;
  profile_image_url?: string | null;
  timeline: ApplicantTimelineItem[];
  certificates: ApplicantCertificateItem[];
}

function normalizeType(type: string | undefined): 'Part-time' | 'Full-time' {
  const value = (type || '').toLowerCase();
  return value.includes('part') ? 'Part-time' : 'Full-time';
}

function payRange(salary?: string | null): string {
  if (!salary) return '$0 - $0';
  const clean = salary.replace(/[^0-9]/g, '');
  if (!clean) return '$0 - $0';
  const numeric = Number(clean);
  if (Number.isNaN(numeric) || numeric <= 0) return '$0 - $0';
  const low = Math.max(0, Math.round(numeric * 0.7));
  const high = Math.round(numeric * 1.1);
  return `$${low.toLocaleString()} - $${high.toLocaleString()}`;
}

function salaryLabel(salary?: string | null): string {
  if (!salary) return '$0';
  const clean = salary.replace(/[^0-9]/g, '');
  if (!clean) return '$0';
  return `$${Number(clean).toLocaleString()}`;
}

function postedAgo(createdAt?: string): string {
  if (!createdAt) return 'Just now';
  const timestamp = new Date(createdAt).getTime();
  if (Number.isNaN(timestamp)) return 'Just now';

  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function appliedLabel(createdAt?: string): string {
  if (!createdAt) return 'Applied just now';
  const timestamp = new Date(createdAt).getTime();
  if (Number.isNaN(timestamp)) return 'Applied just now';

  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 60) return `Applied ${Math.max(1, minutes)} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Applied ${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `Applied ${days} day${days === 1 ? '' : 's'} ago`;
}

function hiresThisMonth(job: JobItem): number {
  return job.active_applications_count ?? job.applications_count ?? 0;
}

function numericSalary(job: JobItem): number {
  const clean = (job.salary || '').replace(/[^0-9]/g, '');
  return clean ? Number(clean) : 0;
}

function avatarSeed(label: string): string {
  const chars = label.trim().split(' ').slice(0, 2).map((part) => part[0]?.toUpperCase() || 'A').join('');
  return chars || 'A';
}

export default function JobsPage() {
  const [view, setView] = useState<PageView>('list');
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantProfileLoading, setApplicantProfileLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobDetails | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantProfile | null>(null);
  const [applicantsData, setApplicantsData] = useState<ApplicantsResponse>({
    counts: { all: 0, pending: 0, approved: 0, rejected: 0, interview: 0 },
    applicants: [],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<JobTypeFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('priority');
  const [menuOpen, setMenuOpen] = useState(false);

  const [applicantStatus, setApplicantStatus] = useState<ApplicantStatus>('all');
  const [applicantSort, setApplicantSort] = useState<ApplicantSort>('newest');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const todayLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  useEffect(() => {
    document.title = 'Job Management | Admin Panel';
  }, []);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const response = await api.get('/jobs');
        setJobs(response.data?.data || []);
      } catch (error) {
        console.error('Failed to load jobs', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const loadJobDetails = async (jobId: number) => {
    setDetailsLoading(true);
    try {
      const response = await api.get(`/admin/jobs/${jobId}`);
      setSelectedJob(response.data?.job || null);
      setSelectedJobId(jobId);
      setView('details');
    } catch (error) {
      console.error('Failed to load job details', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const loadApplicants = async (jobId: number, status: ApplicantStatus, sort: ApplicantSort, range: DateRange) => {
    setApplicantsLoading(true);
    try {
      const response = await api.get(`/admin/jobs/${jobId}/applicants`, {
        params: {
          status,
          sort,
          date_range: range,
        },
      });

      setApplicantsData({
        counts: response.data?.counts || { all: 0, pending: 0, approved: 0, rejected: 0, interview: 0 },
        applicants: response.data?.applicants || [],
      });
    } catch (error) {
      console.error('Failed to load applicants', error);
      setApplicantsData({
        counts: { all: 0, pending: 0, approved: 0, rejected: 0, interview: 0 },
        applicants: [],
      });
    } finally {
      setApplicantsLoading(false);
    }
  };

  const loadApplicantProfile = async (applicationId: number) => {
    if (!selectedJobId) return;

    setApplicantProfileLoading(true);
    try {
      const response = await api.get(`/admin/jobs/${selectedJobId}/applicants/${applicationId}`);
      setSelectedApplicant(response.data?.applicant || null);
      setView('applicant-profile');
    } catch (error) {
      console.error('Failed to load applicant profile', error);
    } finally {
      setApplicantProfileLoading(false);
    }
  };

  useEffect(() => {
    if (view !== 'applicants' || !selectedJobId) return;
    loadApplicants(selectedJobId, applicantStatus, applicantSort, dateRange);
  }, [view, selectedJobId, applicantStatus, applicantSort, dateRange]);

  const filteredAndSorted = useMemo(() => {
    const filtered = jobs.filter((job) => {
      const q = searchQuery.trim().toLowerCase();
      const bySearch =
        q.length === 0 ||
        job.title?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q);

      const jobType = normalizeType(job.type).toLowerCase();
      const byType = typeFilter === 'all' || jobType === typeFilter;

      return bySearch && byType;
    });

    const sorted = [...filtered];

    if (sortMode === 'newest') {
      sorted.sort((a, b) => {
        const at = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bt - at;
      });
    } else if (sortMode === 'trending') {
      sorted.sort((a, b) => hiresThisMonth(b) - hiresThisMonth(a));
    } else if (sortMode === 'most-pay') {
      sorted.sort((a, b) => numericSalary(b) - numericSalary(a));
    } else {
      // Priority: open roles with more demand first.
      sorted.sort((a, b) => {
        const scoreA = hiresThisMonth(a) * 2 + numericSalary(a) * 0.01;
        const scoreB = hiresThisMonth(b) * 2 + numericSalary(b) * 0.01;
        return scoreB - scoreA;
      });
    }

    return sorted;
  }, [jobs, searchQuery, typeFilter, sortMode]);

  const sortLabel =
    sortMode === 'newest'
      ? 'Newest'
      : sortMode === 'trending'
        ? 'Trending'
        : sortMode === 'most-pay'
          ? 'Most Pay'
          : 'Priority';

  const statusPillClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'accepted') return 'bg-emerald-100 text-emerald-700';
    if (s === 'rejected') return 'bg-rose-100 text-rose-700';
    if (s === 'interview' || s === 'interview_scheduled') return 'bg-blue-100 text-blue-700';
    return 'bg-amber-100 text-amber-700';
  };

  const statusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'accepted') return 'Accepted';
    if (s === 'rejected') return 'Rejected';
    if (s === 'interview' || s === 'interview_scheduled') return 'Interview';
    return 'Pending';
  };

  if (view === 'details') {
    const primarySeed = avatarSeed(selectedJob?.title || 'AVA');
    const recruiterSeed = avatarSeed(selectedJob?.recruiter?.name || 'Recruiter');

    return (
      <div className="bg-[#f4f6f7] p-6 md:p-8 min-h-[calc(100vh-84px)]">
        {detailsLoading || !selectedJob ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading job details...</div>
        ) : (
          <div className="mx-auto max-w-[1160px] space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-[28px] font-bold leading-tight text-slate-800">Job Details</h1>
                <p className="text-sm text-slate-500">Monitor and manage job details.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Search..."
                    className="h-10 w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#7EB0AB]/35"
                  />
                </div>
                <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
                  <Bell size={16} />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
                </button>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#d8c6bd] text-xs font-semibold text-slate-700">
                  {recruiterSeed}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1 text-xs text-slate-500">
              <button onClick={() => setView('list')} className="inline-flex items-center gap-1 font-medium hover:text-slate-700">
                <ArrowLeft size={12} /> Home
              </button>
              <ChevronRight size={12} className="text-slate-400" />
              <span className="font-semibold text-[#2f6f6a]">{selectedJob.title}</span>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2.25fr_1.25fr]">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="p-5 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#266c76] text-lg font-bold text-white">
                      {primarySeed}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[38px] font-bold leading-tight text-slate-800">{selectedJob.title}</h2>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span>{selectedJob.company || 'NexusFlow'}</span>
                        <span className="inline-flex items-center gap-1"><MapPin size={13} /> {selectedJob.location || 'San Francisco, CA'}</span>
                        <span className="inline-flex items-center gap-1"><CalendarClock size={13} /> {postedAgo(selectedJob.created_at)}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{normalizeType(selectedJob.type || undefined)}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{payRange(selectedJob.salary)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setView('applicants')}
                    className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#78aba6] text-sm font-semibold text-white transition hover:bg-[#689d98]"
                  >
                    <Eye size={15} /> View Applicants
                  </button>

                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <div className="flex flex-wrap gap-2">
                      {(selectedJob.tags?.length ? selectedJob.tags : ['Figma', 'Prototyping', 'User Research']).slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full bg-[#edf4f3] px-2.5 py-1 text-xs font-medium text-[#3d7671]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="mt-6 text-[22px] font-semibold text-slate-800">Job Description</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {selectedJob.description || 'NexusFlow is looking for a Junior UI/UX Designer to serve as the creative architect of our platform experiences and bridge elegant interfaces with real user needs.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm text-slate-500 md:px-6">
                  <span>Report this job posting</span>
                  <div className="flex items-center gap-3">
                    <button className="text-slate-500 hover:text-slate-700"><Share2 size={15} /></button>
                    <button className="text-slate-500 hover:text-slate-700"><Flag size={15} /></button>
                  </div>
                </div>
              </section>

              <div className="space-y-4">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-[22px] font-semibold text-slate-800">Assigned Recruiter</h3>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#4f6e93] to-[#d2a59a] text-xs font-semibold text-white">
                      {recruiterSeed}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{selectedJob.recruiter?.name || 'Emma Wilson'}</p>
                      <p className="text-xs text-slate-500">{selectedJob.recruiter?.role || 'Senior Creative Partner'}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-[22px] font-semibold text-slate-800">Job Insights</h3>
                  <div className="mt-4 space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Applicants</span>
                      <span className="font-semibold text-slate-800">{selectedJob.applicant_counts?.total ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Budget</span>
                      <span className="font-semibold text-slate-800">{salaryLabel(selectedJob.salary)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Status</span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'applicant-profile') {
    return (
      <div className="bg-[#f4f6f7] p-6 md:p-8 min-h-[calc(100vh-84px)]">
        <div className="mx-auto max-w-[1160px] space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-[28px] font-bold leading-tight text-slate-800">Job Details</h1>
              <p className="text-sm text-slate-500">Monitor and manage job details.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search..."
                  className="h-10 w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#7EB0AB]/35"
                />
              </div>
              <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
                <Bell size={16} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
              </button>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#d8c6bd] text-xs font-semibold text-slate-700">
                {avatarSeed(selectedApplicant?.name || 'AD')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-1 text-xs text-slate-500">
            <button onClick={() => setView('applicants')} className="inline-flex items-center gap-1 font-medium hover:text-slate-700">
              <ArrowLeft size={12} /> Applicants
            </button>
            <ChevronRight size={12} className="text-slate-400" />
            <span className="font-semibold text-[#2f6f6a]">Applicant Profile</span>
          </div>

          {applicantProfileLoading || !selectedApplicant ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading applicant profile...</div>
          ) : (
            <>
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="h-28 bg-gradient-to-r from-[#3f7474] to-[#7db0ab]" />

                <div className="px-5 pb-5 pt-0 md:px-6">
                  <div className="-mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex items-end gap-4">
                      <div className="inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#d9d5cf] text-lg font-semibold text-slate-700">
                        {selectedApplicant.profile_image_url ? (
                          <img src={selectedApplicant.profile_image_url} alt={selectedApplicant.name} className="h-full w-full object-cover" />
                        ) : (
                          avatarSeed(selectedApplicant.name)
                        )}
                      </div>
                      <div>
                        <h2 className="text-[34px] font-bold leading-tight text-slate-800">{selectedApplicant.name}</h2>
                        <p className="text-sm text-slate-500">{selectedApplicant.headline || 'Aspiring UI/UX Designer'}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1"><MapPin size={12} /> {selectedApplicant.location || 'N/A'}</span>
                          <span className="inline-flex items-center gap-1"><Mail size={12} /> {selectedApplicant.email || 'N/A'}</span>
                          <span className="inline-flex items-center gap-1"><Phone size={12} /> {selectedApplicant.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(selectedApplicant.status)}`}>
                      {statusLabel(selectedApplicant.status)}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
                <h3 className="text-[22px] font-semibold text-slate-800">About</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {selectedApplicant.about || 'No about summary provided by the applicant yet.'}
                </p>

                <div className="mt-4 rounded-xl border border-slate-200 bg-[#fafcfc] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Award size={14} className="text-[#5c9994]" /> Top Skills
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {(selectedApplicant.skills.length ? selectedApplicant.skills : ['No skill data provided']).map((skill, index) => (
                      <span key={`${skill}-${index}`}>{index > 0 ? '• ' : ''}{skill}</span>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
                <h3 className="text-[22px] font-semibold text-slate-800">Experience</h3>
                <div className="mt-4 space-y-4">
                  {(selectedApplicant.timeline.length > 0
                    ? selectedApplicant.timeline
                    : [{
                        id: selectedApplicant.application_id,
                        title: selectedApplicant.job_title || 'Recent Application',
                        company: 'Application Track',
                        period: 'Current',
                        status: selectedApplicant.status,
                        summary: selectedApplicant.experience_text,
                      }]
                  ).map((item) => (
                    <article key={item.id} className="rounded-xl border border-slate-200 bg-[#fafcfc] p-4">
                      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.company || 'Application Track'} • {item.status || 'pending'}</p>
                        </div>
                        <p className="text-xs font-semibold text-[#3d7671]">{item.period || 'Current'}</p>
                      </div>
                      {item.summary ? <p className="mt-2 text-sm text-slate-600">{item.summary}</p> : null}
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
                <h3 className="text-[22px] font-semibold text-slate-800">Certificates</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {selectedApplicant.certificates.map((certificate) => (
                    <article key={certificate.id} className="rounded-xl border border-slate-200 bg-[#fafcfc] p-4">
                      <p className="text-sm font-semibold text-slate-800">{certificate.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{certificate.issuer || 'Issuer not provided'} {certificate.year ? `• ${certificate.year}` : ''}</p>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    );
  }

  if (view === 'applicants') {
    return (
      <div className="bg-[#f4f6f7] p-6 md:p-8 min-h-[calc(100vh-84px)]">
        <div className="mx-auto max-w-[1160px] space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-[28px] font-bold leading-tight text-slate-800">Job Details</h1>
              <p className="text-sm text-slate-500">Monitor and manage job details.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search..."
                  className="h-10 w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#7EB0AB]/35"
                />
              </div>
              <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
                <Bell size={16} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
              </button>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#d8c6bd] text-xs font-semibold text-slate-700">
                {avatarSeed(selectedJob?.recruiter?.name || 'AD')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-1 text-xs text-slate-500">
            <button onClick={() => setView('details')} className="inline-flex items-center gap-1 font-medium hover:text-slate-700">
              <ArrowLeft size={12} /> {selectedJob?.title || 'Job'}
            </button>
            <ChevronRight size={12} className="text-slate-400" />
            <span className="font-semibold text-[#2f6f6a]">Applicants</span>
          </div>

          <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
              {([
                { key: 'all', label: 'All' },
                { key: 'approved', label: 'Accepted' },
                { key: 'pending', label: 'Pending' },
                { key: 'rejected', label: 'Rejected' },
              ] as { key: ApplicantStatus; label: string }[]).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setApplicantStatus(item.key)}
                  className={`rounded-md px-8 py-2 text-sm font-medium ${applicantStatus === item.key ? 'bg-[#78aba6] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                <SlidersHorizontal size={14} />
                <select
                  value={applicantSort}
                  onChange={(event) => setApplicantSort(event.target.value as ApplicantSort)}
                  className="bg-transparent text-sm text-slate-700 outline-none"
                >
                  <option value="newest">Sort</option>
                  <option value="oldest">Oldest</option>
                  <option value="name_asc">Name A-Z</option>
                  <option value="name_desc">Name Z-A</option>
                </select>
              </div>

              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <CalendarClock size={14} className="text-slate-500" />
                <select
                  value={dateRange}
                  onChange={(event) => setDateRange(event.target.value as DateRange)}
                  className="bg-transparent text-sm text-slate-700 outline-none"
                >
                  <option value="all">{todayLabel}</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#edf4f3] text-[#5c9994]">
                <Users size={14} />
              </div>
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-4xl font-bold leading-tight text-slate-900">{applicantsData.counts.all || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#edf4f3] text-[#5c9994]">
                <Briefcase size={14} />
              </div>
              <p className="text-sm text-slate-500">Accepted</p>
              <p className="text-4xl font-bold leading-tight text-slate-900">{applicantsData.counts.approved || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#edf4f3] text-[#5c9994]">
                <Clock3 size={14} />
              </div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-4xl font-bold leading-tight text-slate-900">{applicantsData.counts.pending || 0}</p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-[28px] font-bold leading-tight text-slate-800">Applicants for {selectedJob?.title || 'Job Position'}</h3>
              <p className="text-sm text-slate-500">Review candidates who applied for this position.</p>
            </div>

            {applicantsLoading ? (
              <div className="p-8 text-center text-sm text-slate-500">Loading applicants...</div>
            ) : applicantsData.applicants.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No applicants found for this filter.</div>
            ) : (
              <div className="space-y-3 p-4">
                {applicantsData.applicants.map((applicant) => (
                  <article
                    key={applicant.id}
                    onClick={() => loadApplicantProfile(applicant.id)}
                    className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-[#7EB0AB]/70 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d4d9dd] text-xs font-bold text-slate-700">
                          {avatarSeed(applicant.full_name || 'A')}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[24px] font-semibold leading-tight text-slate-800">{applicant.full_name}</p>
                          <p className="truncate text-sm text-slate-500">{applicant.email || 'no-email@example.com'} • {appliedLabel(applicant.created_at)}</p>
                        </div>
                      </div>

                      <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(applicant.status)}`}>
                        {statusLabel(applicant.status)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f6f7] p-6 md:p-8 min-h-[calc(100vh-84px)]">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
          <button
            onClick={() => setTypeFilter('all')}
            className={`rounded-lg px-10 py-2 text-sm font-semibold ${typeFilter === 'all' ? 'bg-[#7EB0AB] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter('part-time')}
            className={`rounded-lg px-10 py-2 text-sm font-semibold ${typeFilter === 'part-time' ? 'bg-[#7EB0AB] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Part-time
          </button>
          <button
            onClick={() => setTypeFilter('full-time')}
            className={`rounded-lg px-10 py-2 text-sm font-semibold ${typeFilter === 'full-time' ? 'bg-[#7EB0AB] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Full-time
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search..."
              className="w-72 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7EB0AB]/35"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <SlidersHorizontal size={14} />
              Sort
            </button>

            <button
              onClick={() => setMenuOpen((value) => !value)}
              className="ml-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {sortLabel}
              <ChevronDown size={14} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                {([
                  { key: 'priority', label: 'Priority', icon: Goal },
                  { key: 'newest', label: 'Newest', icon: Clock3 },
                  { key: 'trending', label: 'Trending', icon: Flame },
                  { key: 'most-pay', label: 'Most Pay', icon: BadgeDollarSign },
                ] as { key: SortMode; label: string; icon: ComponentType<{ size?: number; className?: string }> }[]).map((option, index, arr) => {
                  const Icon = option.icon;
                  return (
                  <button
                    key={option.key}
                    onClick={() => {
                      setSortMode(option.key);
                      setMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${sortMode === option.key ? 'bg-[#7EB0AB]/15 text-[#2b6b65] font-semibold' : 'text-slate-700 hover:bg-slate-50'} ${index < arr.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    <Icon size={15} className="text-slate-500" />
                    {option.label}
                  </button>
                );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading jobs...</div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No jobs found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredAndSorted.map((job) => {
            const typeLabel = normalizeType(job.type);
            const hireCount = hiresThisMonth(job);
            const seed = avatarSeed(job.title || 'A');

            return (
              <article
                key={job.id}
                onClick={() => loadJobDetails(job.id)}
                className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:border-[#7EB0AB]/70 hover:shadow-md"
              >
                <div className="mb-1 flex items-start justify-between">
                  <div>
                    <h3 className="text-[27px] font-bold leading-tight text-slate-800">{job.title}</h3>
                    <p className="text-sm text-slate-500">{payRange(job.salary)} / hour</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1"><MapPin size={13} /> {job.location || 'N/A'}</span>
                  <span className="inline-flex items-center gap-1"><CalendarClock size={13} /> {postedAgo(job.created_at)}</span>
                  <span className="rounded-full bg-[#8ebcb6] px-2.5 py-1 text-xs font-semibold text-white">{typeLabel}</span>
                </div>

                <div className="mt-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex -space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#7EB0AB] text-[10px] font-bold text-white">{seed[0] || 'A'}</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#6a98b8] text-[10px] font-bold text-white">{seed[1] || 'B'}</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#d08962] text-[10px] font-bold text-white">{seed[0] || 'C'}</div>
                  </div>
                  <p className="text-sm text-slate-500">{hireCount.toLocaleString()} hired this month</p>
                </div>

                <div className="mt-3 flex items-center justify-between text-slate-700">
                  <p className="inline-flex items-center gap-2 text-base font-semibold"><Users size={16} className="text-slate-400" /> {salaryLabel(job.salary)}</p>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
