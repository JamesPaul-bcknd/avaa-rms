'use client';

import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/axios';

// ─── Eye Icon ───
const EyeIcon = ({ show }: { show: boolean }) =>
    show ? (
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

const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const MailIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4L12 13L2 4" />
    </svg>
);
const LockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
);
const PhoneIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
);
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);
const LinkedInIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const inputCls = 'w-full pl-10 pr-4 py-3 border border-[#d1d5db] rounded-xl text-[14px] text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all';
const bareInputCls = 'w-full px-3 py-3 border border-[#d1d5db] rounded-xl text-[14px] text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all';

const ErrorBanner = ({ msg }: { msg: string }) => (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FEF2F2] border-l-4 border-red-500 text-sm mb-4">
        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className="text-red-700 font-medium">{msg}</span>
    </div>
);

export default function SignUpPage() {
    const router = useRouter();

    const [role, setRole] = useState<'job-seeker' | 'recruiter'>('job-seeker');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Job Seeker fields
    const [headline, setHeadline] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');

    // Recruiter fields
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [companyDesc, setCompanyDesc] = useState('');
    const [companyLocation, setCompanyLocation] = useState('');
    const [industry, setIndustry] = useState('');
    const [website, setWebsite] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const addSkill = () => {
        const trimmed = skillInput.trim();
        if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed]);
        setSkillInput('');
    };
    const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
    };
    const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) { setError('Please enter a valid email address.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

        const digits = phone.replace(/\D/g, '');
        let normalizedPhone = digits;
        if (/^09\d{9}$/.test(digits)) normalizedPhone = '63' + digits.slice(1);
        if (!/^639\d{9}$/.test(normalizedPhone)) {
            setError('Phone must be a valid PH number (e.g. 09123456789).');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', {
                name,
                email,
                password,
                phone: normalizedPhone,
                location: role === 'job-seeker' ? (location || 'N/A') : (companyLocation || 'N/A'),
            });

            // Build profile payload to apply after OTP verification
            const profileData: Record<string, string> = {};
            if (role === 'job-seeker') {
                profileData.role = 'user';
                profileData.phone = normalizedPhone;
                profileData.location = location || '';
                profileData.headline = headline;
                profileData.bio = bio;
                profileData.skills = JSON.stringify(skills);
            } else {
                profileData.role = 'recruiter';
                profileData.company_name = companyName;
                profileData.position = jobTitle;
                profileData.company_location = companyLocation;
                profileData.company_description = companyDesc;
                profileData.industry = industry;
                profileData.website = website;
            }

            // Always require email verification before entering the app
            sessionStorage.setItem('pendingSignupEmail', email);
            sessionStorage.setItem('pendingSignupPassword', password);
            sessionStorage.setItem('pendingProfileData', JSON.stringify(profileData));
            router.push(`/user/verify-otp?email=${encodeURIComponent(email)}&role=${role}`);
        } catch (err: any) {
            const errors = err.response?.data;
            if (typeof errors === 'string') {
                try {
                    const parsed = JSON.parse(errors);
                    const firstKey = Object.keys(parsed)[0];
                    setError(parsed[firstKey][0]);
                } catch { setError(errors); }
            } else if (errors?.message) setError(errors.message);
            else if (errors?.error) setError(errors.error);
            else setError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/google`;
    };

    return (
        <div className="flex min-h-screen">
            {/* ══════════════ LEFT PANEL ══════════════ */}
            <div className="hidden lg:flex lg:w-[360px] xl:w-[400px] bg-[#1D2835] flex-col px-10 relative flex-shrink-0">
                <div className="pt-10">
                    <Image src="/avaa_logo.png" alt="AVAA Logo" width={80} height={80} priority />
                </div>
                <div className="mt-auto pb-16">
                    <h1 className="text-3xl font-bold text-white mb-4 tracking-wide italic">Start Your Journey</h1>
                    <p className="text-[#a0b0b8] text-sm leading-relaxed max-w-[260px]">
                        Create an account and explore thousands of job opportunities from top companies.
                    </p>
                </div>
            </div>

            {/* ══════════════ RIGHT PANEL ══════════════ */}
            <div className="flex-1 flex flex-col bg-white overflow-y-auto min-h-screen">
                <div className="flex-1 flex items-start justify-center w-full py-10 px-6 sm:px-12">
                    <div className="w-full max-w-[680px]">

                        {/* Mobile logo */}
                        <div className="lg:hidden flex flex-col items-center mb-8">
                            <Image src="/avaa_logo.png" alt="AVAA Logo" width={56} height={56} priority />
                            <h1 className="text-lg font-bold text-[#1e3a4f] mt-2">AVAA</h1>
                        </div>

                        <h2 className="text-[26px] font-bold text-[#1a1a1a] mb-1">Create an account</h2>
                        <p className="text-[14px] text-[#5a6a75] mb-6">Fill in your details to get started</p>

                        {error && <ErrorBanner msg={error} />}

                        {/* ── Role Toggle ── */}
                        <div className="flex items-center border border-[#d1d5db] rounded-xl p-1 mb-6 bg-[#f9fafb]">
                            <span className="text-[13px] font-semibold text-[#374151] pl-3 pr-4 whitespace-nowrap">Choose Your Role :</span>
                            <div className="flex flex-1 gap-1">
                                <button type="button" onClick={() => setRole('job-seeker')}
                                    className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${role === 'job-seeker' ? 'bg-[#7EB0AB] text-white shadow-sm' : 'text-[#6b7280] hover:bg-[#e5e7eb]'}`}>
                                    Job Seeker
                                </button>
                                <button type="button" onClick={() => setRole('recruiter')}
                                    className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${role === 'recruiter' ? 'bg-[#7EB0AB] text-white shadow-sm' : 'text-[#6b7280] hover:bg-[#e5e7eb]'}`}>
                                    Recruiter
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Row 1: Full Name + Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon /></div>
                                        <input type="text" placeholder="Jane Doe" value={name}
                                            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                                            className={inputCls} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MailIcon /></div>
                                        <input type="email" placeholder="jane.doe@email.com" value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={inputCls} required />
                                    </div>
                                </div>
                            </div>

                            {/* Role-specific fields */}
                            {role === 'job-seeker' ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Professional Headline</label>
                                            <input type="text" placeholder="e.g., Junior Web Developer" value={headline}
                                                onChange={(e) => setHeadline(e.target.value)} className={bareInputCls} />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Location</label>
                                            <input type="text" placeholder="City, Country" value={location}
                                                onChange={(e) => setLocation(e.target.value)} className={bareInputCls} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Phone Number</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><PhoneIcon /></div>
                                            <input type="tel" placeholder="09123456789" value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                                className={inputCls} required />
                                        </div>
                                        <p className="text-[11px] text-[#9ca3af] mt-1">PH numbers only (e.g. 09123456789)</p>
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Short description about yourself</label>
                                        <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)}
                                            className="w-full px-3 py-3 border border-[#d1d5db] rounded-xl text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all resize-none" />
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Core Skills</label>
                                        <div className="min-h-[52px] flex flex-wrap gap-2 items-center px-3 py-2.5 border border-[#d1d5db] rounded-xl bg-white focus-within:ring-2 focus-within:ring-[#7EB0AB] transition-all">
                                            {skills.map((s) => (
                                                <span key={s} className="flex items-center gap-1 px-3 py-1 bg-[#f0f7f6] border border-[#c2dbd8] rounded-full text-[13px] text-[#2d6b65] font-medium">
                                                    {s}
                                                    <button type="button" onClick={() => removeSkill(s)} className="ml-0.5 text-[#7EB0AB] hover:text-red-400 leading-none transition-colors">×</button>
                                                </span>
                                            ))}
                                            <input type="text" placeholder={skills.length === 0 ? '+ Add Skill' : ''}
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onKeyDown={handleSkillKeyDown}
                                                className="flex-1 min-w-[100px] text-[14px] placeholder-[#9ca3af] bg-transparent outline-none" />
                                            {skillInput.trim() && (
                                                <button type="button" onClick={addSkill}
                                                    className="text-[12px] font-semibold text-[#7EB0AB] hover:text-[#5a9490] transition-colors whitespace-nowrap">
                                                    + Add Skill
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-[#9ca3af] mt-1">Press Enter or click + Add Skill</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Company Name</label>
                                            <input type="text" value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)} className={bareInputCls} />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Job Title</label>
                                            <input type="text" placeholder="(e.g., Senior HR Recruiter)" value={jobTitle}
                                                onChange={(e) => setJobTitle(e.target.value)} className={bareInputCls} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Phone Number</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><PhoneIcon /></div>
                                            <input type="tel" placeholder="09123456789" value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                                className={inputCls} required />
                                        </div>
                                        <p className="text-[11px] text-[#9ca3af] mt-1">PH numbers only (e.g. 09123456789)</p>
                                    </div>

                                    <div className="pt-1">
                                        <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-3">Company Details</h3>

                                        <div className="mb-4">
                                            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Company Description</label>
                                            <textarea rows={4} value={companyDesc} onChange={(e) => setCompanyDesc(e.target.value)}
                                                className="w-full px-3 py-3 border border-[#d1d5db] rounded-xl text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all resize-none" />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Company Name</label>
                                                <input type="text" value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)} className={bareInputCls} />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Location</label>
                                                <input type="text" value={companyLocation}
                                                    onChange={(e) => setCompanyLocation(e.target.value)} className={bareInputCls} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Industry</label>
                                                <input type="text" placeholder="(e.g., Marketing Industry)" value={industry}
                                                    onChange={(e) => setIndustry(e.target.value)} className={bareInputCls} />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Official Website Link:</label>
                                                <input type="url" value={website}
                                                    onChange={(e) => setWebsite(e.target.value)} className={bareInputCls} />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Password + Confirm Password */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockIcon /></div>
                                        <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={`${inputCls} pr-11`} required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9ca3af] hover:text-[#6b7280] transition-colors">
                                            <EyeIcon show={showPassword} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockIcon /></div>
                                        <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`${inputCls} pr-11`} required />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9ca3af] hover:text-[#6b7280] transition-colors">
                                            <EyeIcon show={showConfirm} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                style={{ background: '#7EB0AB' }}>
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-5">
                            <div className="flex-1 border-t border-[#d1d5db]" />
                            <span className="px-4 text-[12px] text-[#9ca3af] uppercase tracking-wider">Or continue with</span>
                            <div className="flex-1 border-t border-[#d1d5db]" />
                        </div>

                        {/* Social Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={handleGoogleAuth}
                                className="flex items-center justify-center gap-2.5 py-3 px-4 border border-[#d1d5db] rounded-xl text-[14px] font-medium text-[#374151] bg-white hover:bg-[#f9fafb] hover:shadow-sm transition-all">
                                <GoogleIcon /> Google
                            </button>
                            <button type="button"
                                className="flex items-center justify-center gap-2.5 py-3 px-4 border border-[#d1d5db] rounded-xl text-[14px] font-medium text-[#374151] bg-white hover:bg-[#f9fafb] hover:shadow-sm transition-all">
                                <LinkedInIcon /> LinkedIn
                            </button>
                        </div>

                        <p className="text-center text-[14px] text-[#6b7280] mt-5">
                            Already have an account?{' '}
                            <a href="/signin" className="font-semibold text-[#7EB0AB] hover:text-[#6A9994] transition-colors">Sign in</a>
                        </p>

                        <div className="pt-6 pb-4 text-center">
                            <p className="text-[12px] text-[#9ca3af] leading-snug">
                                By signing the account, you accept our{' '}
                                <span className="font-semibold text-[#1a1a1a] cursor-pointer hover:underline">Terms &amp; Conditions</span>
                                {' '}and{' '}
                                <span className="font-semibold text-[#1a1a1a] cursor-pointer hover:underline">Privacy Policy</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
