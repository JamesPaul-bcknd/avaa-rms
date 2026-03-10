"use client";

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EndContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

const EndContractModal = ({ isOpen, onClose, onConfirm, userName }: EndContractModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-[24px] p-8 shadow-2xl flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
          <AlertCircle size={32} />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">End Employee Contract</h2>
          <p className="text-slate-500 text-sm leading-relaxed px-4">
            Are you sure you want to end <span className="font-bold text-slate-700">{userName}</span>&apos;s contract?
            This action will deactivate their account and remove their access.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3 pt-2">
          <button
            onClick={onConfirm}
            className="w-full py-3 bg-[#6b908c] hover:bg-[#5a7a76] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md shadow-teal-500/20"
          >
            End Contract
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-slate-500 hover:text-slate-700 font-bold text-sm transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndContractModal;