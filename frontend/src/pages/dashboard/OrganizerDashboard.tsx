import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { axiosClient } from '../../api/axiosClient';
import { DashboardStats, Event, Participant, SportCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton, CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Activity,
  Calendar,
  Users,
  DollarSign,
  Award,
  Plus,
  Search,
  CheckCircle2,
  Download,
  Filter,
  BarChart3,
  QrCode,
  FolderOpen,
  Loader2,
  Tag,
  Trash2,
  Edit3,
} from 'lucide-react';

const createEventSchema = z.object({
  name: z.string().min(3, 'Event name is required'),
  sportCategory: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(3, 'Venue location is required'),
  description: z.string().min(10, 'Please provide event details and race rules'),
  banner: z.string().optional(),
  organizerName: z.string().optional(),
  organizerPhone: z.string().optional(),
  organizerWebsite: z.string().optional(),
});

type CreateEventForm = z.infer<typeof createEventSchema>;

const createTicketSchema = z.object({
  name: z.string().min(2, 'Ticket name e.g. Early Bird / Regular / VIP'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  quota: z.coerce.number().min(1, 'Quota must be at least 1'),
});

type CreateTicketForm = z.infer<typeof createTicketSchema>;

export const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'orders' | 'participants' | 'checkin' | 'reports'>('overview');
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEventForTicket, setSelectedEventForTicket] = useState<string | null>(null);
  const [selectedEventForVoucher, setSelectedEventForVoucher] = useState<string | null>(null);
  const [newVoucher, setNewVoucher] = useState({ code: '', discountType: 'FIXED_AMOUNT', value: 0, usageLimit: 100, expiredDate: '' });
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // On-Site Check-In search state
  const [searchRegQuery, setSearchRegQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Participant[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedParticipantForBib, setSelectedParticipantForBib] = useState<Participant | null>(null);

  const [isVerifyingBib, setIsVerifyingBib] = useState<boolean>(false);

  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['orgStats'],
    queryFn: async () => axiosClient.get('/api/reports/dashboard'),
    enabled: activeTab === 'overview',
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ['myOrgEvents'],
    queryFn: async () => axiosClient.get(`/api/events?organizerId=${user?.id}`),
  });

  const { data: participants, isLoading: isLoadingParticipants } = useQuery<Participant[]>({
    queryKey: ['orgParticipants'],
    queryFn: async () => axiosClient.get('/api/registration/participants'),
    enabled: activeTab === 'participants',
  });

  const { data: orders, isLoading: isLoadingOrders } = useQuery<any[]>({
    queryKey: ['orgOrders'],
    queryFn: async () => axiosClient.get('/api/orders/manage'),
    enabled: activeTab === 'orders',
  });

  // Create Event form
  const {
    register: regEvent,
    handleSubmit: handleEventSubmit,
    reset: resetEventForm,
    formState: { errors: evtErrors, isSubmitting: evtSubmitting },
  } = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema) as any,
    defaultValues: { sportCategory: 'RUNNING' },
  });

  const onAddEvent = async (data: CreateEventForm) => {
    try {
      let bannerUrl = data.banner;
      
      if (bannerFile) {
        const formData = new FormData();
        formData.append('file', bannerFile);
        const uploadRes = await axiosClient.post('/api/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes && (uploadRes as any).url) {
          bannerUrl = (uploadRes as any).url;
        }
      }

      if (editingEvent) {
        await axiosClient.put(`/api/events/${editingEvent.id}`, { ...data, banner: bannerUrl });
        showToast('Tournament updated successfully!', 'success');
      } else {
        await axiosClient.post('/api/events', { ...data, banner: bannerUrl });
        showToast('New tournament published successfully!', 'success');
      }
      queryClient.invalidateQueries({ queryKey: ['myOrgEvents'] });
      setIsNewEventModalOpen(false);
      setEditingEvent(null);
      resetEventForm();
      setBannerFile(null);
    } catch (err: any) {
      showToast(err.displayMessage || 'Failed to save event', 'error');
    }
  };

  const handleEditEventClick = (e: Event) => {
    setEditingEvent(e);
    resetEventForm({
      name: e.name,
      sportCategory: e.sportCategory,
      date: new Date(e.date).toISOString().slice(0, 16),
      location: e.location,
      description: e.description,
      banner: e.banner,
      organizerName: e.organizerName || '',
      organizerPhone: e.organizerPhone || '',
      organizerWebsite: e.organizerWebsite || '',
    });
    setBannerFile(null);
    setIsNewEventModalOpen(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tournament? This will remove all tickets and registrations.')) return;
    try {
      await axiosClient.delete(`/api/events/${id}`);
      showToast('Tournament deleted successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['myOrgEvents'] });
      queryClient.invalidateQueries({ queryKey: ['orgStats'] });
    } catch (err: any) {
      showToast(err.displayMessage || 'Failed to delete event', 'error');
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this participant? This action cannot be undone.')) return;
    try {
      await axiosClient.delete(`/api/registration/participants/${id}`);
      showToast('Participant deleted successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['orgParticipants'] });
      queryClient.invalidateQueries({ queryKey: ['orgStats'] });
    } catch (err: any) {
      showToast(err.displayMessage || 'Failed to delete participant', 'error');
    }
  };

  // Create Ticket form
  const {
    register: regTicket,
    handleSubmit: handleTicketSubmit,
    reset: resetTicketForm,
    formState: { errors: tktErrors, isSubmitting: tktSubmitting },
  } = useForm<CreateTicketForm>({
    resolver: zodResolver(createTicketSchema) as any,
  });

  const onAddTicket = async (data: CreateTicketForm) => {
    if (!selectedEventForTicket) return;
    try {
      await axiosClient.post(`/api/tickets`, { ...data, eventId: selectedEventForTicket });
      showToast('New ticket tier added to tournament!', 'success');
      queryClient.invalidateQueries({ queryKey: ['myOrgEvents'] });
      setSelectedEventForTicket(null);
      resetTicketForm();
    } catch (err: any) {
      showToast(err.displayMessage || 'Failed to add ticket category', 'error');
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForVoucher) return;
    try {
      await axiosClient.post('/api/vouchers', { ...newVoucher, eventId: selectedEventForVoucher, expiredDate: new Date(newVoucher.expiredDate).toISOString() });
      showToast('Promo code created successfully!', 'success');
      setSelectedEventForVoucher(null);
      setNewVoucher({ code: '', discountType: 'FIXED_AMOUNT', value: 0, usageLimit: 100, expiredDate: '' });
      queryClient.invalidateQueries({ queryKey: ['myOrgEvents'] });
    } catch (err: any) {
      showToast(err.displayMessage || 'Failed to create promo code', 'error');
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;
    try {
      await axiosClient.delete(`/api/vouchers/${id}`);
      showToast('Promo code deleted!', 'success');
      queryClient.invalidateQueries({ queryKey: ['myOrgEvents'] });
    } catch (err: any) {
      showToast(err.displayMessage || 'Failed to delete promo code', 'error');
    }
  };

  // Live Check-in Search
  const handlePerformSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRegQuery.trim()) {
      showToast('Enter QR Code, REG number, Athlete Name, or Email', 'info');
      return;
    }
    setIsSearching(true);
    try {
      const res = await axiosClient.get<any, Participant[]>(`/api/registration/search?query=${encodeURIComponent(searchRegQuery.trim())}`);
      setSearchResults(res || []);
      if (!res || res.length === 0) {
        showToast('No matching participant found for this search.', 'info');
      }
    } catch (err: any) {
      showToast(err.displayMessage || 'Error looking up participant', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // Verify and Assign BIB
  const handleVerifyBib = async (participant: Participant) => {
    setIsVerifyingBib(true);
    try {
      await axiosClient.post('/api/registration/verify', {
        participantIdOrRegNumber: participant.registrationNumber,
      });
      showToast(`Athlete check-in COMPLETED! BIB Number generated automatically.`, 'success');
      // Refresh search results & stats
      if (searchRegQuery.trim()) {
        const res = await axiosClient.get<any, Participant[]>(`/api/registration/search?query=${encodeURIComponent(searchRegQuery.trim())}`);
        setSearchResults(res || []);
      }
      queryClient.invalidateQueries({ queryKey: ['orgStats'] });
      queryClient.invalidateQueries({ queryKey: ['orgParticipants'] });
    } catch (err: any) {
      showToast(err.displayMessage || 'Verification failed.', 'error');
    } finally {
      setIsVerifyingBib(false);
    }
  };

  const handleDownloadReport = async (type: string, format: string) => {
    try {
      showToast(`Exporting ${type.toUpperCase()} report in ${format.toUpperCase()} format...`, 'info');
      const res = await axiosClient.get(`/api/reports/export?type=${type}&format=${format}`, { responseType: 'blob' as any });
      
      const url = window.URL.createObjectURL(new Blob([res as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report_${Date.now()}.${format === 'csv' ? 'csv' : 'txt'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Report file downloaded successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to generate export file.', 'error');
    }
  };

  const handleApprovePayment = async (orderId: string) => {
    if (!window.confirm('Verifikasi pembayaran ini? Tiket akan otomatis diterbitkan.')) return;
    try {
      showToast('Memverifikasi pembayaran...', 'info');
      await axiosClient.post(`/api/payments/simulate-success/${orderId}`);
      showToast('Pembayaran berhasil diverifikasi!', 'success');
      queryClient.invalidateQueries({ queryKey: ['orgOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orgStats'] });
      queryClient.invalidateQueries({ queryKey: ['orgParticipants'] });
    } catch (err: any) {
      showToast(err.displayMessage || 'Gagal memverifikasi pembayaran', 'error');
    }
  };

  const handleDeleteTransaction = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction? This will also remove the participant and any generated tickets.')) return;
    try {
      showToast('Deleting transaction...', 'info');
      await axiosClient.delete(`/api/orders/${orderId}`);
      showToast('Transaction deleted successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['orgOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orgStats'] });
      queryClient.invalidateQueries({ queryKey: ['orgParticipants'] });
    } catch (err: any) {
      showToast(err.displayMessage || 'Failed to delete transaction', 'error');
    }
  };

  const yAxisFormatter = (val: number) => {
    if (val === 0) return 'Rp0';
    if (language === 'id') {
      return `Rp${(val / 1000000).toLocaleString('id-ID')} jt`;
    }
    return `Rp${(val / 1000000)}M`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-black bg-primary-600 text-white uppercase tracking-wider">
              {t('org.admin')}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            {t('org.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mt-2">
            {t('org.desc')}
          </p>
        </div>

        <button
          onClick={() => setIsNewEventModalOpen(true)}
          className="saas-button-primary py-3 px-6 text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('org.btn.publish')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-px scrollbar-none">
        {[
          { id: 'overview', label: t('org.tab.overview'), icon: BarChart3 },
          { id: 'events', label: t('org.tab.events'), icon: Calendar },
          { id: 'orders', label: 'Transactions', icon: DollarSign },
          { id: 'checkin', label: t('org.tab.checkin'), icon: QrCode, badge: t('org.badge.raceDay') },
          { id: 'participants', label: t('org.tab.participants'), icon: Users },
          { id: 'reports', label: t('org.tab.reports'), icon: Download },
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
              {tab.badge && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white animate-pulse shadow">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        isLoadingStats ? (
          <CardSkeleton count={4} />
        ) : (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: t('org.stat.revenue'), value: `Rp ${(stats?.revenue || 0).toLocaleString('id-ID')}`, sub: t('org.stat.revenueSub'), icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' },
                { title: t('org.stat.paid'), value: `${stats?.paidParticipants || 0}`, sub: t('org.stat.paidSub'), icon: Users, color: 'text-primary-500 bg-primary-500/10' },
                { title: t('org.stat.bib'), value: `${stats?.bibIssued || 0}`, sub: t('org.stat.bibSub'), icon: Award, color: 'text-sky-500 bg-sky-500/10' },
                { title: t('org.stat.events'), value: `${stats?.totalEvents || 0}`, sub: t('org.stat.eventsSub'), icon: Activity, color: 'text-amber-500 bg-amber-500/10' },
              ].map((m, i) => (
                <div key={i} className="saas-card p-6 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${m.color}`}>
                    <m.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">{m.title}</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">{m.value}</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">{m.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Revenue Chart */}
              <div className="saas-card p-6 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-500 block">{t('org.chart.finTitle')}</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('org.chart.finSub')}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">{t('org.chart.finDesc')}</p>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.monthlyRevenue || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                      <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={yAxisFormatter} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                        formatter={(val: any) => [`Rp ${Number(val || 0).toLocaleString('id-ID')}`, t('org.stat.revenue')]}
                      />
                      <Bar dataKey="revenue" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Participant Growth Chart */}
              <div className="saas-card p-6 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-500 block">{t('org.chart.growthTitle')}</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('org.chart.growthSub')}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">{t('org.chart.growthDesc')}</p>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.participantGrowth || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                      <YAxis stroke="#94A3B8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                      <Area type="monotone" dataKey="participants" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.2} strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* TAB 2: MY TOURNAMENTS & TICKETS */}
      {activeTab === 'events' && (
        isLoadingEvents ? (
          <CardSkeleton count={4} />
        ) : !events || events.length === 0 ? (
          <EmptyState
            title={t('org.event.emptyTitle')}
            description={t('org.event.emptyDesc')}
            action={
              <button onClick={() => setIsNewEventModalOpen(true)} className="saas-button-primary text-xs py-2.5 px-6">
                {t('org.event.emptyBtn')}
              </button>
            }
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((evt) => (
                <div key={evt.id} className="saas-card p-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-primary-500/10 text-primary-500 text-xs font-extrabold uppercase">
                        {evt.sportCategory}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{new Date(evt.date).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{evt.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{evt.location} - {evt.description}</p>
                  </div>

                  {/* Existing Ticket Tiers */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{t('org.event.tiers')}</span>
                      <button
                        onClick={() => setSelectedEventForTicket(evt.id)}
                        className="text-xs text-primary-500 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> {t('org.event.addTier')}
                      </button>
                    </div>
                    {evt.ticketCategories && evt.ticketCategories.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {evt.ticketCategories.map((tkt) => (
                          <div key={tkt.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">{tkt.name}</span>
                              <span className="text-[10px] text-slate-400">{t('org.event.sold')} {tkt.sold} / {t('org.event.quota')} {tkt.quota}</span>
                            </div>
                            <span className="font-extrabold text-primary-500">
                              {language === 'id' ? `Rp ${tkt.price.toLocaleString('id-ID')}` : `IDR ${tkt.price.toLocaleString('id-ID')}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">{t('org.event.noTiers')}</span>
                    )}
                  </div>

                  {/* Vouchers section */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Promo Codes</span>
                      <button
                        onClick={() => setSelectedEventForVoucher(evt.id)}
                        className="text-xs text-primary-500 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Voucher
                      </button>
                    </div>
                    {evt.vouchers && evt.vouchers.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {evt.vouchers.map((v) => (
                          <div key={v.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 block uppercase">{v.code}</span>
                              <span className="text-[10px] text-slate-400">Terpakai {v.usedCount} / Kuota {v.usageLimit}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-emerald-500">
                                {v.discountType === 'FIXED_AMOUNT' ? `Rp ${v.value.toLocaleString('id-ID')}` : `${v.value}%`}
                              </span>
                              <button onClick={() => handleDeleteVoucher(v.id)} className="text-rose-500 hover:text-rose-600 p-1 rounded hover:bg-rose-500/10">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Belum ada kode promo</span>
                    )}
                  </div>

                  {/* Vouchers section */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Promo Codes</span>
                      <button
                        onClick={() => setSelectedEventForVoucher(evt.id)}
                        className="text-xs text-primary-500 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Voucher
                      </button>
                    </div>
                    {evt.vouchers && evt.vouchers.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {evt.vouchers.map((v) => (
                          <div key={v.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 block uppercase">{v.code}</span>
                              <span className="text-[10px] text-slate-400">Terpakai {v.usedCount} / Kuota {v.usageLimit}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-emerald-500">
                                {v.discountType === 'FIXED_AMOUNT' ? `Rp ${v.value.toLocaleString('id-ID')}` : `${v.value}%`}
                              </span>
                              <button onClick={() => handleDeleteVoucher(v.id)} className="text-rose-500 hover:text-rose-600 p-1 rounded hover:bg-rose-500/10">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Belum ada kode promo</span>
                    )}
                  </div>

                  <div className="pt-3 flex justify-between items-center">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEditEventClick(evt)}
                        className="text-xs text-blue-500 font-bold hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Event
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="text-xs text-rose-500 font-bold hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> {t('org.event.delete')}
                      </button>
                    </div>
                    <a href={`/events/${evt.id}`} target="_blank" rel="noreferrer" className="saas-button-secondary text-xs py-2 px-4">
                      {t('org.event.viewPublic')}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* TAB 3: LIVE ON-SITE CHECK-IN & BIB DISTRIBUTION MODULE */}
      {activeTab === 'checkin' && (
        <div className="space-y-8">
          <div className="saas-card p-6 sm:p-8 bg-slate-900 text-white border-primary-500/40 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg animate-bounce">
                <QrCode className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase text-rose-400 tracking-wider">{t('org.checkin.desk')}</span>
                <h2 className="text-2xl font-black tracking-tight">{t('org.checkin.sys')}</h2>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {t('org.checkin.desc')}
            </p>

            {/* Search Input Box */}
            <form onSubmit={handlePerformSearch} className="max-w-xl flex gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={searchRegQuery}
                  onChange={(e) => setSearchRegQuery(e.target.value)}
                  placeholder={t('org.checkin.searchPlaceholder')}
                  className="w-full rounded-xl bg-slate-800 border-2 border-slate-700 pl-12 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors font-mono font-bold"
                />
              </div>
              <button type="submit" disabled={isSearching} className="saas-button-primary bg-rose-600 hover:bg-rose-500 py-3 px-8 text-sm font-black shrink-0 shadow-lg">
                {isSearching ? t('org.checkin.searching') : t('org.checkin.lookupBtn')}
              </button>
            </form>
          </div>

          {/* Search Results / Verification Cards */}
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((p) => (
                  <div key={p.id} className="saas-card p-6 border-l-4 border-l-rose-500 space-y-5">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('org.checkin.results')}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex">
                          <span className="w-40 text-slate-500">{t('org.checkin.name')}</span>
                          <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                        </div>
                        <div className="flex">
                          <span className="w-40 text-slate-500">{t('org.checkin.reg')}</span>
                          <span className="font-mono font-bold text-primary-500">{p.registrationNumber}</span>
                        </div>
                        <div className="flex">
                          <span className="w-40 text-slate-500">{t('org.checkin.event')}</span>
                          <span className="font-medium text-slate-900 dark:text-white">{p.event?.name}</span>
                        </div>
                        <div className="flex">
                          <span className="w-40 text-slate-500">{t('org.checkin.payment')}</span>
                          <span className="font-bold text-emerald-500">{p.order?.status === 'PAID' ? t('org.checkin.status.paid') : p.order?.status}</span>
                        </div>
                        <div className="flex">
                          <span className="w-40 text-slate-500">{t('org.checkin.status')}</span>
                          <span className={`font-bold ${p.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {p.status === 'COMPLETED' ? t('org.checkin.status.completed') : t('org.checkin.status.pending')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {p.status !== 'COMPLETED' ? (
                      <div className="space-y-3 pt-2">
                        <button
                          onClick={() => handleVerifyBib(p)}
                          disabled={isVerifyingBib}
                          className="saas-button-primary bg-emerald-600 hover:bg-emerald-500 w-full py-3 font-bold text-sm shadow-md disabled:opacity-50"
                        >
                          {isVerifyingBib ? t('org.checkin.searching') : t('org.modal.bib.submit')}
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm font-extrabold text-center flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{t('org.checkin.verified')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-sm">
              {t('org.checkin.emptySearch')}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ATHLETE DIRECTORY */}
      {activeTab === 'participants' && (
        isLoadingParticipants ? (
          <TableSkeleton rows={8} cols={6} />
        ) : !participants || participants.length === 0 ? (
          <EmptyState title="No Athletes Registered" description="No participants have registered for your events yet." />
        ) : (
          <div className="saas-card overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="py-4 px-6">Registration No</th>
                  <th className="py-4 px-6">Athlete Name & Email</th>
                  <th className="py-4 px-6">Event Name</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Check-In Status</th>
                  <th className="py-4 px-6">BIB Assigned</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {participants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-4 px-6 font-mono font-extrabold text-primary-500">{p.registrationNumber}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.email}</div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">{p.event?.name}</td>
                    <td className="py-4 px-6 font-extrabold text-emerald-500">{p.order?.status || 'PAID'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase ${
                        p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
                      }`}>
                        {p.status === 'COMPLETED' ? 'Checked-In' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-extrabold text-rose-500">
                      {p.bibNumber ? `#${p.bibNumber}` : '-'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteParticipant(p.id)}
                        className="text-rose-500 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete Participant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {/* TAB 6: TRANSACTIONS & APPROVALS */}
      {activeTab === 'orders' && (
        isLoadingOrders ? (
          <TableSkeleton rows={8} cols={6} />
        ) : !orders || orders.length === 0 ? (
          <EmptyState title="No Transactions" description="Belum ada transaksi yang masuk." />
        ) : (
          <div className="saas-card overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="py-4 px-6">Invoice / Date</th>
                  <th className="py-4 px-6">Participant</th>
                  <th className="py-4 px-6">Event & Tier</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-4 px-6">
                      <div className="font-mono font-extrabold text-primary-500">{o.invoice}</div>
                      <div className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white">{o.user?.name || '-'}</div>
                      <div className="text-xs text-slate-400">{o.user?.email || '-'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-700 dark:text-slate-300">{o.event?.name}</div>
                      <div className="text-[11px] text-slate-500">{o.ticketCategory?.name}</div>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                      Rp {o.total.toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase ${
                        o.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {o.status === 'PENDING' && (
                          <button
                            onClick={() => handleApprovePayment(o.id)}
                            className="saas-button-primary bg-emerald-600 hover:bg-emerald-500 text-xs py-1.5 px-3"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTransaction(o.id)}
                          className="text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* TAB 5: DATA EXPORTS & REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="saas-card p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Export Financial & Race Reports</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Download structured data files for auditing, timing systems, or offline spreadsheets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-3">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Revenue & Order Transactions</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Export all invoice logs, participant names, subtotal deductions, and Midtrans payment timestamps.
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadReport('revenue', 'csv')}
                  className="saas-button-primary text-xs py-3 w-full justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Revenue Report (CSV)</span>
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Athlete Directory & BIB Assignments</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Export complete race pack check-in status, phone numbers, and official BIB numbers for timing chips.
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadReport('participants', 'csv')}
                  className="saas-button-primary bg-emerald-600 hover:bg-emerald-500 text-xs py-3 w-full justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Participant List (CSV)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Publish New Tournament */}
      <Modal
        isOpen={isNewEventModalOpen}
        onClose={() => {
          setIsNewEventModalOpen(false);
          setEditingEvent(null);
          resetEventForm();
        }}
        title={editingEvent ? 'Edit Tournament' : 'Publish New Sports Event'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleEventSubmit(onAddEvent as any)} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Tournament Title</label>
            <input type="text" placeholder="e.g. Jakarta Ultra Marathon 2026" {...regEvent('name')} className="saas-input" />
            {evtErrors.name && <p className="text-rose-500 text-xs mt-1">{evtErrors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Event Date</label>
            <input type="date" {...regEvent('date')} className="saas-input" />
            {evtErrors.date && <p className="text-rose-500 text-xs mt-1">{evtErrors.date.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Venue / City Location</label>
            <input type="text" placeholder="e.g. Gelora Bung Karno Stadium, Jakarta" {...regEvent('location')} className="saas-input" />
            {evtErrors.location && <p className="text-rose-500 text-xs mt-1">{evtErrors.location.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Banner Image (Optional)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Tournament Rules & Description</label>
            <textarea rows={4} placeholder="Detail the race start times, bag drops, water stations, and regulations..." {...regEvent('description')} className="saas-input py-2" />
            {evtErrors.description && <p className="text-rose-500 text-xs mt-1">{evtErrors.description.message}</p>}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase text-primary-500 tracking-wider">Details</h4>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Organizer</label>
              <input type="text" placeholder="Tegal City Run" {...regEvent('organizerName')} className="saas-input" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input type="text" placeholder="+6287777331817" {...regEvent('organizerPhone')} className="saas-input" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">View Organizer Website</label>
              <input type="text" placeholder="https://..." {...regEvent('organizerWebsite')} className="saas-input" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setIsNewEventModalOpen(false)} className="saas-button-secondary text-xs py-2.5">Cancel</button>
            <button type="submit" disabled={evtSubmitting} className="saas-button-primary text-xs py-2.5 px-6">
              {evtSubmitting ? 'Publishing...' : 'Publish Tournament'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Ticket Tier */}
      <Modal
        isOpen={!!selectedEventForTicket}
        onClose={() => setSelectedEventForTicket(null)}
        title={t('org.modal.ticket.title')}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleTicketSubmit(onAddTicket as any)} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">{t('org.modal.ticket.name')}</label>
            <input type="text" placeholder={t('org.modal.ticket.namePlaceholder')} {...regTicket('name')} className="saas-input" />
            {tktErrors.name && <p className="text-rose-500 text-xs mt-1">{tktErrors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">{t('org.modal.ticket.price')}</label>
              <input type="number" placeholder={t('org.modal.ticket.pricePlaceholder')} {...regTicket('price')} className="saas-input" />
              {tktErrors.price && <p className="text-rose-500 text-xs mt-1">{tktErrors.price.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">{t('org.modal.ticket.quota')}</label>
              <input type="number" placeholder={t('org.modal.ticket.quotaPlaceholder')} {...regTicket('quota')} className="saas-input" />
              {tktErrors.quota && <p className="text-rose-500 text-xs mt-1">{tktErrors.quota.message}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setSelectedEventForTicket(null)} className="saas-button-secondary text-xs py-2.5">{t('org.modal.ticket.cancel')}</button>
            <button type="submit" disabled={tktSubmitting} className="saas-button-primary text-xs py-2.5 px-6">{t('org.modal.ticket.submit')}</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Voucher */}
      <Modal isOpen={!!selectedEventForVoucher} onClose={() => setSelectedEventForVoucher(null)} title="Create Promo Code" maxWidth="max-w-md">
        <form onSubmit={handleCreateVoucher} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Promo Code</label>
            <input type="text" required value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value.toUpperCase()})} className="saas-input uppercase" placeholder="e.g. MERDEKA2026" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Discount Type</label>
              <select value={newVoucher.discountType} onChange={e => setNewVoucher({...newVoucher, discountType: e.target.value})} className="saas-input">
                <option value="FIXED_AMOUNT">Fixed Amount (Rp)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Value</label>
              <input type="number" required min="1" value={newVoucher.value} onChange={e => setNewVoucher({...newVoucher, value: Number(e.target.value)})} className="saas-input" placeholder="e.g. 50000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Usage Limit</label>
              <input type="number" required min="1" value={newVoucher.usageLimit} onChange={e => setNewVoucher({...newVoucher, usageLimit: Number(e.target.value)})} className="saas-input" placeholder="e.g. 100" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
              <input type="date" required value={newVoucher.expiredDate} onChange={e => setNewVoucher({...newVoucher, expiredDate: e.target.value})} className="saas-input" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setSelectedEventForVoucher(null)} className="saas-button-secondary py-2 px-4 text-sm">Cancel</button>
            <button type="submit" className="saas-button-primary py-2 px-6 text-sm">Create Voucher</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
