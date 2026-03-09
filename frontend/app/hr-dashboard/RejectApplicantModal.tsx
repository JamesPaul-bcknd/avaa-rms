"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface RejectApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: any;
  onReject: (message: string) => void;
}

export default function RejectApplicantModal({ isOpen, onClose, applicant, onReject }: RejectApplicantModalProps) {
  const [rejectMessage, setRejectMessage] = useState('');

  if (!isOpen || !applicant) return null;

  const handleSubmit = () => {
    onReject(rejectMessage);
    setRejectMessage(''); // Reset form
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
          
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-800">Message</label>
            <textarea 
              rows={5} 
              value={rejectMessage} 
              onChange={e => setRejectMessage(e.target.value)} 
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-slate-700 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none transition-all placeholder-gray-400" 
              placeholder="Enter the reason for rejection here..." 
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-gray-200 text-slate-600 text-[13px] font-bold hover:bg-gray-50 transition-colors">Close</button>
            <button onClick={handleSubmit} className="px-6 py-2.5 rounded-lg bg-[#ef4444] text-white text-[13px] font-bold hover:bg-[#dc2626] transition-colors shadow-sm active:scale-95">Send Rejection</button>
          </div>
        </div>
      </div>
    </div>
  );
}