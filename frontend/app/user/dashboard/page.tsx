"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import AuthPromptModal from "@/components/AuthPromptModal";
import { messagesApi } from "@/lib/messages";
import api from "@/lib/axios";
import MessageModal from '@/components/messaging/MessageModal';

interface Job {
  id: number;
  initials: string;
  position: string;
  color: string;
  title: string;
  company: string;
  location: string;
  timeAgo: string;
  type: string;
  tags: string[];
  salary: string;
  description: string;
  whatYoullDo: string[];
  whyCompany: string[];
  recruiter_name?: string;
  recruiter_role?: string;
}
const DATE_FILTERS = ["All Time", "Today", "This Week", "This Month"];

const APPLY_STEPS = [
  { id: 1, label: "Info" },
  { id: 2, label: "Resume" },
  { id: 3, label: "Q&A" },
  { id: 4, label: "Review" },
];

interface ApplyFormData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  coverLetter: string;
  whyInterested: string;
  experience: string;
}

function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ApplyFormData>({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    coverLetter: "",
    whyInterested: "",
    experience: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof ApplyFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canGoNext = (): boolean => {
    if (step === 1)
      return form.fullName.trim() !== "" && form.email.trim() !== "";
    if (step === 2) return selectedFile !== null;
    if (step === 3) return form.whyInterested.trim() !== "";
    return true;
  };

  const handleNext = () => {
    if (step < 4 && canGoNext()) setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('full_name', form.fullName);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('linkedin', form.linkedin);
      formData.append('cover_letter', form.coverLetter);
      formData.append('why_interested', form.whyInterested);
      formData.append('experience', form.experience);
      
      if (selectedFile) {
        formData.append('cv', selectedFile);
      }

      await api.post(`/jobs/${job.id}/apply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit application', error);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (
      file &&
      (file.type === "application/pdf" ||
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx"))
    ) {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Success screen
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div
          className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-8 text-center"
          style={{ animation: "fadeInScale 0.3s ease-out" }}
        >
          <div className="w-16 h-16 rounded-full bg-[#e6faf0] flex items-center justify-center mx-auto mb-5">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7EB0AB"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">
            Application Submitted!
          </h3>
          <p className="text-sm text-[#5a6a75] mb-6">
            Your application for <strong>{job.title}</strong> at{" "}
            <strong>{job.company}</strong> has been sent successfully.
          </p>
          <button
            onClick={onClose}
            className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #7EB0AB, #6A9994)" }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        style={{ animation: "fadeInScale 0.3s ease-out" }}
      >
        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-bold text-[#1a1a1a]">Apply for Job</h3>
          <button
            onClick={onClose}
            className="text-[#9ca3af] hover:text-[#1a1a1a] transition-colors p-1"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Step Indicator ── */}
        <div className="px-6 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            {APPLY_STEPS.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center flex-1 last:flex-none"
              >
                {/* Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step > s.id
                      ? "bg-[#7EB0AB] text-white shadow-md shadow-[#7EB0AB]/30"
                      : step === s.id
                        ? "bg-[#1e3a4f] text-white shadow-md shadow-[#1e3a4f]/30"
                        : "bg-[#f0f2f5] text-[#9ca3af]"
                      }`}
                  >
                    {step > s.id ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      s.id
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold mt-1.5 ${step >= s.id ? "text-[#1a1a1a]" : "text-[#9ca3af]"
                      }`}
                  >
                    {s.label}
                  </span>
                </div>
                {/* Connector Line */}
                {i < APPLY_STEPS.length - 1 && (
                  <div className="flex-1 mx-2 mb-5">
                    <div className="h-[2px] rounded-full bg-[#e5e7eb] relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-[#7EB0AB] rounded-full transition-all duration-500"
                        style={{ width: step > s.id ? "100%" : "0%" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Job Info Card ── */}
        <div className="mx-6 mb-4 p-3 bg-[#f8fafc] border border-[#e5e7eb] rounded-xl flex items-center gap-3 flex-shrink-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ backgroundColor: job.color }}
          >
            {job.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#1a1a1a] truncate">
              {job.title}
            </p>
            <p className="text-xs text-[#5a6a75] truncate">
              {job.company} &bull; {job.location}
            </p>
          </div>
          <svg
            className="ml-auto flex-shrink-0 text-[#7EB0AB]"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* ── Step Content (Scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div
              className="space-y-4"
              style={{ animation: "slideIn 0.25s ease-out" }}
            >
              <h4 className="text-[15px] font-bold text-[#1a1a1a] mb-1">
                Personal Information
              </h4>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#d1d5db] rounded-xl text-sm text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all"
                  placeholder="e.g. Juan Dela Cruz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#d1d5db] rounded-xl text-sm text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all"
                  placeholder="juan@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#d1d5db] rounded-xl text-sm text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all"
                  placeholder="+63 912 345 6789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={form.linkedin}
                  onChange={(e) => updateField("linkedin", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#d1d5db] rounded-xl text-sm text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
          )}

          {/* Step 2: Resume */}
          {step === 2 && (
            <div
              className="space-y-4"
              style={{ animation: "slideIn 0.25s ease-out" }}
            >
              <h4 className="text-[15px] font-bold text-[#1a1a1a] mb-1">
                Resume / CV
              </h4>

              {/* File Upload Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragOver
                  ? "border-[#7EB0AB] bg-[#e6faf0]"
                  : selectedFile
                    ? "border-[#7EB0AB] bg-[#f0fdf7]"
                    : "border-[#d1d5db] bg-[#f9fafb] hover:border-[#7EB0AB] hover:bg-[#fafffe]"
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#1a1a1a] truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-[#5a6a75]">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="p-1.5 rounded-full hover:bg-[#fee2e2] text-[#9ca3af] hover:text-red-500 transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-10 w-10 text-[#7EB0AB] mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-sm font-semibold text-[#1a1a1a]">
                      Tap to browse files
                    </p>
                    <p className="text-xs text-[#9ca3af] mt-1">
                      Supports PDF, DOC, DOCX up to 5MB
                    </p>
                  </>
                )}
              </div>

              {/* Cover Letter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-[#1a1a1a]">
                    Cover Letter
                  </label>
                  <span className="text-xs text-[#9ca3af]">Optional</span>
                </div>
                <textarea
                  value={form.coverLetter}
                  onChange={(e) => updateField("coverLetter", e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full px-3.5 py-2.5 border border-[#d1d5db] rounded-xl text-sm text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all resize-none"
                  placeholder="Introduce yourself and explain why you're a good fit for this role..."
                />
                <p className="text-right text-xs text-[#9ca3af] mt-1">
                  {form.coverLetter.length}/500
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Q&A */}
          {step === 3 && (
            <div
              className="space-y-4"
              style={{ animation: "slideIn 0.25s ease-out" }}
            >
              <h4 className="text-[15px] font-bold text-[#1a1a1a] mb-1">
                Quick Questions
              </h4>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Why are you interested in this role?{" "}
                  <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.whyInterested}
                  onChange={(e) => updateField("whyInterested", e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-[#d1d5db] rounded-xl text-sm text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all resize-none"
                  placeholder="Share what excites you about this position..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Describe your relevant experience
                </label>
                <textarea
                  value={form.experience}
                  onChange={(e) => updateField("experience", e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-[#d1d5db] rounded-xl text-sm text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all resize-none"
                  placeholder="Highlight any projects or skills that are relevant..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div
              className="space-y-4"
              style={{ animation: "slideIn 0.25s ease-out" }}
            >
              <h4 className="text-[15px] font-bold text-[#1a1a1a] mb-1">
                Review Your Application
              </h4>

              {/* Personal Info Review */}
              <div className="bg-[#f8fafc] border border-[#e5e7eb] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-xs font-bold text-[#5a6a75] uppercase tracking-wider">
                    Personal Info
                  </h5>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-[#7EB0AB] hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-[11px] text-[#9ca3af]">Name</p>
                    <p className="text-[#1a1a1a] font-medium">
                      {form.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9ca3af]">Email</p>
                    <p className="text-[#1a1a1a] font-medium truncate">
                      {form.email}
                    </p>
                  </div>
                  {form.phone && (
                    <div>
                      <p className="text-[11px] text-[#9ca3af]">Phone</p>
                      <p className="text-[#1a1a1a] font-medium">{form.phone}</p>
                    </div>
                  )}
                  {form.linkedin && (
                    <div>
                      <p className="text-[11px] text-[#9ca3af]">LinkedIn</p>
                      <p className="text-[#1a1a1a] font-medium truncate">
                        {form.linkedin}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resume Review */}
              <div className="bg-[#f8fafc] border border-[#e5e7eb] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-xs font-bold text-[#5a6a75] uppercase tracking-wider">
                    Resume
                  </h5>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs font-semibold text-[#7EB0AB] hover:underline"
                  >
                    Edit
                  </button>
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <p className="text-sm text-[#1a1a1a] font-medium">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-[#9ca3af]">
                      ({formatFileSize(selectedFile.size)})
                    </p>
                  </div>
                )}
                {form.coverLetter && (
                  <div className="mt-2">
                    <p className="text-[11px] text-[#9ca3af] mb-1">
                      Cover Letter
                    </p>
                    <p className="text-sm text-[#5a6a75] leading-relaxed line-clamp-3">
                      {form.coverLetter}
                    </p>
                  </div>
                )}
              </div>

              {/* Q&A Review */}
              <div className="bg-[#f8fafc] border border-[#e5e7eb] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-xs font-bold text-[#5a6a75] uppercase tracking-wider">
                    Q&A
                  </h5>
                  <button
                    onClick={() => setStep(3)}
                    className="text-xs font-semibold text-[#7EB0AB] hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div>
                  <p className="text-[11px] text-[#9ca3af] mb-0.5">
                    Why interested?
                  </p>
                  <p className="text-sm text-[#5a6a75] leading-relaxed line-clamp-2">
                    {form.whyInterested}
                  </p>
                </div>
                {form.experience && (
                  <div className="mt-2">
                    <p className="text-[11px] text-[#9ca3af] mb-0.5">
                      Experience
                    </p>
                    <p className="text-sm text-[#5a6a75] leading-relaxed line-clamp-2">
                      {form.experience}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer Buttons ── */}
        <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between flex-shrink-0 bg-white">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#5a6a75] hover:text-[#1a1a1a] transition-colors rounded-xl hover:bg-[#f0f2f5]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-[#5a6a75] hover:text-[#1a1a1a] transition-colors rounded-xl hover:bg-[#f0f2f5]"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${canGoNext()
                ? "hover:opacity-90 hover:shadow-lg shadow-md"
                : "opacity-50 cursor-not-allowed"
                }`}
              style={{
                background: canGoNext()
                  ? "linear-gradient(135deg, #7EB0AB, #6A9994)"
                  : "#9ca3af",
              }}
            >
              Next Step
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg shadow-md"
              style={{
                background: "linear-gradient(135deg, #7EB0AB, #6A9994)",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
              Submit Application
            </button>
          )}
        </div>

        {/* Inline Animations */}
        <style jsx>{`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(12px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

// Animated job card wrapper
function JobCard({
  job,
  isSelected,
  isBookmarked,
  onSelect,
  onBookmark,
  delay,
  visible,
}: {
  job: Job;
  isSelected: boolean;
  isBookmarked: boolean;
  onSelect: () => void;
  onBookmark: (e: React.MouseEvent) => void;
  delay: number;
  visible: boolean;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition:
          "opacity 0.35s ease, transform 0.35s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      className={`bg-white rounded-2xl border p-5 hover:shadow-lg group cursor-pointer ${isSelected
        ? "border-[#7EB0AB] shadow-md"
        : "border-[#e5e7eb] hover:border-[#c5ccd3]"
        }`}
    >
      {/* Top Row: Avatar + Bookmark */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: job.color }}
          >
            {job.initials}
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#1a1a1a] leading-tight">
              {job.title}
            </h3>
            <p className="text-[13px] text-[#5a6a75]">{job.company}</p>
          </div>
        </div>
        <button
          onClick={onBookmark} // This matches the prop name passed from the grid
          className="text-[#9ca3af] hover:text-[#1e3a4f] transition-colors p-1"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            // We check if the current job.id is in our bookmarked array
            fill={isBookmarked ? "#1e3a4f" : "none"}
            stroke={isBookmarked ? "#1e3a4f" : "currentColor"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
        </button>
      </div>

      {/* Meta Row */}
      <div className="flex items-center gap-3 mb-4 text-[13px] text-[#5a6a75]">
        <span className="flex items-center gap-1">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {job.location}
        </span>
        <span className="flex items-center gap-1">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {job.timeAgo}
        </span>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${job.type === "Full-time"
            ? "bg-[#e6f7f2] text-[#7EB0AB]"
            : "bg-[#fef3e2] text-[#b8860b]"
            }`}
        >
          {job.type}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6 mt-1">
        {job.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#e5e7eb] text-[#5a6a75] border border-transparent hover:border-[#d1d5db] transition-colors"
          >
            {tag}
          </span>
        ))}
        {job.tags.length > 3 && (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#f0f2f5] text-[#9ca3af]">
            +{job.tags.length - 3}
          </span>
        )}
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between border-t border-[#f0f2f5] pt-4 mt-auto">
        <div>
          <span className="block text-[11px] font-medium text-[#9ca3af] mb-0.5">
            Salary Range
          </span>
          <span className="text-[14px] font-bold text-[#1e3a4f] group-hover:text-[#7EB0AB] transition-colors">
            {job.salary}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="flex justify-center flex-1 ml-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all shadow-sm"
          style={{ background: "#7EB0AB" }}
        >
          {/* Apply Now */}
          View Details
        </button>
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  const { isLoading, isAuthenticated, logout, user } = useAuth({
    redirect: false,
  });
  // 1. ALL STATE DEFINITIONS FIRST
  const [jobs, setJobs] = useState<Job[]>([]); // Define jobs before using it below
  const [searchQuery, setSearchQuery] = useState("");
  const [sliding, setSliding] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right",
  );
  const [activeView, setActiveView] = useState<"grid" | "details">("grid");
  const [lastSelectedJob, setLastSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeDateFilter, setActiveDateFilter] = useState("All Time");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [bookmarked, setBookmarked] = useState<number[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const userName = user?.name || "User";
  const userInitials =
    userName
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";
  const userEmail = user?.email || "";
  const profileImageUrl = user?.profile_image_url || null;
  const [visibleIds, setVisibleIds] = useState<number[]>([]);
  const prevFilteredIds = useRef<number[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalRecruiter, setMessageModalRecruiter] = useState<{id: number, name: string} | null>(null);
  // 2. DERIVED DATA (Calculated after state)
  // We only need one declaration of these.
  // We add '|| []' and 'jobs.length' checks to prevent crashes while loading.
  const allTags =
    jobs.length > 0
      ? Array.from(new Set(jobs.flatMap((j) => j.tags || [])))
      : [];

  const companies =
    jobs.length > 0
      ? Array.from(new Set(jobs.map((j) => j.company))).sort()
      : [];
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle URL parameters for auto-navigation to messages
  useEffect(() => {
    const recruiterId = searchParams.get('recruiterId');
    if (recruiterId && isAuthenticated) {
      // Navigate to messages with specific recruiter ID
      router.push(`/user/messages?userId=${recruiterId}`);
    }
  }, [searchParams, isAuthenticated, router]);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await messagesApi.getUnreadCount();
          setUnreadCount(response.data.unread_count);
        } catch (error) {
          console.error('Failed to fetch unread count:', error);
        }
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // 3. FETCHING DATA
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // 1. Use the full Laravel URL (Port 8000)
        // Replace 'http://backend.test' with your actual local IP and port
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/jobs`);
        const result = await response.json();

        // 2. Check result.success and result.data (the array)
        if (result.success && Array.isArray(result.data)) {
          // 3. Map snake_case from DB to camelCase for your Frontend
          const formattedJobs = result.data.map((job: any) => ({
            ...job,
            // Fallbacks to prevent .map() errors in your JSX
            tags: job.tags || [],
            whatYoullDo: job.what_youll_do || job.whatYoullDo || [],
            whyCompany: job.why_company || job.whyCompany || [],
            timeAgo: job.time_ago || job.timeAgo || "Just now",
          }));

          setJobs(formattedJobs);

          // 4. Set the first job as selected if nothing is selected yet
          if (formattedJobs.length > 0) {
            setSelectedJob(formattedJobs[0]);
          }
        } else {
          console.error("API returned success:false or invalid data format");
          setJobs([]);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        setJobs([]); // Set to empty array so .filter() doesn't crash
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);
  useEffect(() => {
    document.title = "Dashboard | AVAA";
  }, []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };
  // ─── Filtering Logic ──────────────────────────────────
  useEffect(() => {
    const fetchUserBookmarks = async () => {
      try {
        // You'll need to create this endpoint in Laravel: Route::get('/bookmarks')
        const response = await api.get("/bookmarks");
        // Assume Laravel returns an array of job IDs: [1, 5, 12]
        setBookmarked(response.data);
      } catch (error) {
        console.error("Could not load bookmarks", error);
      }
    };

    if (isAuthenticated) {
      fetchUserBookmarks();
    }
  }, [isAuthenticated]);
  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter((job) => {
    // 1. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        (job.tags || []).some((tag: string) => tag.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    // 2. Date Filter (The missing piece)
    if (activeDateFilter !== "All Time") {
      const jobDate = job?.timeAgo || job?.timeAgo || "";
      if (activeDateFilter === "Today") {
        const isToday =
          jobDate.includes("h ago") ||
          jobDate.includes("m ago") ||
          jobDate === "Just now";
        if (!isToday) return false;
      }
      // Add logic for "This Week" or "This Month" here if needed
    }

    // 3. Skills Filter
    if (selectedSkills.length > 0) {
      const matches = selectedSkills.every((skill) =>
        (job.tags || []).includes(skill),
      );
      if (!matches) return false;
    }

    // 4. Company Filter
    if (selectedCompanies.length > 0) {
      if (!selectedCompanies.includes(job.company)) return false;
    }

    return true;
  });
  // ─── Animation: fade+slide cards in when filter changes ──
  useEffect(() => {
    // 1. Safety check: ensure filteredJobs exists and is an array
    if (!Array.isArray(filteredJobs)) return;

    const newIds = filteredJobs.map((j) => j.id);

    // 2. First, hide removed cards
    const removed = prevFilteredIds.current.filter(
      (id) => !newIds.includes(id),
    );

    if (removed.length > 0) {
      setVisibleIds((prev) => prev.filter((id) => !removed.includes(id)));
    }

    // 3. Then stagger-reveal new/remaining cards
    newIds.forEach((id, i) => {
      setTimeout(() => {
        setVisibleIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      }, i * 60);
    });

    // 4. Update the ref for the next render
    prevFilteredIds.current = newIds;

    // 5. Close detail panel if the currently selected job is filtered out
    if (selectedJob && !newIds.includes(selectedJob.id)) {
      setSelectedJob(null);
    }

    // UPDATED: Added filteredJobs to dependencies so it triggers on API load
  }, [
    searchQuery,
    selectedSkills,
    selectedCompanies,
    activeDateFilter,
    filteredJobs,
    selectedJob,
  ]);

  // Initial load animation
  useEffect(() => {
    setVisibleIds([]);
    jobs.forEach((job, i) => {
      setTimeout(() => {
        setVisibleIds((prev) => [...prev, job.id]);
      }, i * 80);
    });
    prevFilteredIds.current = jobs.map((j) => j.id);
  }, [jobs]);

  if (isLoading) return null;

  // 4. LOADING GUARDS
  /*if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f5f7fa]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7EB0AB]"></div>
      </div>
    );
  }
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f5f7fa] p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e5e7eb] text-center max-w-md">
          <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">
            No jobs found
          </h3>
          <p className="text-[#5a6a75] mb-6">
            We couldn&apos;t find any job listings in the database right now.
          </p>
        </div>
      </div>
    );
  }
*/
  const handleSelectJob = (job: Job) => {
    if (job.id === lastSelectedJob?.id && activeView === "details") return;
    setLastSelectedJob(job);
    setSelectedJob(job);
    // Slide container to the left (showing right half)
    setActiveView("details");
  };

  const handleClearSelection = () => {
    if (activeView === "grid") return;
    // Slide container to the right (showing left half)
    setActiveView("grid");
    // Optionally clear selectedJob after animation completes, but we can just keep it mounted.
    setTimeout(() => setSelectedJob(null), 500);
  };

  const toggleCompany = (company: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : [...prev, company],
    );
  };

  const toggleBookmark = async (jobId: number) => {
    const numericId = Number(jobId);

    try {
      // 1. OPTIMISTIC UPDATE: Change the heart color immediately
      setBookmarked((prev) => {
        const isCurrentlySaved = prev.map(Number).includes(numericId);
        if (isCurrentlySaved) {
          return prev.filter((id) => Number(id) !== numericId);
        } else {
          return [...prev, numericId];
        }
      });

      // 2. Call Laravel
      const response = await api.post(`/jobs/${numericId}/bookmark`);

      // 3. Sync with Server: Ensure state matches Laravel's final word
      const isSavedOnServer = response.data.saved;
      setBookmarked((prev) => {
        const exists = prev.map(Number).includes(numericId);
        if (isSavedOnServer && !exists) return [...prev, numericId];
        if (!isSavedOnServer && exists) return prev.filter((id) => Number(id) !== numericId);
        return prev;
      });

    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      // Rollback on error
      setBookmarked((prev) => prev.filter((id) => Number(id) !== numericId));
    }
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

          {/* Nav Links */}
          <div className="flex items-center gap-3">
            <Link
              href="/user/dashboard"
              className="flex items-center gap-1.5 px-3 lg:px-5 py-2.5 rounded-lg text-[15px] font-semibold text-white shadow-sm"
              style={{ background: "#7EB0AB" }}
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
              Jobs
            </Link>

            {/* Saved Jobs Link */}
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

            {/* Messages Link */}
            <Link
              href="/user/messages"
              className="flex items-center gap-2 px-3 lg:px-5 py-2.5 rounded-lg border border-[#e5e7eb] text-[15px] font-semibold text-[#1a1a1a] bg-white hover:bg-[#f9fafb] shadow-sm transition-colors relative"
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
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
                <polyline points="3 7 12 13 21 7" />
              </svg>
              <span className="hidden sm:inline">Messages</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {isAuthenticated && (
              <>
                {/* Notification Bell */}
                <div className="relative mx-1">
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
                    <div className="absolute top-2 right-2.5 w-[7px] h-[7px] bg-red-500 rounded-full border-2 border-white"></div>
                  </button>
                </div>
                <div className="w-px h-6 bg-[#e5e7eb] mx-1"></div>
                <div className="relative mx-1">
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
                    <div className="absolute top-2 right-2.5 w-[7px] h-[7px] bg-red-500 rounded-full border-2 border-white"></div>
                  </button>
                </div>
                <div className="w-px h-6 bg-[#e5e7eb] mx-1"></div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] hover:border-[#7EB0AB] transition-all ml-1 bg-[#e6f7f2] font-bold text-[#7EB0AB]"
                    style={profileImageUrl ? { backgroundImage: `url(${profileImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                  >
                    {!profileImageUrl && userInitials}
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-[#e5e7eb] overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                      {/* User Info Header */}
                      <div className="p-4 border-b border-[#e5e7eb] flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center border border-[#7EB0AB] bg-[#e6f7f2] text-[#7EB0AB] font-bold text-lg"
                          style={profileImageUrl ? { backgroundImage: `url(${profileImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                        >
                          {!profileImageUrl && userInitials}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[14px] font-bold text-[#1a1a1a] truncate">
                            {userName}
                          </span>
                          <span className="text-[12px] font-medium text-[#5a6a75] truncate">
                            {userEmail}
                          </span>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          href="/user/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors group"
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
                            className="text-[#5a6a75] group-hover:text-[#7EB0AB] transition-colors"
                          >
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          Account
                        </Link>
                        <button className="w-full flex items-center justify-between px-4 py-2.5 text-[14px] font-semibold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors group text-left">
                          <div className="flex items-center gap-3">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-[#5a6a75] group-hover:text-[#7EB0AB] transition-colors"
                            >
                              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                            Dark Mode
                          </div>
                        </button>
                        <Link
                          href="/user/settings"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors group border-b border-[#f0f2f5]"
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
                            className="text-[#5a6a75] group-hover:text-[#7EB0AB] transition-colors"
                          >
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                          </svg>
                          Settings
                        </Link>

                        <div className="p-2">
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              setShowLogoutConfirm(true);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-bold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors group"
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
                              className="text-[#5a6a75] group-hover:text-[#7EB0AB] transition-colors"
                            >
                              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {!isAuthenticated && !isLoading && (
              <Link
                href="/signin"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "#7EB0AB" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Main Content Wrapper ─── */}
      <div className="w-full overflow-hidden relative">
        {/* 200% wide flex container for sliding. Left 50% = Grid, Right 50% = Details */}
        <div
          className="flex w-[200%] transition-transform duration-500 ease-in-out"
          style={{
            transform:
              activeView === "grid" ? "translateX(0)" : "translateX(-50%)",
          }}
        >
          {/* ─── View 1: Grid (Left half) ─── */}
          <div className="w-[50%] flex-shrink-0 max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
            {/* Mobile Page Header (Visible only on small screens) */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 lg:hidden">
              <div>
                <h1 className="text-2xl md:text-[28px] font-bold text-[#1a1a1a] mb-1">
                  Find Your Next Role
                </h1>
                <p className="text-sm md:text-[15px] text-[#5a6a75]">
                  Browse open positions from top companies
                </p>
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-sm font-semibold text-[#1a1a1a] shadow-sm hover:bg-[#f9fafb] transition-all"
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
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                Filters
              </button>
            </div>

            <div className="flex gap-8">
              {/* ─── Left Sidebar ─── */}
              <aside
                className={`hidden lg:block flex-shrink-0 ${selectedJob ? "w-[200px]" : "w-[240px]"} transition-all duration-300`}
              >
                {/* Desktop Header moved inside styling */}
                <div className="mb-6 pb-6 border-b border-[#e5e7eb]">
                  <h1
                    className={`${selectedJob ? "text-2xl" : "text-[28px]"} font-bold text-[#1a1a1a] mb-2 leading-tight transition-all`}
                  >
                    Find Your Next Role
                  </h1>
                  <p className="text-[14px] text-[#5a6a75] leading-relaxed">
                    Browse open positions from top companies
                  </p>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9ca3af"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-[#d1d5db] rounded-lg text-sm text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all"
                  />
                </div>

                {/* Date Posted */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">
                    Date Posted
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {DATE_FILTERS.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveDateFilter(filter)}
                        style={{
                          transition:
                            "background-color 0.2s ease, color 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease",
                          transform:
                            activeDateFilter === filter
                              ? "scale(1.05)"
                              : "scale(1)",
                          boxShadow:
                            activeDateFilter === filter
                              ? "0 2px 8px rgba(30,58,79,0.18)"
                              : "none",
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${activeDateFilter === filter
                          ? "bg-[#1e3a4f] text-white"
                          : "bg-white border border-[#d1d5db] text-[#5a6a75] hover:bg-[#f0f2f5]"
                          }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills / Tags Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {/* Changed ALL_TAGS to allTags */}
                    {(showAllSkills ? allTags : allTags.slice(0, 6)).map(
                      (skill) => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          style={{
                            transition:
                              "background-color 0.2s ease, color 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease",
                            transform: selectedSkills.includes(skill)
                              ? "scale(1.07)"
                              : "scale(1)",
                            boxShadow: selectedSkills.includes(skill)
                              ? "0 2px 8px rgba(126,176,171,0.25)"
                              : "none",
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${selectedSkills.includes(skill)
                            ? "bg-[#7EB0AB] text-white"
                            : "bg-white border border-[#d1d5db] text-[#5a6a75] hover:bg-[#f0f2f5]"
                            }`}
                        >
                          {skill}
                        </button>
                      ),
                    )}
                  </div>

                  {/* Changed ALL_TAGS to allTags */}
                  {allTags.length > 6 && (
                    <button
                      onClick={() => setShowAllSkills(!showAllSkills)}
                      className="mt-2 text-xs font-medium text-[#7EB0AB] hover:text-[#6A9994] transition-colors"
                    >
                      {showAllSkills
                        ? "Show Less"
                        : `+${allTags.length - 6} more`}
                    </button>
                  )}
                </div>

                {/* Company */}
                <div>
                  <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">
                    Company
                  </h3>
                  <div className="space-y-2">
                    {/* Changed COMPANIES to companies */}
                    {(showAllCompanies ? companies : companies.slice(0, 4)).map(
                      (company) => (
                        <label
                          key={company}
                          className="flex items-center gap-2.5 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCompanies.includes(company)}
                            onChange={() => toggleCompany(company)}
                            className="w-4 h-4 rounded border-[#d1d5db] text-[#7EB0AB] focus:ring-[#7EB0AB] accent-[#7EB0AB]"
                          />
                          <span className="text-sm text-[#5a6a75] group-hover:text-[#1a1a1a] transition-colors">
                            {company}
                          </span>
                        </label>
                      ),
                    )}
                  </div>

                  {/* Changed COMPANIES to companies */}
                  {companies.length > 4 && (
                    <button
                      onClick={() => setShowAllCompanies(!showAllCompanies)}
                      className="mt-2 text-xs font-medium text-[#7EB0AB] hover:text-[#6A9994] transition-colors"
                    >
                      {showAllCompanies
                        ? "Show Less"
                        : `+${companies.length - 4} more`}
                    </button>
                  )}
                </div>

                {/* Clear Filters */}
                {(selectedSkills.length > 0 ||
                  selectedCompanies.length > 0 ||
                  searchQuery.trim()) && (
                    <button
                      onClick={() => {
                        setSelectedSkills([]);
                        setSelectedCompanies([]);
                        setSearchQuery("");
                      }}
                      style={{
                        transition: "opacity 0.3s ease, transform 0.3s ease",
                      }}
                      className="mt-5 w-full px-3 py-2 rounded-lg text-xs font-semibold text-[#5a6a75] border border-[#d1d5db] hover:bg-[#f0f2f5] hover:text-[#1a1a1a] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Clear Filters
                    </button>
                  )}
              </aside>

             {/* ─── Job Cards Grid ─── */}
<main className="min-w-0 transition-all duration-200 flex-1">
  {loading ? (
    /* 1. Loading State */
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7EB0AB]"></div>
    </div>
  ) : filteredJobs.length === 0 ? (
    /* 2. Empty State (No Jobs Found) */
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#e5e7eb] shadow-sm">
      <div className="text-center max-w-md px-6">
        <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">
          No jobs found
        </h3>
        <p className="text-[#5a6a75] mb-6">
          We couldn't find any job listings in the database right now.
        </p>
        {(searchQuery || selectedSkills.length > 0 || selectedCompanies.length > 0) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSkills([]);
              setSelectedCompanies([]);
            }}
            className="text-[#7EB0AB] font-semibold hover:underline transition-all"
          >
            Clear filters and try again
          </button>
        )}
      </div>
    </div>
  ) : (
    /* 3. Success State (The Grid) */
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {filteredJobs.map((job, index) => (
        <JobCard
          key={job.id}
          job={job}
          isSelected={selectedJob?.id === job.id}
          isBookmarked={bookmarked.map(Number).includes(Number(job.id))}
          onSelect={() => handleSelectJob(job)}
          onBookmark={(e) => {
            e.stopPropagation();
            if (isAuthenticated) {
              toggleBookmark(job.id);
            } else {
              setShowAuthPrompt(true);
            }
          }}
          delay={index * 50}
          visible={visibleIds.includes(job.id)}
        />
      ))}
    </div>
  )}
</main>
            </div>
          </div>

          {/* ─── View 2: Job Details (Right half) ─── */}
          <div className="w-[50%] flex-shrink-0 max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
            {lastSelectedJob && (
              <div className="w-full pb-16">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-[#5a6a75] mb-6">
                  <button
                    onClick={handleClearSelection}
                    className="hover:text-[#1e3a4f] transition-colors"
                  >
                    Home
                  </button>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <span className="font-semibold text-[#1e3a4f]">
                    {lastSelectedJob.position || lastSelectedJob.title}
                  </span>
                </div>

                {/* Two-column layout */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                  {/* ── Left Column: Main Job Card ── */}
                  <div className="flex-1 w-full min-w-0">
                    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 lg:p-8">

                      {/* Job Header */}
                      <div className="flex flex-col sm:flex-row gap-5 items-start mb-5">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: lastSelectedJob?.color || "#7EB0AB" }}
                        >
                          {lastSelectedJob?.initials || "J"}
                        </div>
                        <div className="flex-1">
                          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1.5">
                            {lastSelectedJob?.title}
                          </h1>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#5a6a75]">
                            <span className="font-semibold text-[#1e3a4f]">{lastSelectedJob?.company}</span>
                            <span className="flex items-center gap-1">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              {lastSelectedJob?.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {lastSelectedJob?.timeAgo}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="px-3 py-1 bg-[#f0f2f5] text-[#5a6a75] text-xs font-semibold rounded-full border border-[#e5e7eb]">
                              {lastSelectedJob?.type}
                            </span>
                            <span className="px-3 py-1 bg-[#e6f7f2] text-[#7EB0AB] text-xs font-semibold rounded-full border border-[#7EB0AB]/20">
                              {lastSelectedJob?.salary}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Apply + Save Buttons */}
                      <div className="flex gap-3 mb-6">
                        <button
                          onClick={() => {
                            if (isAuthenticated) {
                              setShowApplyModal(true);
                            } else {
                              setShowAuthPrompt(true);
                            }
                          }}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg shadow-md"
                          style={{ background: "linear-gradient(135deg, #7EB0AB, #6A9994)" }}
                        >
                          Apply Now
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAuthenticated) {
                              toggleBookmark(lastSelectedJob.id);
                            } else {
                              setShowAuthPrompt(true);
                            }
                          }}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${bookmarked.map(Number).includes(Number(lastSelectedJob?.id))
                            ? "bg-[#1e3a4f] text-white border-[#1e3a4f]"
                            : "bg-white text-[#1a1a1a] border-[#e5e7eb] hover:bg-[#f5f7fa]"
                            }`}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill={bookmarked.map(Number).includes(Number(lastSelectedJob?.id)) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                          </svg>
                          Save Job
                        </button>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-7">
                        {(lastSelectedJob?.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-[#f0f2f5] text-[#5a6a75] border border-[#e5e7eb]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Body Sections */}
                      <div className="space-y-7">
                        <section>
                          <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-2.5">Job Description</h3>
                          <p className="text-[14.5px] text-[#5a6a75] leading-relaxed">{lastSelectedJob?.description}</p>
                        </section>

                        <section>
                          <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-2.5">Responsibilities</h3>
                          <ul className="space-y-2">
                            {(lastSelectedJob?.whatYoullDo || []).map((item, i) => (
                              <li key={i} className="flex gap-2.5 text-[14.5px] text-[#5a6a75] leading-relaxed">
                                <span className="text-[#7EB0AB] font-bold mt-0.5 flex-shrink-0">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </section>

                        <section>
                          <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-2.5">Qualifications</h3>
                          <ul className="space-y-2">
                            {(lastSelectedJob?.whyCompany || []).map((item, i) => (
                              <li key={i} className="flex gap-2.5 text-[14.5px] text-[#5a6a75] leading-relaxed">
                                <span className="text-[#7EB0AB] font-bold mt-0.5 flex-shrink-0">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      </div>

                      {/* Report Footer */}
                      <div className="mt-8 pt-4 border-t border-[#f0f2f5] flex items-center justify-between">
                        <span className="text-xs text-[#9ca3af]">Report this job posting</span>
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#5a6a75] hover:bg-[#f0f2f5] transition-colors">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                          </button>
                          <button className="p-1.5 rounded-lg text-[#9ca3af] hover:text-red-400 hover:bg-red-50 transition-colors">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                              <line x1="4" y1="22" x2="4" y2="15" />
                            </svg>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* ── Right Column: Sidebar Panels ── */}
                  <div className="w-full lg:w-[272px] flex-shrink-0 space-y-4">

                    {/* Meet the Recruiter */}
                    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
                      <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4">Meet the Recruiter</h3>
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border-2"
                          style={{
                            backgroundColor: lastSelectedJob?.color || "#7EB0AB",
                            borderColor: (lastSelectedJob?.color || "#7EB0AB") + "40",
                          }}
                        >
                          {lastSelectedJob?.recruiter_name 
                            ? lastSelectedJob.recruiter_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : 'JD'
                          }
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#1a1a1a]">
                            {lastSelectedJob?.recruiter_name || 'Jane Doe'}
                          </p>
                          <p className="text-[12px] text-[#5a6a75]">
                            {lastSelectedJob?.recruiter_role || 'Senior Tech Talent Partner'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Open messaging modal with recruiter
                          const recruiterId = lastSelectedJob?.recruiter_id || lastSelectedJob?.user_id || lastSelectedJob?.posted_by;
                          const recruiterName = lastSelectedJob?.recruiter_name || 'Recruiter';
                          if (recruiterId) {
                            setMessageModalRecruiter({ id: recruiterId, name: recruiterName });
                            setShowMessageModal(true);
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#e5e7eb] text-sm font-semibold text-[#1a1a1a] hover:bg-[#f5f7fa] hover:border-[#7EB0AB] hover:text-[#7EB0AB] transition-all group"
                        disabled={!lastSelectedJob?.recruiter_id && !lastSelectedJob?.user_id && !lastSelectedJob?.posted_by}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#7EB0AB] transition-colors">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                        Message {lastSelectedJob?.recruiter_name?.split(' ')[0] || 'Recruiter'}
                      </button>
                    </div>

                    {/* Similar Jobs */}
                    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
                      <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4">Similar Jobs</h3>
                      <div className="space-y-3">
                        {filteredJobs
                          .filter((j) => j.id !== lastSelectedJob?.id)
                          .slice(0, 3)
                          .map((sj) => (
                            <button
                              key={sj.id}
                              onClick={() => handleSelectJob(sj)}
                              className="w-full text-left p-3 rounded-xl border border-[#f0f2f5] hover:border-[#7EB0AB]/40 hover:bg-[#f8fffe] transition-all group"
                            >
                              <p className="text-[13px] font-bold text-[#1a1a1a] group-hover:text-[#1e3a4f] leading-snug mb-0.5">
                                {sj.title}
                              </p>
                              <p className="text-[11px] text-[#9ca3af] mb-1.5">
                                {sj.company} • {sj.location}
                              </p>
                              <p className="text-[12px] font-semibold text-[#7EB0AB]">{sj.salary}</p>
                            </button>
                          ))}
                        {filteredJobs.filter((j) => j.id !== lastSelectedJob?.id).length === 0 && (
                          <p className="text-xs text-[#9ca3af] text-center py-2">No similar jobs found</p>
                        )}
                      </div>
                      {filteredJobs.filter((j) => j.id !== lastSelectedJob?.id).length > 3 && (
                        <button
                          onClick={handleClearSelection}
                          className="mt-3 w-full py-2 rounded-xl border border-[#e5e7eb] text-sm font-semibold text-[#5a6a75] hover:bg-[#f5f7fa] hover:text-[#1a1a1a] transition-all"
                        >
                          View All
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>{" "}
        {/* Close sliding wrapper */}
      </div>

      {/* ─── Multi-Step Apply Modal ─── */}
      {showApplyModal && selectedJob && (
        <ApplyModal
          job={selectedJob}
          onClose={() => setShowApplyModal(false)}
        />
      )}

      {/* ─── Sign Out Confirmation Modal ─── */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#e6f7f2] flex items-center justify-center mb-4">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7EB0AB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">
                Sign Out
              </h3>
              <p className="text-sm text-[#5a6a75] mb-6">
                Are you sure you want to sign out of your account?
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#d1d5db] text-sm font-semibold text-[#5a6a75] hover:bg-[#f5f7fa] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    router.push("/signin");
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-md"
                  style={{ background: "#7EB0AB" }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Auth Prompt Modal ─── */}
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
      />

      {/* ─── Message Modal ─── */}
      <MessageModal
        isOpen={showMessageModal}
        onClose={() => {
          setShowMessageModal(false);
          setMessageModalRecruiter(null);
        }}
        recruiterId={messageModalRecruiter?.id || 0}
        recruiterName={messageModalRecruiter?.name || 'Recruiter'}
      />
    </div>
  );
}
