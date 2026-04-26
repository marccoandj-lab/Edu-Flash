import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { paddleService } from '../services/paddleService';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

export const Pricing = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    paddleService.initialize();
  }, []);

  const handleUpgrade = (planName: string) => {
    if (planName === 'Pro') {
      if (!user) {
        navigate('/auth');
        return;
      }
      const productId = import.meta.env.VITE_PADDLE_PRO_PRODUCT_ID || "12345";
      paddleService.openCheckout(productId, user.email || "student@edu-flash.com");
    } else {
      if (!user) {
        navigate('/auth');
      }
    }
  };

  const plans = [
    {
      name: 'Freemium',
      price: '$0',
      description: 'Perfect for casual learners.',
      features: [
        '250,000 API Tokens (~50 docs)',
        'Basic Q&A flashcards',
        'Auto Language detection',
        'PWA Support (Offline)',
        'Batch scanning (10 cards cap)'
      ],
      cta: 'Current Plan',
      current: true,
      buttonClass: 'bg-white/10 text-white/40 cursor-default border border-white/5'
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: '/mo',
      description: 'For serious students and super-learning.',
      features: [
        '2.5M API Tokens (~500 docs)',
        'Detailed Flashcards (Llama 4)',
        'Unlimited cards per scan',
        'Full Offline mode & Sync',
        'Priority Support'
      ],
      cta: 'Upgrade to Pro',
      current: false,
      highlight: true,
      buttonClass: 'bg-white text-[var(--background)] hover:scale-[1.03] shadow-white/10 shadow-2xl'
    }
  ];

  return (
    <div className="px-6 lg:px-10 pb-32 max-w-5xl mx-auto bg-transparent">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase italic">Elevate Your Study</h2>
        <p className="text-white/50 mt-4 font-bold text-sm uppercase tracking-[0.2em]">Select your learning horsepower</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`
              relative p-10 lg:p-14 rounded-[4rem] border transition-all duration-500
              ${plan.highlight ? 'border-white bg-white/5 shadow-[0_32px_80px_-16px_rgba(255,255,255,0.1)]' : 'border-white/10 bg-white/5 shadow-2xl'}
              flex flex-col
            `}
          >
            {plan.highlight && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-8 py-2.5 bg-white text-[var(--background)] text-[10px] font-black rounded-full shadow-2xl tracking-[0.3em] uppercase italic">
                Recommended
              </div>
            )}

            <div className="mb-12">
              <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] opacity-40">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-6">
                <span className="text-6xl font-black text-white tracking-tight">{plan.price}</span>
                {plan.period && <span className="text-white/40 font-bold text-xl">{plan.period}</span>}
              </div>
              <p className="text-white/60 mt-6 font-medium leading-relaxed italic pr-4">{plan.description}</p>
            </div>

            <div className="flex-1 space-y-6 mb-16">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-5">
                  <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-white text-[var(--background)]' : 'bg-white/10 text-white'}`}>
                    <Check size={16} strokeWidth={4} />
                  </div>
                  <span className="text-sm text-white font-bold tracking-tight opacity-90">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleUpgrade(plan.name)}
              className={`w-full py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-95 ${plan.buttonClass}`}
            >
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
