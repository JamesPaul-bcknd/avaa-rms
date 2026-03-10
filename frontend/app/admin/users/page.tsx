'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Eye,
  Grid2x2,
  List,
  Mail,
  MoreVertical,
  Pencil,
  Search,
  Trash2,
  UserCircle2,
  X,
} from 'lucide-react';
import api from '@/lib/axios';

interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'recruiter';
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  profile_image_url?: string | null;
  email_verified_at: string | null;
  created_at: string;
  job_applications_count?: number;
}

interface UserListResponse {
  data: ManagedUser[];
  total: number;
}

interface UserDetailsResponse {
  user: ManagedUser;
  recent_activity: {
    id: string;
    title: string;
    description: string;
    created_at: string;
  }[];
}

type StatusFilter = 'all' | 'active' | 'inactive';
type UserTypeFilter = 'all' | 'user' | 'recruiter';
type ViewMode = 'table' | 'grid';

function toRoleLabel(role: ManagedUser['role']) {
  return role === 'recruiter' ? 'Recruiter' : 'Job Seeker';
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<UserTypeFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);

  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsActivity, setDetailsActivity] = useState<UserDetailsResponse['recent_activity']>([]);

  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<ManagedUser | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [showDeactivateSuccess, setShowDeactivateSuccess] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { per_page: '100' };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (userTypeFilter !== 'all') params.user_type = userTypeFilter;

      const response = await api.get('/admin/users', { params });
      const payload = response.data as UserListResponse;
      setUsers(payload.data || []);
    } catch (error) {
      console.error('Failed to load users', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, userTypeFilter]);

  useEffect(() => {
    document.title = 'User Management | Admin Panel';
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const closeMenu = () => setActionMenuId(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const filteredUsers = useMemo(() => users, [users]);

  const patchUser = (id: number, patch: Partial<ManagedUser>) => {
    setUsers((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    if (selectedUser?.id === id) {
      setSelectedUser((prev) => (prev ? { ...prev, ...patch } : prev));
    }
  };

  const updateUser = async (id: number, payload: Record<string, any>) => {
    const response = await api.put(`/admin/users/${id}`, payload);
    return response.data?.user as ManagedUser;
  };

  const deactivateUser = async (user: ManagedUser) => {
    setDeactivateLoading(true);
    try {
      await updateUser(user.id, { email_verified: false });
      patchUser(user.id, { email_verified_at: null });
      setDeactivateTarget(null);
      setShowDeactivateSuccess(true);
    } catch (error) {
      console.error('Failed to deactivate user', error);
    } finally {
      setDeactivateLoading(false);
    }
  };

  const openDetails = async (user: ManagedUser) => {
    setSelectedUser(user);
    setDetailsActivity([]);
    setDetailsLoading(true);
    try {
      const response = await api.get(`/admin/users/${user.id}`);
      const payload = response.data as UserDetailsResponse;
      if (payload.user) {
        patchUser(payload.user.id, payload.user);
        setSelectedUser(payload.user);
      }
      setDetailsActivity(payload.recent_activity || []);
    } catch (error) {
      console.error('Failed to load user details', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openEditModal = (user: ManagedUser) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditLocation(user.location || '');
    setEditBio(user.bio || '');
    setEditSkills((user.skills || []).join(', '));
    setActionMenuId(null);
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    setSaveLoading(true);
    try {
      const skillsArray = editSkills
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const updated = await updateUser(editingUser.id, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        location: editLocation,
        bio: editBio,
        skills: skillsArray,
      });

      patchUser(editingUser.id, updated);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to save user updates', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const deleteUser = async (user: ManagedUser) => {
    const confirmed = window.confirm(`Delete ${user.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.delete(`/admin/users/${user.id}`);
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      if (selectedUser?.id === user.id) setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
          {(['all', 'active', 'inactive'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-6 py-2 text-sm font-semibold capitalize ${statusFilter === status ? 'bg-[#7EB0AB] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search user..."
              className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7EB0AB]/30"
            />
          </div>

          <select
            value={userTypeFilter}
            onChange={(event) => setUserTypeFilter(event.target.value as UserTypeFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7EB0AB]/30"
          >
            <option value="all">All Users</option>
            <option value="user">Job Seekers</option>
            <option value="recruiter">Recruiters</option>
          </select>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-2 ${viewMode === 'grid' ? 'bg-[#7EB0AB] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              title="Grid View"
            >
              <Grid2x2 size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-md p-2 ${viewMode === 'table' ? 'bg-[#7EB0AB] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase text-slate-500">
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Skills</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Joined Date</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">Loading users...</td>
                </tr>
              )}
              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">No users found.</td>
                </tr>
              )}
              {!loading && filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => openDetails(user)}
                  className="cursor-pointer border-b border-slate-100 text-sm hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {user.profile_image_url ? (
                        <img src={user.profile_image_url} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7EB0AB]/25 text-xs font-bold text-[#2f5f5a]">{initials(user.name)}</div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800">{user.name}</p>
                        <p className="text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <div className="flex flex-wrap gap-1">
                      {(user.skills || []).slice(0, 2).map((skill) => (
                        <span key={skill} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{skill}</span>
                      ))}
                      {(user.skills || []).length === 0 && <span className="text-xs text-slate-400">No skills</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.email_verified_at ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {user.email_verified_at ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{formatDate(user.created_at)}</td>
                  <td className="px-5 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                    <button onClick={() => openEditModal(user)} className="mr-2 rounded-md p-2 text-slate-500 hover:bg-slate-100"><Pencil size={14} /></button>
                    <button onClick={() => deleteUser(user)} className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading && <p className="col-span-full rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading users...</p>}
          {!loading && filteredUsers.length === 0 && <p className="col-span-full rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No users found.</p>}
          {!loading && filteredUsers.map((user) => (
            <article key={user.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" onClick={() => openDetails(user)}>
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {user.profile_image_url ? (
                    <img src={user.profile_image_url} alt={user.name} className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7EB0AB]/25 text-xs font-bold text-[#2f5f5a]">{initials(user.name)}</div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{toRoleLabel(user.role)}</p>
                  </div>
                </div>
                <div className="relative" onClick={(event) => event.stopPropagation()}>
                  <button onClick={() => setActionMenuId(actionMenuId === user.id ? null : user.id)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100"><MoreVertical size={16} /></button>
                  {actionMenuId === user.id && (
                    <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                      <button onClick={() => openDetails(user)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><Eye size={14} /> Details</button>
                      <button onClick={() => openEditModal(user)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><Pencil size={14} /> Edit</button>
                      <button onClick={() => deleteUser(user)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"><Trash2 size={14} /> Delete</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2"><Mail size={14} /> {user.email}</p>
                <p className="flex items-center gap-2"><CalendarDays size={14} /> {formatDate(user.created_at)}</p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <p className="text-sm text-slate-600">{user.job_applications_count || 0} Applications</p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.email_verified_at ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {user.email_verified_at ? 'Active' : 'Inactive'}
                </span>
              </div>

            </article>
          ))}
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="rounded-t-2xl bg-gradient-to-r from-[#4d7d79] to-[#74aba6] px-6 py-5 text-white">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">User Details</h3>
                <button onClick={() => setSelectedUser(null)} className="rounded-md p-1 hover:bg-white/20"><X size={18} /></button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedUser.profile_image_url ? (
                    <img src={selectedUser.profile_image_url} alt={selectedUser.name} className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#7EB0AB]/25 text-base font-bold text-[#2f5f5a]">{initials(selectedUser.name)}</div>
                  )}
                  <div>
                    <p className="text-xl font-semibold text-slate-800">{selectedUser.name}</p>
                    <p className="text-sm text-slate-500">{toRoleLabel(selectedUser.role)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeactivateTarget(selectedUser)}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  Deactivate
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <section>
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Personal Information</h4>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p><span className="font-semibold text-slate-500">Full Name:</span> {selectedUser.name}</p>
                    <p><span className="font-semibold text-slate-500">Email:</span> {selectedUser.email}</p>
                    <p><span className="font-semibold text-slate-500">Phone:</span> {selectedUser.phone || 'N/A'}</p>
                    <p><span className="font-semibold text-slate-500">Address:</span> {selectedUser.location || 'N/A'}</p>
                    <p><span className="font-semibold text-slate-500">Role:</span> {toRoleLabel(selectedUser.role)}</p>
                    <p><span className="font-semibold text-slate-500">Joined:</span> {formatDate(selectedUser.created_at)}</p>
                    <p><span className="font-semibold text-slate-500">Total Applications:</span> {selectedUser.job_applications_count || 0}</p>
                  </div>
                </section>

                <section>
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Recent Activity</h4>
                  <div className="space-y-3">
                    {detailsLoading && <p className="text-sm text-slate-500">Loading activity...</p>}
                    {!detailsLoading && detailsActivity.length === 0 && <p className="text-sm text-slate-500">No recent activity.</p>}
                    {!detailsLoading && detailsActivity.map((item) => (
                      <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.description}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{formatDate(item.created_at)}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button onClick={() => setSelectedUser(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Close</button>
                <button
                  onClick={() => window.open(`mailto:${selectedUser.email}`, '_self')}
                  className="rounded-lg bg-[#7EB0AB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#699f99]"
                >
                  Message User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditingUser(null)}>
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="rounded-md p-1 hover:bg-slate-100"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="Name" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input value={editEmail} onChange={(event) => setEditEmail(event.target.value)} placeholder="Email" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input value={editPhone} onChange={(event) => setEditPhone(event.target.value)} placeholder="Phone" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input value={editLocation} onChange={(event) => setEditLocation(event.target.value)} placeholder="Location" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input value={editSkills} onChange={(event) => setEditSkills(event.target.value)} placeholder="Skills (comma separated)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2" />
              <textarea value={editBio} onChange={(event) => setEditBio(event.target.value)} placeholder="Bio" rows={3} className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2" />
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setEditingUser(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={saveEdit} disabled={saveLoading} className="rounded-lg bg-[#7EB0AB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#699f99] disabled:opacity-60">
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deactivateTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" onClick={() => setDeactivateTarget(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertTriangle size={30} />
            </div>
            <h3 className="mb-2 text-3xl font-bold text-slate-800">Deactivate User</h3>
            <p className="mb-8 text-lg leading-relaxed text-slate-500">
              Deactivating this account will set their status to Inactive. They will no longer be able to access the system.
            </p>

            <button
              onClick={() => deactivateUser(deactivateTarget)}
              disabled={deactivateLoading}
              className="mb-4 w-full rounded-lg bg-[#7EB0AB] px-4 py-3 text-xl font-semibold text-white hover:bg-[#6aa19b] disabled:opacity-60"
            >
              {deactivateLoading ? 'Deactivating...' : 'Deactivate Account'}
            </button>
            <button
              onClick={() => setDeactivateTarget(null)}
              className="text-lg font-semibold text-slate-700 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showDeactivateSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" onClick={() => setShowDeactivateSuccess(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-[#1e6b73]">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="mb-2 text-3xl font-bold text-slate-800">User Deactivated Successfully</h3>
            <p className="mb-8 text-lg leading-relaxed text-slate-500">
              The user has been permanently removed from the system.
            </p>

            <button
              onClick={() => setShowDeactivateSuccess(false)}
              className="w-full rounded-lg bg-[#7EB0AB] px-4 py-3 text-xl font-semibold text-white hover:bg-[#6aa19b]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
