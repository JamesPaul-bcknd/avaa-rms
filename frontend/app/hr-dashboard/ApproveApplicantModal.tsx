"use client";

import React, { useState } from 'react';
import { X, Calendar, Clock, ChevronDown, Link } from 'lucide-react';

interface ApproveApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: any;
  onApprove: (interviewDetails: any) => void;
}

export default function ApproveApplicantModal({ isOpen, onClose, applicant, onApprove }: ApproveApplicantModalProps) {
  const [interviewDate, setInterviewDate] = useState('2026-02-19');
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [interviewType, setInterviewType] = useState('In-Person Interview');
  const [interviewer, setInterviewer] = useState('John Doe');
  const [googleMeetLink, setGoogleMeetLink] = useState('');

  if (!isOpen || !applicant) return null;

  const handleSubmit = () => {
    onApprove({
      date: `${interviewDate} ${interviewTime}`,
      type: interviewType,
      interviewer: interviewer,
      googleMeetLink: googleMeetLink,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-[550px] shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">

        <div className="h-32 bg-gradient-to-r from-[#4c8479] to-[#6ebea3] relative">
          <button onClick={onClose} className="absolute top-5 right-5 text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-8">
          <div className="flex items-end gap-5 -mt-12 mb-8 relative z-10">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-sm shrink-0">
              <img src={applicant.avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="pb-1">
              <h3 className="text-[22px] font-bold text-slate-800 leading-tight">{applicant.name}</h3>
              <p className="text-[13px] font-medium text-slate-500 mt-0.5">{applicant.email}</p>
            </div>
          </div>

          <div className="space-y-6">

            {/* Interview Date & Time */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-[14px] font-bold text-slate-800 w-32 shrink-0">Interview Date:</label>
              <div className="flex gap-3 flex-1">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Calendar size={16} /></div>
                  <input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:border-[#53968b] focus:ring-1 focus:ring-[#53968b] transition-all cursor-pointer" />
                </div>
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Clock size={16} /></div>
                  <input type="time" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:border-[#53968b] focus:ring-1 focus:ring-[#53968b] transition-all cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Interview Type */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-[14px] font-bold text-slate-800 w-32 shrink-0">Interview Type:</label>
              <div className="relative flex-1">
                <select value={interviewType} onChange={e => setInterviewType(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:border-[#53968b] focus:ring-1 focus:ring-[#53968b] transition-all appearance-none cursor-pointer">
                  <option>Online Interview</option>
                  <option>In-Person Interview</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown size={16} /></div>
              </div>
            </div>

            {/* Interviewer */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-[14px] font-bold text-slate-800 w-32 shrink-0">Interviewer:</label>
              <input type="text" value={interviewer} onChange={e => setInterviewer(e.target.value)} placeholder="Enter interviewer name..." className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:border-[#53968b] focus:ring-1 focus:ring-[#53968b] transition-all" />
            </div>

            {/* Google Meet Link */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-[14px] font-bold text-slate-800 w-32 shrink-0">Google Meet Link:</label>
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Link size={15} /></div>
                <input
                  type="url"
                  value={googleMeetLink}
                  onChange={e => setGoogleMeetLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:border-[#53968b] focus:ring-1 focus:ring-[#53968b] transition-all placeholder-slate-300"
                />
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 mt-10">
            <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-gray-200 text-slate-600 text-[13px] font-bold hover:bg-gray-50 transition-colors">Close</button>
            <button onClick={handleSubmit} className="px-6 py-2.5 rounded-lg bg-[#6ebea3] text-white text-[13px] font-bold hover:bg-[#5bad92] transition-colors shadow-sm active:scale-95">Schedule Interview</button>
          </div>
        </div>
      </div>
    </div>
  );
}