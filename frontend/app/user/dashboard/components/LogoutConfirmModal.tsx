"use client";

import { useRouter } from "next/navigation";

interface LogoutConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LogoutConfirmModal({
    isOpen,
    onClose,
}: LogoutConfirmModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-[fadeIn_0.2s_ease-out]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-[#e6f7f2] flex items-center justify-center mb-4">
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#7EB0AB"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">
                        Sign Out
                    </h3>
                    <p className="text-sm text-[#5a6a75] mb-6">
                        Are you sure you want to sign out of your account?
                    </p>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-[#d1d5db] text-sm font-semibold text-[#5a6a75] hover:bg-[#f5f7fa] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                router.push("/signin");
                            }}
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-md"
                            style={{ background: "#7EB0AB" }}
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
