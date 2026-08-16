import React from 'react';
import { Activity, ShieldCheck, Zap, Award, Users, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 text-primary-500 text-xs font-bold uppercase">
          <span>{t('about.badge')}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {t('about.title')}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {t('about.desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: t('about.card1.title'), desc: t('about.card1.desc'), icon: ShieldCheck },
          { title: t('about.card2.title'), desc: t('about.card2.desc'), icon: Zap },
          { title: t('about.card3.title'), desc: t('about.card3.desc'), icon: Award },
        ].map((v, i) => (
          <div key={i} className="saas-card p-8 space-y-4">

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{v.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
