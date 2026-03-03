'use client';

import { useEffect, useState } from 'react';
import {
    Users,
    Briefcase,
    FileText,
    Eye,
    TrendingUp,
    UserPlus,
    PenTool,
    FileCheck,
    UserCog,
    KeyRound,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';
import api from '@/lib/axios';

interface DashboardData {
    stats: {
        total_users: number;
        verified_users: number;
        unverified_users: number;
    };
    user_growth: { month: string; users: number }[];
    recent_users: {
        id: number;
        name: string;
        email: string;
        created_at: string;
        email_verified_at: string | null;
    }[];
}

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'Admin Dashboard | AVAA';

        const token = localStorage.getItem('token');
        api.get('/admin/dashboard', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => setData(res.data))
            .catch((err) => console.error('Failed to load dashboard:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3CD894]" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8">
                <p className="text-red-500">Failed to load dashboard data.</p>
            </div>
        );
    }

    // ─── Stat Cards ───
    const statCards = [
        {
            title: 'Active Users',
            value: data.stats.total_users.toLocaleString(),
            subtitle: 'Users currently active',
            icon: Users,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-500',
            badge: '+12%',
            badgeColor: 'bg-green-50 text-green-600',
        },
        {
            title: 'Job Posted',
            value: '320',
            subtitle: 'Open positions available',
            icon: Briefcase,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-500',
            badge: '+8%',
            badgeColor: 'bg-green-50 text-green-600',
        },
        {
            title: 'Applications',
            value: data.stats.verified_users.toLocaleString(),
            subtitle: 'Submitted this month',
            icon: FileText,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-500',
            badge: '+8%',
            badgeColor: 'bg-green-50 text-green-600',
        },
        {
            title: 'Total Visits',
            value: '18,200',
            subtitle: 'Visits recorded this month',
            icon: Eye,
            iconBg: 'bg-cyan-50',
            iconColor: 'text-cyan-500',
            badge: '+18%',
            badgeColor: 'bg-green-50 text-green-600',
        },
    ];

    // ─── Activity Icons ───
    const activityIcons = [UserPlus, PenTool, FileCheck, UserCog, KeyRound];

    // ─── Build Recent Activities from recent_users ───
    const recentActivities = data.recent_users.slice(0, 5).map((user, i) => {
        const activityTypes = [
            { text: `New user '${user.name}' registered successfully.`, actor: 'New User' },
            { text: `Job posted`, actor: 'By Admin' },
            { text: `New application received for 'Senior Software Engineer' position.`, actor: `By ${user.name}` },
            { text: `Profile Updated`, actor: `By ${user.name}` },
            { text: `User '${user.email}' requested a password reset.`, actor: 'By Admin' },
        ];
        const activity = activityTypes[i % activityTypes.length];
        const createdAt = new Date(user.created_at);
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        let timeAgo: string;
        if (diffMins < 60) timeAgo = `${diffMins} minutes ago`;
        else if (diffMins < 1440) timeAgo = `${Math.floor(diffMins / 60)} hours ago`;
        else timeAgo = `${Math.floor(diffMins / 1440)} days ago`;

        return {
            id: user.id,
            icon: activityIcons[i % activityIcons.length],
            text: activity.text,
            actor: activity.actor,
            time: timeAgo,
        };
    });

    return (
        <div className="p-8 space-y-6">
            {/* ─── Stat Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.title}
                            className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                                    <Icon size={20} className={card.iconColor} />
                                </div>
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                                    <TrendingUp size={12} />
                                    {card.badge}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-0.5">{card.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
                        </div>
                    );
                })}
            </div>

            {/* ─── Charts Row ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Application Trends (wider) */}
                <div className="lg:col-span-3 bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Application Trends</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Monthly application volume</p>
                        </div>
                        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#3CD894]/40">
                            <option>Last 6 Months</option>
                            <option>Last 12 Months</option>
                        </select>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.user_growth} barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                        fontSize: '13px',
                                    }}
                                />
                                <Bar dataKey="users" fill="#3CD894" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Growth (narrower) */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-gray-900">User Growth</h2>
                        <p className="text-sm text-gray-500 mt-0.5">New user registrations</p>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.user_growth}>
                                <defs>
                                    <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3CD894" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#3CD894" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                        fontSize: '13px',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#3CD894"
                                    strokeWidth={2}
                                    fill="url(#userGrowthGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ─── Recent Activity ─── */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Sub-header here</p>
                    </div>
                    <button className="px-4 py-2 bg-[#3CD894] text-white text-sm font-semibold rounded-full hover:bg-[#32c584] transition-colors duration-200">
                        View All Activity
                    </button>
                </div>
                <div className="divide-y divide-gray-100">
                    {recentActivities.length === 0 ? (
                        <p className="text-gray-400 text-sm py-4">No recent activity.</p>
                    ) : (
                        recentActivities.map((activity) => {
                            const Icon = activity.icon;
                            return (
                                <div key={activity.id} className="flex items-center justify-between py-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#3CD894] mt-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{activity.actor}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{activity.time}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
