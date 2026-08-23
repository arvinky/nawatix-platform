import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, CreditCard, Ticket, QrCode, Map, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ProductStory: React.FC = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const steps = [
    {
      id: 'discover',
      title: t('home.story.step1.title'),
      icon: Search,
      desc: t('home.story.step1.desc'),
    },
    {
      id: 'register',
      title: t('home.story.step2.title'),
      icon: Ticket,
      desc: t('home.story.step2.desc'),
    },
    {
      id: 'pay',
      title: t('home.story.step3.title'),
      icon: CreditCard,
      desc: t('home.story.step3.desc'),
    },
    {
      id: 'verify',
      title: t('home.story.step4.title'),
      icon: CheckCircle2,
      desc: t('home.story.step4.desc'),
    },
    {
      id: 'check-in',
      title: t('home.story.step5.title'),
      icon: QrCode,
      desc: t('home.story.step5.desc'),
    },
    {
      id: 'race-day',
      title: t('home.story.step6.title'),
      icon: Map,
      desc: t('home.story.step6.desc'),
    }
  ];

  return (
    <section ref={containerRef} className="py-32 bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark relative">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-text-primary dark:text-text-darkPrimary" dangerouslySetInnerHTML={{ __html: t('home.story.title') }} />
          <p className="text-[18px] text-text-secondary dark:text-text-darkSecondary">
            {t('home.story.desc')}
          </p>
        </div>

        {/* Desktop Horizontal Flow */}
        <div className="hidden lg:flex items-start justify-between relative">
          <div className="absolute top-[28px] left-[4%] right-[4%] h-[2px] bg-border-light dark:bg-border-dark -z-10" />
          <motion.div 
            className="absolute top-[28px] left-[4%] right-[4%] h-[2px] bg-primary-500 origin-left -z-10"
            style={{ scaleX: scrollYProgress }}
          />

          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center text-center w-48 relative">
              <div className="w-14 h-14 rounded-xl bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark flex items-center justify-center mb-6 shadow-sm transition-colors duration-300">
                <step.icon className="w-6 h-6 text-text-secondary" />
              </div>
              <h3 className="text-[14px] font-bold tracking-[0.05em] text-text-primary dark:text-text-darkPrimary mb-2">{step.title}</h3>
              <p className="text-[13px] text-text-secondary dark:text-text-darkSecondary leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile Vertical Flow */}
        <div className="lg:hidden flex flex-col gap-12 relative">
          <div className="absolute left-[27px] top-[28px] bottom-0 w-[2px] bg-border-light dark:bg-border-dark -z-10" />
          
          {steps.map((step, idx) => (
            <div key={step.id} className="flex gap-6 relative">
              <div className="w-14 h-14 rounded-xl bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark flex items-center justify-center shrink-0">
                <step.icon className="w-6 h-6 text-text-secondary" />
              </div>
              <div className="pt-3">
                <h3 className="text-[14px] font-bold tracking-[0.05em] text-text-primary dark:text-text-darkPrimary mb-1">{step.title}</h3>
                <p className="text-[14px] text-text-secondary dark:text-text-darkSecondary">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
