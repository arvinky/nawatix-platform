import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Event, User, SportCategory } from '../../types';
import { EventCard } from '../../components/common/EventCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  Activity,
  Award,
  Calendar,
  Zap,
  ArrowRight,
  ChevronRight,
  Building2,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';

const CATEGORIES: { label: string; value: SportCategory | 'ALL' }[] = [
  { label: 'All Sports', value: 'ALL' },
  { label: 'Running', value: 'RUNNING' },
  { label: 'Cycling', value: 'CYCLING' },
  { label: 'Badminton', value: 'BADMINTON' },
  { label: 'Basketball', value: 'BASKETBALL' },
  { label: 'Football', value: 'FOOTBALL' },
  { label: 'Futsal', value: 'FUTSAL' },
];

export const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: events, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ['events', selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== 'ALL' ? `?sportCategory=${selectedCategory}` : '';
      return axiosClient.get(`/api/events${params}`);
    },
  });



  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-primary-500/5 dark:bg-primary-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">


          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-none max-w-4xl mx-auto">
            {t('home.hero.title1')}{' '}
            <span className="bg-gradient-to-r from-primary-500 to-amber-500 bg-clip-text text-transparent">
              {t('home.hero.title2')}
            </span>{' '}
            {t('home.hero.title3')}
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {t('home.hero.subtitle')}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto pt-6">
            <div className="relative flex items-center saas-card p-1.5 shadow-2xl shadow-primary-500/10 border-primary-500/40">
              <Search className="w-5 h-5 text-slate-400 ml-4 mr-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.search.placeholder')}
                className="w-full bg-transparent border-none py-2.5 text-sm sm:text-base focus:outline-none text-slate-900 dark:text-white placeholder-slate-400"
              />
              <button
                type="submit"
                className="saas-button-primary py-2.5 px-7 shrink-0 rounded-lg text-sm font-semibold shadow-md hover:scale-105 transition-transform"
              >
                {t('home.search.button')}
              </button>
            </div>
          </form>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
            <Link to="/events" className="saas-button-primary px-8 py-3.5 text-sm sm:text-base font-semibold flex items-center gap-2 group shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 transition-all">
              <span>{t('home.btn.browse')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Sport Categories Filter Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('home.categories.title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('home.categories.subtitle')}
            </p>
          </div>
          <Link to="/events" className="text-sm font-semibold text-primary-500 hover:text-primary-400 flex items-center gap-1 shrink-0">
            <span>{t('home.categories.viewAll')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                selectedCategory === cat.value
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/20'
                  : 'bg-surface-light dark:bg-surface-dark text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary-500/40 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {isLoadingEvents ? (
          <CardSkeleton count={6} />
        ) : !events || events.length === 0 ? (
          <EmptyState
            title={t('home.empty.title')}
            description={t('home.empty.desc')}
            action={
              <button
                onClick={() => setSelectedCategory('ALL')}
                className="saas-button-primary text-xs py-2 px-4"
              >
                {t('home.empty.action')}
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </section>

      {/* Value Propositions / Why NAWATIX */}
      <section className="bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-500 block">{t('about.badge')}</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('about.title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('about.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: t('about.card1.title'),
                description: t('about.card1.desc'),
              },
              {
                icon: Zap,
                title: t('about.card2.title'),
                description: t('about.card2.desc'),
              },
              {
                icon: Award,
                title: t('about.card3.title'),
                description: t('about.card3.desc'),
              },
            ].map((feat, idx) => (
              <div key={idx} className="saas-card p-6 space-y-4 hover:border-primary-500/40 transition-all duration-300">

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
};
