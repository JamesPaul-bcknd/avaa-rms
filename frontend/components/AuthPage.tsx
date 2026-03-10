'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';

interface AuthPageProps {
    initialMode?: 'signin' | 'signup';
}

export default function AuthPage({ initialMode = 'signin' }: AuthPageProps) {
    const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
    const [sliding, setSliding] = useState(false);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
    const searchParams = useSearchParams();

    // Sign-in state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginShowPassword, setLoginShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // Sign-up state
    const [name, setName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyNumber, setCompanyNumber] = useState('');
    const [position, setPosition] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [regShowPassword, setRegShowPassword] = useState(false);
    const [regError, setRegError] = useState('');
    const [regLoading, setRegLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'job-seeker' | 'recruiter'>('job-seeker');

    const router = useRouter();

    useEffect(() => {
        document.title = mode === 'signin' ? 'Sign In | AVAA' : 'Sign Up | AVAA';
    }, [mode]);

    // Redirect if already logged in
    useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        api.post('/auth/me')
            .then((response) => {
                const user = response.data;
                if (user.role === 'admin') {
                    router.replace('/admin/dashboard');
                } else if (user.role === 'recruiter') {
                    router.replace('/hr/dashboard');
                } else {
                    router.replace('/user/dashboard');
                }
            })
            .catch(() => {
                localStorage.removeItem('token');
            });
    }
}, [router]);

    const switchMode = (target: 'signin' | 'signup') => {
    if (target === mode || sliding) return;
    setSlideDirection(target === 'signup' ? 'left' : 'right');
    setSliding(true);
    setTimeout(() => {
        setMode(target);
        // Updated: Clean URL path since files are now in the root app folder
        window.history.replaceState(null, '', `/${target}`);
        setTimeout(() => setSliding(false), 50);
    }, 300);
};

    // ─── Sign-in handler ───
