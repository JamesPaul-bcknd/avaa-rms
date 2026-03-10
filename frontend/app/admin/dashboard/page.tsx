'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Briefcase,
  FileText,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import api from '@/lib/axios';

interface TrendData {
  value: number;
  direction: 'up' | 'down' | 'flat';
}

interface DashboardResponse {
  stats: {
    total_users: number;
    verified_users: number;
    unverified_users: number;
    total_jobs: number;
    total_applications: number;
    total_visits: number;
    monthly: {
      users: number;
      jobs: number;
      applications: number;
      visits: number;
    };
    trends: {
      users: TrendData;
      jobs: TrendData;
      applications: TrendData;
      visits: TrendData;
    };
  };
  months: number;
  user_growth: { month: string; users: number }[];
  application_growth: { month: string; applications: number }[];
  activity_feed: {
    id: string;
    type: string;
    title: string;
    description: string;
    author: string;
    created_at: string;
  }[];
  activity_feed_all?: {
    id: string;
    type: string;
    title: string;
    description: string;
    author: string;
    created_at: string;
  }[];
  recent_users: {
    id: number;
    name: string;
    email: string;
    created_at: string;
    email_verified_at: string | null;
    job_applications_count: number;
  }[];
}

function formatRelativeTime(value: string): string {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return 'Unknown';
  }

  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function statusPill(verifiedAt: string | null): { text: string; className: string } {
  if (verifiedAt) {
    return {
      text: 'Active',
      className: 'bg-emerald-100 text-emerald-700',
    };
  }

  return {
    text: 'Inactive',
    className: 'bg-slate-200 text-slate-600',
  };
}

function avatarFromName(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
}

function trendBadge(trend: TrendData) {
  if (trend.direction === 'flat') {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
        0%
      </span>
    );
  }

  const UpIcon = trend.direction === 'up' ? ArrowUpRight : ArrowDownRight;
  const tone = trend.direction === 'up'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-rose-100 text-rose-700';

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>
      <UpIcon size={12} className="mr-0.5" />
      {trend.value}%
    </span>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState<6 | 12>(6);
  const [showAllActivity, setShowAllActivity] = useState(false);

  useEffect(() => {
    document.title = 'Admin Dashboard | AVAA';
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/dashboard', {
          params: { months: duration },
        });

        if (!cancelled) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Failed to load admin dashboard data:', error);
        if (!cancelled) {
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [duration]);

  const statCards = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        title: 'Active Users',
        value: data.stats.total_users,
        subtitle: `${data.stats.monthly.users} joined this month`,
        icon: Users,
        trend: data.stats.trends.users,
      },
      {
        title: 'Jobs Posted',
        value: data.stats.total_jobs,
        subtitle: `${data.stats.monthly.jobs} posted this month`,
        icon: Briefcase,
        trend: data.stats.trends.jobs,
      },
      {
        title: 'Applications',
        value: data.stats.total_applications,
        subtitle: `${data.stats.monthly.applications} submitted this month`,
        icon: FileText,
        trend: data.stats.trends.applications,
      },
      {
        title: 'Total Visits',
        value: data.stats.total_visits,
        subtitle: 'Monthly platform activity total',
        icon: Eye,
        trend: data.stats.trends.visits,
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7EB0AB] border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Failed to load dashboard data.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 bg-[#f5f7f8] p-4 md:p-6 lg:p-8 min-h-[calc(100vh-84px)]">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="rounded-lg bg-[#7EB0AB]/15 p-2">
                  <Icon size={18} className="text-[#5A8F89]" />
                </div>
                {trendBadge(card.trend)}
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.title}</p>
              <p className="mt-1 text-3xl font-bold text-slate-800">{card.value.toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-3">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Application Trends</h2>
              <p className="text-xs text-slate-500">Monthly application volume</p>
            </div>
            <select
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7EB0AB]/40"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value) as 6 | 12)}
            >
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last 12 Months</option>
            </select>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.application_growth} barSize={24} margin={{ top: 6, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF0" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#F1F7F7' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #dbe4e7',
                    boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
                  }}
                />
                <Bar dataKey="applications" fill="#53B8AD" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">System Activity</h2>
              <p className="text-xs text-slate-500">Real-time updates</p>
            </div>
            <button
              onClick={() => setShowAllActivity(true)}
              className="rounded-lg bg-[#7EB0AB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#6da19c]"
            >
              View All Activity
            </button>
          </div>

          <div className="space-y-3">
            {data.activity_feed.length === 0 && (
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                No recent activity yet.
              </div>
            )}

            {data.activity_feed.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <span className="mt-2 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-[#53B8AD]" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold tracking-wide text-[#4B8F88]">{item.title}</p>
                  <p className="truncate text-sm font-medium text-slate-800">{item.description}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatRelativeTime(item.created_at)}  •  by {item.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Users Summary</h2>
            <p className="text-xs text-slate-500">Recent user registrations</p>
          </div>
          <a href="/admin/users" className="text-sm font-semibold text-[#5A8F89] hover:text-[#4c7b76]">
            View all Users
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Joined</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Applications</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-500">
                    No user registrations found.
                  </td>
                </tr>
              )}

              {data.recent_users.slice(0, 5).map((user) => {
                const pill = statusPill(user.email_verified_at);
                return (
                  <tr key={user.id} className="rounded-xl bg-slate-50/70">
                    <td className="whitespace-nowrap px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7EB0AB]/30 text-xs font-bold text-[#275f59]">
                          {avatarFromName(user.name)}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-600">{user.email}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${pill.className}`}>
                        {pill.text}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold text-slate-700">
                      {user.job_applications_count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Activity size={14} />
        Dashboard auto-refreshes when duration changes and always reads live data from API.
      </div>

      {showAllActivity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setShowAllActivity(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">All System Activity</h3>
              <button
                onClick={() => setShowAllActivity(false)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {(data.activity_feed_all ?? data.activity_feed).map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-lg border border-slate-100 px-3 py-2">
                  <span className="mt-2 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-[#53B8AD]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold tracking-wide text-[#4B8F88]">{item.title}</p>
                    <p className="text-sm font-medium text-slate-800">{item.description}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatRelativeTime(item.created_at)}  •  by {item.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
