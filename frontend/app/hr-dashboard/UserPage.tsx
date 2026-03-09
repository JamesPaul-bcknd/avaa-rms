"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { hrProfilesApi, HrUser } from '@/lib/hrProfiles';
import { Eye, Ban, Loader2, User, AlertTriangle, CheckCircle2 } from 'lucide-react';

// --- Sub-components ---
import UserDetailsModal from './UserDetailsModal';

const UserPage = () => {
  // --- State ---
  const [users, setUsers] = useState<HrUser[]>([
    // Fallback dummy data if API fails to load instantly
    { id: '1', name: 'John Doe', email: 'john@example.com', position: 'Backend', created_at: '', updated_at: '' },
    { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', position: 'Frontend', created_at: '', updated_at: '' },
    { id: '3', name: 'Michael Chen', email: 'michael@example.com', position: 'Back end', created_at: '', updated_at: '' },
  ]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [selectedUser, setSelectedUser] = useState<HrUser | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<HrUser | null>(null);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await hrProfilesApi.getUsers();
      if (response.data && response.data.length > 0) {
        setUsers(response.data);
      }
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
      // 1. Remove user from list
      setUsers(users.filter(u => u.id !== userToBlock.id));
      // 2. Close Block modal
      setIsBlockOpen(false);
      setUserToBlock(null);
      // 3. Open Success Modal
      setIsSuccessOpen(true);
      
      // Auto close success modal after 3 seconds
      setTimeout(() => {
        setIsSuccessOpen(false);
      }, 3000);
    }
  };

  const handleOpenViewModal = (user: HrUser) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  return (
    <div className="w-full animate-in fade-in duration-300">
      
      <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden">
        {/* Card Title */}
        <div className="px-8 py-6 mb-2">
          <h2 className="text-[17px] font-bold text-slate-800">Active Employee</h2>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block w-full overflow-x-auto pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#7EB0AB]" size={28} />
              <span className="ml-3 text-slate-400 text-sm font-medium">Loading users...</span>
            </div>
          ) : (
            <div className="px-8">
              <table className="w-full text-left border border-slate-100 rounded-2xl overflow-hidden min-w-[800px]">
                <thead className="bg-white">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Name</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Position</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">

                      {/* Name & Avatar Column */}
                      <td className="px-8 py-5 border-b border-slate-50 group-last:border-none">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 shrink-0">
                            {user.profile_image_url ? (
                              <Image
                                src={user.profile_image_url}
                                alt={user.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <User size={18} strokeWidth={2} />
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
                        <span className="text-[13px] font-semibold text-slate-600">{user.position || 'Backend'}</span>
                      </td>

                      {/* Status Column */}
                      <td className="px-8 py-5 border-b border-slate-50 group-last:border-none text-center">
                        <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-bold tracking-wide gap-1.5">
                          <CheckCircle2 size={12} strokeWidth={3} />
                          Active
                        </span>
                      </td>

                      {/* Action Column */}
                      <td className="px-8 py-5 border-b border-slate-50 group-last:border-none">
                        <div className="flex items-center justify-center gap-3">
                          {/* View Button */}
                          <button
                            onClick={() => handleOpenViewModal(user)}
                            title="View Details"
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#7EB0AB] hover:border-[#7EB0AB] hover:bg-emerald-50 transition-all focus:outline-none shadow-sm"
                          >
                            <Eye size={16} strokeWidth={2} />
                          </button>
                          
                          {/* Block/End Contract Button */}
                          <button
                            onClick={() => handleBlockRequest(user)}
                            title="End Contract"
                            className="p-2 bg-white border border-red-200 rounded-lg text-red-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all focus:outline-none shadow-sm"
                          >
                            <Ban size={16} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile Responsive View (Cards) */}
        <div className="md:hidden flex flex-col p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#7EB0AB]" size={24} />
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="p-5 border border-slate-100 rounded-2xl flex flex-col gap-4 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-300">
                      {user.profile_image_url ? (
                        <Image src={user.profile_image_url} alt={user.name} width={40} height={40} className="rounded-xl object-cover" />
                      ) : (
                        <User size={18} strokeWidth={2} />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-[14px]">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.position || 'Quality Assurance'}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 size={10} strokeWidth={3} /> Active
                  </span>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleOpenViewModal(user)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => handleBlockRequest(user)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-red-200 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors shadow-sm"
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

      {/* ── 2. End Contract Modal (Matching Screenshot) ── */}
      {isBlockOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-[400px] p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6 border border-red-100">
              <AlertTriangle size={32} strokeWidth={1.5} />
            </div>
            
            <h2 className="text-[22px] font-bold text-slate-800 mb-3 tracking-tight">End Employee Contract</h2>
            
            <p className="text-[14px] text-slate-500 mb-8 leading-relaxed px-4">
              Are you sure you want to end this employee's contract?<br/>
              This action will remove their access.
            </p>
            
            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={handleConfirmBlock} 
                className="w-full py-3.5 bg-[#7EB0AB] hover:bg-[#689893] text-white text-[15px] font-bold rounded-xl transition-colors shadow-sm active:scale-95"
              >
                End Contract
              </button>
              <button 
                onClick={() => setIsBlockOpen(false)} 
                className="w-full py-3.5 text-slate-600 text-[15px] font-bold hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Success Modal ── */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] max-w-[340px] w-full p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-200 shadow-inner mb-4">
              <CheckCircle2 size={36} strokeWidth={2.5} className="fill-emerald-100 text-emerald-500" />
            </div>
            <h3 className="text-[20px] font-bold text-slate-800 mb-2">Contract Ended</h3>
            <p className="text-slate-500 text-[13px] leading-relaxed px-2 mb-6">
              The employee's contract has been successfully terminated and access removed.
            </p>
            <button 
              onClick={() => setIsSuccessOpen(false)} 
              className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all active:scale-95 shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserPage;