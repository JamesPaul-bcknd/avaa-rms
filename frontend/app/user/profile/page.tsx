'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import api from '@/lib/axios';

export default function ProfilePage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [resumeFile, setResumeFile] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { isLoading, user, logout } = useAuth();

    const userName = user?.name || 'User';
    const userInitials = userName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'U';
    const userEmail = user?.email || '';

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => { document.title = 'Profile | AVAA'; }, []);

    // Populate fields once auth user data is ready
    useEffect(() => {
        if (user) {
            setFullName(user.name ?? '');
            setEmail(user.email ?? '');
            setPhone(user.phone ?? '');
            setLocation(user.location ?? '');
            setBio(user.bio ?? '');
        }
    }, [user]);

    if (isLoading) return null;

    const handleCancel = () => {
        // Revert to original user data
        if (user) {
            setFullName(user.name ?? '');
            setPhone(user.phone ?? '');
            setLocation(user.location ?? '');
            setBio(user.bio ?? '');
        }
        setIsEditing(false);
        setSaveError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');
        setSaveSuccess(false);
        try {
            await api.put('/auth/profile', {
                name: fullName,
                phone: phone || null,
                location: location || null,
                bio: bio || null,
            });
            setSaveSuccess(true);
            setIsEditing(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            setSaveError(err.response?.data?.error || 'Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const addSkill = () => {
        const trimmed = newSkill.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills([...skills, trimmed]);
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter((s) => s !== skill));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) setResumeFile(file.name);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setResumeFile(file.name);
    };

    // Generate initials avatar from name
    const initials = fullName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="min-h-screen bg-[#f5f7fa] page-enter pt-20">
            {/* ─── Navbar ─── */}
            <nav className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-[#e5e7eb] px-6 lg:px-10">
                <div className="flex items-center justify-between h-20 max-w-[1400px] mx-auto">
                    {/* Logo */}
                    <Link href="/user/dashboard" className="flex items-center">
                        <Image src="/AVAA Banner Borderless 1.png" alt="AVAA Logo" width={110} height={35} className="object-contain" />
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-3">
                        <Link href="/user/dashboard" className="flex items-center gap-1.5 px-3 lg:px-5 py-2.5 rounded-lg text-[15px] font-semibold text-[#5a6a75] hover:bg-[#f0f2f5] transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 3H8l-2 4h12l-2-4z" />
                            </svg>
                            <span className="hidden sm:inline">Jobs</span>
                        </Link>

                    {/* Saved Jobs Link */}
                    <Link href="/user/saved-jobs" className="flex items-center gap-2 px-3 lg:px-5 py-2.5 rounded-lg border border-[#e5e7eb] text-[15px] font-semibold text-[#1a1a1a] bg-white hover:bg-[#f9fafb] shadow-sm transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                        </svg>
                        <span className="hidden sm:inline">Saved Jobs</span>
                    </Link>

                    {/* Messages Link */}
                    <Link href="/user/messages" className="flex items-center gap-2 px-3 lg:px-5 py-2.5 rounded-lg border border-[#e5e7eb] text-[15px] font-semibold text-[#1a1a1a] bg-white hover:bg-[#f9fafb] shadow-sm transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
                            <polyline points="3 7 12 13 21 7" />
                        </svg>
                        <span className="hidden sm:inline">Messages</span>
                    </Link>

                        <>
                            {/* Notification Bell */}
                            <div className="relative mx-1">
                                <button className="p-2 text-[#5a6a75] hover:text-[#1a1a1a] hover:bg-[#f0f2f5] rounded-full transition-colors relative">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                    </svg>
                                    <div className="absolute top-2 right-2.5 w-[7px] h-[7px] bg-red-500 rounded-full border-2 border-white"></div>
                                </button>
                            </div>
                            <div className="w-px h-6 bg-[#e5e7eb] mx-1"></div>

                            {/* Profile Dropdown */}
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="w-10 h-10 rounded-full flex items-center justify-center border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] hover:border-[#7EB0AB] transition-all ml-1 bg-[#e6f7f2] font-bold text-[#7EB0AB]"
                                >
                                    {userInitials}
                                </button>

                                {/* Dropdown Menu */}
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-[#e5e7eb] overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                                        {/* User Info Header */}
                                        <div className="p-4 border-b border-[#e5e7eb] flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full flex items-center justify-center border border-[#7EB0AB] bg-[#e6f7f2] text-[#7EB0AB] font-bold text-lg">
                                                {userInitials}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-[14px] font-bold text-[#1a1a1a] truncate">{userName}</span>
                                                <span className="text-[12px] font-medium text-[#5a6a75] truncate">{userEmail}</span>
                                            </div>
                                        </div>

                                        <div className="py-2">
                                            <Link href="/user/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors group border-b border-[#f0f2f5] bg-[#e6f7f2] text-[#7EB0AB]">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7EB0AB] group-hover:text-[#7EB0AB] transition-colors">
                                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                                                </svg>
                                                Account
                                            </Link>
                                            <button className="w-full flex items-center justify-between px-4 py-2.5 text-[14px] font-semibold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors group text-left">
                                                <div className="flex items-center gap-3">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5a6a75] group-hover:text-[#7EB0AB] transition-colors">
                                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                                    </svg>
                                                    Dark Mode
                                                </div>
                                            </button>
                                            <Link href="/user/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors group">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5a6a75] group-hover:text-[#7EB0AB] transition-colors">
                                                    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                                                </svg>
                                                Settings
                                            </Link>

                                            <div className="p-2">
                                                <button
                                                    onClick={() => { setShowProfileMenu(false); setShowLogoutConfirm(true); }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-bold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors group"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#5a6a75] group-hover:text-[#7EB0AB] transition-colors">
                                                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                                                    </svg>
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    </div>
                </div>
            </nav>

            {/* ─── Content ─── */}
            <div className="max-w-[780px] mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-[28px] font-bold text-[#1a1a1a]">My Profile</h1>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
                            style={{ background: '#7EB0AB' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* ─── Avatar Card ─── */}
                <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 mb-6 flex items-center gap-5">
                    {/* Avatar — shows initials if name exists */}
                    <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold"
                        style={{ background: initials ? 'linear-gradient(135deg, #1e3a4f, #2a5a6e)' : '#d1d5db' }}>
                        {initials || (
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#1a1a1a]">{fullName || 'Your Name'}</h2>
                        <p className="text-sm text-[#5a6a75] mb-1">{email}</p>
                        {location && <p className="text-xs text-[#9ca3af]">{location}</p>}
                    </div>
                </div>

                {/* ─── Save feedback banner ─── */}
                {saveSuccess && (
                    <div className="mb-5 p-3.5 rounded-xl bg-[#e6f7f2] border border-[#7EB0AB]/40 text-[#6A9994] text-sm font-medium flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Profile saved successfully!
                    </div>
                )}
                {saveError && (
                    <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                        {saveError}
                    </div>
                )}

                {/* ─── Personal Information ─── */}
                <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 mb-6">
                    <h3 className="text-lg font-bold text-[#1a1a1a] mb-5">Personal Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        {/* Full Name */}
                        <div>
                            <label htmlFor="profile-name" className="block text-sm font-semibold text-[#1a1a1a] mb-2">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <input
                                    id="profile-name"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    readOnly={!isEditing}
                                    className={`w-full pl-10 pr-4 py-3 border border-[#d1d5db] rounded-xl text-sm transition-all ${isEditing
                                        ? 'text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent'
                                        : 'text-[#5a6a75] bg-[#f8fafc] cursor-default'
                                        }`}
                                    placeholder="Your full name"
                                />
                            </div>
                        </div>

                        {/* Email — read-only (tied to account) */}
                        <div>
                            <label htmlFor="profile-email" className="block text-sm font-semibold text-[#1a1a1a] mb-2">
                                Email <span className="text-[11px] font-normal text-[#9ca3af] ml-1">(cannot be changed)</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4L12 13L2 4" />
                                    </svg>
                                </div>
                                <input
                                    id="profile-email"
                                    type="email"
                                    value={email}
                                    readOnly
                                    className="w-full pl-10 pr-4 py-3 border border-[#d1d5db] rounded-xl text-sm text-[#9ca3af] bg-[#f8fafc] cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="profile-phone" className="block text-sm font-semibold text-[#1a1a1a] mb-2">Phone</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                                    </svg>
                                </div>
                                <input
                                    id="profile-phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    readOnly={!isEditing}
                                    className={`w-full pl-10 pr-4 py-3 border border-[#d1d5db] rounded-xl text-sm transition-all ${isEditing
                                        ? 'text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent'
                                        : 'text-[#5a6a75] bg-[#f8fafc] cursor-default'
                                        }`}
                                    placeholder="+63 912 345 6789"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor="profile-location" className="block text-sm font-semibold text-[#1a1a1a] mb-2">Location</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                                    </svg>
                                </div>
                                <input
                                    id="profile-location"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    readOnly={!isEditing}
                                    className={`w-full pl-10 pr-4 py-3 border border-[#d1d5db] rounded-xl text-sm transition-all ${isEditing
                                        ? 'text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent'
                                        : 'text-[#5a6a75] bg-[#f8fafc] cursor-default'
                                        }`}
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label htmlFor="profile-bio" className="block text-sm font-semibold text-[#1a1a1a] mb-2">Bio</label>
                        <textarea
                            id="profile-bio"
                            rows={3}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            readOnly={!isEditing}
                            maxLength={500}
                            className={`w-full px-4 py-3 border border-[#d1d5db] rounded-xl text-sm transition-all resize-none ${isEditing
                                ? 'text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent'
                                : 'text-[#5a6a75] bg-[#f8fafc] cursor-default'
                                }`}
                            placeholder="Tell employers a bit about yourself..."
                        />
                        {isEditing && <p className="text-right text-xs text-[#9ca3af] mt-1">{bio.length}/500</p>}
                    </div>
                </div>

                {/* ─── Skills ─── */}
                <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 mb-6">
                    <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {skills.map((skill) => (
                            <span
                                key={skill}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[#e6f7f2] text-[#7EB0AB]"
                            >
                                {skill}
                                <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </span>
                        ))}
                        {skills.length === 0 && (
                            <p className="text-sm text-[#9ca3af]">No skills added yet.</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add a skill..."
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm text-[#1a1a1a] placeholder-[#9ca3af] bg-white focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all"
                        />
                        <button
                            onClick={addSkill}
                            className="px-4 py-2.5 text-sm font-medium text-[#5a6a75] bg-[#f0f2f5] rounded-xl hover:bg-[#e5e7eb] transition-colors"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* ─── Resume/CV ─── */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Resume/CV</h3>
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center py-10 px-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${isDragging
                            ? 'border-[#7EB0AB] bg-[#e6f7f2]'
                            : 'border-[#d1d5db] bg-white hover:border-[#9ca3af]'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                        {resumeFile ? (
                            <p className="text-sm font-medium text-[#1a1a1a]">{resumeFile}</p>
                        ) : (
                            <>
                                <p className="text-sm text-[#5a6a75] mb-1">Drag and drop your resume, or click to browse</p>
                                <span className="text-sm font-semibold text-[#7EB0AB]">Upload Resume</span>
                            </>
                        )}
                    </div>
                </div>

                {/* ─── Action Buttons ─── */}
                {isEditing && (
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#d1d5db] text-sm font-semibold text-[#5a6a75] hover:bg-[#f5f7fa] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: '#7EB0AB' }}
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                                    </svg>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
            {/* ─── Sign Out Confirmation Modal ─── */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-[#e6f7f2] flex items-center justify-center mb-4">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7EB0AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">Sign Out</h3>
                            <p className="text-sm text-[#5a6a75] mb-6">Are you sure you want to sign out of your account?</p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#d1d5db] text-sm font-semibold text-[#5a6a75] hover:bg-[#f5f7fa] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={logout}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-md"
                                    style={{ background: '#7EB0AB' }}
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
