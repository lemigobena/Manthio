import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { COURSES } from '../../services/mockData';
import { 
  ArrowLeft, 
  CheckCircle, 
  ArrowRight, 
  User, 
  Mail, 
  Phone, 
  Laptop,
  Users,
  Percent,
  Sparkles
} from 'lucide-react';
import { useXP } from '../../context/XPContext';

// Custom icons for Payment Methods
const MastercardIcon = () => (
  <div className="flex items-center space-x-1">
    <div className="w-4 h-4 bg-[#EB001B] rounded-full opacity-90 shadow-sm" />
    <div className="w-4 h-4 bg-[#F79E1B] rounded-full -ml-2.5 opacity-90 shadow-sm" />
  </div>
);

const VisaIcon = () => (
  <span className="text-[#1A1F71] font-black italic tracking-tighter text-sm">VISA</span>
);

const ApplePayIcon = () => (
  <div className="flex items-center space-x-1">
    <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center p-0.5">
      <svg viewBox="0 0 256 315" className="w-full h-full fill-black"><path d="M213.803 167.03c.442 47.58 41.74 63.413 42.197 63.615-.35 1.116-6.599 22.563-21.757 44.716-13.103 19.15-26.676 38.273-48.134 38.665-21.085.387-27.887-12.462-51.901-12.462-24.017 0-31.564 12.063-51.58 12.851-20.35.788-35.636-20.705-48.825-39.637C6.792 240.236-11.837 165.736 17.51 114.7c14.545-25.334 40.59-41.385 68.647-41.785 21.433-.399 41.656 14.435 54.75 14.435 13.088 0 37.58-18.067 63.158-15.443 10.697.447 40.75 4.316 60.013 32.513-1.554.966-35.808 20.852-35.433 62.61zM176.022 40.472c11.353-13.75 19.014-32.88 16.924-51.986-16.425.666-36.326 10.96-48.093 24.715-10.551 12.193-19.78 31.69-17.29 50.395 18.34 1.42 37.106-9.37 48.459-23.124z"/></svg>
    </div>
    <span className="text-white font-bold text-[10px]">Pay</span>
  </div>
);

