'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => { document.title = 'Forgot Password | AVAA'; }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setSuccess(response.data.message || 'Check your email for the reset link.');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#DCE8E6] px-4 page-enter">
            <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-lg p-10">
                {/* AVAA Logo */}
                <div className="flex justify-center mb-6">
                    <Image src="/avaa_logo.png" alt="AVAA Logo" width={80} height={80} priority />
                </div>

                {/* Heading */}
                <h1 className="text-[28px] font-bold text-[#1e3a4f] text-center mb-2">Forgot password?</h1>
                <p className="text-[14px] text-[#5a6a75] text-center mb-8">
                    Enter your email and we&apos;ll send you reset instructions.
                </p>

                {/* Error Message */}
                {error && (
                    <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-[#FEF2F2] border-l-4 border-red-500 text-sm">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        <span className="text-red-700 font-medium">{error}</span>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-green-50 border-l-4 border-green-500 text-sm">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span className="text-green-700 font-medium">{success}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div>
                        <label htmlFor="forgot-email" className="block text-[15px] font-semibold text-[#1a1a1a] mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="M22 4L12 13L2 4" />
                                </svg>
                            </div>
                            <input
                                id="forgot-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 border border-[#d1d5db] rounded-xl text-[15px] text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: '#7EB0AB' }}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                {/* Back to Sign In */}
                <p className="text-center text-[14px] text-[#5a6a75] mt-6">
                    Remember your password?{' '}
                    <Link href="/signin" className="font-semibold text-[#7EB0AB] hover:text-[#6A9994] transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
