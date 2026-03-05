"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import api from "@/lib/axios";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const role = searchParams.get("role") || "job-seeker";

  useEffect(() => {
    document.title = "Verify Email | AVAA";
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
        const otpCode = otp.join('');
        const response = await api.post('/auth/verify-otp', { email, otp: otpCode });
        setSuccess(response.data.message || 'Email verified successfully!');

        setTimeout(async () => {
            const pendingEmail    = sessionStorage.getItem('pendingSignupEmail');
            const pendingPassword = sessionStorage.getItem('pendingSignupPassword');
            const pendingProfile  = sessionStorage.getItem('pendingProfileData');

            // 🔍 DEBUG - check what's in sessionStorage
            console.log('=== DEBUG ===');
            console.log('pendingEmail:', pendingEmail);
            console.log('pendingPassword:', pendingPassword);
            console.log('pendingProfile raw:', pendingProfile);
            console.log('pendingProfile parsed:', pendingProfile ? JSON.parse(pendingProfile) : null);

            if (pendingEmail && pendingPassword) {
                try {
                    const loginResponse = await api.post('/auth/login', {
                        email: pendingEmail,
                        password: pendingPassword,
                    });
                    localStorage.setItem('token', loginResponse.data.access_token);
                    console.log('✅ Login success, token set:', loginResponse.data.access_token);

                    if (pendingProfile) {
                        try {
                            const profileData = JSON.parse(pendingProfile);
                            console.log('📤 Sending profile update:', profileData);
                            const profileRes = await api.put('/auth/profile', profileData);
                            console.log('✅ Profile update response:', profileRes.data);
                        } catch (profileErr: any) {
                            console.error('❌ Profile update failed:', profileErr.response?.status, profileErr.response?.data);
                        }
                    } else {
                        console.warn('⚠️ No pendingProfile found in sessionStorage!');
                    }

                    sessionStorage.removeItem('pendingSignupEmail');
                    sessionStorage.removeItem('pendingSignupPassword');
                    sessionStorage.removeItem('pendingProfileData');

                    const destination = role === 'recruiter' ? '/hr-dashboard' : '/user/dashboard';
                    router.replace(destination);
                    return;
                } catch (loginErr: any) {
                    console.error('❌ Login failed:', loginErr.response?.data);
                }
            } else {
                console.warn('⚠️ No pending credentials found in sessionStorage!');
            }

            router.push('/signin');
        }, 1200);

    } catch (err: any) {
        setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
        setLoading(false);
    }
};

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const response = await api.post("/auth/resend-otp", { email });
      setSuccess(response.data.message || "A new code has been sent!");
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to resend code. Please try again.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#DCE8E6] px-4 page-enter">
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-lg p-10 text-center">
        {/* AVAA Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/avaa_logo.png"
            alt="AVAA Logo"
            width={80}
            height={80}
            priority
          />
        </div>

        {/* Heading */}
        <h1 className="text-[24px] font-bold text-[#1e3a4f] mb-2">
          Verify your email
        </h1>
        <p className="text-[14px] text-[#5a6a75] mb-2 leading-relaxed">
          We&apos;ve sent a 6-digit code to your email address. Enter it below
          to verify your account.
        </p>
        {email && (
          <p className="text-[14px] font-semibold text-[#1e3a4f] mb-8">
            {email}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-[#FEF2F2] border-l-4 border-red-500 text-sm text-left">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-green-50 border-l-4 border-green-500 text-sm text-left">
            <svg
              className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-green-700 font-medium">{success}</span>
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold text-[#1a1a1a] border-2 border-[#d1d5db] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.some((d) => !d)}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "#7EB0AB" }}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* Resend Link */}
        <p className="text-[14px] text-[#5a6a75] mt-6">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            disabled={resending}
            className="font-semibold text-[#7EB0AB] hover:text-[#6A9994] transition-colors disabled:opacity-50"
            onClick={handleResend}
          >
            {resending ? "Sending..." : "Resend"}
          </button>
        </p>
      </div>
    </div>
  );
}
