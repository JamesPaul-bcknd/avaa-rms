"use client";
import React, { useState, useEffect } from 'react';
import { X, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RejectModalProps {
  applicant: { name: string; email: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

const RejectModal = ({ applicant, isOpen, onClose, onSubmit }: RejectModalProps) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(message.trim());
      setIsSuccess(true);
    } catch (error) {
      console.error("Rejection failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFullClose = () => {
    setIsSuccess(false);
    onClose();
  };

  // Extract initials for the fallback avatar
  const initials = applicant?.name
    ? applicant.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'JD';

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
              <div className="relative mb-6">
                {/* Avatar: Floating overlap */}
                <div className="absolute -top-16 left-0 w-32 h-32 rounded-full border-[6px] border-white bg-[#84b3af] flex items-center justify-center shadow-xl z-20 overflow-hidden">
                   <span className="text-white text-4xl font-black tracking-tighter">
                    {initials}
                   </span>
                </div>
                
                {/* Name & Email: Offset to the right of the avatar */}
                <div className="pl-36 pt-4">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
                    {applicant?.name || "John Doe"}
                  </h2>
                  <p className="text-[#84b3af] text-lg font-bold">
                    {applicant?.email || "john.doe@example.com"}
                  </p>
                </div>
              </div>

              {/* Message Input */}
              <div className="space-y-3 mt-12">
                <label className="block text-sm font-black text-slate-400 ml-1 uppercase tracking-[0.15em]">
                  Message
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-8 py-8 bg-[#f8fafc] rounded-[2.5rem] text-slate-600 font-bold border border-slate-50 focus:ring-4 focus:ring-[#84b3af]/10 focus:border-[#84b3af]/30 outline-none resize-none transition-all placeholder:text-slate-200"
                  placeholder="Enter the reason for rejection here..."
                />
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
                  onClick={handleSend}
                  disabled={!message.trim() || isSubmitting}
                  className="px-12 py-4 bg-[#f8a09a] hover:bg-[#f68b83] text-white rounded-[1.25rem] font-black text-lg shadow-lg shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  {isSubmitting ? "Sending..." : "Send Rejection"}
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
              <div className="absolute inset-0 bg-red-100 blur-3xl rounded-full opacity-40" />
              <div className="relative bg-red-50 p-8 rounded-full">
                <XCircle size={100} className="text-[#f8a09a]" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">Rejection Sent</h2>
            <p className="text-slate-400 mb-12 text-xl font-bold max-w-sm mx-auto">
              The application for <span className="text-slate-700">{applicant?.name}</span> has been updated.
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

export default RejectModal;