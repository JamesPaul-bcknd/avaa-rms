"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Eye, Ban, MessageSquare, Bell, Loader2, MessageCircle } from 'lucide-react';
import UserDetailsModal from './UserDetailsModal';
import EndContractModal from './EndContractModal';
import { hrProfilesApi, HrUser } from '@/lib/hrProfiles';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';

const UserPage = () => {
  const [users, setUsers] = useState<HrUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user: hrUser } = useAuth({ redirect: false });
  const router = useRouter();
  
  // State for View Modal
  const [selectedUser, setSelectedUser] = useState<HrUser | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // State for End Contract Modal
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const response = await hrProfilesApi.searchUsers(searchQuery);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to search users:', error);
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

  // Handle messaging a user
  const handleMessageUser = (user: HrUser) => {
    // Navigate to messages with the user ID
    router.push('/hr-dashboard?view=messages&userId=' + user.id);
  };

  // Generate user initials and color
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserColor = (id: number) => {
    const colors = ['bg-teal-500', 'bg-slate-800', 'bg-emerald-400', 'bg-blue-500', 'bg-purple-500'];
    return colors[id % colors.length];
  };

  const actionBtnBase = `
    p-2 bg-white rounded-xl border border-slate-200 
    transition-all duration-200 ease-in-out shadow-sm
    hover:shadow-md hover:-translate-y-0.5 active:scale-95
  `;

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] p-4 sm:p-8 space-y-8">
      
      {/* ── Header Section ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-700">Users</h1>
        
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="relative w-full max-w-xs hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20" 
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 shadow-sm transition-all">
            <MessageSquare size={18} className="text-slate-400" />
            Messages
          </button>

          <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 shadow-sm relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
            {hrUser?.profile_image_url ? (
              <Image 
                src={hrUser.profile_image_url} 
                alt="HR User" 
                width={40} 
                height={40} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-teal-500 flex items-center justify-center text-white font-bold">
                HR
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden p-2">
        <div className="p-6">
            <h2 className="text-lg font-bold text-slate-800">Active Employee</h2>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-slate-400" size={24} />
              <span className="ml-2 text-slate-400">Loading users...</span>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 border-y border-slate-50">
                <tr>
                  <th className="px-8 py-4">Name</th>
                  <th className="px-8 py-4">Position</th>
                  <th className="px-8 py-4 text-center">Status</th>
                  <th className="px-8 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${getUserColor(user.id)} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                          {user.profile_image_url ? (
                            <Image 
                              src={user.profile_image_url} 
                              alt={user.name} 
                              width={48} 
                              height={48} 
                              className="w-full h-full object-cover rounded-xl" 
                            />
                          ) : (
                            getUserInitials(user.name)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-700 text-[16px]">{user.name}</div>
                          <div className="text-xs text-slate-400 font-medium uppercase tracking-tight">{user.position || 'User'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-slate-500 font-semibold">{user.position || 'N/A'}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="px-4 py-1.5 bg-emerald-50 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Active
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => handleMessageUser(user)}
                          title="Send Message"
                          className={`${actionBtnBase} text-slate-400 hover:text-blue-500 hover:border-blue-200`}
                        >
                          <MessageCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenViewModal(user)}
                          title="View Details"
                          className={`${actionBtnBase} text-slate-400 hover:text-teal-500 hover:border-teal-200`}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleBlockRequest(user)}
                          title="Block User"
                          className={`${actionBtnBase} text-slate-400 hover:text-red-500 hover:border-red-200`}
                        >
                          <Ban size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-50">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-slate-400" size={24} />
              <span className="ml-2 text-slate-400">Loading users...</span>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${getUserColor(user.id)} flex items-center justify-center text-white font-bold text-xs`}>
                      {user.profile_image_url ? (
                        <Image 
                          src={user.profile_image_url} 
                          alt={user.name} 
                          width={40} 
                          height={40} 
                          className="w-full h-full object-cover rounded-lg" 
                        />
                      ) : (
                        getUserInitials(user.name)
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-700 text-sm">{user.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{user.position || 'User'}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-500 rounded-full text-[9px] font-black uppercase">
                    Active
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleMessageUser(user)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-blue-500 hover:bg-blue-50"
                  >
                    <MessageCircle size={14} /> Message
                  </button>
                  <button 
                    onClick={() => handleOpenViewModal(user)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button 
                    onClick={() => handleBlockRequest(user)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50"
                  >
                    <Ban size={14} /> Block
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 1. Details Modal */}
      <UserDetailsModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        user={selectedUser} 
      />

      {/* 2. End Contract Confirmation Modal */}
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
