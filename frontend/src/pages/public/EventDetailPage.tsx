import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Event, TicketCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../components/common/Toast';
import {
  Calendar,
  MapPin,
  Tag,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Info,
  Clock,
  ExternalLink,
  Phone,
  Globe,
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { data: event, isLoading, isError } = useQuery<Event>({
    queryKey: ['eventDetail', id],
    queryFn: async () => {
      return axiosClient.get(`/api/events/${id}`);
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 animate-pulse">
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        <div className="space-y-4 max-w-3xl">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded w-full pt-6" />
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Event Not Found</h2>
        <p className="text-slate-500 mb-6">This sports event may have been unpublished or closed by the organizer.</p>
        <button onClick={() => navigate('/events')} className="saas-button-primary">
          Back to Events Catalog
        </button>
      </div>
    );
  }

  const handleProceedToCheckout = () => {
    if (!selectedTicketId) {
      showToast('Please select a ticket category first before proceeding.', 'error');
      return;
    }
    if (!isAuthenticated) {
      showToast('Please sign in to your NAWATIX account to continue registration.', 'info');
      navigate(`/login?redirect=/checkout/${event.id}/${selectedTicketId}`);
      return;
    }
    navigate(`/checkout/${event.id}/${selectedTicketId}`);
  };

  const formattedDate = new Date(event.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('event.back')}</span>
      </button>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left 2 Cols: Banner, Title, About, Maps */}
        <div className="lg:col-span-2 space-y-8">
          {/* Banner */}
          <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            {event.banner ? (
              <img src={event.banner} alt={event.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg font-bold bg-gradient-to-tr from-slate-900 to-slate-800">
                NAWATIX Verified Sports Tournament
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-600 text-white shadow-md uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                <span>{event.sportCategory}</span>
              </span>
            </div>
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {event.name}
              </h1>
            </div>
          </div>

          {/* Event Key Facts Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="saas-card p-4 flex items-start gap-3.5 bg-slate-50 dark:bg-slate-900/50">
              <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-semibold text-slate-400 block">{t('event.dateTime')}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{formattedDate}</span>
                <span className="text-xs text-slate-500 block mt-0.5">{t('event.startFinish')}</span>
              </div>
            </div>

            <div className="saas-card p-4 flex items-start gap-3.5 bg-slate-50 dark:bg-slate-900/50">
              <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-semibold text-slate-400 block">{t('event.location')}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{event.location}</span>
                <span className="text-xs text-primary-500 block mt-0.5 cursor-pointer hover:underline">{t('event.viewMaps')}</span>
              </div>
            </div>
          </div>

          {/* Organizer Info Box */}
          <div className="saas-card p-5 flex items-center justify-between border-primary-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white font-black text-lg flex items-center justify-center shadow">
                {(event.organizer?.organizationName || event.organizer?.name || 'OR').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {event.organizer?.organizationName || event.organizer?.name || 'Verified NAWATIX Organizer'}
                  </h3>
                  <span title="Verified Organizer">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('event.organizer.auth')}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/events?organizerId=${event.organizerId}`)}
              className="hidden sm:inline-flex saas-button-secondary text-xs py-2 px-3.5 gap-1.5"
            >
              <span>{t('event.viewProfile')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Description & Rules */}
          <div className="saas-card p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary-500" />
                <span>{t('event.about')}</span>
              </h3>
              <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap space-y-4">
                {event.description || 'Join us for this exciting sports competition! Please arrive 45 minutes prior to start time for on-site QR code check-in and BIB race pack collection.'}
              </div>
            </div>

            {/* Venue Map Placeholder */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('event.venueArea')}</h4>
              <div className="h-44 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <MapPin className="w-8 h-8 text-rose-500 mb-2 animate-bounce" />
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{event.location}</span>
                <span className="text-xs mt-1">{t('event.parkingInfo')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Ticket Selector & Checkout Card */}
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="saas-card p-6 space-y-6 shadow-xl border-primary-500/30 dark:border-primary-500/20">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-500 block mb-1">{t('event.regDesk')}</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('event.selectTier')}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('event.selectTierDesc')}
              </p>
            </div>

            {/* Ticket Categories List */}
            <div className="space-y-3.5">
              {!event.ticketCategories || event.ticketCategories.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 text-amber-500 text-xs font-medium text-center">
                  Registration is currently closed or all ticket tiers are sold out.
                </div>
              ) : (
                event.ticketCategories.map((ticket) => {
                  const isSoldOut = ticket.sold >= ticket.quota;
                  const isSelected = selectedTicketId === ticket.id;
                  const remaining = ticket.quota - ticket.sold;

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => !isSoldOut && setSelectedTicketId(ticket.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer select-none ${
                        isSoldOut
                          ? 'opacity-50 border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 cursor-not-allowed'
                          : isSelected
                          ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-500/10 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-slate-900/60 hover:border-primary-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{ticket.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {isSoldOut ? (
                              <span className="font-semibold text-rose-500 uppercase">{t('event.soldOut')}</span>
                            ) : remaining < 10 ? (
                              <span className="font-semibold text-amber-500 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> {t('event.onlyLeft')} {remaining} {t('event.spotsLeft')}
                              </span>
                            ) : (
                              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('event.quotaAvail')}</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-black text-primary-600 dark:text-primary-400 block">
                            IDR {ticket.price.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('event.perAthlete')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <button
                onClick={handleProceedToCheckout}
                disabled={!selectedTicketId || event.status === 'SOLD_OUT'}
                className="saas-button-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-primary-500/20"
              >
                {!selectedTicketId ? t('event.btn.selectFirst') : t('event.btn.proceed')}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{t('event.secured')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details & Organizer Footer Section */}
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="saas-card p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 text-white shadow-2xl border border-primary-500/40 relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none -mt-10 -mr-10" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
            {/* Column 1: Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary-400 font-bold uppercase text-xs tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>{t('event.footer.details')}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase font-semibold block">{t('event.footer.date')}</span>
                <p className="text-xl font-black text-white tracking-tight">
                  {new Date(event.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <span className="text-xs text-primary-400/90 font-medium block pt-0.5">{t('event.startFinish')}</span>
              </div>
            </div>

            {/* Column 2: Venue */}
            <div className="pt-6 md:pt-0 md:pl-8 space-y-3">
              <div className="flex items-center gap-2 text-primary-400 font-bold uppercase text-xs tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>{t('event.footer.venue')}</span>
              </div>
              <div className="space-y-3">
                <p className="text-xl font-black text-white tracking-tight leading-snug">
                  {event.location}
                </p>
                <div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 border border-primary-500/40 font-bold text-xs transition-all shadow-md hover:shadow-primary-500/20 group"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
                    <span>+ Google Map</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70 shrink-0" />
                  </a>
                </div>
              </div>
            </div>

            {/* Column 3: Organizer */}
            <div className="pt-6 md:pt-0 md:pl-8 space-y-3">
              <div className="flex items-center gap-2 text-primary-400 font-bold uppercase text-xs tracking-wider">
                <User className="w-4 h-4" />
                <span>{t('event.footer.organizer')}</span>
              </div>
              <div className="space-y-3.5">
                <div>
                  <h4 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>{event.organizerName || event.organizer?.organizationName || event.organizer?.name || 'Reckless Sports Club'}</span>
                    <span title="Verified Organizer">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    </span>
                  </h4>
                </div>
                <div className="space-y-1 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 w-fit">
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wide block flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-primary-400 shrink-0" />
                    <span>{t('event.footer.phone')}</span>
                  </span>
                  <p className="text-sm font-bold text-slate-200 tracking-wide select-all">
                    {event.organizerPhone || event.organizer?.phone || '+6285803169617'}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => {
                      if (event.organizerWebsite) {
                        window.open(event.organizerWebsite.startsWith('http') ? event.organizerWebsite : `https://${event.organizerWebsite}`, '_blank');
                      } else {
                        navigate(`/events?organizerId=${event.organizerId}`);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 via-amber-600 to-primary-600 hover:from-primary-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.02]"
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span>{t('event.footer.viewWebsite')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
