import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Calendar, MapPin, Tag, User, ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'CLOSING_SOON':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse';
      case 'SOLD_OUT':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const formattedDate = new Date(event.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedPrice = event.startingPrice && event.startingPrice > 0
    ? `IDR ${event.startingPrice.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}`
    : t('card.free');

  return (
    <div className="saas-card group flex flex-col overflow-hidden hover:border-primary-500/50 hover:shadow-lg dark:hover:border-primary-500/40 dark:hover:shadow-glow transition-all duration-300">
      {/* Banner */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        {event.banner ? (
          <img
            src={event.banner}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-slate-500 font-medium">
            Athletix Sports Event
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-sm uppercase tracking-wider ${getBadgeColor(event.status)}`}>
            {event.status === 'OPEN' ? t('card.status.OPEN') : event.status === 'CLOSING_SOON' ? t('card.status.CLOSING_SOON') : event.status === 'SOLD_OUT' ? t('card.status.SOLD_OUT') : event.status.replace('_', ' ')}
          </span>
        </div>

        {/* Sport Category Chip */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-xs font-medium border border-slate-700/60">
          <Tag className="w-3 h-3 text-primary-400" />
          <span>{event.sportCategory}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <User className="w-3.5 h-3.5 text-primary-500 shrink-0" />
            <span className="truncate">{event.organizer?.organizationName || event.organizer?.name || 'Authorized Organizer'}</span>
          </div>

          <h3
            onClick={() => navigate(`/events/${event.id}`)}
            className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors cursor-pointer line-clamp-2 leading-tight"
          >
            {event.name}
          </h3>

          <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary-500 shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </div>

        {/* Footer info and CTA */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">{t('card.startingFrom')}</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white text-primary-600 dark:text-primary-400">
              {formattedPrice}
            </span>
          </div>

          <button
            onClick={() => navigate(`/events/${event.id}`)}
            className="saas-button-primary text-xs py-2 px-3.5 gap-1.5 rounded-xl shadow-none hover:shadow-md transition-all group-hover:bg-primary-500"
          >
            <span>{t('card.detail')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
