import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sun, Moon, Menu, X, User as UserIcon, LogOut, LayoutDashboard, Ticket } from 'lucide-react';

const FlagID: React.FC = () => (
  <svg className="w-6 h-4 rounded-[3px] shadow-sm overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 object-cover" viewBox="0 0 60 40">
    <rect width="60" height="20" fill="#E70011" />
    <rect y="20" width="60" height="20" fill="#FFFFFF" />
  </svg>
);

const FlagEN: React.FC = () => (
  <svg className="w-6 h-4 rounded-[3px] shadow-sm overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 object-cover" viewBox="0 0 60 40">
    <clipPath id="uk-clip">
      <rect width="60" height="40"/>
    </clipPath>
    <g clipPath="url(#uk-clip)">
      <rect width="60" height="40" fill="#012169"/>
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="6"/>
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="3.5"/>
      <path d="M30,0 v40 M0,20 h60" stroke="#FFFFFF" strokeWidth="10"/>
      <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'SUPER_ADMIN') return '/super-admin';
    if (user.role === 'ADMIN') return '/admin';
    return '/dashboard';
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    if (user.role === 'SUPER_ADMIN') return t('nav.superAdmin');
    if (user.role === 'ADMIN') return t('nav.adminPortal');
    return t('nav.myPortal');
  };

  const navLinks = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.events'), path: '/events' },
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-surface-light/80 dark:bg-surface-dark/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900 dark:text-white group">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-sm group-hover:bg-primary-500 transition-colors">
            <Ticket className="w-5 h-5" />
          </div>
          <span className="tracking-wide">NAWATIX</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive(item.path)
                  ? 'bg-primary-500 text-white font-bold shadow-sm shadow-primary-500/30'
                  : item.isPortal
                  ? 'bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 font-bold border border-primary-500/20 hover:bg-primary-500 hover:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {item.isPortal && <Ticket className="w-4 h-4 shrink-0" />}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Controls & Account Action */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm hover:scale-105"
            title={language === 'id' ? 'Bahasa Indonesia (Klik untuk ganti ke English)' : 'English (Click to switch to Indonesia)'}
          >
            {language === 'id' ? <FlagID /> : <FlagEN />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
            title="Switch Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 ml-1">
              <button
                onClick={() => navigate(getDashboardPath())}
                className="saas-button-secondary text-sm py-2 px-3.5 gap-2 border border-slate-200 dark:border-slate-700 font-semibold flex items-center shadow-sm hover:border-primary-500/50 hover:text-primary-500 transition-all"
                title="Go to My Portal & Tickets"
              >
                <UserIcon className="w-4 h-4 text-primary-500" />
                <span className="max-w-[140px] truncate">{user.name || t('nav.myPortal')}</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 hover:border-rose-500/30 transition-colors"
                title={t('nav.logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 ml-1">
              <Link to="/login" className="text-sm font-medium px-4 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="saas-button-primary text-sm py-2 px-4 shadow">
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
            title="Switch Language"
          >
            {language === 'id' ? <FlagID /> : <FlagEN />}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
                  isActive(item.path)
                    ? 'bg-primary-500 text-white font-bold shadow-sm'
                    : item.isPortal
                    ? 'bg-primary-500/15 text-primary-500 font-bold border border-primary-500/20'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {item.isPortal && <Ticket className="w-4 h-4 shrink-0" />}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(getDashboardPath());
                  }}
                  className="saas-button-secondary w-full justify-center text-sm py-2.5 font-bold flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-primary-500" />
                  <span>{t('nav.myPortal')} ({user.name})</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="saas-button-secondary w-full justify-center text-rose-500 text-sm py-2.5 border-rose-500/20"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="saas-button-secondary w-full justify-center text-sm py-2.5"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="saas-button-primary w-full justify-center text-sm py-2.5"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
