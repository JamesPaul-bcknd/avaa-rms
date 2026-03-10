'use client';

import React from 'react';
import { ArrowLeft, MessageSquare, Bell, Lock } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

interface AccountProfileProps {
  onBack: () => void;
}

const AccountProfile = ({ onBack }: AccountProfileProps) => {
  const { user } = useAuth();

  // Mock data to match image_30a311.png exactly if user is null
  const profileData = {
    firstName: "Beatriz",
    lastName: "Valeska",
    role: "Chief Systems Administrator",
    address: "San Francisco, CA",
    email: "beatriz.valeska@email.com",
    phone: "+1 (555) 123-4567",
    status: "Active",
    about: "Chief Systems Administrator at AVAA. Bridging the gap between world-class virtual talent and executive-level demand. My primary mission is to maintain the operational heartbeat of our platform, meticulously overseeing resource allocations and ensuring that every Senior Virtual Assistant—including specialists with over 5 years of executive support experience—is perfectly aligned with the right opportunities."
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
          >
            <ArrowLeft size={24} className="text-slate-600 group-hover:text-slate-900" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all shadow-sm">
            <MessageSquare size={18} />
            Messages
          </button>
          <button className="relative p-2.5 bg-white border border-slate-100 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm ml-2">
            <img 
              src={user?.profile_image_url || "https://ui-avatars.com/api/?name=Recruiter&background=60a39d&color=fff"} 
              alt="Profile Nav" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Profile Card Section */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden mb-6">
        {/* Teal Banner */}
        <div className="h-44 bg-[#84b3af]" />
        
        {/* Profile Info Overlay */}
        <div className="px-10 pb-8">
          <div className="relative flex items-end gap-6 -mt-16">
            <div className="h-32 w-32 rounded-full border-[6px] border-white shadow-lg overflow-hidden bg-white">
              <img 
                src={user?.profile_image_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-800">
                  {user?.full_name || `${profileData.firstName} ${profileData.lastName}`}
                </h2>
                <span className="px-3 py-1 bg-green-50 text-green-600 text-[11px] font-bold uppercase rounded-full tracking-wider border border-green-100">
                  {profileData.status}
                </span>
              </div>
              <p className="text-slate-500 font-medium">{profileData.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-8 mb-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">About</h3>
        <p className="text-slate-500 text-sm leading-relaxed">
          {profileData.about}
        </p>
      </div>

      {/* Details Grid Section */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* First Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">First Name</label>
            <input 
              type="text" 
              readOnly 
              value={user?.full_name?.split(' ')[0] || profileData.firstName}
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-600 text-sm outline-none"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Last Name</label>
            <input 
              type="text" 
              readOnly 
              value={user?.full_name?.split(' ')[1] || profileData.lastName}
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-600 text-sm outline-none"
            />
          </div>

          {/* Role (Locked) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Role</label>
            <div className="relative">
              <input 
                type="text" 
                readOnly 
                value={profileData.role}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-400 text-sm outline-none pr-10"
              />
              <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Complete Address</label>
            <input 
              type="text" 
              readOnly 
              value={profileData.address}
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-600 text-sm outline-none"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                readOnly 
                value={user?.email || profileData.email}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-600 text-sm outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded uppercase border border-green-100">
                Verified
              </span>
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Phone Number</label>
            <div className="relative">
              <input 
                type="text" 
                readOnly 
                value={profileData.phone}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-600 text-sm outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded uppercase border border-green-100">
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;