"use client";

import React, { useState } from 'react';
import { Search, MessageSquare, Bell, Pencil, Trash2, User as UserIcon } from 'lucide-react';

const initialUsers = [
  { id: 1, name: 'John Doe', position: 'Backend', status: 'Active' },
  { id: 2, name: 'Miracle', position: 'Frontend', status: 'Active' },
  { id: 3, name: 'Dendi', position: 'Back end', status: 'Active' },
];

const UserPage = () => {
  // Changed to state so it can receive new approved users
  const [users, setUsers] = useState(initialUsers);

  const deleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-700">Users</h1>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search users..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-full sm:w-64 outline-none focus:ring-2 focus:ring-teal-500/20" />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-8">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Active Employees</h2>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-50">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="group">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 text-slate-400">
                        <UserIcon size={20} />
                      </div>
                      <span className="font-bold text-slate-700">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm text-slate-500 font-medium">{user.position}</td>
                  <td className="px-6 py-6 text-center">
                    <span className="px-6 py-1.5 bg-[#bbf7d0] text-[#16a34a] rounded-full text-xs font-bold">{user.status}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center justify-center gap-3">
                      <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden divide-y divide-slate-100">
          {users.map((user) => (
            <div key={user.id} className="py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 text-slate-400 shrink-0">
                  <UserIcon size={16} />
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-sm">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 bg-[#bbf7d0] text-[#16a34a] rounded-full text-[10px] font-bold">{user.status}</span>
                <button className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPage;