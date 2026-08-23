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

  const navLinks: Array<{ label: string; path: string; isPortal?: boolean }> = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.events'), path: '/events' },
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background-light/80 dark:bg-background-dark/80 border-b border-border-light dark:border-border-dark transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 font-semibold text-[17px] tracking-tight text-text-primary dark:text-text-darkPrimary group">
          <div className="w-8 h-8 rounded-lg bg-text-primary dark:bg-text-darkPrimary flex items-center justify-center text-background-light dark:text-background-dark transition-transform duration-300 group-hover:scale-105">
            <Ticket className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <span className="tracking-[-0.02em]">NAWATIX</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded-md text-[14px] font-medium transition-colors flex items-center gap-1.5 ${
                isActive(item.path)
                  ? 'text-text-primary dark:text-text-darkPrimary'
                  : item.isPortal
                  ? 'text-primary-600 dark:text-primary-500 hover:text-primary-700'
                  : 'text-text-secondary hover:text-text-primary dark:hover:text-text-darkPrimary'
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
            className="p-1.5 rounded-md border border-border-light dark:border-border-dark flex items-center justify-center hover:bg-surface-hoverLight dark:hover:bg-surface-hoverDark transition-colors"
            title={language === 'id' ? 'Bahasa Indonesia (Klik untuk ganti ke English)' : 'English (Click to switch to Indonesia)'}
          >
            {language === 'id' ? <FlagID /> : <FlagEN />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md border border-border-light dark:border-border-dark text-text-secondary hover:text-text-primary dark:hover:text-text-darkPrimary hover:bg-surface-hoverLight dark:hover:bg-surface-hoverDark transition-colors"
            aria-label="Toggle Theme"
            title="Switch Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 ml-1">
              <button
                onClick={() => navigate(getDashboardPath())}
                className="saas-button-secondary py-1.5 px-3 text-[14px] flex items-center gap-2"
                title="Go to My Portal & Tickets"
              >
                <UserIcon className="w-3.5 h-3.5 text-primary-600" />
                <span className="max-w-[140px] truncate">{user.name || t('nav.myPortal')}</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-1.5 rounded-md border border-border-light dark:border-border-dark text-text-muted hover:text-accent-rose hover:border-accent-rose/30 transition-colors"
                title={t('nav.logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 ml-1">
              <Link to="/login" className="text-[14px] font-medium px-4 py-2 rounded-md text-text-secondary hover:text-text-primary dark:hover:text-text-darkPrimary transition-colors">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="saas-button-primary text-[14px] py-1.5 px-4">
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={toggleLanguage}
            className="p-1.5 rounded-md border border-border-light dark:border-border-dark flex items-center justify-center hover:bg-surface-hoverLight dark:hover:bg-surface-hoverDark transition-colors"
            title="Switch Language"
          >
            {language === 'id' ? <FlagID /> : <FlagEN />}
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md border border-border-light dark:border-border-dark text-text-secondary hover:text-text-primary dark:hover:text-text-darkPrimary"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-text-primary dark:text-text-darkPrimary hover:bg-surface-hoverLight dark:hover:bg-surface-hoverDark"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-6 pt-4 pb-8 space-y-4 animate-fade-in absolute w-full left-0 top-16 shadow-elevation z-50">
          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-3 rounded-md text-[15px] font-medium flex items-center gap-2 transition-colors ${
                  isActive(item.path)
                    ? 'text-text-primary dark:text-text-darkPrimary bg-surface-hoverLight dark:bg-surface-hoverDark'
                    : item.isPortal
                    ? 'text-primary-600'
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-text-darkPrimary'
                }`}
              >
                {item.isPortal && <Ticket className="w-4 h-4 shrink-0" />}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-border-light dark:border-border-dark flex flex-col gap-3">
            {isAuthenticated && user ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(getDashboardPath());
                  }}
                  className="saas-button-secondary w-full justify-center text-[15px] py-3 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-primary-600" />
                  <span>{t('nav.myPortal')} ({user.name})</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full justify-center text-text-muted hover:text-accent-rose text-[15px] py-3 transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="saas-button-secondary w-full justify-center text-[15px] py-3"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="saas-button-primary w-full justify-center text-[15px] py-3"
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
