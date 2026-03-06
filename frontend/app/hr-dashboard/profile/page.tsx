"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'platform' | 'security'>('platform');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Toggle States for Security Tab
  const [twoFactor, setTwoFactor] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);

  // Custom Toggle Component to match your design
  const CustomToggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${checked ? 'bg-[#7EB0AB]' : 'bg-slate-200'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans">

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-10 animate-in fade-in duration-300">

        {/* --- Top Header with Logo --- */}
        <div className="flex items-start gap-4 mb-8">
          {/* Clickable Logo -> Redirects to Dashboard */}
          <button
            onClick={() => router.push('/hr-dashboard')}
            className="flex items-center justify-center shrink-0 mt-1 hover:opacity-80 transition-opacity"
            title="Back to Dashboard"
          >
            {/* Custom SVG Logo matching screenshot */}
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 5L35 30H5L20 5Z" fill="#7EB0AB" opacity="0.8" />
              <path d="M20 15L28 28H12L20 15Z" fill="#2d4e56" />
            </svg>
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Account Settings</h1>
            <p className="text-[13px] text-slate-500 mt-1">Manage your account, security, preferences, and notifications.</p>
          </div>
        </div>

        {/* --- Tabs --- */}
        <div className="flex gap-8 border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab('platform')}
            className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'platform' ? 'text-[#7EB0AB]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Platform Settings
            {activeTab === 'platform' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7EB0AB] rounded-t-full"></div>}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'security' ? 'text-[#7EB0AB]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Security & Privacy
            {activeTab === 'security' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7EB0AB] rounded-t-full"></div>}
          </button>
        </div>

        {/* ========================================== */}
        {/* PLATFORM SETTINGS TAB                      */}
        {/* ========================================== */}
        {activeTab === 'platform' && (
          <div className="space-y-8">

            {/* 1. Personal Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-base font-bold text-slate-800">Personal Information</h2>
                <p className="text-[13px] text-slate-500 mt-1">Edit your name, email, and other essential information.</p>
              </div>

              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
                    alt="Profile"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[13px] font-bold hover:bg-slate-50 transition-colors shadow-sm">
                  Change Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="w-28 text-[13px] font-bold text-slate-800 shrink-0">Name</label>
                  <div className="flex gap-3 flex-1">
                    <input type="text" defaultValue="Beatriz" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                    <input type="text" defaultValue="Valeska" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="w-28 text-[13px] font-bold text-slate-800 shrink-0">Location</label>
                  <input type="text" defaultValue="San Francisco, CA" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="w-28 text-[13px] font-bold text-slate-800 shrink-0">Email</label>
                  <input type="email" defaultValue="beatriz.valeska@email.com" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="w-28 text-[13px] font-bold text-slate-800 shrink-0">Phone Number</label>
                  <input type="text" defaultValue="+1 (555) 123-4567" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-bold hover:bg-slate-50 transition-colors shadow-sm">Discard</button>
                <button className="px-6 py-2.5 bg-[#7EB0AB] hover:bg-[#689b96] text-white rounded-lg text-[13px] font-bold transition-colors shadow-sm active:scale-95">Save Changes</button>
              </div>
            </div>

            {/* 2. Language & Localization */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-base font-bold text-slate-800">Language & Localization</h2>
                <p className="text-[13px] text-slate-500 mt-1">Basic Identification details for the admin console and user portal.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-800">Language</label>
                  <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all outline-none">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-800">Theme</label>
                  <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all outline-none">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System Default</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[13px] font-bold text-slate-800">Timezone</label>
                  <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all outline-none">
                    <option>(UTC-05:00) Eastern Time (US & Canada)</option>
                    <option>(UTC-08:00) Pacific Time (US & Canada)</option>
                    <option>(UTC+00:00) Greenwich Mean Time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Company Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-base font-bold text-slate-800">Company Details</h2>
                <p className="text-[13px] text-slate-500 mt-1">Edit your name, email, and other essential information.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-800">Company Description</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="w-32 text-[13px] font-bold text-slate-800 shrink-0">Company Name</label>
                    <input type="text" defaultValue="TechNova" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="w-28 text-[13px] font-bold text-slate-800 shrink-0">Location</label>
                    <input type="text" defaultValue="San Francisco, CA" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="w-32 text-[13px] font-bold text-slate-800 shrink-0">Company Email</label>
                    <input type="email" defaultValue="contact@technova.com" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="w-28 text-[13px] font-bold text-slate-800 shrink-0">Phone Number</label>
                    <input type="text" defaultValue="+1 (555) 123-4567" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-bold hover:bg-slate-50 transition-colors shadow-sm">Discard</button>
                <button className="px-6 py-2.5 bg-[#7EB0AB] hover:bg-[#689b96] text-white rounded-lg text-[13px] font-bold transition-colors shadow-sm active:scale-95">Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* SECURITY & PRIVACY TAB                     */}
        {/* ========================================== */}
        {activeTab === 'security' && (
          <div className="space-y-8">

            {/* Top Info section */}
            <div>
              <h2 className="text-[20px] font-bold text-slate-800">Account Settings</h2>
              <p className="text-[13px] text-slate-500 mt-1">Manage and update your personal information.</p>
            </div>

            {/* 1. Alerts & Authentication Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">

              {/* 2FA */}
              <div className="flex items-start gap-4 pb-6 border-b border-slate-100 mb-6">
                <div className="mt-1">
                  <CustomToggle checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-800">Two-Factor Authentication (2FA)</h3>
                  <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">Protect your account with an extra layer of security. We will ask for a verification code when you log in on a new device.</p>
                </div>
              </div>

              {/* Login Alerts */}
              <div>
                <h3 className="text-[14px] font-bold text-slate-800">Login Alerts</h3>
                <p className="text-[13px] text-slate-500 mt-0.5 mb-5">Choose how you want to be notified when a new login is detected on your account.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                    <CustomToggle checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">Email Notifications</p>
                      <p className="text-[12px] text-slate-500">Send an alert to your email</p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                    <CustomToggle checked={pushNotif} onChange={() => setPushNotif(!pushNotif)} />
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">Push Notifications</p>
                      <p className="text-[12px] text-slate-500">Alerts via desktop or mobile app</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Change Password Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-[15px] font-bold text-slate-800">Change Password</h3>
                <p className="text-[13px] text-slate-500 mt-0.5">Update your password to keep your account secure.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Old Password */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-800">Old Password</label>
                  <input
                    type="password"
                    defaultValue="password123"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all"
                  />
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-800">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      defaultValue="newpassword123"
                      className="w-full px-4 py-2.5 pr-10 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-800">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      defaultValue="newpassword123"
                      className="w-full px-4 py-2.5 pr-10 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-bold text-slate-600">Password Strength</span>
                  <span className="text-[12px] font-bold text-[#7EB0AB]">Strong</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-[#7EB0AB] rounded-full transition-all duration-500"></div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-bold hover:bg-slate-50 transition-colors shadow-sm">Discard</button>
                <button className="px-6 py-2.5 bg-[#7EB0AB] hover:bg-[#689b96] text-white rounded-lg text-[13px] font-bold transition-colors shadow-sm active:scale-95">Save Changes</button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}