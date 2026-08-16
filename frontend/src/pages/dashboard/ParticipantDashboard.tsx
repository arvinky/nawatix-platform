import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { axiosClient } from '../../api/axiosClient';
import { Participant, Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Calendar,
  MapPin,
  FileText,
  Award,
  ExternalLink,
} from 'lucide-react';

export const ParticipantDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'tickets' | 'orders'>('tickets');
  const [selectedQrTicket, setSelectedQrTicket] = useState<Participant | null>(null);

  const { data: tickets, isLoading: isLoadingTickets } = useQuery<Participant[]>({
    queryKey: ['myTickets'],
    queryFn: async () => axiosClient.get('/api/registration/my-tickets'),
  });

  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['myOrders'],
    queryFn: async () => axiosClient.get('/api/orders/my-orders'),
  });

  const completedCount = tickets?.filter((t) => t.status === 'COMPLETED').length || 0;
  const totalSpent = orders?.filter((o) => o.status === 'PAID').reduce((acc, o) => acc + o.total, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="saas-card p-8 bg-gradient-to-r from-primary-900/40 via-surface-light dark:via-surface-dark to-surface-light dark:to-surface-dark border-primary-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-500 block">{t('dash.portal')}</span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('dash.hello')} {user?.name || 'Athlete'}!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            {t('dash.desc')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center shrink-0">
          <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('dash.stat1.title')}</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{tickets?.length || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('dash.stat2.title')}</span>
            <div className="text-xl font-extrabold text-emerald-500 mt-1">{completedCount}</div>
          </div>
          <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('dash.stat3.title')}</span>
            <div className="text-sm font-black text-primary-500 mt-2 truncate">Rp {totalSpent.toLocaleString('id-ID')}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'tickets'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>{t('dash.tab.tickets')}</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('dash.tab.orders')}</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'tickets' ? (
        isLoadingTickets ? (
          <TableSkeleton rows={4} cols={5} />
        ) : !tickets || tickets.length === 0 ? (
          <EmptyState
            title="No Registered Tickets Yet"
            description="You haven't purchased any event tickets yet. Explore upcoming marathons and tournaments in our catalog to begin your athletic journey!"
            action={<a href="/events" className="saas-button-primary text-xs py-2.5 px-6">Browse Catalog</a>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="saas-card p-6 flex flex-col justify-between space-y-6 border-l-4 border-l-primary-500 shadow-md hover:shadow-lg transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-primary-500">{ticket.event?.sportCategory || 'SPORTS'} EVENT</span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{ticket.event?.name}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shrink-0 ${
                      ticket.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-sky-500/10 text-sky-500 border border-sky-500/30'
                    }`}>
                      {ticket.status === 'COMPLETED' ? t('dash.bib.assigned') : 'Registered (Awaiting Race Day)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{t('dash.reg.number')}</span>
                      <div className="font-mono font-black text-primary-500 text-sm mt-0.5">{ticket.registrationNumber}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{t('dash.bib.number')}</span>
                      <div className="font-mono font-black text-emerald-500 text-base mt-0.5 flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>{ticket.bibNumber ? `#${ticket.bibNumber}` : 'Pending Check-In'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                      <span>{ticket.event?.date ? new Date(ticket.event.date).toLocaleDateString('en-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : 'Scheduled'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                      <span className="truncate">{ticket.event?.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 font-medium">Ticket: {ticket.order?.ticketCategory?.name || 'Participant'}</span>
                  <button
                    onClick={() => setSelectedQrTicket(ticket)}
                    className="saas-button-primary text-xs py-2 px-4 gap-2 rounded-xl shadow"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{t('dash.btn.qr')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Order History Tab */
        isLoadingOrders ? (
          <TableSkeleton rows={5} cols={6} />
        ) : !orders || orders.length === 0 ? (
          <EmptyState title="No Order History" description="No financial transactions found on your account." />
        ) : (
          <div className="saas-card overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="py-4 px-6">Invoice</th>
                  <th className="py-4 px-6">Event Name</th>
                  <th className="py-4 px-6">Ticket Tier</th>
                  <th className="py-4 px-6">Total (IDR)</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-primary-500">{o.invoice}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">{o.event?.name}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{o.ticketCategory?.name}</td>
                    <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">{o.total.toLocaleString('id-ID')}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase ${
                        o.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {/* QR Code Inspection Modal */}
      <Modal
        isOpen={!!selectedQrTicket}
        onClose={() => setSelectedQrTicket(null)}
        title={t('dash.modal.qr.title')}
        maxWidth="max-w-md"
      >
        {selectedQrTicket && (
          <div className="text-center space-y-6 py-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 inline-block shadow-lg mx-auto">
              <QRCodeSVG value={selectedQrTicket.registrationNumber} size={200} level="H" />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-bold">{t('dash.modal.qr.reg')}</span>
              <div className="text-lg font-mono font-black text-primary-500 tracking-wider">
                {selectedQrTicket.registrationNumber}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('dash.modal.qr.name')}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedQrTicket.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('dash.modal.qr.event')}</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{selectedQrTicket.event?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('dash.modal.qr.status')}</span>
                <span className="font-bold text-emerald-500">{selectedQrTicket.status}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              {t('dash.modal.qr.desc')}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};
