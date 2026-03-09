"use client";
import React, { useState, useEffect } from 'react';
import { X, User, XCircle } from 'lucide-react';

interface RejectModalProps {
  applicant: { name: string; email: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

const RejectModal = ({ applicant, isOpen, onClose, onSubmit }: RejectModalProps) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!message.trim()) return;
    await onSubmit(message.trim());
    setIsSuccess(true);
  };

  const handleFullClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden relative border border-gray-100">

        {!isSuccess ? (
          /* --- STEP 1: REJECTION FORM --- */
          <div className="animate-in fade-in zoom-in duration-200">
            {/* Header Area matching screenshot */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-[#2d3748]">Reject Application</h2>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-800" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Applicant Profile Section matching screenshot */}
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#6ee7b7] rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0">
                  <User size={32} />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-4xl font-semibold text-[#2d3748] tracking-tight">
                    {applicant?.name || "Alice Johnson"}
                  </h3>
                  <p className="text-gray-400 text-lg font-medium">
                    {applicant?.email || "alice@example.com"}
                  </p>
                </div>
              </div>

              {/* Message Input matching screenshot design */}
              <div className="space-y-2">
                <label className="block text-lg font-bold text-[#2d3748] ml-1">Message</label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-4 bg-[#edf2f7] rounded-2xl text-slate-600 font-medium border-none focus:ring-2 focus:ring-red-100 outline-none resize-none transition-all"
                  placeholder="Enter rejection message here..."
                />
              </div>

              {/* Footer Button matching screenshot */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="px-8 py-3 bg-[#ff5c5c] text-white rounded-2xl font-bold text-lg hover:bg-red-600 transition-all shadow-sm active:scale-95"
                >
                  Send Rejection
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* --- STEP 2: SUCCESS MESSAGE --- */
          <div className="text-center p-12 animate-in fade-in scale-in duration-300">
            <div className="flex justify-center mb-6">
              <div className="bg-red-50 p-6 rounded-full">
                <XCircle size={80} className="text-red-500" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Rejection Sent</h2>
            <p className="text-slate-500 mb-8 text-lg">
              The status has been updated for <br />
              <span className="font-bold text-slate-700">{applicant?.name}</span>.
            </p>
            <button
              onClick={handleFullClose}
              className="w-full py-4 bg-[#ff5c5c] text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-md"
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