interface CheckoutProps {
  onNavigate: (page: string) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
  const { activeCourseId, selectedFormat } = useAuth();
  const { addXp } = useXP();
  const [step, setStep] = useState<'checkout' | 'processing' | 'success'>('checkout');
  const [paymentMethod, setPaymentMethod] = useState<'mastercard' | 'visa' | 'apple' | 'paypal' | 'twint'>('visa');
  const [deliveryMethod, setDeliveryMethod] = useState<'online' | 'hybrid'>('online');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoActive, setPromoActive] = useState(false);

  const course = COURSES.find(c => c.id === activeCourseId) || COURSES[0];
  
  const activeFormatData = course.availableFormats?.find(f => f.format === selectedFormat);
  const activeBundle = activeFormatData?.bundledSubscription || course.bundledSubscription;
  const activeCohort = activeFormatData?.cohortProgress || course.cohortProgress;
  const isReserved = activeCohort && activeCohort.currentParticipants < activeCohort.minParticipants;

  const currentPrice = activeFormatData?.price || course.price;
  const priceValue = parseFloat(currentPrice?.replace(/[^\d.]/g, '') || '0');
  const loyaltyDiscount = priceValue * 0.1; 
  const promoDiscount = promoActive ? (priceValue - loyaltyDiscount) * 0.2 : 0;
  const totalDiscount = loyaltyDiscount + promoDiscount;
  const taxAmount = (priceValue - totalDiscount) * 0.081;
  const totalAmount = priceValue - totalDiscount + taxAmount;

  const handleProcessPayment = () => {
    if (!agreedToTerms) return;
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      addXp(500, 'Course Booking Achievement');
    }, 2000);
  };

  if (step === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] space-y-4">
        <div className="w-12 h-12 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-text uppercase tracking-tight">Securing Transaction</h2>
          <p className="text-muted text-xs font-medium">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
          <CheckCircle className="w-12 h-12 text-green" />
        </div>
        <h2 className="text-2xl font-black text-text uppercase tracking-[2px] text-center">Enrolment Confirmed</h2>
        <p className="text-muted text-center max-w-sm mt-3 text-xs font-medium leading-relaxed opacity-80 px-6">
          Welcome to <span className="text-text font-bold decoration-cyan underline decoration-2 underline-offset-4">{course.title}</span>. 
          Your transformation starts now.
        </p>
        <button 
          onClick={() => onNavigate('learning-path')}
          className="mt-8 bg-cyan hover:bg-cyan/90 text-bg font-black px-10 py-3 rounded-full transition-all shadow-[0_8px_30px_rgba(45,212,191,0.3)] uppercase tracking-widest text-[10px]"
        >
          START LEARNING
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 h-[calc(100vh-80px)] flex flex-col">
      {/* Compact Header */}
      <div className="flex items-center space-x-4 pb-4 border-b border-line/50 shrink-0">
        <button 
          onClick={() => onNavigate('course-detail')}
          className="p-2 rounded-lg border border-line bg-panel hover:bg-bg transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-text" />
        </button>
        <h1 className="text-2xl font-black text-text tracking-tight uppercase">Checkout</h1>
      </div>

      <div className="flex-1 min-h-0 pt-4 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          {/* Left Form Section - Optimized for zero-scroll persistence */}
          <div className="lg:col-span-8 space-y-8 overflow-y-visible pr-2 flex flex-col">
            
            {/* Section 1: Contact */}
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-text flex items-center space-x-2">
                <span className="text-cyan opacity-40">1.</span>
                <span>Contact Information</span>
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted tracking-tight ml-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted/50" />
                    <input type="text" placeholder="Eduard" className="w-full bg-panel border-line border rounded-xl pl-9 pr-3 py-4 text-xs focus:border-cyan/50 !outline-none transition-all text-text" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted tracking-tight ml-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted/50" />
                    <input type="text" placeholder="Franz" className="w-full bg-panel border-line border rounded-xl pl-9 pr-3 py-4 text-xs focus:border-cyan/50 !outline-none transition-all text-text" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted tracking-tight ml-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted/50" />
                    <input type="text" placeholder="+41 79 000 00 00" className="w-full bg-panel border-line border rounded-xl pl-9 pr-3 py-4 text-xs focus:border-cyan/50 !outline-none transition-all text-text" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted tracking-tight ml-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted/50" />
                    <input type="email" placeholder="eduard.f@example.ch" className="w-full bg-panel border-line border rounded-xl pl-9 pr-3 py-4 text-xs focus:border-cyan/50 !outline-none transition-all text-text" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Learning Method & Rewards */}
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-text flex items-center space-x-2">
                <span className="text-cyan opacity-40">2.</span>
                <span>Learning Method & Rewards</span>
              </h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setDeliveryMethod('online')}
                  className={`flex-1 flex items-center justify-center p-4 rounded-xl border transition-all space-x-2 ${deliveryMethod === 'online' ? 'border-cyan bg-cyan/5' : 'border-line bg-panel opacity-60'}`}
                >
                  <Laptop className="w-4 h-4 text-text" />
                  <span className="text-[9px] font-black uppercase tracking-tight">Self-Paced</span>
                </button>
                <button 
                  onClick={() => setDeliveryMethod('hybrid')}
                  className={`flex-1 flex items-center justify-center p-4 rounded-xl border transition-all space-x-2 ${deliveryMethod === 'hybrid' ? 'border-cyan bg-cyan/5' : 'border-line bg-panel opacity-60'}`}
                >
                  <Users className="w-4 h-4 text-text" />
                  <span className="text-[9px] font-black uppercase tracking-tight">Hybrid / Live</span>
                </button>
              </div>
              
              {/* Promo Code Integrated (REQ-CHECKOUT-004) */}
              <div className="space-y-3 pt-2">
                <label className="text-[9px] font-black uppercase text-muted tracking-tight ml-1">Promotional Code</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Enter code (e.g. EARLY20)" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-panel border-line border rounded-xl px-4 py-3 text-xs focus:border-cyan/50 !outline-none transition-all text-text" 
                  />
                  <button 
                    onClick={() => setPromoActive(promoCode.toUpperCase() === 'EARLY20')}
                    className="bg-cyan hover:bg-cyan/90 text-bg px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(45,212,191,0.2)]"
                  >
                    Apply
                  </button>
                </div>
                {promoActive && (
                  <div className="flex items-center space-x-2 text-green text-[10px] font-bold bg-green/5 p-2 rounded-lg border border-green/10">
                    <CheckCircle className="w-3 h-3" />
                    <span>Success! 20% extra discount Applied.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Payment */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-text flex items-center space-x-2">
                <span className="text-cyan opacity-40">3.</span>
                <span>Payment method</span>
              </h2>
              <div className="grid grid-cols-5 gap-2">
                <button onClick={() => setPaymentMethod('mastercard')} className={`py-4 rounded-xl border transition-all flex items-center justify-center ${paymentMethod === 'mastercard' ? 'border-cyan bg-cyan/5' : 'border-line bg-panel'}`}>
                  <MastercardIcon />
                </button>
                <button onClick={() => setPaymentMethod('visa')} className={`py-4 rounded-xl border transition-all flex items-center justify-center ${paymentMethod === 'visa' ? 'border-cyan bg-cyan/5' : 'border-line bg-panel'}`}>
                  <VisaIcon />
                </button>
                <button onClick={() => setPaymentMethod('apple')} className={`py-4 rounded-xl border transition-all flex items-center justify-center ${paymentMethod === 'apple' ? 'border-cyan bg-cyan/5' : 'border-line bg-panel'}`}>
                  <ApplePayIcon />
                </button>
                <button onClick={() => setPaymentMethod('paypal')} className={`py-4 rounded-xl border transition-all flex items-center justify-center ${paymentMethod === 'paypal' ? 'border-cyan bg-cyan/5' : 'border-line bg-panel'}`}>
                  <span className="text-[#003087] font-black italic text-[10px]">PayPal</span>
                </button>
                <button onClick={() => setPaymentMethod('twint')} className={`py-4 rounded-xl border transition-all flex items-center justify-center ${paymentMethod === 'twint' ? 'border-cyan bg-cyan/5' : 'border-line bg-panel'}`}>
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-text font-black text-[9px] tracking-tighter">TWINT</span>
                    <span className="text-[6px] font-bold text-muted uppercase">Swiss Pay</span>
                  </div>
                </button>
              </div>
            </div>

          </div>

          <div className="mb-15 lg:col-span-4 h-full flex flex-col">
            <div className="bg-panel border border-line rounded-[24px] pt-5 px-5 pb-7 flex flex-col shadow-xl">
              <h2 className="text-lg font-black text-text uppercase tracking-tight mb-4">Order</h2>
              
              <div className="flex-1 flex flex-col space-y-4 min-h-0">
                {/* Compact Course Preview */}
                <div className="relative h-32 shrink-0">
                  <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover rounded-xl border border-line" />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent rounded-xl" />
                  <div className="absolute bottom-3 left-3 pr-3 text-[11px] font-bold text-white line-clamp-1">{course.title}</div>
                </div>

                {/* Bundled Access Row (REQ-CHECKOUT-010) */}
                {activeBundle && (
                  <div className="bg-cyan/10 border border-cyan/20 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-cyan" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-text uppercase leading-none">Access Bundle</span>
                        <span className="text-[9px] font-bold text-cyan mt-1">{activeBundle.durationMonths}m {activeBundle.label}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-text/50 uppercase">Included</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-muted uppercase">Level</span>
                    <div className="font-bold text-text">{course.level}</div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-muted uppercase">Duration</span>
                    <div className="font-bold text-text">{course.duration}</div>
                  </div>
                </div>

                {/* Compact Breakdown */}
                <div className="pt-4 border-t border-line/50 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-text">CHF {priceValue.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-cyan">Total Discount</span>
                    <span className="text-cyan">-CHF {totalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center space-x-1">
                      <Percent className="w-2.5 h-2.5 text-muted" />
                      <span className="text-muted">VAT (8.1%)</span>
                    </div>
                    <span className="text-text">CHF {taxAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Conditional Confirmation Message (REQ-CHECKOUT-016) */}
                {isReserved && (
                  <div className="p-3 bg-orange/10 border border-orange/20 rounded-xl">
                    <p className="text-[9px] text-orange font-bold leading-relaxed">
                      Your seat is reserved. The course runs once {activeCohort.minParticipants} participants are booked. Confirmation by {new Date(activeCohort.confirmationDate).toLocaleDateString()}.
                    </p>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-line space-y-4">
                  <div className="flex items-end justify-between">
                    <span className="text-xs font-black text-text uppercase">Total</span>
                    <span className="text-2xl font-black text-text tracking-tighter">CHF {totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={handleProcessPayment}
                      disabled={!agreedToTerms}
                      className={`w-full py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all font-black uppercase text-[10px] ${agreedToTerms ? 'bg-cyan hover:bg-cyan/90 text-bg' : 'bg-line text-muted opacity-50'}`}
                    >
                      <span className="flex-1 text-center">
                        {isReserved ? 'Reserve Your Seat' : 'Enrol Now'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 mr-2" />
                    </button>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2.5">
                        <input 
                          type="checkbox" 
                          id="terms-check"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-0.5 accent-cyan w-3 h-3 cursor-pointer" 
                        />
                        <label htmlFor="terms-check" className="text-[11px] text-muted leading-tight cursor-pointer font-medium">
                          I accept the <span className="text-cyan underline">terms of agreement</span> and the <span className="text-cyan underline">cancellation policy</span>
                        </label>
                      </div>
                      {course.cancellationPolicy && (
                        <div className="p-3 bg-bg/50 border border-line rounded-xl text-[9px] text-muted leading-relaxed font-medium italic">
                          <strong>Cancellation:</strong> {course.cancellationPolicy}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
