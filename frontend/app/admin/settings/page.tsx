'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Loader2, Save } from 'lucide-react';

interface AdminProfile {
  name: string;
  email: string;
  role: string;
  profile_image_url?: string | null;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    document.title = 'Settings | Admin Panel';
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await api.post('/admin/me');
        const payload = response.data as AdminProfile;
        setProfile(payload);
        setName(payload.name || '');
        setEmail(payload.email || '');
      } catch (error: any) {
        setErrorMsg(error?.response?.data?.error || 'Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileSave = async () => {
    setProfileMsg('');
    setPasswordMsg('');
    setErrorMsg('');

    try {
      setSavingProfile(true);
      const response = await api.put('/admin/profile', { name, email });
      const updated = response.data?.user as AdminProfile;
      if (updated) {
        setProfile(updated);
      }
      setProfileMsg('Profile updated successfully.');
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    setProfileMsg('');
    setPasswordMsg('');
    setErrorMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    try {
      setSavingPassword(true);
      await api.put('/admin/profile', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      setPasswordMsg('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.error || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#7EB0AB]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {(errorMsg || profileMsg || passwordMsg) && (
        <div className="space-y-2">
          {errorMsg && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</p>}
          {profileMsg && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{profileMsg}</p>}
          {passwordMsg && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{passwordMsg}</p>}
        </div>
      )}

      <section id="profile" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">View Profile</h2>
        <p className="mt-1 text-sm text-slate-500">Update your basic account information.</p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7EB0AB]/25 text-sm font-bold text-[#2f5f5a]">
              {(profile?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{profile?.name || 'Admin'}</p>
              <p className="text-xs text-slate-500">{profile?.role || 'admin'}</p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7EB0AB]/40"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7EB0AB]/40"
            />
          </div>
        </div>

        <button
          onClick={handleProfileSave}
          disabled={savingProfile}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#7EB0AB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6ca39e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Profile
        </button>
      </section>

      <section id="account" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Account Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Change your password securely.</p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7EB0AB]/40"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7EB0AB]/40"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7EB0AB]/40"
            />
          </div>
        </div>

        <button
          onClick={handlePasswordSave}
          disabled={savingPassword}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#7EB0AB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6ca39e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Update Password
        </button>
      </section>
    </div>
  );
}
