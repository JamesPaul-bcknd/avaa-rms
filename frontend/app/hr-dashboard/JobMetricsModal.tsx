"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, X } from "lucide-react";

type MetricsJob = {
  id: number;
  title: string;
  location: string;
  status: string;
};

export default function JobMetricsModal({
  job,
  onClose,
}: {
  job: MetricsJob;
  onClose: () => void;
}) {
  const [range, setRange] = useState<"6m" | "12m">("6m");
  const [jobStatus, setJobStatus] = useState(job.status ?? "Active");

  useEffect(() => {
    setJobStatus(job.status ?? "Active");
  }, [job.status]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const series = useMemo(() => {
    // Placeholder values to match your screenshot style.
    const sixMonths = [
      { label: "Sep", value: 380 },
      { label: "Oct", value: 430 },
      { label: "Nov", value: 455 },
      { label: "Dec", value: 410 },
      { label: "Jun", value: 560 },
      { label: "Feb", value: 470 },
    ];
    const twelveMonths = [
      { label: "Mar", value: 320 },
      { label: "Apr", value: 360 },
      { label: "May", value: 390 },
      { label: "Jun", value: 560 },
      { label: "Jul", value: 420 },
      { label: "Aug", value: 445 },
      { label: "Sep", value: 380 },
      { label: "Oct", value: 430 },
      { label: "Nov", value: 455 },
      { label: "Dec", value: 410 },
      { label: "Jan", value: 500 },
      { label: "Feb", value: 470 },
    ];
    return range === "6m" ? sixMonths : twelveMonths;
  }, [range]);

  const maxValue = useMemo(() => {
    return Math.max(...series.map((p) => p.value), 1);
  }, [series]);

  return (
    <div
      className="fixed inset-0 z-[180] bg-slate-900/40 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-4xl rounded-[28px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-8 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-[16px] sm:text-[18px] font-semibold text-slate-800 truncate">
              Job Details: {job.title}
            </h2>
            <p className="mt-1 text-[12px] sm:text-[13px] text-slate-500 flex items-center gap-2">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{job.location}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-full border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-8 py-5 sm:py-6 overflow-y-auto">
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">
            {/* Left: Metrics */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12px] font-semibold tracking-wider text-slate-500">
                  PERFORMANCE METRICS
                </p>
                <div className="text-[12px] font-semibold text-slate-500">
                  <span className="hidden sm:inline">Job Status</span>
                </div>
              </div>

              <div className="mt-4 border border-slate-200 rounded-2xl bg-white p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">
                      Application Quality
                    </p>
                    <p className="text-[11px] text-slate-500">
                      (AVAA Match Score)
                    </p>
                  </div>

                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value as "6m" | "12m")}
                    className="w-full sm:w-auto text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#7EB0AB]/30"
                  >
                    <option value="6m">Last 6 Months</option>
                    <option value="12m">Last 12 Months</option>
                  </select>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-3 sm:p-4">
                  <div className="h-44 sm:h-56 flex items-end gap-2 sm:gap-3">
                    {series.map((p) => {
                      const pct = Math.max(
                        8,
                        Math.round((p.value / maxValue) * 100)
                      );
                      return (
                        <div
                          key={p.label}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div className="w-full flex items-end justify-center">
                            <div
                              className="w-full max-w-[46px] sm:max-w-[56px] rounded-xl bg-[#7EB0AB]"
                              style={{ height: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {p.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-[12px] text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span>
                      Application Rating:{" "}
                      <span className="font-semibold text-slate-800">1.5</span>{" "}
                      <span className="text-amber-500">★</span>{" "}
                      <span className="font-semibold text-slate-800">5.0</span>
                    </span>
                    <span>
                      Avg. Screening Time:{" "}
                      <span className="font-semibold text-slate-800">
                        2 days
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-slate-500">
                      Job Status
                    </span>
                    <select
                      value={jobStatus}
                      onChange={(e) => setJobStatus(e.target.value)}
                      className="text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#7EB0AB]/30"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="w-full lg:w-[260px]">
              <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white">
                <p className="text-[12px] font-semibold tracking-wider text-slate-500">
                  QUICK ACTIONS
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <button className="w-full px-4 py-2.5 rounded-xl bg-[#7EB0AB] text-white text-[12px] font-semibold hover:opacity-90 active:scale-[0.99]">
                    View Applicants
                  </button>
                  <button className="w-full px-4 py-2.5 rounded-xl bg-[#a7f3d0] text-[#065f46] text-[12px] font-semibold hover:bg-[#86efac] active:scale-[0.99]">
                    Compare &amp; Shortlist
                  </button>
                </div>

                <p className="mt-5 text-[11px] text-slate-500 leading-relaxed">
                  This panel is UI-ready. You can later wire the metrics values
                  and actions to real backend data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

