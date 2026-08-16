import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Ticket, Globe, Share2, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-surface-light dark:bg-surface-dark border-t border-slate-200/80 dark:border-slate-800/80 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-200 dark:border-slate-800/80">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                <Ticket className="w-5 h-5" />
              </div>
              <span>NAWATIX</span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {t('footer.desc')}
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-500 dark:text-slate-400">
              <a href="#" className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:text-primary-500 hover:border-primary-500/40 transition-all">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:text-primary-500 hover:border-primary-500/40 transition-all">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:text-primary-500 hover:border-primary-500/40 transition-all">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-slate-900 dark:text-white">{t('footer.explore')}</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: t('nav.home'), path: '/' },
                { label: t('nav.events'), path: '/events' },
                { label: t('nav.myTickets'), path: '/dashboard' },
                { label: t('nav.about'), path: '/about' },
                { label: t('nav.contact'), path: '/contact' },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.path}
                    className="text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-slate-900 dark:text-white">{t('footer.office')}</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                <span>9G3M+88Q, Jl. Panorama Raya, Pandean, Kec. Taman, Kota Madiun, Jawa Timur 63133</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-500 shrink-0" />
                <span>+62 811 8888 2026</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-500 shrink-0" />
                <span>support@nawatix.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>&copy; {new Date().getFullYear()} NAWATIX. {t('footer.rights')}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('footer.terms')}</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('footer.security')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
