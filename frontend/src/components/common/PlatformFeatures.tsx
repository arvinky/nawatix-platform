import React, { useEffect, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Users, CreditCard, Ticket, CheckCircle2, QrCode } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ProgressBar = ({ targetPercentage }: { targetPercentage: number }) => {
  return (
    <div className="h-2 w-full bg-surface-hoverLight dark:bg-surface-hoverDark rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: `${targetPercentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
        className={`h-full rounded-full ${targetPercentage >= 100 ? 'bg-border-dark dark:bg-border-light' : 'bg-primary-500'}`} 
      />
    </div>
  );
};

export const PlatformFeatures: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="bg-background-light dark:bg-background-dark">
      
      {/* 1. Registration Showcase */}
      <section className="py-24 border-b border-border-light dark:border-border-dark overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-text-primary dark:text-text-darkPrimary" dangerouslySetInnerHTML={{ __html: t('home.feat1.title') }} />
              <p className="text-[16px] text-text-secondary leading-relaxed max-w-md">
                {t('home.feat1.desc')}
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/5 dark:bg-primary-500/10 rounded-2xl blur-3xl -z-10 transform scale-90"></div>
              <div className="bg-surface-light dark:bg-[#151515] border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-elevation">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="font-semibold dark:text-white max-w-[200px] truncate">Madiun City Run 2026</h4>
                      <p className="text-[13px] text-text-secondary">{t('mockup.reg.status')}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-accent-emerald/10 text-accent-emerald text-[12px] font-semibold">Active</span>
                  </div>
                  {/* Category bars */}
                  {[
                    { name: '5K Fun Run', total: 1000, sold: 1000 },
                    { name: '10K Challenge', total: 2000, sold: 1850 },
                    { name: '21K Half Marathon', total: 1500, sold: 1431 },
                  ].map((cat: any) => {
                    const sold = cat.sold;
                    const total = cat.total;
                    const percentage = total > 0 ? (sold / total) * 100 : 0;
                    return (
                      <div key={cat.name} className="space-y-2">
                        <div className="flex justify-between text-[13px]">
                          <span className="font-medium dark:text-white">{cat.name}</span>
                          <span className="text-text-secondary">{sold.toLocaleString()} / {total.toLocaleString()}</span>
                        </div>
                        <ProgressBar targetPercentage={percentage} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Payment Showcase */}
      <section className="py-24 border-b border-border-light dark:border-border-dark bg-surface-light/50 dark:bg-surface-dark/30">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse">
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-text-primary dark:text-text-darkPrimary" dangerouslySetInnerHTML={{ __html: t('home.feat2.title') }} />
              <p className="text-[16px] text-text-secondary leading-relaxed max-w-md">
                {t('home.feat2.desc')}
              </p>
            </div>
            <div className="order-2 lg:order-1 relative">
              <div className="w-[360px] mx-auto bg-surface-light dark:bg-[#151515] border border-border-light dark:border-border-dark rounded-2xl shadow-elevation overflow-hidden">
                <div className="bg-background-light dark:bg-[#111111] p-5 border-b border-border-light dark:border-border-dark text-center">
                  <div className="w-12 h-12 bg-accent-emerald/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-accent-emerald" />
                  </div>
                  <h4 className="font-semibold dark:text-white">{t('mockup.pay.title')}</h4>
                  <p className="text-[13px] text-text-secondary mt-1">Rp 350.000</p>
                </div>
                <div className="p-5 space-y-4 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('mockup.pay.participant')}</span>
                    <span className="font-medium dark:text-white">REG-48217</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('mockup.pay.category')}</span>
                    <span className="font-medium dark:text-white">10K Challenge</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('mockup.pay.method')}</span>
                    <span className="font-medium dark:text-white">Virtual Account</span>
                  </div>
                  <div className="pt-4 border-t border-border-light dark:border-border-dark">
                    <button className="w-full py-2.5 rounded-lg bg-primary-500 text-white font-medium">
                      {t('mockup.pay.viewTicket')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Race Day & Check-in */}
      <section className="py-24 bg-[#111111] text-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
          <div className="max-w-2xl mx-auto space-y-6 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white" dangerouslySetInnerHTML={{ __html: t('home.feat3.title') }} />
            <p className="text-[18px] text-text-darkSecondary leading-relaxed">
              {t('home.feat3.desc')}
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto bg-[#181818] border border-[#333333] rounded-2xl p-8 shadow-2xl relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <QrCode className="w-48 h-48" />
            </div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-2 rounded-full bg-accent-rose animate-pulse"></div>
              <span className="text-[13px] font-bold tracking-[0.1em] text-accent-rose">{t('mockup.race.live')} • 08:42:13</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              <div>
                <p className="text-[12px] text-[#A1A1AA] mb-1">{t('mockup.race.participant')}</p>
                <p className="font-semibold text-[15px]">Participant #A4217</p>
              </div>
              <div>
                <p className="text-[12px] text-[#A1A1AA] mb-1">{t('mockup.race.category')}</p>
                <p className="font-semibold text-[15px]">10K Challenge</p>
              </div>
              <div>
                <p className="text-[12px] text-[#A1A1AA] mb-1">{t('mockup.race.bib')}</p>
                <p className="font-semibold text-[15px] text-primary-500">A4217</p>
              </div>
              <div>
                <p className="text-[12px] text-[#A1A1AA] mb-1">{t('mockup.race.status')}</p>
                <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-[#10B981]/20 text-[#10B981]">
                  VERIFIED
                </span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-[#333333]">
              <div className="flex justify-between text-[13px] mb-2">
                <span className="text-[#A1A1AA]">{t('mockup.race.checkedIn')}</span>
                <span className="font-medium">3,942 / 4,500</span>
              </div>
              <div className="h-1.5 w-full bg-[#222222] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '87.6%' }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="h-full bg-primary-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
