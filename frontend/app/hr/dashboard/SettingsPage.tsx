'use client';

import React, { useState } from 'react';
import { ArrowLeft, Globe, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

interface SettingsPageProps {
  onBack: () => void;
}

const SettingsPage = ({ onBack }: SettingsPageProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'platform' | 'security'>('platform');

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
          <p className="text-sm text-slate-500">Manage your account, security, preferences, and notifications.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200 mb-8 mt-4">
        <button 
          onClick={() => setActiveTab('platform')}
          className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === 'platform' ? 'text-[#84b3af]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Platform Settings
          {activeTab === 'platform' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#84b3af]" />}
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === 'security' ? 'text-[#84b3af]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Security & Privacy
        </button>
      </div>

      <div className="space-y-6">
        {/* Personal Information Card */}
        <section className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Personal Information</h3>
          <p className="text-xs text-slate-400 mb-6">Edit your name, email, and other essential information.</p>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-slate-100">
              <img src={user?.profile_image_url || "https://ui-avatars.com/api/?name=User&background=60a39d&color=fff"} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Change Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">First Name</label>
              <input type="text" defaultValue={user?.full_name?.split(' ')[0]} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#84b3af]/20" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Last Name</label>
              <input type="text" defaultValue={user?.full_name?.split(' ')[1]} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#84b3af]/20" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email</label>
              <input type="email" defaultValue={user?.email} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Location</label>
              <input type="text" placeholder="City, Country" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#84b3af]/20" />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <button className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Discard</button>
            <button className="px-6 py-2.5 text-sm font-semibold bg-[#84b3af] text-white rounded-xl hover:bg-[#6d9692] transition-colors shadow-md shadow-[#84b3af]/20">Save Changes</button>
          </div>
        </section>

        {/* Language & Localization */}
        <section className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Language & Localization</h3>
          <p className="text-xs text-slate-400 mb-6">Basic identification details for the admin console and user portal.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Language</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none cursor-pointer">
                <option>English</option>
                <option>Tagalog</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Theme</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none cursor-pointer">
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Timezone</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none cursor-pointer">
                <option>(UTC+08:00) Beijing, Perth, Singapore, Hong Kong</option>
                <option>(UTC-05:00) Eastern Time (US & Canada)</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;