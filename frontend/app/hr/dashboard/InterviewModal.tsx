"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, X, User, ChevronDown } from 'lucide-react'; // Added ChevronDown

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
  const [interviewer, setInterviewer] = useState("John Smith");

  useEffect(() => {
    if (!isOpen) setIsSuccess(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFullClose = () => {
    setIsSuccess(false);
    onClose();
  };

  const handleSchedule = async () => {
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
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden relative border border-gray-100">

        {!isSuccess ? (
          <div className="animate-in fade-in zoom-in duration-200">
            {/* Header Area */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-[#2d3748]">Accept Application</h2>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-800" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Applicant Profile Section */}
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-[#6ee7b7] rounded-2xl flex items-center justify-center text-white shadow-sm">
                  <User size={40} />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-4xl font-semibold text-[#2d3748] tracking-tight">{applicantName}</h3>
                  <p className="text-gray-400 text-lg font-medium">alice@example.com</p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="space-y-6">
                {/* Date & Time Row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-1/3 text-base sm:text-lg font-bold text-[#2d3748]">Interview Date:</label>
                  <div className="flex-1 flex gap-3">
                    <div className="flex-1 relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[#edf2f7] rounded-xl text-gray-600 font-semibold text-center outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[#edf2f7] rounded-xl text-gray-600 font-semibold text-center outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Interview Type Row with "v" icon */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-1/3 text-base sm:text-lg font-bold text-[#2d3748]">Interview Type:</label>
                  <div className="flex-1 relative">
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full px-4 py-2 bg-[#edf2f7] rounded-xl text-gray-600 font-semibold text-center appearance-none outline-none cursor-pointer focus:ring-2 focus:ring-emerald-100 transition-all pr-10"
                    >
                      <option value="Online Interview">Online Interview</option>
                      <option value="Face to Face">Face to Face</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>

                {/* Interviewer Row with "v" icon */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-1/3 text-base sm:text-lg font-bold text-[#2d3748]">Interviewer:</label>
                  <div className="flex-1 relative">
                    <select
                      value={interviewer}
                      onChange={(e) => setInterviewer(e.target.value)}
                      className="w-full px-4 py-2 bg-[#edf2f7] rounded-xl text-gray-600 font-semibold text-center appearance-none outline-none cursor-pointer focus:ring-2 focus:ring-emerald-100 transition-all pr-10"
                    >
                      <option value="John Smith">John Smith</option>
                      <option value="Emily Davis">Emily Davis</option>
                      <option value="Sarah Wilson">Sarah Wilson</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>
              </div>

              {/* Footer Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSchedule}
                  className="px-8 py-3 bg-[#a7f3d0] text-[#065f46] rounded-2xl font-extrabold text-lg hover:bg-[#6ee7b7] transition-all shadow-sm active:scale-95"
                >
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Success Message State */
          <div className="text-center p-12 animate-in fade-in scale-in duration-300">
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-100 p-6 rounded-full">
                <CheckCircle size={80} className="text-emerald-500" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Success!</h2>
            <p className="text-slate-500 mb-8 text-lg">
              Interview scheduled for <span className="font-bold text-slate-700">{applicantName}</span>.
            </p>
            <button
              onClick={handleFullClose}
              className="w-full py-4 bg-[#6ee7b7] text-[#065f46] rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-md"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewModal;