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

    const userName = user?.name || 'User';
    const userInitials = userName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'U';
    const userEmail = user?.email || '';
    const profileImageUrl = user?.profile_image_url || null;

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

                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-full text-sm font-medium text-[#5a6a75] hover:bg-[#f0f2f5] transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>

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

            {/* ─── Content ─── */}
            <div className="max-w-[780px] mx-auto px-6 py-8">
                <h1 className="text-[28px] font-bold text-[#1a1a1a] mb-6">Settings</h1>

                {/* Success / Error banners */}
                {saveSuccess && (
                    <div className="mb-5 p-3.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        {saveSuccess}
                    </div>
                )}
                {saveError && (
                    <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                        {saveError}
                    </div>
                )}

                {/* ─── Section 1: Account Info (read-only) ─── */}
                <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 mb-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-full bg-[#e6f7f2] flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7EB0AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#1a1a1a]">Account Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                readOnly
                                className="w-full px-4 py-3 bg-[#f5f7fa] border border-[#e5e7eb] rounded-xl text-sm text-[#5a6a75] cursor-not-allowed"
                            />
                            <p className="text-[11px] text-[#9ca3af] mt-1">Edit from your Profile page</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                readOnly
                                className="w-full px-4 py-3 bg-[#f5f7fa] border border-[#e5e7eb] rounded-xl text-sm text-[#5a6a75] cursor-not-allowed"
                            />
                            <p className="text-[11px] text-[#9ca3af] mt-1">Email cannot be changed</p>
                        </div>
                    </div>
                </div>

                {/* ─── Section 2: Change Password ─── */}
                <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 mb-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-full bg-[#fef3e2] flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#1a1a1a]">Change Password</h3>
                    </div>

                    <div className="space-y-5">
                        {/* Current Password */}
                        <div>
                            <label htmlFor="current-password" className="block text-sm font-semibold text-[#1a1a1a] mb-2">Current Password</label>
                            <div className="relative">
                                <input
                                    id="current-password"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 bg-[#f5f7fa] border border-[#e5e7eb] rounded-xl text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all"
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9ca3af] hover:text-[#5a6a75] transition-colors"
                                >
                                    <EyeIcon open={showCurrentPassword} />
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-semibold text-[#1a1a1a] mb-2">New Password</label>
                            <div className="relative">
                                <input
                                    id="new-password"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 bg-[#f5f7fa] border border-[#e5e7eb] rounded-xl text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all"
                                    placeholder="Enter new password (min 6 characters)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9ca3af] hover:text-[#5a6a75] transition-colors"
                                >
                                    <EyeIcon open={showNewPassword} />
                                </button>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-semibold text-[#1a1a1a] mb-2">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    id="confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 bg-[#f5f7fa] border border-[#e5e7eb] rounded-xl text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:border-transparent transition-all"
                                    placeholder="Re-enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9ca3af] hover:text-[#5a6a75] transition-colors"
                                >
                                    <EyeIcon open={showConfirmPassword} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Section 3: Two-Factor (coming soon) ─── */}
                <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 mb-6 opacity-60">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-full bg-[#eef2ff] flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#1a1a1a]">Two-Factor Authentication</h3>
                            <span className="text-[11px] font-medium text-[#6366f1] bg-[#eef2ff] px-2 py-0.5 rounded-full">Coming Soon</span>
                        </div>
                    </div>
                    <p className="text-sm text-[#5a6a75]">Add an extra layer of security to your account with two-factor authentication. This feature will be available soon.</p>
                </div>

                {/* ─── Save Changes Button ─── */}
                <div className="flex justify-end">
                    <button
                        onClick={handleChangePassword}
                        disabled={saving || (!currentPassword && !newPassword)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#7EB0AB] hover:bg-[#6A9994] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#7EB0AB] focus:ring-offset-2"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </svg>
                        )}
                        {saving ? 'Saving...' : 'Change Password'}
                    </button>
                </div>
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
                                    onClick={() => logout('/user/signin')}
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
