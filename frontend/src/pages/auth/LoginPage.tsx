import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { axiosClient } from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../components/common/Toast';
import { Activity, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await axiosClient.post<any, { access_token: string; user: any }>('/api/auth/login', data);
      login(res.access_token, res.user);
      showToast(`Welcome back, ${res.user.name}!`, 'success');

      // Direct to respective portal based on role
      if (res.user.role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else if (res.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      showToast(err.displayMessage || 'Login failed. Please verify credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillTestAccount = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'Password@123', { shouldValidate: true });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background-light to-slate-100 dark:from-background-dark dark:to-slate-950/50">
      <div className="max-w-md w-full space-y-8 saas-card p-8 sm:p-10">
        {/* Header */}
        <div className="text-center space-y-2">

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('login.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('login.subtitle')}
          </p>
        </div>



        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('login.email.label')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  placeholder={t('login.email.placeholder')}
                  {...register('email')}
                  className={`saas-input pl-10 ${errors.email ? 'border-rose-500 focus:ring-rose-500/30' : ''}`}
                />
              </div>
              {errors.email && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('login.password.label')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder={t('login.password.placeholder')}
                  {...register('password')}
                  className={`saas-input pl-10 ${errors.password ? 'border-rose-500 focus:ring-rose-500/30' : ''}`}
                />
              </div>
              {errors.password && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="saas-button-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 group"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('login.btn.loading')}</span>
              </>
            ) : (
              <>
                <span>{t('login.btn.submit')}</span>
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('login.noAccount')}{' '}
              <Link to="/register" className="text-primary-500 font-semibold hover:underline">
                {t('login.registerLink')}
              </Link>
            </span>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="shrink-0 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('login.or')}</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={() => window.location.href = 'http://localhost:3000/api/auth/google'}
            className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t('login.btn.google')}
          </button>
        </form>
      </div>
    </div>
  );
};
