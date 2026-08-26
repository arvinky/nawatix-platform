import React, { useState } from 'react';
import { useToast } from '../../components/common/Toast';
import { useLanguage } from '../../context/LanguageContext';
import { MapPin, Phone, Mail, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    showToast(t('contact.toast'), 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('contact.title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
        <div className="saas-card p-8 space-y-8 bg-slate-900 text-white border-primary-500/30 shadow-2xl">
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-white">{t('contact.hq.title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('contact.hq.desc')}</p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3.5 text-slate-300">
              <MapPin className="w-5 h-5 text-primary-400 shrink-0" />
              <span>9G3M+88Q, Jl. Panorama Raya, Pandean, Kec. Taman, Kota Madiun, Jawa Timur 63133</span>
            </div>
            <div className="flex items-center gap-3.5 text-slate-300">
              <Phone className="w-5 h-5 text-primary-400 shrink-0" />
              <span>+628579010663</span>
            </div>
            <div className="flex items-center gap-3.5 text-slate-300">
              <Mail className="w-5 h-5 text-primary-400 shrink-0" />
              <span>nawainspirasi@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="saas-card p-8 space-y-6">
          {sent ? (
            <div className="py-12 text-center space-y-4 text-emerald-500">
              <CheckCircle2 className="w-12 h-12 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('contact.success.title')}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">{t('contact.success.desc')}</p>
              <button onClick={() => setSent(false)} className="saas-button-secondary text-xs py-2 px-4">{t('contact.success.another')}</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">{t('contact.form.name')}</label>
                <input required type="text" placeholder={t('contact.form.namePlaceholder')} className="saas-input" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">{t('contact.form.email')}</label>
                <input required type="email" placeholder={t('contact.form.emailPlaceholder')} className="saas-input" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">{t('contact.form.subject')}</label>
                <input required type="text" placeholder={t('contact.form.subjectPlaceholder')} className="saas-input" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">{t('contact.form.message')}</label>
                <textarea required rows={4} placeholder={t('contact.form.messagePlaceholder')} className="saas-input py-2" />
              </div>
              <button type="submit" className="saas-button-primary w-full py-3 text-sm font-bold gap-2 shadow">
                <Send className="w-4 h-4" />
                <span>{t('contact.form.submit')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