const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    
    try {
        const response = await api.post('/auth/login', { 
            email: loginEmail, 
            password: loginPassword 
        });

        const { access_token, user } = response.data;
        localStorage.setItem('token', access_token);

        // Conditional redirect based on role
        if (user && user.role === 'admin') {
            router.replace('/admin/dashboard');
        } else if (user && user.role === 'recruiter') {
            router.replace('/hr/dashboard');
        } else {
            router.replace('/user/dashboard');
        }

    } catch (err: any) {
        if (err.response?.data?.email_not_verified) {
            const unverifiedEmail = err.response?.data?.email || loginEmail;
            router.push(`/user/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`);
            return;
        }

        setLoginError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
        setLoginLoading(false);
    }
};
    // ─── Social Login handlers ───
    // These redirect the user to the Laravel backend to start the OAuth flow
    const handleGoogleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/google`;
    };
    
    const handleGoogleSignUp = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/google`;
    };

    // ─── Sign-up handler ───
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegError('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(regEmail)) { setRegError('Please enter a valid email address.'); return; }

        const digits = phone.replace(/\D/g, '');
        if (!/^639\d{9}$/.test(digits)) { setRegError('Phone must be a valid PH number starting with 639 (e.g. 639123456789).'); return; }

        if (regPassword !== confirmPassword) { setRegError('Passwords do not match'); return; }

        setRegLoading(true);
        try {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('pendingSignupEmail', regEmail);
                sessionStorage.setItem('pendingSignupPassword', regPassword);
                sessionStorage.setItem('selectedRole', selectedRole);
            }
            const roleToSend = selectedRole === 'job-seeker' ? 'user' : 'recruiter';
            const registrationData: {
                name: string;
                email: string;
                phone: string;
                location: string;
                password: string;
                role: string;
                company_name?: string;
                company_number?: string;
                position?: string;
            } = {
                name, 
                email: regEmail, 
                phone: digits, 
                location, 
                password: regPassword, 
                role: roleToSend 
            };
            
            // Add company fields for recruiters
            if (selectedRole === 'recruiter') {
                registrationData.company_name = companyName;
                registrationData.company_number = companyNumber;
                registrationData.position = position;
            }
            
            await api.post('/auth/register', registrationData);

            // Try to log in immediately so we can send the user to profile completion with a token.
            try {
                const loginResponse = await api.post('/auth/login', { email: regEmail, password: regPassword });
                localStorage.setItem('token', loginResponse.data.access_token);
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.removeItem('pendingSignupEmail');
                    sessionStorage.removeItem('pendingSignupPassword');
                }
                router.replace('/register');
                return;
            } catch (loginErr: any) {
                console.log('Login error:', loginErr);
                console.log('Error response:', loginErr?.response?.data);
                
                if (loginErr?.response?.data?.email_not_verified) {
                    console.log('Redirecting to email verification...');
                    router.push(`/user/verify-otp?email=${encodeURIComponent(regEmail)}`);
                    return;
                }
                
                // Also check for 403 status with email_not_verified
                if (loginErr?.response?.status === 403 && loginErr?.response?.data?.error?.includes('verify your email')) {
                    console.log('Redirecting to email verification (403)...');
                    router.push(`/user/verify-otp?email=${encodeURIComponent(regEmail)}`);
                    return;
                }
                
                // Fall through to show registration error if login fails for another reason.
                throw loginErr;
            }
        } catch (err: any) {
            const errors = err.response?.data;
            if (typeof errors === 'string') {
                try { const parsed = JSON.parse(errors); const firstKey = Object.keys(parsed)[0]; setRegError(parsed[firstKey][0]); }
                catch { setRegError(errors); }
            } else if (errors?.message) { setRegError(errors.message); }
            else { setRegError('Registration failed. Please try again.'); }
        } finally {
            setRegLoading(false);
        }
    };

    // ─── Password visibility toggle SVG ───
    const EyeIcon = ({ show }: { show: boolean }) => show ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

    return (
        <div className="flex min-h-screen page-enter">
            {/* ══════════════ LEFT PANEL ══════════════ */}
            <div className="hidden lg:flex lg:w-[45%] bg-[#1D2835] flex-col px-12 relative">
                <div
                    key={mode}
                    className="flex flex-col h-full w-full"
                    style={{ animation: 'fadeSwitch 0.5s ease-out both' }}
                >
                    {mode === 'signin' ? (
                        /* Sign-in: centered logo + title */
                        <div className="flex flex-col items-center justify-center flex-1 text-center">
                            <div className="mb-6">
                                <Image src="/avaa_logo.png" alt="AVAA Logo" width={120} height={120} priority />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-4 tracking-wide">AVAA</h1>
                            <p className="text-[#a0b0b8] text-sm leading-relaxed max-w-[280px]">
                                Connect with top employers and discover opportunities that match your skills and aspirations.
                            </p>
                        </div>
                    ) : (
                        /* Sign-up: logo at top, title at bottom-left */
                        <>
                            <div className="pt-12">
                                <Image src="/avaa_logo.png" alt="AVAA Logo" width={80} height={80} priority />
                            </div>
                            <div className="mt-auto pb-16">
                                <h1 className="text-3xl font-bold text-white mb-4 tracking-wide italic">Start Your Journey</h1>
                                <p className="text-[#a0b0b8] text-sm leading-relaxed max-w-[280px]">
                                    Create an account and explore thousands of job opportunities from top companies.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ══════════════ RIGHT PANEL ══════════════ */}
            <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-16 bg-white overflow-y-auto overflow-x-hidden min-h-screen">
                <div className="flex-1 flex items-center justify-center w-full min-h-max py-8 relative">
                    <div className="w-full max-w-[480px]">
                        {/* Mobile logo */}
                        <div className="lg:hidden flex flex-col items-center mb-10">
                            <Image src="/avaa_logo.png" alt="AVAA Logo" width={60} height={60} priority />
                            <h1 className="text-xl font-bold text-[#1e3a4f] mt-2">AVAA</h1>
                        </div>

                        {/* Animated form container */}
                        <div
                            style={{
                                transform: sliding
                                    ? `translateX(${slideDirection === 'left' ? '-100%' : '100%'})`
                                    : 'translateX(0)',
                                opacity: sliding ? 0 : 1,
                                transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
                            }}
                        >
                            {mode === 'signin' ? (
                                /* ─────── SIGN IN FORM ─────── */
                                <div>
                                    <h2 className="text-[28px] font-bold text-[#1a1a1a] mb-2">Welcome back</h2>
                                    <p className="text-[15px] text-[#5a6a75] mb-10">Enter your credentials to access your account</p>

                                    <form onSubmit={handleSignIn} className="space-y-6">
                                        {/* Email */}
                                        <div>
                                            <label htmlFor="login-email" className="block text-[15px] font-semibold text-[#1a1a1a] mb-2">Email</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4L12 13L2 4" /></svg>
                                                </div>
                                                <input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3.5 border border-[#d1d5db] rounded-xl text-[15px] text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all" required />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label htmlFor="login-password" className="block text-[15px] font-semibold text-[#1a1a1a]">Password</label>
                                                <Link href="/user/forgot-password" className="text-sm font-medium text-[#7EB0AB] hover:text-[#6A9994] transition-colors">Forgot password?</Link>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                                                </div>
                                                <input id="login-password" type={loginShowPassword ? 'text' : 'password'} placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                                                    className="w-full pl-12 pr-12 py-3.5 border border-[#d1d5db] rounded-xl text-[15px] text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all" required />
                                                <button type="button" onClick={() => setLoginShowPassword(!loginShowPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9ca3af] hover:text-[#6b7280] transition-colors">
                                                    <EyeIcon show={loginShowPassword} />
                                                </button>
                                            </div>
                                        </div>

                                        {loginError && (
                                            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FEF2F2] text-sm mb-4">
                                                <svg className="w-5 h-5 text-[#E02424] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <line x1="12" y1="8" x2="12" y2="12" />
                                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                                </svg>
                                                <span className="text-[#E02424] font-medium leading-snug">{loginError}</span>
                                            </div>
                                        )}

                                        <button type="submit" disabled={loginLoading}
                                            className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                            style={{ background: '#7EB0AB' }}>
                                            {loginLoading ? 'Signing in...' : 'Sign In'}
                                        </button>
                                    </form>

                                    {/* Divider */}
                                    <div className="flex items-center my-8">
                                        <div className="flex-1 border-t border-[#d1d5db]"></div>
                                        <span className="px-5 text-sm text-[#9ca3af]">Or continue with</span>
                                        <div className="flex-1 border-t border-[#d1d5db]"></div>
                                    </div>

                                    {/* Social Buttons */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
        type="button" 
        onClick={handleGoogleLogin}
        className="flex items-center justify-center gap-2.5 py-3 px-4 border border-[#d1d5db] rounded-xl text-[15px] font-medium text-[#374151] bg-white hover:bg-[#f9fafb] hover:shadow-sm transition-all"
    >
        <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Google
    </button>
                                        <button type="button" className="flex items-center justify-center gap-2.5 py-3 px-4 border border-[#d1d5db] rounded-xl text-[15px] font-medium text-[#374151] bg-white hover:bg-[#f9fafb] hover:shadow-sm transition-all">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                            </svg>
                                            LinkedIn
                                        </button>
                                    </div>


                                    {/* Switch to Sign Up */}
                                    <p className="text-center text-[15px] text-[#6b7280] mt-6">
                                        Don&apos;t have an account?{' '}
                                        <button onClick={() => switchMode('signup')} className="font-semibold text-[#7EB0AB] hover:text-[#6A9994] transition-colors">
                                            Sign up
                                        </button>
                                    </p>
                                </div>
                            ) : (
                                /* ─────── SIGN UP FORM ─────── */
                                <div>
                                    <h2 className="text-[28px] font-bold text-[#1a1a1a] mb-2">Create account</h2>
                                    <p className="text-[15px] text-[#5a6a75] mb-8">Fill in your details to get started</p>

                                    {regError && (
                                        <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-[#FEF2F2] border-l-4 border-red-500 text-sm">
                                            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="8" x2="12" y2="12" />
                                                <line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                            <span className="text-red-700 font-medium">{regError}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleSignUp} className="space-y-5">
                                       {/* Role Selection */}
                                       <div>
                                            <label className="block text-[15px] font-semibold text-[#1a1a1a] mb-3">I am a:</label>
                                            <div className="flex gap-3 p-1 bg-gray-100 rounded-xl border border-gray-200">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedRole('job-seeker')}
                                                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                                                        selectedRole === 'job-seeker' 
                                                            ? 'bg-[#7EB0AB] text-white shadow-md' 
                                                            : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                                >
                                                    Job Seeker
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedRole('recruiter')}
                                                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                                                        selectedRole === 'recruiter' 
                                                            ? 'bg-[#7EB0AB] text-white shadow-md' 
                                                            : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                                >
                                                    Recruiter
                                                </button>
                                            </div>
                                        </div>
                                       {/* Full Name */}
<div>
    <label htmlFor="reg-name" className="block text-[15px] font-semibold text-[#1a1a1a] mb-2">Full Name</label>
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        </div>
        <input 
            id="reg-name" 
            type="text" 
            placeholder="John Doe" 
            value={name} 
            onChange={(e) => {
                // Regex: Allows only letters (a-z, A-Z) and spaces
                const filteredValue = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                setName(filteredValue);
            }}
            className="w-full pl-12 pr-4 py-3.5 border border-[#d1d5db] rounded-xl text-[15px] text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all" 
            required 
        />
    </div>
</div>

                                        {/* Email */}
                                        <div>
                                            <label htmlFor="reg-email" className="block text-[15px] font-semibold text-[#1a1a1a] mb-2">Email</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4L12 13L2 4" /></svg>
                                                </div>
                                                <input id="reg-email" type="email" placeholder="you@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3.5 border border-[#d1d5db] rounded-xl text-[15px] text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all" required />
                                            </div>
                                        </div>

                                        {/* Phone */}
<div>
    <label htmlFor="reg-phone" className="block text-[15px] font-semibold text-[#1a1a1a] mb-2">Phone Number</label>
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
        </div>
        <input 
            id="reg-phone" 
            type="tel" 
            placeholder="09123456789" 
            value={phone} 
            onChange={(e) => {
                // Regex: Allows only numbers (0-9)
                const numbersOnly = e.target.value.replace(/[^0-9]/g, "");
                setPhone(numbersOnly);
            }}
            className="w-full pl-12 pr-4 py-3.5 border border-[#d1d5db] rounded-xl text-[15px] text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all" 
            required 
        />
    </div>
    <p className="text-[11px] text-[#9ca3af] mt-1"> (e.g. 09123456789)</p>
</div>

                                        {/* Location */}
                                        <div>
                                            <label htmlFor="reg-location" className="block text-[15px] font-semibold text-[#1a1a1a] mb-2">Location</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                                </div>
                                                <input id="reg-location" type="text" placeholder="City, Country" value={location} onChange={(e) => setLocation(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3.5 border border-[#d1d5db] rounded-xl text-[15px] text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all" required />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <label htmlFor="reg-password" className="block text-[15px] font-semibold text-[#1a1a1a] mb-2">Password</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                                                </div>
                                                <input id="reg-password" type={regShowPassword ? 'text' : 'password'} placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                                                    className="w-full pl-12 pr-12 py-3.5 border border-[#d1d5db] rounded-xl text-[15px] text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all" required />
                                                <button type="button" onClick={() => setRegShowPassword(!regShowPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9ca3af] hover:text-[#6b7280] transition-colors">
                                                    <EyeIcon show={regShowPassword} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label htmlFor="reg-confirm" className="block text-[15px] font-semibold text-[#1a1a1a] mb-2">Confirm Password</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                                                </div>
                                                <input id="reg-confirm" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3.5 border border-[#d1d5db] rounded-xl text-[15px] text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all" required />
                                            </div>
                                        </div>

                                        {regError && (
                                            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FEF2F2] text-sm mb-4">
                                                <svg className="w-5 h-5 text-[#E02424] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <line x1="12" y1="8" x2="12" y2="12" />
                                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                                </svg>
                                                <span className="text-[#E02424] font-medium leading-snug">{regError}</span>
                                            </div>
                                        )}

                                        <button type="submit" disabled={regLoading}
                                            className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                            style={{ background: '#7EB0AB' }}>
                                            {regLoading ? 'Creating account...' : 'Create Account'}
                                        </button>
                                    </form>

                                    {/* Divider */}
                                    <div className="flex items-center my-6">
                                        <div className="flex-1 border-t border-[#d1d5db]"></div>
                                        <span className="px-5 text-sm text-[#9ca3af]">Or continue with</span>
                                        <div className="flex-1 border-t border-[#d1d5db]"></div>
                                    </div>

                                    {/* Social Buttons */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button  type="button" 
        onClick={handleGoogleSignUp} className="flex items-center justify-center gap-2.5 py-3 px-4 border border-[#d1d5db] rounded-xl text-[15px] font-medium text-[#374151] bg-white hover:bg-[#f9fafb] hover:shadow-sm transition-all">
                                            <svg width="20" height="20" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            Google
                                        </button>
                                        <button type="button" className="flex items-center justify-center gap-2.5 py-3 px-4 border border-[#d1d5db] rounded-xl text-[15px] font-medium text-[#374151] bg-white hover:bg-[#f9fafb] hover:shadow-sm transition-all">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                            </svg>
                                            LinkedIn
                                        </button>
                                    </div>

                                    {/* Switch to Sign In */}
                                    <p className="text-center text-[15px] text-[#6b7280] mt-6">
                                        Already have an account?{' '}
                                        <button onClick={() => switchMode('signin')} className="font-semibold text-[#7EB0AB] hover:text-[#6A9994] transition-colors">
                                            Sign in
                                        </button>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Terms & Conditions pinned to bottom */}
                <div className="w-full pb-8 pt-4 shrink-0 mt-auto">
                    <p className="text-center text-[12px] text-[#9ca3af] leading-snug" style={{ animation: 'fadeSwitch 0.5s ease-out both' }}>
                        By signing the account, you accept our <span className="font-semibold text-[#1a1a1a] cursor-pointer hover:underline">Terms &amp; Conditions</span>
                        <br />
                        and <span className="font-semibold text-[#1a1a1a] cursor-pointer hover:underline">Privacy Policy</span>
                    </p>
                </div>
            </div>

            {/* ─── Keyframes ─── */}
            <style jsx global>{`
                @keyframes fadeSwitch {
                    0% { opacity: 0; transform: scale(0.95); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div >
    );
}