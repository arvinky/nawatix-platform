import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Event, SportCategory } from '../../types';
import { EventCard } from '../../components/common/EventCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Filter, RefreshCw, Calendar, Tag } from 'lucide-react';



export const EventListPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMonth = searchParams.get('month') || '';
  const initialSearch = searchParams.get('search') || '';
  const organizerId = searchParams.get('organizerId') || '';

  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    if (initialMonth !== selectedMonth) setSelectedMonth(initialMonth);
    if (initialSearch !== searchQuery) setSearchQuery(initialSearch);
  }, [searchParams]);

  const { data: events, isLoading, refetch, isFetching } = useQuery<Event[]>({
    queryKey: ['allEvents', selectedStatus, organizerId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      if (organizerId) params.append('organizerId', organizerId);
      return axiosClient.get(`/api/events?${params.toString()}`);
    },
  });

  const filteredEvents = (events || []).filter((event) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase().trim();
    return (
      event.name.toLowerCase().includes(term) ||
      event.location.toLowerCase().includes(term) ||
      event.description?.toLowerCase().includes(term) ||
      event.sportCategory.toLowerCase().includes(term)
    );
  }).filter((event) => {
    if (!selectedMonth) return true;
    const d = new Date(event.date);
    const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return mStr === selectedMonth;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedMonth('');
    setSelectedStatus('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('events.catalog.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('events.catalog.subtitle')}
          </p>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {language === 'id' ? 'Menampilkan' : 'Showing'} <span className="text-slate-900 dark:text-white font-bold">{filteredEvents.length}</span> {language === 'id' ? 'turnamen tersedia' : 'upcoming tournaments'}
        </div>
      </div>

      {/* Filter Panel */}
      <div className="saas-card p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50/50 dark:bg-slate-900/50">
        {/* Search */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
            {language === 'id' ? 'Kata Kunci / Lokasi Venue' : 'Search Keyword / Venue'}
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('events.search.placeholder')}
              className="saas-input pl-10"
            />
          </div>
        </div>

        {/* Month Select */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary-500" />
            <span>{language === 'id' ? 'Bulan Event' : 'Event Month'}</span>
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              if (e.target.value) setSearchParams({ month: e.target.value });
              else setSearchParams({});
            }}
            className="saas-input"
          >
            <option value="">{language === 'id' ? 'Semua Bulan' : 'All Months'}</option>
            {Array.from(new Set((events || []).map(e => {
              const d = new Date(e.date);
              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            }))).sort().map(val => {
              const [y, m] = val.split('-');
              const date = new Date(parseInt(y), parseInt(m) - 1);
              const label = date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' });
              return (
                <option key={val} value={val}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        {/* Status Select & Reset */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-primary-500" />
              <span>Status</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="saas-input"
            >
              <option value="">All Status</option>
              <option value="OPEN">Open Registration</option>
              <option value="CLOSING_SOON">Closing Soon</option>
              <option value="SOLD_OUT">Sold Out</option>
            </select>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            title="Reset Filters"
            className="saas-button-secondary py-2.5 px-3 self-end text-slate-500 hover:text-rose-500 border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Results */}
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title="No Matching Events Found"
          description="We couldn't find any sports tournaments matching your active criteria. Try clearing your keyword search or switching sport categories."
          action={
            <button onClick={resetFilters} className="saas-button-primary text-xs py-2 px-4">
              Reset All Filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};
