"use client";


import { useState, useRef } from "react";
import { Job, ApplyFormData, APPLY_STEPS } from "../types";
import api from "@/lib/axios";

export default function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
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
                <style>{`
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
