import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Ticket, Globe, Share2, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark pt-20 pb-12 transition-colors">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-border-light dark:border-border-dark">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-3 font-semibold text-[17px] tracking-tight text-text-primary dark:text-text-darkPrimary">
              <div className="w-8 h-8 rounded-lg bg-text-primary dark:bg-text-darkPrimary flex items-center justify-center text-background-light dark:text-background-dark">
                <Ticket className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <span className="tracking-[-0.02em]">NAWATIX</span>
            </Link>
            <p className="text-[15px] text-text-secondary dark:text-text-darkSecondary max-w-sm leading-relaxed">
              {t('footer.desc')}
            </p>
            <div className="flex items-center gap-4 pt-2 text-text-muted">
              <a href="#" className="hover:text-text-primary dark:hover:text-text-darkPrimary transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-text-primary dark:hover:text-text-darkPrimary transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-text-primary dark:hover:text-text-darkPrimary transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="text-[13px] font-semibold tracking-[0.05em] uppercase text-text-primary dark:text-text-darkPrimary">{t('footer.explore')}</h4>
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
                    className="text-text-secondary hover:text-text-primary dark:hover:text-text-darkPrimary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h4 className="text-[13px] font-semibold tracking-[0.05em] uppercase text-text-primary dark:text-text-darkPrimary">{t('footer.office')}</h4>
            <ul className="space-y-3 text-[14px] text-text-secondary dark:text-text-darkSecondary leading-relaxed">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                <span>9G3M+88Q, Jl. Panorama Raya, Pandean, Kec. Taman, Kota Madiun, Jawa Timur 63133</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-text-muted shrink-0" />
                <span>+62 811 8888 2026</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-text-muted shrink-0" />
                <span>support@nawatix.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[13px] text-text-muted gap-4">
          <p>&copy; {new Date().getFullYear()} NAWATIX. {t('footer.rights')}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-text-primary dark:hover:text-text-darkPrimary transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-text-primary dark:hover:text-text-darkPrimary transition-colors">{t('footer.terms')}</a>
            <a href="#" className="hover:text-text-primary dark:hover:text-text-darkPrimary transition-colors">{t('footer.security')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
