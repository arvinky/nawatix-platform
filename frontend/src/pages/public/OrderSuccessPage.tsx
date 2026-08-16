import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { axiosClient } from '../../api/axiosClient';
import { Order } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../components/common/Toast';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Tag,
  Download,
  Printer,
  ArrowRight,
  User,
  ShieldCheck,
  Activity,
  QrCode,
} from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const { data: order, isLoading, isError } = useQuery<Order>({
    queryKey: ['orderSuccess', orderId],
    queryFn: async () => axiosClient.get(`/api/orders/${orderId}`),
    enabled: !!orderId,
  });

  if (isLoading || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center animate-pulse">
        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 mx-auto mb-4" />
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  const participant = order.participant;

  const handlePrintSimulation = () => {
    showToast('Generating official e-Ticket & PDF invoice simulation...', 'success');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg border border-emerald-500/30 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('success.title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {t('success.desc1')} <span className="font-semibold text-emerald-500">{order.paymentMethod || 'Midtrans Snap'}</span>{t('success.desc2')}
        </p>
      </div>

      {/* e-Ticket Pass Card */}
      <div className="saas-card overflow-hidden shadow-2xl border-primary-500/40 dark:border-primary-500/30">
        {/* Top bar */}
        <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 p-6 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-primary-400 tracking-wider">{t('success.ticket.title')}</span>
              <h3 className="text-lg font-black tracking-tight">{order.event?.name}</h3>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow">
            {t('success.ticket.paid')}
          </span>
        </div>

        <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-8 items-center bg-surface-light dark:bg-slate-900/90">
          {/* QR Code Col */}
          <div className="sm:col-span-1 flex flex-col items-center justify-center p-5 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-md text-center">
            {participant ? (
              <>
                <div className="p-2 border border-slate-100 rounded-xl bg-white shadow-sm">
                  <QRCodeSVG value={participant.registrationNumber || participant.id} size={150} level="H" />
                </div>
                <div className="mt-3 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t('success.ticket.reg')}</span>
                  <div className="font-mono text-sm font-extrabold text-primary-600 tracking-wider">
                    {participant.registrationNumber}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-slate-500 text-xs py-10">QR generating...</div>
            )}
          </div>

          {/* Details Col */}
          <div className="sm:col-span-2 space-y-5">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">{t('success.ticket.name')}</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white block mt-0.5">
                  {participant?.name || order.user?.name || 'Authorized Athlete'}
                </span>
                <span className="text-xs text-slate-500">{participant?.email || order.user?.email}</span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block">{t('success.ticket.tier')}</span>
                <span className="text-base font-extrabold text-primary-600 dark:text-primary-400 block mt-0.5">
                  {order.ticketCategory?.name}
                </span>
                <span className="text-xs text-slate-500">{t('success.ticket.invoice')}{order.invoice}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-primary-500 shrink-0" />
                <span>{order.event?.date ? new Date(order.event.date).toLocaleDateString('en-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Confirmed Schedule'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                <span className="truncate">{order.event?.location}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2.5 font-medium">
              <QrCode className="w-5 h-5 text-primary-500 shrink-0" />
              <span>{t('success.ticket.instruction')}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 dark:bg-slate-950/80 p-5 px-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500">{t('success.ticket.help')}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintSimulation}
              className="saas-button-secondary text-xs py-2.5 px-4 gap-2"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>{t('success.ticket.print')}</span>
            </button>
            <Link to="/dashboard" className="saas-button-primary text-xs py-2.5 px-5 gap-2">
              <span>{t('success.ticket.view')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
