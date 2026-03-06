"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

interface ProfileSettingsProps {
    onBack: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('platform');

    return (
        <div className="w-full bg-white min-h-screen p-6 md:p-10 animate-in fade-in duration-300">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-[24px] font-bold text-slate-800 tracking-tight">Account Settings</h1>
                <p className="text-[13px] text-slate-500 mt-1">Manage your account, security, preferences, and notifications.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-slate-200 mb-8">
                <button
                    onClick={() => setActiveTab('platform')}
                    className={`pb-3 text-[14px] font-bold transition-colors relative ${activeTab === 'platform' ? 'text-[#53968b]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Platform Settings
                    {activeTab === 'platform' && (
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#53968b] rounded-t-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`pb-3 text-[14px] font-bold transition-colors relative ${activeTab === 'security' ? 'text-[#53968b]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Security & Privacy
                    {activeTab === 'security' && (
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#53968b] rounded-t-full"></div>
                    )}
                </button>
            </div>

            <div className="space-y-10 max-w-5xl">

                {/* --- 1. Personal Information Section --- */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-[16px] font-bold text-slate-800">Personal Information</h2>
                        <p className="text-[13px] text-slate-500 mt-0.5">Edit your name, email, and other essential information.</p>
                    </div>

                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                            <User size={32} className="text-slate-400" />
                        </div>
                        <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[13px] font-bold hover:bg-slate-50 transition-colors shadow-sm">
                            Change Profile
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                        {/* Name */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <label className="w-28 text-[13px] font-bold text-slate-800 shrink-0">Name</label>
                            <div className="flex gap-3 flex-1">
                                <input type="text" defaultValue="Beatriz" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                                <input type="text" defaultValue="Valeska" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <label className="w-28 text-[13px] font-bold text-slate-800 shrink-0">Location</label>
                            <input type="text" defaultValue="San Francisco, CA" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <label className="w-28 text-[13px] font-bold text-slate-800 shrink-0">Email</label>
                            <input type="email" defaultValue="beatriz.valeska@email.com" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                        </div>

                        {/* Phone Number */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <label className="w-28 text-[13px] font-bold text-slate-800 shrink-0">Phone Number</label>
                            <input type="text" defaultValue="+1 (555) 123-4567" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button onClick={onBack} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-bold hover:bg-slate-50 transition-colors shadow-sm">
                            Discard
                        </button>
                        <button className="px-6 py-2.5 bg-[#7EB0AB] hover:bg-[#689b96] text-white rounded-lg text-[13px] font-bold transition-colors shadow-sm active:scale-95">
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* --- 2. Language & Localization Section --- */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-[16px] font-bold text-slate-800">Language & Localization</h2>
                        <p className="text-[13px] text-slate-500 mt-0.5">Basic Identification details for the admin console and user portal.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-800">Language</label>
                            <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all appearance-none cursor-pointer">
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-800">Theme</label>
                            <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all appearance-none cursor-pointer">
                                <option>Light</option>
                                <option>Dark</option>
                                <option>System Default</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[13px] font-bold text-slate-800">Timezone</label>
                            <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all appearance-none cursor-pointer">
                                <option>(UTC-05:00) Eastern Time (US & Canada)</option>
                                <option>(UTC-08:00) Pacific Time (US & Canada)</option>
                                <option>(UTC+00:00) Greenwich Mean Time</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- 3. Company Details Section --- */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-[16px] font-bold text-slate-800">Company Details</h2>
                        <p className="text-[13px] text-slate-500 mt-0.5">Edit your name, email, and other essential information.</p>
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
                            {/* Company Name */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <label className="w-32 text-[13px] font-bold text-slate-800 shrink-0">Company Name</label>
                                <input type="text" defaultValue="Beatriz" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                            </div>

                            {/* Location */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <label className="w-28 text-[13px] font-bold text-slate-800 shrink-0">Location</label>
                                <input type="text" defaultValue="San Francisco, CA" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                            </div>

                            {/* Company Email */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <label className="w-32 text-[13px] font-bold text-slate-800 shrink-0">Company Email</label>
                                <input type="email" defaultValue="beatriz.valeska@email.com" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                            </div>

                            {/* Phone Number */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <label className="w-28 text-[13px] font-bold text-slate-800 shrink-0">Phone Number</label>
                                <input type="text" defaultValue="+1 (555) 123-4567" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-[#7EB0AB] focus:ring-1 focus:ring-[#7EB0AB] transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button onClick={onBack} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-bold hover:bg-slate-50 transition-colors shadow-sm">
                            Discard
                        </button>
                        <button className="px-6 py-2.5 bg-[#7EB0AB] hover:bg-[#689b96] text-white rounded-lg text-[13px] font-bold transition-colors shadow-sm active:scale-95">
                            Save Changes
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfileSettings;