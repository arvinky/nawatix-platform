import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { axiosClient } from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { Event, TicketCategory } from '../../types';
import {
  ShieldCheck,
  Tag,
  CreditCard,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Loader2,
  Lock,
  ArrowRight,
  HelpCircle,
  Building,
} from 'lucide-react';

const checkoutSchema = z.object({
  participantName: z.string().min(2, { message: 'Participant name is required' }),
  participantEmail: z.string().email({ message: 'Valid email is required for ticket delivery' }),
  participantPhone: z.string().min(8, { message: 'Phone number is required for SMS check-in notice' }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const CheckoutPage: React.FC = () => {
  const { eventId, ticketId } = useParams<{ eventId: string; ticketId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [voucherCode, setVoucherCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [voucherApplied, setVoucherApplied] = useState<boolean>(false);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState<boolean>(false);

  // Midtrans Simulation Modal State
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [isSimulatedModalOpen, setIsSimulatedModalOpen] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('GoPay / ShopeePay / QRIS');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      participantName: user?.name || '',
      participantEmail: user?.email || '',
      participantPhone: user?.phone || '+6281234567890',
    },
  });

  useEffect(() => {
    if (user) {
      setValue('participantName', user.name || '');
      setValue('participantEmail', user.email || '');
      setValue('participantPhone', user.phone || '+6281234567890');
    }
  }, [user]);

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ['checkoutEvent', eventId],
    queryFn: async () => axiosClient.get(`/api/events/${eventId}`),
    enabled: !!eventId,
  });

  const ticket = event?.ticketCategories?.find((t) => t.id === ticketId);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim() || !ticket) return;
    setIsValidatingVoucher(true);
    try {
      const res = await axiosClient.post<any, { discount: number }>('/api/vouchers/validate', {
        code: voucherCode.trim().toUpperCase(),
        eventId: eventId,
        subtotal: ticket.price,
      });
      setDiscount(res.discount);
      setVoucherApplied(true);
      showToast(`Voucher applied! IDR ${res.discount.toLocaleString('id-ID')} off!`, 'success');
    } catch (err: any) {
      setDiscount(0);
      setVoucherApplied(false);
      showToast(err.displayMessage || 'Invalid or expired promo code.', 'error');
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const onSubmitOrder = async (data: CheckoutFormValues) => {
    if (!ticket) return;
    try {
      const payload = {
        eventId,
        ticketCategoryId: ticketId,
        voucherCode: voucherApplied ? voucherCode.trim().toUpperCase() : undefined,
        participantName: data.participantName,
        participantEmail: data.participantEmail,
        participantPhone: data.participantPhone,
      };

      const res = await axiosClient.post<any, { id: string; snapToken?: string; snapRedirectUrl?: string }>('/api/orders', payload);
      setCreatedOrderId(res.id);
      
      if (res.snapRedirectUrl) {
        window.location.href = res.snapRedirectUrl;
        return;
      }
      
      // Fallback
      showToast('Order created! No redirect URL returned.', 'info');
      navigate(`/order-success/${res.id}`);
    } catch (err: any) {
      showToast(err.displayMessage || 'Failed to initialize ticket checkout.', 'error');
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!createdOrderId) return;

    if (selectedPaymentMethod === t('checkout.method.qris.name')) {
      showToast('Mohon tunggu verifikasi pembayaran dari Admin.', 'info');
      setIsSimulatedModalOpen(false);
      navigate(`/order-success/${createdOrderId}`);
      return;
    }

    setIsProcessingPayment(true);
    try {
      await axiosClient.post(`/api/payments/simulate-success/${createdOrderId}`);
      showToast('Payment successful! Your registration QR Code is ready.', 'success');
      setIsSimulatedModalOpen(false);
      navigate(`/order-success/${createdOrderId}`);
    } catch (err: any) {
      showToast(err.displayMessage || 'Failed to simulate payment.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading || !event || !ticket) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
        <span className="text-sm text-slate-500 font-medium">Preparing ticket checkout details...</span>
      </div>
    );
  }

  const subtotal = ticket.price;
  const platformFee = Math.round(subtotal * 0.015);
  const paymentFee = 4500;
  const total = Math.max(0, subtotal - discount + platformFee + paymentFee);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('checkout.title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('checkout.subtitle1')} <span className="font-semibold text-slate-800 dark:text-slate-200">{event.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Athlete information & Voucher */}
        <form onSubmit={handleSubmit(onSubmitOrder)} className="lg:col-span-2 space-y-6">
          <div className="saas-card p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              <span>{t('checkout.info.title')}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('checkout.info.desc')}
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('checkout.info.name')}
                </label>
                <input
                  type="text"
                  placeholder={t('checkout.info.namePlaceholder')}
                  {...register('participantName')}
                  className="saas-input"
                />
                {errors.participantName && <p className="text-rose-500 text-xs mt-1">{errors.participantName.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('checkout.info.email')}
                  </label>
                  <input
                    type="email"
                    placeholder={t('checkout.info.emailPlaceholder')}
                    {...register('participantEmail')}
                    className="saas-input"
                  />
                  {errors.participantEmail && <p className="text-rose-500 text-xs mt-1">{errors.participantEmail.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('checkout.info.phone')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('checkout.info.phonePlaceholder')}
                    {...register('participantPhone')}
                    className="saas-input"
                  />
                  {errors.participantPhone && <p className="text-rose-500 text-xs mt-1">{errors.participantPhone.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="saas-card p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <Tag className="w-4 h-4 text-primary-500" />
                <span>{t('checkout.promo.title')}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('checkout.promo.desc')}</p>
            </div>
            
            <div className="flex items-center gap-3 max-w-md">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder={t('checkout.promo.placeholder')}
                disabled={voucherApplied}
                className="saas-input font-mono uppercase"
              />
              <button
                type="button"
                onClick={handleApplyVoucher}
                disabled={voucherApplied || isValidatingVoucher || !voucherCode.trim()}
                className="saas-button-secondary py-2.5 px-6 text-xs font-semibold shrink-0"
              >
                {isValidatingVoucher ? t('checkout.promo.btn.checking') : voucherApplied ? t('checkout.promo.btn.applied') : t('checkout.promo.btn.apply')}
              </button>
            </div>
            {voucherApplied && (
              <p className="text-emerald-500 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Promo voucher active! {language === 'id' ? `Potongan Rp ${discount.toLocaleString('id-ID')} diterapkan.` : `IDR ${discount.toLocaleString('id-ID')} deduction applied.`}
              </p>
            )}
            <p className="text-[11px] text-slate-400">{t('checkout.promo.hint')}</p>
          </div>

          <div className="pt-2 text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="saas-button-primary w-full py-4 text-sm font-bold shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('checkout.submit.loading')}</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>{t('checkout.submit.btn')}</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed max-w-md mx-auto">
              {t('checkout.submit.desc')}
            </p>
          </div>
        </form>

        {/* Right Col: Order Summary Card */}
        <div className="space-y-6">
          <div className="saas-card p-6 space-y-6 bg-slate-50/80 dark:bg-slate-900/40">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              {t('checkout.summary.title')}
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t('checkout.summary.event')}</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[180px] truncate">{event.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t('checkout.summary.ticket')}</span>
                <span className="font-semibold text-primary-500">{ticket.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Harga tiket</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{language === 'id' ? 'Rp' : 'IDR'} {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-500">
                  <span>{t('checkout.summary.discount')}</span>
                  <span className="font-semibold">- {language === 'id' ? 'Rp' : 'IDR'} {discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-500">
                <span>Platform Fee 1,5%</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{language === 'id' ? 'Rp' : 'IDR'} {platformFee.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Payment Fee</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{language === 'id' ? 'Rp' : 'IDR'} {paymentFee.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="font-extrabold text-base text-slate-900 dark:text-white">{t('checkout.summary.total')}</span>
              <span className="text-2xl font-black text-primary-600 dark:text-primary-400">
                {language === 'id' ? 'Rp' : 'IDR'} {total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Midtrans Snap Simulation Drawer Modal */}
      <Modal
        isOpen={isSimulatedModalOpen}
        onClose={() => setIsSimulatedModalOpen(false)}
        title={t('checkout.modal.title')}
        maxWidth="max-w-xl"
      >
        <div className="space-y-6 py-2">
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white max-w-sm mx-auto">{event.name}</h4>
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold text-slate-400">{t('checkout.modal.total')}</span>
              <div className="text-3xl font-black text-primary-500">{language === 'id' ? 'Rp' : 'IDR'}{total.toLocaleString('id-ID')}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              {t('checkout.modal.method')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: t('checkout.method.qris.name'), desc: t('checkout.method.qris.desc') },
                { name: t('checkout.method.va.name'), desc: t('checkout.method.va.desc') },
                { name: t('checkout.method.cc.name'), desc: t('checkout.method.cc.desc') },
                { name: t('checkout.method.retail.name'), desc: t('checkout.method.retail.desc') },
              ].map((m) => (
                <div
                  key={m.name}
                  onClick={() => setSelectedPaymentMethod(m.name)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPaymentMethod === m.name
                      ? 'border-primary-500 bg-primary-500/10 text-slate-900 dark:text-white shadow'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                  }`}
                >
                  <div className="font-bold text-xs">{m.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                </div>
              ))}
            </div>
            {selectedPaymentMethod === t('checkout.method.qris.name') && (
              <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-3 shadow-sm">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Scan QRIS ini untuk membayar</p>
                <img src="/qris.jpg" alt="QRIS Nawatix" className="max-w-[250px] w-full h-auto rounded-lg" />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsSimulatedModalOpen(false)}
              className="saas-button-secondary flex-1 py-3 text-xs font-semibold"
            >
              {t('checkout.modal.cancel')}
            </button>
            <button
              onClick={handleSimulatePaymentSuccess}
              disabled={isProcessingPayment}
              className="saas-button-primary flex-[2] py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('checkout.modal.paying')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{selectedPaymentMethod === t('checkout.method.qris.name') ? 'Saya Sudah Melakukan Pembayaran' : t('checkout.modal.pay')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
