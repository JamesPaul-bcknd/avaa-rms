"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import api from "@/lib/axios";

type ApplicationStatus = "pending" | "reviewed" | "accepted" | "rejected";

interface Application {
    id: number;
    job_id: number;
    job_title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    applied_at: string;
    status: ApplicationStatus;
    color?: string;
    initials?: string;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; bg: string; text: string; dot: string }> = {
    pending: { label: "Pending", bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
    reviewed: { label: "Reviewed", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
    accepted: { label: "Accepted", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
    rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
};

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export default function ApplyHistoryPage() {
    const { isLoading, isAuthenticated } = useAuth({ redirect: true });
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelingId, setCancelingId] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState<"all" | ApplicationStatus>("all");

    useEffect(() => {
        document.title = "Apply History | AVAA";
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchApplications = async () => {
            try {
                const res = await api.get("/applications");
                setApplications(res.data?.data || res.data || []);
            } catch (err) {
                console.error("Failed to fetch applications", err);
                setApplications([]);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, [isAuthenticated]);

    const handleCancel = async (appId: number) => {
        setCancelingId(appId);
        try {
            await api.delete(`/applications/${appId}`);
            setApplications((prev) => prev.filter((a) => a.id !== appId));
        } catch (err) {
            console.error("Failed to cancel application", err);
        } finally {
            setCancelingId(null);
        }
    };

    const filtered = filterStatus === "all"
        ? applications
        : applications.filter((a) => a.status === filterStatus);

    if (isLoading) return null;

    return (
        <div className="min-h-screen bg-[#f5f7fa] pt-8 px-6 lg:px-10 pb-16">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[28px] font-bold text-[#1a1a1a] mb-1">Apply History</h1>
                <p className="text-[15px] text-[#5a6a75]">Track all your submitted job applications.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {(["all", "pending", "reviewed", "accepted", "rejected"] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border transition-all ${filterStatus === s
                                ? "bg-[#1e3a4f] text-white border-[#1e3a4f] shadow"
                                : "bg-white text-[#5a6a75] border-[#e5e7eb] hover:bg-[#f5f7fa]"
                            }`}
                    >
                        {s === "all" ? "All" : STATUS_CONFIG[s].label}
                        {s === "all"
                            ? ` (${applications.length})`
                            : ` (${applications.filter((a) => a.status === s).length})`}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7EB0AB]" />
                </div>
            ) : filtered.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[#e5e7eb]">
                    <div className="w-16 h-16 rounded-full bg-[#e6f7f2] flex items-center justify-center mb-4">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7EB0AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">No applications yet</h3>
                    <p className="text-sm text-[#5a6a75]">
                        {filterStatus === "all"
                            ? "Start applying to jobs and they will appear here."
                            : `No ${STATUS_CONFIG[filterStatus as ApplicationStatus].label.toLowerCase()} applications.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((app) => {
                        const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                        const isPending = app.status === "pending";
                        return (
                            <div
                                key={app.id}
                                className="bg-white rounded-2xl border border-[#e5e7eb] p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
                            >
                                {/* Avatar */}
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                    style={{ backgroundColor: app.color || "#7EB0AB" }}
                                >
                                    {app.initials || app.company?.slice(0, 2).toUpperCase() || "JB"}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                        <h3 className="text-[15px] font-bold text-[#1a1a1a]">{app.job_title}</h3>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusCfg.bg} ${statusCfg.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                            {statusCfg.label}
                                        </span>
                                    </div>
                                    <p className="text-[13px] text-[#5a6a75]">
                                        {app.company}
                                        {app.location && <> &bull; {app.location}</>}
                                        {app.type && (
                                            <span className="ml-2 px-2 py-0.5 rounded-full bg-[#f0f2f5] text-[11px] font-semibold text-[#5a6a75]">
                                                {app.type}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-[12px] text-[#9ca3af] mt-1">
                                        Applied {formatDate(app.applied_at)}
                                        {app.salary && <> &bull; <span className="text-[#7EB0AB] font-semibold">{app.salary}</span></>}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {isPending && (
                                        <button
                                            onClick={() => handleCancel(app.id)}
                                            disabled={cancelingId === app.id}
                                            className="px-4 py-2 rounded-xl text-[13px] font-semibold border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                                        >
                                            {cancelingId === app.id ? "Cancelling…" : "Cancel"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
