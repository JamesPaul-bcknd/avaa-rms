"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, X, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InterviewModalProps {
  applicantName: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (interviewData: any) => Promise<void>;
}

const InterviewModal = ({
  applicantName,
  jobTitle,
  isOpen,
  onClose,
  onSchedule
}: InterviewModalProps) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [interviewType, setInterviewType] = useState("Online Interview");
  const [date, setDate] = useState("2025-02-19");
  const [time, setTime] = useState("10:00 AM");
  const [interviewer, setInterviewer] = useState("John Doe");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFullClose = () => {
    setIsSuccess(false);
    onClose();
  };

  const handleSchedule = async () => {
    setIsSubmitting(true);
    try {
      await onSchedule({
        id: Date.now(),
        candidateName: applicantName,
        role: jobTitle,
        date,
        time,
        type: interviewType,
        interviewer,
        status: "Active"
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Scheduling failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = applicantName
    ? applicantName.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'AJ';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative z-10"
      >
        {!isSuccess ? (
          <div className="flex flex-col">
            {/* Design Header: Teal Banner */}
            <div className="h-32 bg-[#84b3af] relative">
              <button 
                onClick={onClose} 
                className="absolute top-6 right-8 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Area */}
            <div className="px-10 pb-10 relative">
              {/* Profile Section */}
              <div className="relative mb-8">
                {/* Avatar Overlap */}
                <div className="absolute -top-16 left-0 w-32 h-32 rounded-full border-[6px] border-white bg-[#84b3af] flex items-center justify-center shadow-xl z-20 overflow-hidden">
                   <span className="text-white text-4xl font-black tracking-tighter">
                    {initials}
                   </span>
                </div>
                
                {/* Name & Email */}
                <div className="pl-36 pt-4">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
                    {applicantName}
                  </h2>
                  <p className="text-[#84b3af] text-lg font-bold">
                    alice@example.com
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="space-y-6 mt-10">
                {/* Interview Date & Time */}
                <div className="flex items-center gap-4">
                  <label className="w-1/3 text-lg font-black text-slate-700">Interview Date & Time:</label>
                  <div className="flex-1 flex gap-3">
                    <div className="flex-1 relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[#f8fafc] rounded-2xl text-slate-600 font-bold border border-slate-50 focus:ring-4 focus:ring-[#84b3af]/10 outline-none transition-all"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[#f8fafc] rounded-2xl text-slate-600 font-bold border border-slate-50 focus:ring-4 focus:ring-[#84b3af]/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Interview Type */}
                <div className="flex items-center gap-4">
                  <label className="w-1/3 text-lg font-black text-slate-700">Interview Type:</label>
                  <div className="flex-1 relative">
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full px-6 py-3 bg-[#f8fafc] rounded-2xl text-slate-600 font-bold border border-slate-50 appearance-none focus:ring-4 focus:ring-[#84b3af]/10 outline-none cursor-pointer"
                    >
                      <option value="Online Interview">Online Interview</option>
                      <option value="Face to Face">Face to Face</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                </div>

                {/* Interviewer */}
                <div className="flex items-center gap-4">
                  <label className="w-1/3 text-lg font-black text-slate-700">Interviewer:</label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={interviewer}
                      onChange={(e) => setInterviewer(e.target.value)}
                      className="w-full px-6 py-3 bg-[#f8fafc] rounded-2xl text-slate-600 font-bold border border-slate-50 focus:ring-4 focus:ring-[#84b3af]/10 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Google Meet Link (Visual placeholder matching your screenshot) */}
                <div className="flex items-center gap-4">
                  <label className="w-1/3 text-lg font-black text-slate-700">Google Meet Link:</label>
                  <div className="flex-1">
                    <input
                      disabled
                      type="text"
                      placeholder="https://meet.google.com/..."
                      className="w-full px-6 py-3 bg-[#f8fafc] rounded-2xl text-slate-300 font-bold border border-slate-50 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-6 mt-10">
                <button
                  onClick={onClose}
                  className="text-slate-500 font-black text-lg hover:text-slate-800 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={isSubmitting}
                  className="px-12 py-4 bg-[#84b3af] hover:bg-[#729e9a] text-white rounded-[1.25rem] font-black text-lg shadow-lg shadow-teal-100 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Interview"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* SUCCESS STATE */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-16 flex flex-col items-center"
          >
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-emerald-100 blur-3xl rounded-full opacity-40" />
              <div className="relative bg-emerald-50 p-8 rounded-full">
                <CheckCircle size={100} className="text-[#84b3af]" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">Interview Scheduled</h2>
            <p className="text-slate-400 mb-12 text-xl font-bold max-w-sm mx-auto">
              The invitation for <span className="text-slate-700">{applicantName}</span> has been sent.
            </p>
            <button
              onClick={handleFullClose}
              className="w-full py-5 bg-slate-800 text-white rounded-[1.5rem] font-black text-xl hover:bg-slate-900 transition-all shadow-2xl active:scale-95"
            >
              Back to Dashboard
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default InterviewModal;