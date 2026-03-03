'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function MessagesPage() {
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const conversationMenuRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<"chat" | "report">("chat");
  const [reportReason, setReportReason] = useState<
    | "inappropriate"
    | "spam"
    | "scam"
    | "identity"
    | "other"
    | ""
  >("inappropriate");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!showConversationMenu) return;
      const el = conversationMenuRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setShowConversationMenu(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [showConversationMenu]);

  const openReport = () => {
    setShowConversationMenu(false);
    setReportSubmitted(false);
    setActiveView("report");
  };

  const closeReport = () => {
    setActiveView("chat");
    setReportSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] page-enter overflow-x-hidden pt-20">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-[#e5e7eb] px-6 lg:px-10">
        <div className="flex items-center justify-between h-20 max-w-[1400px] mx-auto">
          {/* Logo */}
          <Link href="/user/dashboard" className="flex items-center">
            <Image
              src="/AVAA Banner Borderless 1.png"
              alt="AVAA Logo"
              width={110}
              height={35}
              className="object-contain"
            />
          </Link>

          <div className="flex items-center gap-3">
            {/* Nav Links */}
            <div className="flex items-center gap-3">
              <Link
                href="/user/dashboard"
                className="flex items-center gap-1.5 px-3 lg:px-5 py-2.5 rounded-lg text-[15px] font-semibold text-[#5a6a75] hover:bg-[#f0f2f5] transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 3H8l-2 4h12l-2-4z" />
                </svg>
                <span className="hidden sm:inline">Jobs</span>
              </Link>

              <Link
                href="/user/saved-jobs"
                className="flex items-center gap-2 px-3 lg:px-5 py-2.5 rounded-lg border border-[#e5e7eb] text-[15px] font-semibold text-[#1a1a1a] bg-white hover:bg-[#f9fafb] shadow-sm transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
                <span className="hidden sm:inline">Saved Jobs</span>
              </Link>

              <Link
                href="/user/messages"
                className="flex items-center gap-2 px-3 lg:px-5 py-2.5 rounded-lg text-[15px] font-semibold text-white shadow-sm"
                style={{ background: "#7EB0AB" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
                  <polyline points="3 7 12 13 21 7" />
                </svg>
                <span className="hidden sm:inline">Messages</span>
              </Link>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-[#e5e7eb] mx-1" />

            {/* Notification bell */}
            <button className="p-2 text-[#5a6a75] hover:text-[#1a1a1a] hover:bg-[#f0f2f5] rounded-full transition-colors relative">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <div className="absolute top-2 right-2.5 w-[7px] h-[7px] bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-[#e5e7eb] bg-[#e6f7f2] font-bold text-[#7EB0AB]">
              AA
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        {activeView === "report" ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden">
              <div className="px-8 py-6 border-b border-[#f0f2f5]">
                <button
                  onClick={closeReport}
                  className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#5a6a75] hover:text-[#1a1a1a] mb-4"
                >
                  <span aria-hidden="true">←</span> Back to Messages
                </button>
                <h1 className="text-xl font-bold text-[#111827]">
                  Report Safety Concern
                </h1>
                <p className="text-[13px] text-[#6b7280] mt-1">
                  Your safety is our priority. Reports are handled
                  confidentially by our trust and safety team.
                </p>
              </div>

              <div className="px-8 py-6 space-y-6">
                <div className="border border-[#e5e7eb] rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#111827] text-white flex items-center justify-center text-sm font-semibold">
                    AT
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#111827]">
                      Reporting: Alex Thompson
                    </p>
                    <p className="text-[11px] text-[#6b7280]">
                      Senior Project Manager
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[12px] font-semibold text-[#111827] mb-3">
                    What&apos;s the main reason for your report?
                  </p>

                  <div className="space-y-3">
                    {[
                      {
                        id: "inappropriate",
                        title: "Inappropriate behavior",
                        desc: "Unprofessional language, harassment, or offensive communication style.",
                      },
                      {
                        id: "spam",
                        title: "Spam or automated content",
                        desc: "Unsolicited marketing, bots, or excessive repetitive messages.",
                      },
                      {
                        id: "scam",
                        title: "Suspicious job offer or scam",
                        desc: "Asking for bank details, external payments, or “get rich quick” schemes.",
                      },
                      {
                        id: "identity",
                        title: "Identity theft or faking profile",
                        desc: "Using a fake name, photo, or pretending to represent a company they don’t.",
                      },
                      {
                        id: "other",
                        title: "Other",
                        desc: "None of the above matches my specific concern.",
                      },
                    ].map((opt) => {
                      const checked = reportReason === (opt.id as any);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setReportReason(opt.id as typeof reportReason)
                          }
                          className={`w-full text-left border rounded-xl p-4 flex items-start gap-3 transition-colors ${
                            checked
                              ? "border-[#7EB0AB] bg-[#f7fffd]"
                              : "border-[#e5e7eb] hover:bg-[#f9fafb]"
                          }`}
                        >
                          <span
                            className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                              checked
                                ? "border-[#7EB0AB]"
                                : "border-[#d1d5db]"
                            }`}
                          >
                            {checked && (
                              <span className="w-2 h-2 rounded-full bg-[#7EB0AB]" />
                            )}
                          </span>
                          <span className="flex-1">
                            <span className="block text-[12px] font-semibold text-[#111827]">
                              {opt.title}
                            </span>
                            <span className="block text-[11px] text-[#6b7280] mt-1">
                              {opt.desc}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[12px] font-semibold text-[#111827] mb-2">
                    Additional details (Optional)
                  </p>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Please provide more context or specific examples to help us investigate..."
                    maxLength={1000}
                    className="w-full min-h-[110px] rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[12px] text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent"
                  />
                  <p className="text-[10px] text-[#9ca3af] mt-2">
                    Maximum 1000 characters.
                  </p>
                </div>

                {reportSubmitted && (
                  <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-[12px] text-[#166534]">
                    Report submitted. Our team will review it shortly.
                  </div>
                )}
              </div>

              <div className="px-8 py-5 border-t border-[#f0f2f5] flex items-center justify-end gap-3">
                <button
                  onClick={closeReport}
                  className="px-4 py-2 rounded-lg border border-[#e5e7eb] text-[12px] font-semibold text-[#374151] hover:bg-[#f9fafb]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setReportSubmitted(true)}
                  className="px-5 py-2 rounded-lg text-[12px] font-semibold text-white hover:opacity-90"
                  style={{ background: "#7EB0AB" }}
                >
                  Submit Report
                </button>
              </div>

              <div className="px-8 py-6 bg-[#fbfbfb] border-t border-[#f0f2f5]">
                <p className="text-[11px] font-semibold text-[#111827] mb-1">
                  Our Professional Commitment
                </p>
                <p className="text-[11px] text-[#6b7280]">
                  We take every report seriously. Our moderation team reviews all
                  safety reports within 24 hours. If we find violations of our
                  Terms of Service, appropriate actions ranging from warnings to
                  account suspension will be taken.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden flex h-[calc(100vh-160px)]">
          {/* Sidebar */}
          <aside className="w-72 border-r border-[#e5e7eb] flex flex-col">
            <div className="px-6 py-4 border-b border-[#f0f2f5]">
              <h1 className="text-xl font-bold text-[#1a1a1a] mb-3">Messages</h1>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] py-2 pl-9 pr-3 text-[13px] text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 text-[#9ca3af]"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 pt-3 pb-2 flex gap-2">
              <button className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-[#e6f7f2] text-[#1a7f6b]">
                All
              </button>
              <button className="px-3 py-1.5 rounded-full text-[12px] font-semibold text-[#6b7280] hover:bg-[#f3f4f6]">
                Archived
              </button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#e6f7f2] hover:bg-[#d9f0ea] text-left border-b border-[#f0f2f5]">
                <div className="w-10 h-10 rounded-full bg-[#1e3a4f] text-white flex items-center justify-center text-sm font-semibold">
                  TN
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[13px] font-semibold text-[#111827] truncate">
                      TechFlow
                    </p>
                    <span className="text-[11px] text-[#9ca3af] whitespace-nowrap">
                      2h ago
                    </span>
                  </div>
                  <p className="text-[12px] text-[#6b7280] truncate">
                    The hiring manager viewed your profile…
                  </p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f9fafb] text-left border-b border-[#f0f2f5]">
                <div className="w-10 h-10 rounded-full bg-[#111827] text-white flex items-center justify-center text-sm font-semibold">
                  AS
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[13px] font-semibold text-[#111827] truncate">
                      Anne Smith
                    </p>
                    <span className="text-[11px] text-[#9ca3af] whitespace-nowrap">
                      6h ago
                    </span>
                  </div>
                  <p className="text-[12px] text-[#6b7280] truncate">
                    Did you see the new brief for AI…
                  </p>
                </div>
              </button>
            </div>
          </aside>

          {/* Conversation panel */}
          <section className="flex-1 flex flex-col">
            {/* Header (no call / video icons) */}
            <div className="px-6 py-4 border-b border-[#f0f2f5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1e3a4f] text-white flex items-center justify-center text-sm font-semibold">
                  TN
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">
                    HR Team @ TechFlow
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    <span className="text-[11px] font-medium text-[#16a34a]">
                      Online
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative" ref={conversationMenuRef}>
                <button
                  onClick={() => setShowConversationMenu((v) => !v)}
                  className="p-2 rounded-full hover:bg-[#f3f4f6] text-[#6b7280]"
                  aria-haspopup="menu"
                  aria-expanded={showConversationMenu}
                >
                  {/* Vertical dots */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>

                {showConversationMenu && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.18)] border border-[#e5e7eb] overflow-hidden z-50"
                  >
                    
                    <div className="h-px bg-[#f0f2f5]" />

                    <button
                      role="menuitem"
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        <path d="M4 4l16 16" />
                      </svg>
                      Mute Notification
                    </button>
                    <button
                      role="menuitem"
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Archive Conversation
                    </button>

                    <div className="h-px bg-[#f0f2f5]" />

                    <button
                      role="menuitem"
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                      Block
                    </button>
                    <button
                      role="menuitem"
                      onClick={openReport}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                        <path d="M10.29 3.86l-7.4 12.8A2 2 0 0 0 4.62 20h14.76a2 2 0 0 0 1.73-3.34l-7.4-12.8a2 2 0 0 0-3.42 0Z" />
                      </svg>
                      Report
                    </button>

                    <div className="h-px bg-[#f0f2f5]" />

                    <button
                      role="menuitem"
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-red-600 hover:bg-red-50"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                      Delete Conversation
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-[#f9fafb]">
              <div className="space-y-4">
                <div className="text-center">
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#6b7280] shadow-sm border border-[#e5e7eb]">
                    Today
                  </span>
                </div>

                {/* Incoming message */}
                <div className="flex items-start gap-3 max-w-xl">
                  <div className="w-8 h-8 rounded-full bg-[#1e3a4f] text-white flex items-center justify-center text-[11px] font-semibold">
                    TN
                  </div>
                  <div>
                    <div className="rounded-2xl rounded-tl-none bg-white border border-[#e5e7eb] px-4 py-3 text-[13px] text-[#111827] shadow-sm">
                      Hi John, thank you for applying for the Senior Executive
                      VA position. We&apos;ve reviewed your portfolio and were
                      quite impressed with your previous work at TechFlow.
                    </div>
                    <p className="mt-1 text-[11px] text-[#9ca3af]">09:15 AM</p>
                  </div>
                </div>

                {/* Outgoing message */}
                <div className="flex justify-end">
                  <div className="max-w-xl">
                    <div className="rounded-2xl rounded-tr-none bg-[#7EB0AB] px-4 py-3 text-[13px] text-white shadow-sm">
                      Thank you so much! I&apos;m really excited about the
                      possibility of joining TechFlow. I&apos;m available for
                      the interview slot tomorrow at 2 PM as suggested.
                    </div>
                    <p className="mt-1 text-[11px] text-right text-[#9ca3af]">
                      10:42 AM
                    </p>
                  </div>
                </div>

                {/* Incoming message */}
                <div className="flex items-start gap-3 max-w-xl">
                  <div className="w-8 h-8 rounded-full bg-[#1e3a4f] text-white flex items-center justify-center text-[11px] font-semibold">
                    TN
                  </div>
                  <div>
                    <div className="rounded-2xl rounded-tl-none bg-white border border-[#e5e7eb] px-4 py-3 text-[13px] text-[#111827] shadow-sm">
                      Perfect. I&apos;ve sent over the official calendar invite
                      and the preliminary offer document for your review before
                      our call.
                    </div>
                    <p className="mt-1 text-[11px] text-[#9ca3af]">10:45 AM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Composer */}
            <div className="border-t border-[#e5e7eb] bg-white px-6 py-3">
              <div className="flex items-center gap-3">
                {/* Left icons: attachment, image, mic */}
                <div className="flex items-center gap-2 text-[#6b7280]">
                  <button className="p-2 rounded-full hover:bg-[#f3f4f6]">
                    {/* Paperclip */}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21.44 11.05l-8.49 8.49a5 5 0 0 1-7.07-7.07l8.49-8.49a3 3 0 1 1 4.24 4.24l-8.49 8.49a1 1 0 0 1-1.41-1.41l7.79-7.79" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full hover:bg-[#f3f4f6]">
                    {/* Image */}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-4-4-3 3-2-2-5 5" />
                    </svg>
                  </button>
                 
                </div>

                {/* Input */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Write a message..."
                    className="w-full rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2 text-[13px] text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent"
                  />
                </div>

                {/* Emoji */}
                <button className="p-2 rounded-full hover:bg-[#f3f4f6] text-[#6b7280]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </button>

                {/* Send */}
                <button className="p-2 rounded-full bg-[#7EB0AB] text-white hover:opacity-90 shadow-sm">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </div>
        )}
      </main>
    </div>
  );
}

