'use client';

import Link from 'next/link';

interface AuthPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthPromptModal({ isOpen, onClose }: AuthPromptModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-[modalIn_0.25s_ease-out]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#9ca3af] hover:text-[#1a1a1a] transition-colors"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-[#e6faf0] flex items-center justify-center mx-auto mb-5">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3CD894" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>

                <h3 className="text-xl font-bold text-[#1e3a4f] mb-2">Create an Account</h3>
                <p className="text-sm text-[#5a6a75] mb-6 leading-relaxed">
                    Sign in or create an account to continue with this action.
                </p>

                <div className="flex items-center gap-3">
                    <Link
                        href="/signin"
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#1e3a4f] border border-[#d1d5db] hover:bg-[#f0f2f5] transition-colors text-center"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/user/signup"
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 text-center"
                        style={{ background: '#3CD894' }}
                    >
                        Sign Up
                    </Link>
                </div>
            </div>

            <style jsx global>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
