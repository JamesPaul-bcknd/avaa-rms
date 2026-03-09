"use client";

import { Check, X, Loader2 } from 'lucide-react';

interface ApplicationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'accept' | 'reject';
  applicantName: string;
  isLoading?: boolean;
}

export default function ApplicationStatusModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  action, 
  applicantName,
  isLoading = false 
}: ApplicationStatusModalProps) {
  if (!isOpen) return null;

  const isAccept = action === 'accept';
  const icon = isAccept ? Check : X;
  const bgColor = isAccept ? 'bg-emerald-50' : 'bg-red-50';
  const iconColor = isAccept ? 'text-emerald-600' : 'text-red-600';
  const borderColor = isAccept ? 'border-emerald-200' : 'border-red-200';
  const buttonColor = isAccept ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700';
  const actionText = isAccept ? 'Accept' : 'Reject';
  const actionDesc = isAccept ? 'accept this application' : 'reject this application';

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8">
          {/* Icon */}
          <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mb-6`}>
            {isAccept ? (
              <Check className={`w-8 h-8 ${iconColor}`} strokeWidth={3} />
            ) : (
              <X className={`w-8 h-8 ${iconColor}`} strokeWidth={3} />
            )}
          </div>

          {/* Content */}
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 text-center">
            {actionText} Application
          </h3>
          
          <p className="text-sm text-slate-600 text-center mb-8 max-w-sm">
            Are you sure you want to {actionDesc} for <span className="font-semibold">&quot;{applicantName}&quot;</span>?
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonColor}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {icon === Check && <Check className="w-4 h-4 inline mr-2" />}
                  {icon === X && <X className="w-4 h-4 inline mr-2" />}
                  {actionText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
