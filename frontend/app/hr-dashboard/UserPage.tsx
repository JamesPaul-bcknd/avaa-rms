"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { hrProfilesApi, HrUser } from '@/lib/hrProfiles';
import { Eye, Ban, Loader2, User } from 'lucide-react';

// --- Sub-components ---
import UserDetailsModal from './UserDetailsModal';
import EndContractModal from './EndContractModal';

const UserPage = () => {
  const router = useRouter();

  // --- State ---
  const [users, setUsers] = useState<HrUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedUser, setSelectedUser] = useState<HrUser | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<HrUser | null>(null);
  const [isBlockOpen, setIsBlockOpen] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await hrProfilesApi.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Triggered when clicking the Ban icon
  const handleBlockRequest = (user: HrUser) => {
    setUserToBlock(user);
    setIsBlockOpen(true);
  };

  // Triggered when clicking "End Contract" in the modal
  const handleConfirmBlock = () => {
    if (userToBlock) {
      setUsers(users.filter(u => u.id !== userToBlock.id));
      setIsBlockOpen(false);
      setUserToBlock(null);
    }
  };

  const handleOpenViewModal = (user: HrUser) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  // Generate user initials
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden">

        {/* Card Title */}
        <div className="px-8 py-6">
          <h2 className="text-[17px] font-bold text-slate-800">Active Employee</h2>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block w-full overflow-x-auto pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-slate-400" size={28} />
              <span className="ml-3 text-slate-400 text-sm font-medium">Loading users...</span>
            </div>
          ) : (
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr>
                  <th className="px-8 pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Name</th>
                  <th className="px-8 pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Position</th>
                  <th className="px-8 pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                  <th className="px-8 pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">

                    {/* Name & Avatar Column */}
                    <td className="px-8 py-5 border-b border-slate-50 group-last:border-none">
                      <div className="flex items-center gap-4">
                        <div className="w-[42px] h-[42px] rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 shrink-0">
                          {user.profile_image_url ? (
                            <Image
                              src={user.profile_image_url}
                              alt={user.name}
                              width={42}
                              height={42}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <User size={20} strokeWidth={2} />
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="font-bold text-slate-800 text-[14px] leading-tight">{user.name}</span>
                          <span className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">{user.position || 'Quality Assurance'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Position Column */}
                    <td className="px-8 py-5 border-b border-slate-50 group-last:border-none">
                      <span className="text-sm font-medium text-slate-600">{user.position || 'Backend'}</span>
                    </td>

                    {/* Status Column */}
                    <td className="px-8 py-5 border-b border-slate-50 group-last:border-none text-center">
                      <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-500 rounded-full text-[11px] font-bold tracking-wide">
                        Active
                      </span>
                    </td>

                    {/* Action Column */}
                    <td className="px-8 py-5 border-b border-slate-50 group-last:border-none">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenViewModal(user)}
                          title="View Details"
                          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleBlockRequest(user)}
                          title="Block User"
                          className="p-2 bg-white border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors focus:outline-none"
                        >
                          <Ban size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Responsive View (Cards) */}
        <div className="md:hidden flex flex-col p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="p-5 border border-slate-100 rounded-2xl flex flex-col gap-4 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-[42px] h-[42px] rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-300">
                      {user.profile_image_url ? (
                        <Image src={user.profile_image_url} alt={user.name} width={42} height={42} className="rounded-xl object-cover" />
                      ) : (
                        <User size={20} strokeWidth={2} />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-[14px]">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.position || 'Quality Assurance'}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-500 rounded-full text-[10px] font-bold">
                    Active
                  </span>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleOpenViewModal(user)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => handleBlockRequest(user)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-red-200 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Ban size={14} /> Block
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ── 1. Details Modal ── */}
      <UserDetailsModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        user={selectedUser}
      />

      {/* ── 2. End Contract / Block Confirmation Modal ── */}
      <EndContractModal
        isOpen={isBlockOpen}
        userName={userToBlock?.name || ''}
        onClose={() => setIsBlockOpen(false)}
        onConfirm={handleConfirmBlock}
      />
    </div>
  );
};

export default UserPage;