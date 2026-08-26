import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { axiosClient } from '../../api/axiosClient';
import { DashboardStats, User, Event } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { CardSkeleton, TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Activity,
  Users,
  ShieldCheck,
  DollarSign,
  Award,
  Calendar,
  Settings,
  Download,
  Building2,
  Check,
  Plus,
  Trash2,
  Tag,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'events' | 'settings'>('analytics');
  const [platformName, setPlatformName] = useState<string>('NAWATIX');
  const [themeSetting, setThemeSetting] = useState<string>('dark');
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [isNewAdminModalOpen, setIsNewAdminModalOpen] = useState<boolean>(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', organizationName: '' });

  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['adminStats'],
    queryFn: async () => axiosClient.get('/api/reports/dashboard'),
    enabled: activeTab === 'analytics',
  });

  const { data: usersList, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['allUsers'],
    queryFn: async () => axiosClient.get('/api/users'),
    enabled: activeTab === 'users',
  });

  const { data: allEvents, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ['adminAllEvents'],
    queryFn: async () => axiosClient.get('/api/events'),
    enabled: activeTab === 'events',
  });



  const handlePromoteToAdmin = async (userId: string) => {
    try {
      await axiosClient.put(`/api/users/${userId}/role`, { role: 'ADMIN', organizationName: 'NAWATIX Partner Sports Club' });
      showToast('User promoted to verified Event Admin!', 'success');
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    } catch (err: any) {
      showToast(err.displayMessage || 'Failed to update role.', 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await axiosClient.delete(`/api/users/${id}`);
      showToast('Account deleted successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    } catch (err: any) {
      showToast(err.displayMessage || 'Failed to delete account', 'error');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosClient.post('/api/users', { ...newAdmin, role: 'ADMIN' });
      showToast('Admin account created successfully!', 'success');
      setIsNewAdminModalOpen(false);
      setNewAdmin({ name: '', email: '', password: '', organizationName: '' });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    } catch (err: any) {
      showToast(err.displayMessage || 'Failed to create admin', 'error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await axiosClient.put('/api/settings', { name: platformName, theme: themeSetting });
      showToast('Platform settings saved successfully!', 'success');
    } catch (err: any) {
      showToast('Error saving settings.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="px-2.5 py-1 rounded-md text-xs font-black bg-rose-600 text-white uppercase tracking-wider">
            Super Admin HQ
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            Ecosystem Administration
          </h1>
        </div>
        <div className="text-sm font-semibold text-slate-500">
          Logged in as: <span className="text-slate-900 dark:text-white font-bold">{user?.name} (Root Admin)</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-px scrollbar-none">
        {[
          { id: 'analytics', label: 'Platform Analytics & Revenue', icon: Activity },
          { id: 'users', label: 'User & Admin Directory', icon: Users },
          { id: 'events', label: 'All Tournament Catalog', icon: Calendar },
          { id: 'settings', label: 'SaaS Platform Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-5 text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-primary-500 text-primary-500 bg-primary-500/5'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        isLoadingStats ? (
          <CardSkeleton count={4} />
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'System Gross Volume', value: `IDR ${(stats?.revenue || 0).toLocaleString('id-ID')}`, icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' },
                { title: 'Total Registered Users', value: `${stats?.totalParticipants || 14} Accounts`, icon: Users, color: 'text-primary-500 bg-primary-500/10' },
                { title: 'Active Tournaments', value: `${stats?.totalEvents || 0} Events`, icon: Calendar, color: 'text-sky-500 bg-sky-500/10' },
                { title: 'BIBs Verified & Checked', value: `${stats?.bibIssued || 0} Complete`, icon: Award, color: 'text-rose-500 bg-rose-500/10' },
              ].map((m, i) => (
                <div key={i} className="saas-card p-6 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${m.color}`}>
                    <m.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">{m.title}</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">{m.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="saas-card p-6 space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">System Monthly Revenue Trend (IDR)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.monthlyRevenue || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                      <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(val) => `${(val / 1000).toFixed(0)}K`} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }} />
                      <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="saas-card p-6 space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Platform Participant Registration Trajectory</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.participantGrowth || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                      <YAxis stroke="#94A3B8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }} />
                      <Area type="monotone" dataKey="participants" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.3} strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* TAB 2: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">User & Admin Directory</h2>
            <button onClick={() => setIsNewAdminModalOpen(true)} className="saas-button-primary text-xs py-2 px-4 gap-2 flex items-center">
              <Plus className="w-4 h-4" /> Add Admin Manually
            </button>
          </div>
        {isLoadingUsers ? (
          <TableSkeleton rows={10} cols={5} />
        ) : !usersList || usersList.length === 0 ? (
          <EmptyState title="No Users Found" description="User list directory is empty." />
        ) : (
          <div className="saas-card overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Organization Name</th>
                  <th className="py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black text-xs">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-mono text-xs">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase ${
                        u.role === 'SUPER_ADMIN' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30' : u.role === 'ADMIN' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/30' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">{u.organizationName || '-'}</td>
                    <td className="py-4 px-6 flex items-center gap-3">
                      {u.role === 'USER' && (
                        <button
                          onClick={() => handlePromoteToAdmin(u.id)}
                          className="text-xs text-primary-500 font-bold hover:underline shrink-0"
                        >
                          Promote to Admin
                        </button>
                      )}
                      {u.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-rose-500 hover:text-rose-600 p-1.5 rounded hover:bg-rose-500/10 transition-colors"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      )}

      {/* TAB 3: EVENTS */}
      {activeTab === 'events' && (
        isLoadingEvents ? (
          <CardSkeleton count={6} />
        ) : !allEvents || allEvents.length === 0 ? (
          <EmptyState title="No Events in Ecosystem" description="No tournaments have been published across any organizer account." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents.map((evt) => (
              <div key={evt.id} className="saas-card p-5 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold uppercase text-primary-500">{evt.sportCategory}</span>
                  <span className="text-slate-400 font-mono">{evt.status}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{evt.name}</h3>
                <span className="text-xs text-slate-500 block">By Org ID: {evt.organizerId.substring(0, 8)}...</span>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <a href={`/events/${evt.id}`} target="_blank" rel="noreferrer" className="saas-button-secondary text-xs py-1.5 px-3">
                    View Catalog Page
                  </a>
                </div>
              </div>
            ))}
          </div>
        ))}



      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="saas-card p-8 max-w-2xl space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Platform Global Configuration</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Configure corporate branding and global defaults for NAWATIX.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Application Brand Name</label>
              <input type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="saas-input" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Default UI Theme</label>
              <select value={themeSetting} onChange={(e) => setThemeSetting(e.target.value)} className="saas-input">
                <option value="dark">SaaS Dark (Recommended)</option>
                <option value="light">SaaS Light</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={isSavingSettings} className="saas-button-primary py-3 px-8 text-xs font-bold shadow">
            {isSavingSettings ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      )}
    
      <Modal isOpen={isNewAdminModalOpen} onClose={() => setIsNewAdminModalOpen(false)} title="Create New Admin Account">
        <form onSubmit={handleCreateAdmin} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Name</label>
            <input type="text" required value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} className="saas-input" placeholder="e.g. John Organizer" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input type="email" required value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} className="saas-input" placeholder="admin@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input type="password" required value={newAdmin.password} minLength={6} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="saas-input" placeholder="Minimum 6 characters" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Organization Name</label>
            <input type="text" required value={newAdmin.organizationName} onChange={e => setNewAdmin({...newAdmin, organizationName: e.target.value})} className="saas-input" placeholder="e.g. Jakarta Running Hub" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsNewAdminModalOpen(false)} className="saas-button-secondary py-2 px-4 text-sm">Cancel</button>
            <button type="submit" className="saas-button-primary py-2 px-6 text-sm">Create Admin</button>
          </div>
        </form>
      </Modal>



    </div>
  );
};
