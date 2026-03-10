'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import api from '@/lib/axios';
import { usePathname } from 'next/navigation';
export default function SettingsPage() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');
    const [saveError, setSaveError] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { isLoading, user, logout } = useAuth();
    const [phone, setPhone] = useState('');     // Add this
    const [location, setLocation] = useState('');
    const userName = user?.name || 'User';
    const userInitials = userName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'U';
    const userEmail = user?.email || '';
    const profileImageUrl = user?.profile_image_url || null;
    const userPhone = user?.phone || '';
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    // Security Toggles
    const [is2FAEnabled, setIs2FAEnabled] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);

    // Marketplace Visibility Selection
    const [visibility, setVisibility] = useState('public'); // 'public', 'agency', or 'private'

    // Privacy Toggles
    const [showContact, setShowContact] = useState(true);
    const [showRatings, setShowRatings] = useState(true);
    const [hideProfile, setHideProfile] = useState(false);
    
const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('Account');
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => { document.title = 'Settings | AVAA'; }, []);

    // Populate fields from user data
    useEffect(() => {
        if (user) {
            
            setEmail(user.email || '');
            setName(user.name || '');
            setPhone(user.phone || '');
            setLocation(user.location || '');
        }
    }, [user]);

    if (isLoading) return null;

    const handleChangePassword = async () => {
        setSaveError('');
        setSaveSuccess('');

        if (!currentPassword || !newPassword) {
            setSaveError('Please fill in both current and new password.');
            return;
        }
        if (newPassword.length < 6) {
            setSaveError('New password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setSaveError('New passwords do not match.');
            return;
        }

        setSaving(true);
        try {
            await api.put('/auth/change-password', {
                current_password: currentPassword,
                new_password: newPassword,
            });
            setSaveSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setTimeout(() => setSaveSuccess(''), 4000);
        } catch (err: any) {
            setSaveError(err.response?.data?.error || 'Failed to change password.');
        } finally {
            setSaving(false);
        }
    };

    // Eye icon component to reduce repetition
    const EyeIcon = ({ open }: { open: boolean }) => open ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

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
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 3H8l-2 4h12-2-4z" />
                            </svg>
                            <span className="hidden sm:inline">Jobs</span>
                        </Link>

                        {/* Saved Jobs Link */}
                        <Link
                            href="/user/saved-jobs"
                            className="flex items-center gap-2 px-3 lg:px-5 py-2.5 rounded-lg border border-[#e5e7eb] text-[15px] font-semibold text-[#1a1a1a] bg-white hover:bg-[#f9fafb] shadow-sm transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                            </svg>
                            <span className="hidden sm:inline">Saved Jobs</span>
                        </Link>

                        {/* Messages Link */}
                        <Link
                            href="/user/messages"
                            className="flex items-center gap-2 px-3 lg:px-5 py-2.5 rounded-lg border border-[#e5e7eb] text-[15px] font-semibold text-[#1a1a1a] bg-white hover:bg-[#f9fafb] shadow-sm transition-colors"
                        >
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
                                    style={profileImageUrl ? { backgroundImage: `url(${profileImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                                >
                                    {!profileImageUrl && userInitials}
                                </button>

                                {/* Dropdown Menu */}
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-[#e5e7eb] overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                                        {/* User Info Header */}
                                        <div className="p-4 border-b border-[#e5e7eb] flex items-center gap-3">
                                            <div
                                                className="w-11 h-11 rounded-full flex items-center justify-center border border-[#7EB0AB] bg-[#e6f7f2] text-[#7EB0AB] font-bold text-lg"
                                                style={profileImageUrl ? { backgroundImage: `url(${profileImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                                            >
                                                {!profileImageUrl && userInitials}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-[14px] font-bold text-[#1a1a1a] truncate">{userName}</span>
                                                <span className="text-[12px] font-medium text-[#5a6a75] truncate">{userEmail}</span>
                                            </div>
                                        </div>

                                        <div className="py-2">
                                            <Link href="/user/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors group">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5a6a75] group-hover:text-[#7EB0AB] transition-colors">
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
                                            <Link href="/user/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-[#1a1a1a] hover:bg-[#e6f7f2] hover:text-[#7EB0AB] transition-colors group border-b border-[#f0f2f5] bg-[#e6f7f2] text-[#7EB0AB]">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7EB0AB] group-hover:text-[#7EB0AB] transition-colors">
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

            {/* ─── Content Wrapper ─── */}
<div className="max-w-[1400px] mx-auto px-10 py-10 flex gap-12 bg-[#F9FAFB] min-h-screen">
    
   {/* ─── LEFT SIDEBAR ─── */}
<aside className="w-64 flex-shrink-0">
    <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
    <p className="text-sm text-gray-500 mb-8">Manage your account preferences.</p>
    
    <nav className="space-y-1">
        {['Account', 'Security & Privacy', 'Job Preferences', 'Notifications', 'Documents'].map((item) => (
            <button 
                key={item} 
                onClick={() => setActiveTab(item)} // Added this
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === item  // Changed from item === 'Account'
                    ? 'bg-[#7EB0AB] text-white shadow-md' 
                    : 'text-gray-500 hover:bg-white hover:shadow-sm'
                }`}
            >
                {item}
            </button>
        ))}
    </nav>
</aside>

    {/* ─── MAIN CONTENT AREA ─── */}
    <main className="flex-1 max-w-4xl space-y-8">
        {activeTab === 'Account' && (
            <>
        {/* Success / Error banners */}
        {saveSuccess && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                {saveSuccess}
            </div>
        )}
<div className="mb-2">
            <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
            <p className="text-sm text-gray-400">Manage and update your personal information.</p>
        </div>

        {/* ─── Section 1: Personal Information ─── */}
<section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
    
    <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
        <p className="text-sm text-gray-500">Edit your name, email, and other essential information.</p>
    </div>

    {/* Profile Initials Row */}
    <div className="flex items-center gap-6 mb-8">
        <div className="relative">
            {/* Initials Circle matching the "JP" style */}
            <div className="w-20 h-20 rounded-full bg-[#e6f2f1] border-2 border-[#7EB0AB] flex items-center justify-center shadow-sm">
                <span className="text-[#7EB0AB] text-2xl font-bold tracking-tighter">
                    {name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'JP'}
                </span>
            </div>
        </div>
        <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Change Image
        </button>
    </div>

    {/* Form Fields Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        
       {/* Name Fields */}
<div className="flex items-center">
    <label className="w-32 text-sm font-bold text-gray-900">Name</label>
    <div className="flex-1 flex gap-3">
        <input
            type="text"
            /* Splits name and takes everything except the last word as first name */
            value={name ? name.split(' ').slice(0, -1).join(' ') : ''}
            readOnly
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-500 cursor-not-allowed"
        />
        <input
            type="text"
            /* Takes the last word as the last name */
            value={name ? name.split(' ').slice(-1)[0] : ''}
            readOnly
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-500 cursor-not-allowed"
        />
    </div>
</div>

        {/* Username */}
        <div className="flex items-center">
            <label className="w-32 text-sm font-bold text-gray-900">Username</label>
            <input
                type="text"
                defaultValue={email}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-600 focus:outline-none"
            />
        </div>

        {/* Email */}
        <div className="flex items-center">
            <label className="w-32 text-sm font-bold text-gray-900">Email</label>
            <input
                type="email"
                value={email}
                readOnly
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-500 cursor-not-allowed"
            />
        </div>

        {/* Phone Number */}
<div className="flex items-center">
    <label className="w-32 text-sm font-bold text-gray-900">Phone Number</label>
    <input
        type="text"
        value={phone || 'N/A'} // Uses the 'phone' state variable
        readOnly
        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-500 cursor-not-allowed"
    />
</div>

       {/* Location */}
<div className="flex items-center">
    <label className="w-32 text-sm font-bold text-gray-900">Location</label>
    <input
        type="text"
        value={location || 'N/A'} // Replaced hardcoded "San Francisco" with state
        readOnly
        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-500 cursor-not-allowed"
    />
</div>

        {/* Portfolio Link */}
        <div className="flex items-center">
            <label className="w-32 text-sm font-bold text-gray-900">Portfolio Link</label>
            <input
                type="text"
                defaultValue="N/A"
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-600 focus:outline-none"
            />
        </div>
    </div>

    {/* Action Buttons */}
    <div className="flex justify-end gap-3 mt-10">
        <button className="px-10 py-2.5 text-sm font-bold text-gray-500 bg-white border border-gray-100 rounded-lg hover:bg-gray-50">
            Discard
        </button>
        <button className="px-10 py-2.5 text-sm font-bold text-white bg-[#7EB0AB] rounded-lg shadow-sm hover:bg-[#6A9994] transition-all">
            Save Changes
        </button>
    </div>
</section>

        {/* ─── Section 2: Change Password ─── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Change Password</h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Current Password</label>
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#7EB0AB] outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">New Password</label>
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#7EB0AB] outline-none"
                            placeholder="Min. 8 characters"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Confirm Password</label>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#7EB0AB] outline-none"
                            placeholder="Re-type password"
                        />
                    </div>
                </div>

                {/* Password Strength Indicator */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400">Password Strength</span>
                        <span className="text-xs font-bold text-[#7EB0AB]">
                            {newPassword.length > 8 ? 'Strong' : newPassword.length > 0 ? 'Weak' : ''}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#7EB0AB] transition-all duration-500" 
                            style={{ width: newPassword.length > 8 ? '100%' : newPassword.length > 4 ? '50%' : newPassword.length > 0 ? '20%' : '0%' }}
                        ></div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600">Discard</button>
                    <button
                        onClick={handleChangePassword}
                        disabled={saving || !newPassword}
                        className="px-8 py-2.5 bg-[#7EB0AB] text-white text-sm font-bold rounded-xl shadow-md hover:bg-[#6A9994] transition-all disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </section>

       {/* ─── Section 3: Delete Account ─── */}
<section className="bg-white rounded-2xl border border-red-100 p-8 shadow-sm">
    <h3 className="text-lg font-bold text-red-600 mb-2">Delete Account</h3>
    <p className="text-sm text-gray-500 mb-6">Permanently delete your account and all associated data. This action cannot be undone.</p>
    <div className="flex justify-end">
        <button 
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl shadow-sm hover:bg-red-600 transition-all"
        >
            Delete Account
        </button>
    </div>
</section></>
)}
{/* 2. SECURITY & PRIVACY TAB CONTENT */}
{activeTab === 'Security & Privacy' && (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mb-2">
            <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
            <p className="text-sm text-gray-400">Manage your account security preferences to keep your data safe.</p>
        </div>

        {/* --- Section 1: 2FA & Login Alerts --- */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs text-gray-500">Protect your account with an extra layer of security. We will ask for a verification code when you log in on a new device.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7EB0AB]"></div>
                </label>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Login Alerts</h3>
                <p className="text-xs text-gray-500 -mt-2">Choose how you want to be notified when a new login is detected on your account.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7EB0AB]"></div>
                            </label>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Email Notifications</p>
                                <p className="text-xs text-gray-400">Send an alert your email</p>
                            </div>
                        </div>
                    </div>

                    {/* Push Notifications */}
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7EB0AB]"></div>
                            </label>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Push Notifications</p>
                                <p className="text-xs text-gray-400">Alerts via desktop or mobile app</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- Section 2: Marketplace Visibility --- */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-6">Marketplace Visibility</h3>
            <div className="space-y-3">
                {[
                    { id: 'public', title: 'Public', desc: 'Visible to all potential clients and search engines' },
                    { id: 'agency', title: 'Agency-only', desc: 'Only verified agencies can view your full profile and ratings' },
                    { id: 'private', title: 'Private', desc: 'Your profile is hidden from the marketplace search results' }
                ].map((option) => (
                    <label key={option.id} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${option.id === 'public' ? 'border-[#7EB0AB] bg-[#F9FBFB]' : 'border-gray-100 hover:border-gray-200'}`}>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{option.title}</p>
                            <p className="text-xs text-gray-500">{option.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${option.id === 'public' ? 'border-[#7EB0AB]' : 'border-gray-300'}`}>
                            {option.id === 'public' && <div className="w-2.5 h-2.5 rounded-full bg-[#7EB0AB]"></div>}
                        </div>
                    </label>
                ))}
            </div>
        </section>

        {/* --- Section 3: Privacy & Security --- */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-6">Privacy & Security</h3>
            <div className="space-y-6">
                {[
                    { label: 'Show Contact Info', desc: 'Enable clients to reach you directly before booking', checked: true },
                    { label: 'Show Ratings & Reviews', desc: 'Let potential clients see your track record and VA score', checked: true },
                    { label: 'Hide profile while employed', desc: 'Reduce noise by hiding when you aren\'t looking for work', checked: false }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-900">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7EB0AB]"></div>
                        </label>
                    </div>
                ))}
            </div>
        </section>


    </div>
)}

{/* 2. JOB PREFERENCES TAB CONTENT */}
{activeTab === 'Job Preferences' && (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mb-2">
            <h2 className="text-xl font-bold text-gray-900">Job Preferences</h2>
            <p className="text-sm text-gray-400">Refine your matching criteria to find the perfect VA roles.</p>
        </div>

        {/* --- Preferred Roles --- */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-4">
            <div>
                <h3 className="text-sm font-bold text-gray-900">Preferred Roles</h3>
                <p className="text-xs text-gray-500">Select the roles that best describe your professional expertise.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {['Executive Assistant', 'Project Manager', 'Operations Lead'].map((role) => (
                    <span key={role} className="flex items-center gap-2 px-4 py-2 bg-[#F9FBFB] border border-[#7EB0AB]/30 text-[#4A726E] text-sm font-medium rounded-full">
                        {role}
                        <button className="hover:text-red-500 text-lg">×</button>
                    </span>
                ))}
                <button className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-gray-400 text-sm rounded-full hover:bg-gray-50">
                    + Add Role
                </button>
            </div>
        </section>

        {/* --- Core Skills --- */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-4">
            <div>
                <h3 className="text-sm font-bold text-gray-900">Core Skills</h3>
                <p className="text-xs text-gray-500">Choose skills that represent your core strengths to improve job matching.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {['Executive Support', 'Calendar Management', 'Project Coordination', 'CRM (Salesforce)', 'Expense Tracking', 'Technical Writing', 'Notion & Slack'].map((skill) => (
                    <span key={skill} className="flex items-center gap-2 px-4 py-2 bg-[#F9FBFB] border border-[#7EB0AB]/30 text-[#4A726E] text-sm font-medium rounded-full">
                        {skill}
                        <button className="hover:text-red-500 text-lg">×</button>
                    </span>
                ))}
                <button className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-gray-400 text-sm rounded-full hover:bg-gray-50">
                    + Add Skill
                </button>
            </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* --- Employment Type --- */}
            <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-4">
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Employment Type</h3>
                    <p className="text-xs text-gray-500">Choose your ideal weekly commitment and project load.</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 border-2 border-[#7EB0AB] bg-[#F9FBFB] rounded-xl text-center">
                        <div className="text-xl mb-1">📅</div>
                        <p className="text-sm font-bold text-[#4A726E]">Full-time</p>
                        <p className="text-[10px] text-gray-400">40h/week, primary focus</p>
                    </div>
                    <div className="p-4 border border-gray-100 rounded-xl text-center hover:bg-gray-50 cursor-pointer">
                        <div className="text-xl mb-1">⏱️</div>
                        <p className="text-sm font-bold text-gray-900">Part-time</p>
                        <p className="text-[10px] text-gray-400">20h/week, flexible focus</p>
                    </div>
                    <div className="p-4 border border-gray-100 rounded-xl text-center hover:bg-gray-50 cursor-pointer">
                        <div className="text-xl mb-1">📋</div>
                        <p className="text-sm font-bold text-gray-900">Contract</p>
                        <p className="text-[10px] text-gray-400">Project-based, varied focus</p>
                    </div>
                </div>
            </section>

            {/* --- Target Industries --- */}
            <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-4">
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Target Industries</h3>
                    <p className="text-xs text-gray-500 text-balance">Pick the sectors you have experience in or are most interested in joining.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {['Technology', 'SaaS'].map((industry) => (
                        <span key={industry} className="flex items-center gap-2 px-4 py-2 bg-[#F9FBFB] border border-[#7EB0AB]/30 text-[#4A726E] text-sm font-medium rounded-full">
                            {industry} <button>×</button>
                        </span>
                    ))}
                    <button className="px-4 py-2 bg-gray-50 text-gray-400 text-sm rounded-full">+ Add More</button>
                </div>
            </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* --- Weekly Hours --- */}
            <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Weekly Hours</h3>
                        <p className="text-xs text-gray-500">Specify your ideal number of working hours.</p>
                    </div>
                    <span className="bg-[#F1F7F6] text-[#4A726E] font-bold text-sm px-3 py-1 rounded-md border border-[#7EB0AB]/20">40hrs/week</span>
                </div>
                <div className="relative pt-1">
                    <input type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#7EB0AB]" />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-1">
                        <span>5H</span><span>10H</span><span>20H</span><span>30H</span><span className="text-[#4A726E] font-bold">40H</span><span>50H+</span>
                    </div>
                </div>
            </section>

            {/* --- Preferred Time Zone --- */}
            <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-4">
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Preferred Time Zone</h3>
                    <p className="text-xs text-gray-500">Set your primary working time zone.</p>
                </div>
                <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 outline-none focus:border-[#7EB0AB]">
                    <option>Pacific Standard Time (PST) - UTC</option>
                </select>
                <p className="text-[10px] text-gray-400 italic">Recommended: PST/EST for higher paying opportunities.</p>
            </section>
        </div>

        {/* --- Notice Period --- */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-4">
            <div>
                <h3 className="text-sm font-bold text-gray-900">Notice Period</h3>
                <p className="text-xs text-gray-500">Indicate how soon you can start your next assignment once an offer is made.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Immediate', sub: 'Ready to start now', active: true, icon: '⚡' },
                    { label: '1 Week', sub: 'Standard transition', active: false, icon: '📅' },
                    { label: '2 Weeks', sub: 'Professional transition', active: false, icon: '📅' },
                    { label: '1 Month+', sub: 'Extended transition', active: false, icon: '📅' },
                ].map((period) => (
                    <div key={period.label} className={`p-4 border rounded-xl cursor-pointer ${period.active ? 'border-[#7EB0AB] bg-[#F9FBFB]' : 'border-gray-100 hover:bg-gray-50'}`}>
                        <div className="text-lg mb-1">{period.icon}</div>
                        <p className={`text-sm font-bold ${period.active ? 'text-gray-900' : 'text-gray-900'}`}>{period.label}</p>
                        <p className="text-[10px] text-gray-400">{period.sub}</p>
                    </div>
                ))}
            </div>
        </section>
    </div>
)}

{/* 2. NOTIFICATIONS TAB CONTENT */}
{/* Change 'Notification Preferences' to 'Notifications' to match your sidebar */}
{activeTab === 'Notifications' && (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mb-2">
            <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
            <p className="text-sm text-gray-400">Choose how and when you want to be notified about job matches, messages, and platform updates.</p>
        </div>

        {/* Reusable Notification Section Component */}
        {[
            { 
                title: "Email Notifications", 
                items: [
                    { label: "New Job Matches", desc: "Get notified when a job matches your specific skills and experience." },
                    { label: "Application Status Updates", desc: "Stay updated on your application progress from submission to hire." },
                    { label: "Interview Invites", desc: "Receive instant alerts for scheduled interviews and meeting links." },
                    { label: "Messages from Employers", desc: "Get an email when a potential employer sends you a direct message." }
                ]
            },
            { 
                title: "In-App Notifications", 
                items: [
                    { label: "New Job Matches", desc: "Get notified when a job matches your specific skills and experience." },
                    { label: "Application Status Updates", desc: "Stay updated on your application progress from submission to hire." },
                    { label: "Interview Invites", desc: "Receive instant alerts for scheduled interviews and meeting links." },
                    { label: "Messages from Employers", desc: "Get an email when a potential employer sends you a direct message." }
                ]
            }
        ].map((section, idx) => (
            <section key={idx} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-6">{section.title}</h3>
                <div className="divide-y divide-gray-50">
                    {section.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-start gap-4 py-6 first:pt-0 last:pb-0">
                            <label className="relative inline-flex items-center cursor-pointer mt-1">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                {/* Matches the muted teal color from your sidebar */}
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7EB0AB]"></div>
                            </label>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{item.label}</p>
                                <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        ))}
    </div>
)}

{/* 5. DOCUMENTS TAB CONTENT */}
{activeTab === 'Documents' && (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mb-2">
            <h2 className="text-xl font-bold text-gray-900">Resume & Documents</h2>
            <p className="text-sm text-gray-400">Manage your primary resume and supporting certifications for client matching.</p>
        </div>

        {/* --- Resume Upload Section --- */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Resume Upload</h3>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50/30">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-100 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">Click or drag files here to upload</p>
                <p className="text-xs text-gray-400 mb-6">PDF up to 25 MB</p>
                <button className="px-8 py-2.5 bg-[#7EB0AB] text-white rounded-xl text-sm font-bold hover:bg-[#6A9A95] transition-all shadow-sm">
                    Select File
                </button>
            </div>
        </section>

        {/* --- Active Documents Section --- */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-6">Active Documents</h3>
            
            {/* Using optional chaining (?.) to prevent crashes if uploadedFiles is undefined */}
            {uploadedFiles?.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-50">
                                <th className="pb-4 font-bold">File Name</th>
                                <th className="pb-4 font-bold">Type</th>
                                <th className="pb-4 font-bold">Size</th>
                                <th className="pb-4 font-bold">Date</th>
                                <th className="pb-4 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {uploadedFiles.map((doc, idx) => (
                                <tr key={idx} className="group">
                                    <td className="py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#F4F9F8] rounded-lg flex items-center justify-center text-[#7EB0AB]">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14.5 2 14.5 7.5 20 7.5"/></svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">{doc.name}</p>
                                                <p className="text-[10px] text-gray-400">{doc.category || 'Document'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 text-xs text-gray-500">{doc.type}</td>
                                    <td className="py-5 text-xs text-gray-500">{doc.size}</td>
                                    <td className="py-5 text-xs text-gray-500">{doc.date}</td>
                                    <td className="py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 text-gray-400 transition-colors">✎</button>
                                            <button className="p-2 border border-gray-100 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors">🗑</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="py-12 text-center border border-dashed border-gray-100 rounded-xl bg-gray-50/20">
                    <p className="text-sm text-gray-400">No uploaded files found.</p>
                </div>
            )}
        </section>
    </div>
)}
    </main>
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
                                    onClick={() => logout('/signin')}
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
            {/* Delete Account Modal Overlay */}
{showDeleteModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                </div>
            </div>

            <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Permanently Delete Account?</h2>
            <p className="text-center text-sm text-gray-500 mb-6">This action cannot be undone.</p>

            {/* Warning Box */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 mb-8">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs font-medium text-red-700 leading-relaxed">
                    All your data will be deleted immediately.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 ml-1">Reason for leaving (Optional)</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none">
                        <option>Select a reason</option>
                        <option>No longer need the service</option>
                        <option>Technical issues</option>
                        <option>Switching to another platform</option>
                    </select>
                </div>

                <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-gray-500 ml-1">Confirm Password</label>
                    <input 
                        type="password" 
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                    />
                </div>

                <div className="pt-2 flex flex-col gap-3">
                    <button className="w-full py-3.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors">
                        Delete Account
                    </button>
                    <button 
                        onClick={() => setShowDeleteModal(false)}
                        className="w-full py-3.5 bg-white text-gray-600 font-bold rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                        Cancel, Keep My Account
                    </button>
                </div>
            </div>
        </div>
    </div>
)}
        </div>
    );
}
