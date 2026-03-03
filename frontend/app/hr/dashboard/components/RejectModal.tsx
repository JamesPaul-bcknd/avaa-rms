"use client";
import React, { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';

interface RejectModalProps {
  applicant: { name: string; email: string } | null;
  isOpen: boolean;
  onClose: () => void;
}

const RejectModal = ({ applicant, isOpen, onClose }: RejectModalProps) => {
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    setIsSuccess(true);
  };

  const handleFullClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">

        {!isSuccess ? (
          /* --- STEP 1: REJECTION FORM --- */
          <div className="animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-[#334155] mb-6">Reject Applicant</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-2">To:</label>
                <input
                  type="text"
                  defaultValue={applicant?.email}
                  className="w-full px-4 py-3 bg-[#f1f5f9] rounded-lg text-slate-600 font-medium border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-2">Subject:</label>
                <input
                  type="text"
                  placeholder="Application Status Update"
                  className="w-full px-4 py-3 bg-[#f1f5f9] rounded-lg text-slate-600 font-medium border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-2">Message:</label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 bg-[#f1f5f9] rounded-lg text-xs text-slate-500 leading-relaxed border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  defaultValue={`Dear ${applicant?.name || 'Applicant'},\nThank you for giving us the opportunity to review your application for the Senior Front End Developer position. After careful consideration, we have decided to move forward with other candidates whose qualifications more closely align with our current needs. We truly appreciate the time and effort you put into your application and for your interest in joining TechNova.\n\nWe wish you the best of luck in your job search and future professional endeavors.\n\nBest regards, TechNova`}
                />
              </div>

              <div className="flex justify-between gap-4 mt-4">
                <button
                  onClick={onClose}
                  className="px-10 py-3 bg-[#e2e8f0] text-slate-700 rounded-lg font-bold text-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  className="flex-1 py-3 bg-[#ff1e1e] text-white rounded-lg font-bold text-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  Send Rejection
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* --- STEP 2: SUCCESS MESSAGE --- */
          <div className="text-center py-6 animate-in fade-in scale-in duration-300">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-6 rounded-full">
                <XCircle size={80} className="text-red-500" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Email Sent!</h2>
            <p className="text-slate-500 mb-8 px-4 text-lg">
              Rejection notice has been sent to <br />
              <span className="font-bold text-slate-700">{applicant?.name}</span>.
            </p>
            <button
              onClick={handleFullClose}
              className="w-full py-4 bg-[#ff1e1e] text-white rounded-lg font-bold text-lg hover:bg-red-700 transition-all shadow-lg"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RejectModal;