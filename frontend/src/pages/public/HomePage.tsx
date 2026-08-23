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
import { motion } from 'framer-motion';
import { HeroDashboardMockup } from '../../components/common/HeroDashboardMockup';
import { ProductStory } from '../../components/common/ProductStory';
import { PlatformFeatures } from '../../components/common/PlatformFeatures';

// Move CATEGORIES inside the component to access useLanguage hook

export const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const CATEGORIES: { label: string; value: SportCategory | 'ALL' }[] = [
    { label: t('cat.all'), value: 'ALL' },
    { label: t('cat.running'), value: 'RUNNING' },
    { label: t('cat.cycling'), value: 'CYCLING' },
    { label: t('cat.badminton'), value: 'BADMINTON' },
    { label: t('cat.basketball'), value: 'BASKETBALL' },
    { label: t('cat.football'), value: 'FOOTBALL' },
    { label: t('cat.futsal'), value: 'FUTSAL' },
  ];

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
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-32 overflow-hidden border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
            
            {/* Left Content (5-6 cols) */}
            <div className="lg:col-span-5 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="inline-flex"
              >
                <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-text-secondary dark:text-text-darkSecondary border border-border-light dark:border-border-dark px-3 py-1 rounded-full bg-surface-light dark:bg-surface-dark">
                  {t('home.hero.badge')}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-[72px] font-bold text-text-primary dark:text-text-darkPrimary tracking-tight leading-[0.95]"
                dangerouslySetInnerHTML={{ __html: t('home.hero.headline') }}
              />

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                className="text-[18px] text-text-secondary dark:text-text-darkSecondary leading-relaxed max-w-lg"
              >
                {t('home.hero.desc')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 pt-4"
              >
                <Link to="/events" className="saas-button-primary w-full sm:w-auto h-12 px-6 flex items-center justify-center gap-2 group">
                  <span>{t('home.hero.btn.explore')}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link to="/contact" className="saas-button-secondary w-full sm:w-auto h-12 px-6">
                  {t('home.hero.btn.organizer')}
                </Link>
              </motion.div>
            </div>

            {/* Right Content (6-7 cols) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="lg:col-span-7 h-[460px] relative w-full perspective-1000"
            >
              <HeroDashboardMockup />
            </motion.div>
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

      {/* Product Story */}
      <ProductStory />

      {/* Platform Features */}
      <PlatformFeatures />

      {/* Final CTA */}
      <section className="bg-[#111111] py-32 border-t border-[#333333] text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-[18px] text-text-darkSecondary mb-10 leading-relaxed">
            {t('home.cta.desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-500 hover:-translate-y-0.5 transition-all">
              {t('home.cta.btn1')}
            </Link>
            <Link to="/events" className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-[#333333] text-white font-medium hover:bg-[#222222] transition-colors">
              {t('home.cta.btn2')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
