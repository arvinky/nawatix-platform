import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Event, SportCategory } from '../../types';
import { EventCard } from '../../components/common/EventCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useLanguage } from '../../context/LanguageContext';
import { Search, ChevronRight, Calendar, MapPin, Building2, Ticket, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const CATEGORIES: { label: string; value: SportCategory | 'ALL' }[] = [
    { label: t('cat.all'), value: 'ALL' },
    { label: t('cat.running'), value: 'RUNNING' },
    { label: t('cat.football'), value: 'FOOTBALL' },
    { label: t('cat.futsal'), value: 'FUTSAL' },
    { label: t('cat.basketball'), value: 'BASKETBALL' },
    { label: t('cat.badminton'), value: 'BADMINTON' },
    { label: t('cat.cycling'), value: 'CYCLING' },
  ];

  const QUICK_TAGS = ['Lari', 'Sepak Bola', 'Futsal', 'Basket', 'Badminton', 'Bersepeda'];

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

  const steps = [
    { num: '01', title: t('market.hiw.1.title'), desc: t('market.hiw.1.desc') },
    { num: '02', title: t('market.hiw.2.title'), desc: t('market.hiw.2.desc') },
    { num: '03', title: t('market.hiw.3.title'), desc: t('market.hiw.3.desc') },
    { num: '04', title: t('market.hiw.4.title'), desc: t('market.hiw.4.desc') },
    { num: '05', title: t('market.hiw.5.title'), desc: t('market.hiw.5.desc') },
    { num: '06', title: t('market.hiw.6.title'), desc: t('market.hiw.6.desc') },
  ];

  const sortedEvents = events ? [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
  const topFeatured = sortedEvents[0];
  const secondaryFeatured = sortedEvents.slice(1, 4);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans">
      
      {/* 1. HERO - Focus on Search */}
      <section className="relative pt-32 pb-24 border-b border-border-light dark:border-border-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-light to-background-light dark:from-surface-dark dark:to-background-dark -z-10"></div>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <span className="text-[13px] font-bold tracking-widest uppercase text-text-secondary dark:text-text-darkSecondary mb-6 block">
              {t('market.hero.title')}
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-text-primary dark:text-text-darkPrimary tracking-tight leading-[1.1] mb-6 uppercase"
          >
            {t('market.hero.sub1')} <br className="hidden sm:block"/>
            <span className="text-primary-500">{t('market.hero.sub2')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            className="text-lg md:text-xl text-text-secondary dark:text-text-darkSecondary max-w-2xl mx-auto mb-12"
          >
            {t('market.hero.desc')}
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full h-16 sm:h-20 bg-white dark:bg-[#151515] rounded-2xl border-2 border-border-light dark:border-border-dark shadow-xl hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-colors group focus-within:border-primary-500 dark:focus-within:border-primary-500 overflow-hidden">
              <div className="pl-6 text-text-muted">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('market.hero.search')}
                className="w-full h-full bg-transparent border-none focus:ring-0 px-4 text-[16px] sm:text-[18px] text-text-primary dark:text-white placeholder-text-muted"
              />
              <div className="pr-3 hidden sm:block">
                <button type="submit" className="h-14 px-8 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-500 transition-colors">
                  {t('home.search.button')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURED EVENTS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <h2 className="text-3xl font-bold dark:text-white tracking-tight">{t('market.featured.title')}</h2>
        </div>
        
        {isLoadingEvents ? (
          <CardSkeleton count={4} />
        ) : !topFeatured ? (
          <EmptyState title={t('home.empty.title')} description={t('home.empty.desc')} action={<></>} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Featured */}
            <Link to={`/events/${topFeatured.id}`} className="lg:col-span-8 group relative rounded-2xl overflow-hidden bg-[#111111] border border-border-light dark:border-border-dark shadow-lg block aspect-[4/3] lg:aspect-auto lg:h-[420px]">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
              {/* Optional background image can go here */}
              <div className="absolute inset-0 bg-primary-900/20 z-0"></div>
              
              <div className="absolute inset-0 z-20 p-8 sm:p-10 flex flex-col justify-end">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white text-black text-[12px] font-bold tracking-wider rounded-sm uppercase">{topFeatured.sportCategory}</span>
                  <span className="px-3 py-1 bg-primary-500 text-white text-[12px] font-bold tracking-wider rounded-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> {topFeatured.status === 'OPEN' ? 'DIBUKA' : topFeatured.status}
                  </span>
                </div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-primary-400 transition-colors">
                  {topFeatured.name}
                </h3>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-300 text-[14px] sm:text-[15px] font-medium mb-6">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> {new Date(topFeatured.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {topFeatured.location}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] text-slate-400">{t('card.startingFrom')}</p>
                    <p className="text-2xl font-bold text-white">Rp{topFeatured.startingPrice?.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Secondary Featured List */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {secondaryFeatured.map((evt) => (
                <Link key={evt.id} to={`/events/${evt.id}`} className="flex-1 group bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-primary-500 tracking-wider mb-2 block uppercase">{evt.sportCategory}</span>
                  <h4 className="text-[17px] font-bold dark:text-white leading-snug mb-3 group-hover:text-primary-500 transition-colors line-clamp-2">
                    {evt.name}
                  </h4>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-light dark:border-border-dark">
                    <div className="text-[13px] text-text-secondary font-medium">
                      {new Date(evt.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-[13px] font-bold dark:text-white">
                      Rp{evt.startingPrice?.toLocaleString('id-ID')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link to="/events" className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-primary-500 text-primary-600 dark:text-primary-400 font-bold hover:bg-primary-500 hover:text-white transition-colors">
            Cari event lainnya <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>


      {/* 4. HOW IT WORKS */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold dark:text-white tracking-tight">{t('market.hiw.title')}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: (idx % 3) * 0.15, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.1 }}
              className="relative pl-12 group"
            >
              <div className="absolute left-0 top-0 text-5xl font-extrabold text-border-light dark:text-[#222222] select-none -z-10 transition-colors group-hover:text-primary-100 dark:group-hover:text-primary-900/30">
                {step.num}
              </div>
              <h3 className="text-lg font-bold dark:text-white mb-2 pt-2 group-hover:text-primary-500 transition-colors">{step.title}</h3>
              <p className="text-[15px] text-text-secondary dark:text-text-darkSecondary leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. TRUST & PAYMENT COMPACT */}
      <section className="py-24 border-y border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold dark:text-white tracking-tight mb-4">{t('market.trust.title')}</h2>
            <div className="flex flex-wrap items-center gap-8 py-8">
              <div>
                <p className="text-4xl font-extrabold dark:text-white mb-1">120+</p>
                <p className="text-[14px] text-text-secondary font-medium">Event</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold dark:text-white mb-1">35+</p>
                <p className="text-[14px] text-text-secondary font-medium">Kota</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold dark:text-white mb-1">18+</p>
                <p className="text-[14px] text-text-secondary font-medium">Organizer</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#151515] p-8 rounded-3xl border border-border-light dark:border-border-dark shadow-xl">
            <div className="w-12 h-12 bg-accent-emerald/10 text-accent-emerald flex items-center justify-center rounded-2xl mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-3">Pembayaran aman dan praktis</h3>
            <p className="text-[15px] text-text-secondary mb-8">
              Selesaikan pendaftaran menggunakan metode pembayaran yang tersedia dan dapatkan e-ticket secara otomatis setelah pembayaran berhasil.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <span className="px-4 py-2 rounded-lg bg-surface-light dark:bg-[#222] text-[13px] font-semibold dark:text-white">QRIS</span>
              <span className="px-4 py-2 rounded-lg bg-surface-light dark:bg-[#222] text-[13px] font-semibold dark:text-white">Virtual Account</span>
              <span className="px-4 py-2 rounded-lg bg-surface-light dark:bg-[#222] text-[13px] font-semibold dark:text-white">E-Wallet</span>
              <span className="px-4 py-2 rounded-lg bg-surface-light dark:bg-[#222] text-[13px] font-semibold dark:text-white">Kartu Debit/Kredit</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ORGANIZER CTA (Small) */}
      <section className="py-20 max-w-4xl mx-auto px-6 text-center">
        <Building2 className="w-10 h-10 mx-auto text-text-muted mb-6" />
        <h2 className="text-2xl font-bold dark:text-white mb-4">{t('market.org.title')}</h2>
        <p className="text-[16px] text-text-secondary mb-8 max-w-xl mx-auto">
          {t('market.org.desc')}
        </p>
        <Link to="/contact" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:underline">
          {t('market.org.btn')}
        </Link>
      </section>

      {/* 7. FINAL CTA */}
      <section className="bg-[#111111] py-32 border-t border-[#333333] text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-10">
            {t('market.cta.title')}
          </h2>
          <Link to="/events" className="inline-block w-full sm:w-auto px-8 py-4 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-500 hover:-translate-y-1 transition-all shadow-lg shadow-primary-600/20 text-lg">
            {t('market.cta.btn')}
          </Link>
        </div>
      </section>
    </div>
  );
};
