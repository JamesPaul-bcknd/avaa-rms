"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, MapPin, Plus, X } from "lucide-react";

export type EditableJob = {
  id: number;
  title: string;
  company: string;
  location: string;
  type?: string;
  salary?: string;
  timeAgo?: string;
  date?: string;
  status?: string;
  techStack?: string[];
  description: string;
  doList?: string[];
  whyList?: string[];
  projectTimeline?: string;
  onboardingProcess?: string;
  initials?: string;
  color?: string;
};

function splitLinesToList(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function joinListToLines(list: string[] | undefined): string {
  return (list ?? []).join("\n");
}

export default function JobViewEditModal({
  job,
  isEditing,
  onRequestEdit,
  onClose,
  onChange,
  onSubmit,
  errorMessage,
}: {
  job: EditableJob;
  isEditing: boolean;
  onRequestEdit: () => void;
  onClose: () => void;
  onChange: (next: EditableJob) => void;
  onSubmit: () => void;
  errorMessage?: string;
}) {
  const [tagDraft, setTagDraft] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    joinListToLines(job.doList),
  );
  const [qualificationsText, setQualificationsText] = useState(
    joinListToLines(job.whyList),
  );
  const [applicationLimit, setApplicationLimit] = useState<number>(1);

  useEffect(() => {
    setResponsibilitiesText(joinListToLines(job.doList));
    setQualificationsText(joinListToLines(job.whyList));
    setTagDraft("");
    setIsAddingTag(false);
  }, [job.id, job.doList, job.whyList]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const initials = useMemo(() => {
    const fromJob = (job.initials ?? "").trim();
    if (fromJob) return fromJob.toUpperCase().slice(0, 2);
    const fromCompany = (job.company ?? "")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    return fromCompany || "JN";
  }, [job.company, job.initials]);

  const headerMetaRight = useMemo(() => {
    const timeLabel = (job.timeAgo ?? "").trim() || (job.date ? "Posted" : "");
    const timeValue = (job.timeAgo ?? "").trim() || (job.date ?? "");
    return { timeLabel, timeValue };
  }, [job.date, job.timeAgo]);

  const chip = (text: string, variant: "primary" | "muted" = "muted") => {
    const base =
      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold border";
    if (variant === "primary") {
      return (
        <span className={`${base} bg-[#e6f7f2] text-[#3b6f6a] border-[#cfe9e6]`}>
          {text}
        </span>
      );
    }
    return (
      <span className={`${base} bg-slate-100 text-slate-500 border-slate-200`}>
        {text}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-5xl rounded-[28px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Teal header bar */}
        <div className="h-[88px] bg-[#84b3af] relative flex-shrink-0">
          {!isEditing && (
            <button
              onClick={onRequestEdit}
              className="absolute top-4 right-16 px-8 py-2 bg-white text-slate-700 rounded-xl text-[12px] font-extrabold tracking-wide shadow-sm hover:bg-slate-50 active:scale-[0.99]"
            >
              EDIT
            </button>
          )}
          <button
            onClick={onClose}
            className="absolute top-5 right-6 text-white/90 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-6 sm:px-10 pt-6 pb-5 overflow-y-auto">
          {/* Company header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shrink-0"
                style={{ backgroundColor: job.color || "#2bbf86" }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 truncate">
                  {job.company}
                </h2>
                <p className="mt-1 text-sm text-slate-500 flex items-center gap-2">
                  <MapPin size={15} className="shrink-0" />
                  <span className="truncate">{job.location}</span>
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 shrink-0 pt-1">
              {headerMetaRight.timeValue &&
                chip(headerMetaRight.timeValue, "muted")}
            </div>
          </div>

          {/* Tech stack row */}
          <div className="mt-5 border border-slate-200 rounded-2xl px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-[12px] font-extrabold text-slate-600 shrink-0">
                Tech Stack Requirements:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {(job.techStack ?? []).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-[#e6f7f2] text-[#3b6f6a] border border-[#cfe9e6]"
                  >
                    {t}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          onChange({
                            ...job,
                            techStack: (job.techStack ?? []).filter(
                              (x) => x !== t,
                            ),
                          });
                        }}
                        className="text-[#3b6f6a]/70 hover:text-red-500"
                        aria-label={`Remove ${t}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}

                {isEditing && (
                  <div className="flex items-center gap-2">
                    {isAddingTag ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={tagDraft}
                          onChange={(e) => setTagDraft(e.target.value)}
                          placeholder="Add tag"
                          className="h-8 px-3 rounded-full border border-slate-200 text-[12px] font-semibold outline-none focus:ring-2 focus:ring-[#84b3af]/30"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = tagDraft.trim();
                            if (!next) return;
                            const curr = job.techStack ?? [];
                            if (
                              curr.some(
                                (x) => x.toLowerCase() === next.toLowerCase(),
                              )
                            ) {
                              setTagDraft("");
                              setIsAddingTag(false);
                              return;
                            }
                            onChange({ ...job, techStack: [...curr, next] });
                            setTagDraft("");
                            setIsAddingTag(false);
                          }}
                          className="h-8 px-4 rounded-full bg-slate-900 text-white text-[12px] font-bold hover:bg-slate-800"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTagDraft("");
                            setIsAddingTag(false);
                          }}
                          className="h-8 px-3 rounded-full border border-slate-200 text-slate-600 text-[12px] font-bold hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingTag(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                      >
                        <Plus size={14} /> Add
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form blocks */}
          <div className="mt-5 space-y-4">
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
              <div>
                <label className="text-[12px] font-extrabold text-slate-600">
                  Position
                </label>
                <input
                  value={job.title}
                  onChange={(e) => onChange({ ...job, title: e.target.value })}
                  disabled={!isEditing}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#84b3af]/30 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5">
              <label className="text-[12px] font-extrabold text-slate-600">
                Job Description
              </label>
              <textarea
                value={job.description}
                onChange={(e) =>
                  onChange({ ...job, description: e.target.value })
                }
                disabled={!isEditing}
                rows={4}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#84b3af]/30 resize-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5">
              <label className="text-[12px] font-extrabold text-slate-600">
                Key Responsibilities
              </label>
              {isEditing ? (
                <textarea
                  value={responsibilitiesText}
                  onChange={(e) => {
                    const v = e.target.value;
                    setResponsibilitiesText(v);
                    onChange({ ...job, doList: splitLinesToList(v) });
                  }}
                  rows={3}
                  placeholder={"One responsibility per line"}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#84b3af]/30 resize-none"
                />
              ) : (
                <ul className="mt-3 space-y-2 text-[13px] text-slate-600">
                  {(job.doList ?? []).length ? (
                    (job.doList ?? []).map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-1 text-slate-500">•</span>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">No items provided.</li>
                  )}
                </ul>
              )}
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5">
              <label className="text-[12px] font-extrabold text-slate-600">
                Ideal Qualifications
              </label>
              {isEditing ? (
                <textarea
                  value={qualificationsText}
                  onChange={(e) => {
                    const v = e.target.value;
                    setQualificationsText(v);
                    onChange({ ...job, whyList: splitLinesToList(v) });
                  }}
                  rows={3}
                  placeholder={"One qualification per line"}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#84b3af]/30 resize-none"
                />
              ) : (
                <ul className="mt-3 space-y-2 text-[13px] text-slate-600">
                  {(job.whyList ?? []).length ? (
                    (job.whyList ?? []).map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-1 text-slate-500">•</span>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">No items provided.</li>
                  )}
                </ul>
              )}
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5">
              <label className="text-[12px] font-extrabold text-slate-600">
                Project Timeline
              </label>
              {isEditing ? (
                <textarea
                  value={job.projectTimeline ?? ""}
                  onChange={(e) =>
                    onChange({ ...job, projectTimeline: e.target.value })
                  }
                  rows={3}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#84b3af]/30 resize-none"
                />
              ) : (
                <p className="mt-3 text-[13px] text-slate-600 leading-relaxed">
                  {(job.projectTimeline ?? "").trim() || (
                    <span className="text-slate-400">No timeline provided.</span>
                  )}
                </p>
              )}
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5">
              <label className="text-[12px] font-extrabold text-slate-600">
                Application &amp; Onboarding Process
              </label>
              {isEditing ? (
                <textarea
                  value={job.onboardingProcess ?? ""}
                  onChange={(e) =>
                    onChange({ ...job, onboardingProcess: e.target.value })
                  }
                  rows={3}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#84b3af]/30 resize-none"
                />
              ) : (
                <p className="mt-3 text-[13px] text-slate-600 leading-relaxed">
                  {(job.onboardingProcess ?? "").trim() || (
                    <span className="text-slate-400">
                      No onboarding process provided.
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Footer row like screenshot */}
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-extrabold text-slate-600">
                    Application Limit
                  </label>
                  <div className="mt-2 flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white">
                    <input
                      type="number"
                      value={applicationLimit}
                      onChange={(e) =>
                        setApplicationLimit(Math.max(1, Number(e.target.value)))
                      }
                      disabled={!isEditing}
                      className="w-full text-[13px] font-semibold text-slate-700 outline-none disabled:bg-transparent"
                    />
                    <div className="flex flex-col gap-1 pl-3">
                      <button
                        type="button"
                        disabled={!isEditing}
                        onClick={() => setApplicationLimit((v) => v + 1)}
                        className="h-5 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                        aria-label="Increase"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={!isEditing}
                        onClick={() => setApplicationLimit((v) => Math.max(1, v - 1))}
                        className="h-5 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                        aria-label="Decrease"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-extrabold text-slate-600">
                    Status
                  </label>
                  <div className="mt-2 relative">
                    <select
                      value={job.status ?? "Active"}
                      onChange={(e) =>
                        onChange({ ...job, status: e.target.value })
                      }
                      disabled={!isEditing}
                      className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#84b3af]/30 disabled:bg-slate-50 disabled:text-slate-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {errorMessage && (
                <p className="mt-4 text-[12px] font-bold text-red-500 text-right">
                  {errorMessage}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!isEditing}
                  className="px-10 py-2.5 bg-[#84b3af] text-white rounded-xl text-sm font-bold hover:bg-[#729e9a] transition-all shadow-md disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

