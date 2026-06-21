import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Zap, Coins, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../redux/slices/authSlice';
import type { RootState } from '../../redux/store';
import { createPortal } from 'react-dom';
import { server_url } from '../../config';

// We must declare Razorpay type for TypeScript since we load it via script tag
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tiers = [
  {
    id: 'tier_50',
    name: 'Starter Pack',
    credits: 50,
    price: '₹99',
    features: ['5 Interview Sessions', 'Basic AI Feedback', 'No Expiry'],
    popular: false,
    icon: Coins
  },
  {
    id: 'tier_100',
    name: 'Pro Pack',
    credits: 100,
    price: '₹149',
    features: ['10 Interview Sessions', 'Advanced Tone Analysis', 'Priority Support'],
    popular: true,
    icon: Zap
  }
];

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const handlePayment = async (tierId: string) => {
    if (!user) return;
    setLoadingTier(tierId);
    setErrorMsg('');

    try {
      // 1. Create order on backend
      const { data: orderData } = await axios.post(
        `${server_url}/api/payment/create-order`,
        { tierId },
        { withCredentials: true }
      );

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Evelify',
        description: 'Interview Credits',
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            // 2. Verify payment on backend
            const { data: verifyData } = await axios.post(
              `${server_url}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                tierId
              },
              { withCredentials: true }
            );

            if (verifyData.success) {
              // 3. Update Redux state
              dispatch(setUser(verifyData.user));
              onClose();
            }
          } catch (verifyError: any) {
            console.error('Verification failed', verifyError);
            setErrorMsg(verifyError.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#3B82F6' // Tailwind Blue-500
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        setErrorMsg('Payment failed. Please try again.');
      });

      rzp.open();

    } catch (err: any) {
      console.error('Payment initialization failed', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to start payment');
    } finally {
      setLoadingTier(null);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-4xl dark:bg-[#0B1120] light:bg-white dark:border-white/10 light:border-gray-200 border rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] overflow-hidden z-[10000] my-auto"
          >
            {/* Header */}
            <div className="p-6 md:p-10 pb-6 text-center border-b dark:border-white/5 light:border-gray-100 relative">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 dark:text-gray-400 dark:hover:text-white dark:bg-white/5 dark:hover:bg-white/10 light:text-gray-500 light:hover:text-gray-900 light:bg-gray-100 light:hover:bg-gray-200 rounded-full transition-all hover:rotate-90 active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                <Zap className="w-3 h-3 fill-current" />
                Credits System
              </div>
              <h2 className="text-3xl md:text-4xl font-bold dark:text-white light:text-gray-900 text-white mb-3 tracking-tight">Level Up Your Interviews</h2>
              <p className="dark:text-gray-400 light:text-gray-600 text-gray-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                Each AI interview session costs 10 credits. Purchase more credits to continue practicing and landing your dream job.
              </p>
            </div>

            {errorMsg && (
              <div className="dark:bg-red-500/10 light:bg-red-50 dark:border-red-500/20 light:border-red-100 border-b px-8 py-3 text-red-500 dark:text-red-400 text-sm text-center font-medium">
                {errorMsg}
              </div>
            )}

            {/* Pricing Cards */}
            <div className="p-6 md:p-10 grid md:grid-cols-2 gap-6 md:gap-8">
              {tiers.map((tier) => {
                const Icon = tier.icon;
                return (
                  <div
                    key={tier.id}
                    className={`relative rounded-[2rem] p-8 border transition-all duration-500 hover:translate-y-[-4px] ${
                      tier.popular 
                        ? 'bg-gradient-to-b dark:from-blue-600/10 light:from-blue-500/5 dark:via-blue-600/5 light:via-blue-500/2 dark:to-transparent light:to-transparent border-blue-500/30 dark:border-blue-500/30 light:border-blue-300 shadow-[0_20px_50px_rgba(59,130,246,0.1)]' 
                        : 'dark:bg-white/[0.02] light:bg-gray-50/50 dark:border-white/5 light:border-gray-200 hover:dark:bg-white/[0.04] hover:light:bg-gray-100/50'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1.5 px-4 rounded-full shadow-xl">
                          Best Value
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-6 mt-2">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${tier.popular ? 'bg-blue-500/20 text-blue-500 dark:text-blue-400' : 'dark:bg-white/10 light:bg-gray-100 dark:text-gray-300 light:text-gray-600'}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold dark:text-white light:text-gray-900 text-white tracking-tight">{tier.name}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black dark:text-white light:text-gray-900 text-white">{tier.price}</span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 mb-8 pb-8 border-b dark:border-white/5 light:border-gray-100">
                      <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        {tier.credits}
                      </span>
                      <span className="dark:text-gray-500 light:text-gray-400 font-bold uppercase tracking-widest text-xs">Credits</span>
                    </div>

                    <ul className="space-y-4 mb-10">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3.5 dark:text-gray-400 light:text-gray-600">
                          <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${tier.popular ? 'text-blue-500 dark:text-blue-400' : 'dark:text-gray-600 light:text-gray-300'}`} />
                          <span className="text-sm font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePayment(tier.id)}
                      disabled={loadingTier !== null}
                      className={`w-full py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex justify-center items-center gap-3 ${
                        tier.popular
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_25px_-5px_rgba(59,130,246,0.4)]'
                          : 'dark:bg-white/10 light:bg-gray-900 dark:hover:bg-white/15 light:hover:bg-gray-800 text-white dark:text-white'
                      } ${loadingTier === tier.id ? 'opacity-80 cursor-wait' : 'hover:scale-[1.02] active:scale-95'}`}
                    >
                      {loadingTier === tier.id ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Buy ${tier.credits} Credits`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default PricingModal;

