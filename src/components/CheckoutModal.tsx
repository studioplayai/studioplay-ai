import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { Button } from './Button';
import { User, AppLanguage } from '../types';
import { TRANSLATIONS } from '../translations';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    planId: string;
    user: User | null;
    onPaymentSuccess: (planId: string, amount: number, credits: number) => void;
    language: AppLanguage;
}

const PLAN_DATA: Record<string, { name: string, price: number, credits: number, desc: string, features: string[] }> = {
    'basic': { 
        name: 'Basic Plan', price: 39.95, credits: 35, desc: 'Perfect for getting started',
        features: ['35 Monthly Credits', 'Standard Processing', 'Full Tool Access']
    },
    'pro': { 
        name: 'Pro Plan', price: 59.95, credits: 80, desc: 'Most popular for creators',
        features: ['80 Monthly Credits', 'Priority Processing', 'Pro Badge', 'No Watermark']
    },
    'promax': { 
        name: 'Pro Max Plan', price: 89.99, credits: 120, desc: 'Professional agency power',
        features: ['120 Monthly Credits', 'Ultra-fast Processing', 'Agency Support', 'Full Commercial Rights']
    },
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, planId, user, onPaymentSuccess, language }) => {
    const [step, setStep] = useState<'cart' | 'payment' | 'processing' | 'success'>('cart');
    const [cardData, setCardData] = useState({ name: '', number: '', expiry: '', cvc: '' });
    const plan = PLAN_DATA[planId] || PLAN_DATA['pro'];
    
    const t = (key: string) => {
        // @ts-ignore
        return TRANSLATIONS[language][key] || key;
    };

    const isHebrew = language === 'he';

    useEffect(() => {
        if (isOpen) setStep('cart');
    }, [isOpen]);

    if (!isOpen) return null;

    const handleProcessPayment = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                onPaymentSuccess(planId, plan.price, plan.credits);
            }, 2500);
        }, 3000);
    };

    const formatCardNumber = (val: string) => {
        const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) return parts.join(' ');
        return v;
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 font-heebo" dir={isHebrew ? 'rtl' : 'ltr'}>
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-500" onClick={step !== 'processing' ? onClose : undefined}></div>
            
            <div className="relative w-full max-w-5xl bg-[#0a0f1d] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_-20px_rgba(139,92,246,0.4)] overflow-hidden flex flex-col min-h-[650px] animate-in zoom-in-95 duration-300">
                
                {/* Header with Steps */}
                {step !== 'success' && (
                    <div className="w-full bg-slate-900/50 p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Icons.Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-black text-white">Secure Checkout</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === 'cart' ? 'bg-purple-600 text-white ring-4 ring-purple-500/20' : 'bg-green-500/20 text-green-400'}`}>
                                    {step === 'cart' ? '1' : <Icons.Check className="w-4 h-4" />}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${step === 'cart' ? 'text-white' : 'text-slate-500'}`}>{isHebrew ? 'הסל שלי' : 'Cart'}</span>
                            </div>
                            <div className="w-8 h-px bg-white/10"></div>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === 'payment' || step === 'processing' ? 'bg-purple-600 text-white ring-4 ring-purple-500/20' : 'bg-slate-800 text-slate-500'}`}>2</div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${step === 'payment' || step === 'processing' ? 'text-white' : 'text-slate-500'}`}>{isHebrew ? 'תשלום' : 'Payment'}</span>
                            </div>
                        </div>

                        <button onClick={onClose} className="hidden md:block p-2 hover:bg-white/10 rounded-full transition-colors text-slate-500 hover:text-white">
                            <Icons.X className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {step === 'success' ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[radial-gradient(circle_at_50%_50%,_rgba(139,92,246,0.1),transparent_70%)]">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,197,94,0.4)] animate-bounce">
                            <Icons.Check className="w-12 h-12 text-white stroke-[4px]" />
                        </div>
                        <h2 className="text-5xl font-black text-white mb-6 animate-in slide-in-from-bottom-4 duration-700">{isHebrew ? 'התשלום בוצע בהצלחה!' : 'Order Confirmed!'}</h2>
                        <p className="text-xl text-slate-400 max-w-lg mx-auto mb-10 leading-relaxed">
                            {isHebrew 
                                ? `מעולה! הוספנו ${plan.credits} קרדיטים לחשבון שלך. הקבלה נשלחה אליך במייל. בוא ניצור משהו יוצא דופן.` 
                                : `Fantastic! We've added ${plan.credits} credits to your account. Your receipt has been sent to your email. Let's create something extraordinary.`}
                        </p>
                        <Button onClick={onClose} className="px-10 py-4 text-lg !rounded-2xl">{isHebrew ? 'התחל ליצור' : 'Start Creating'}</Button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                        
                        {/* LEFT/MAIN CONTENT */}
                        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar relative">
                            {step === 'processing' && (
                                <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-8"></div>
                                    <h3 className="text-3xl font-black text-white mb-3">{isHebrew ? 'מאמת עסקה...' : 'Verifying Transaction...'}</h3>
                                    <p className="text-slate-400">{isHebrew ? 'מעבד את התשלום מול חברת האשראי' : 'Securely processing with your bank'}</p>
                                </div>
                            )}

                            {step === 'cart' ? (
                                <div className="animate-in slide-in-from-left-8 duration-500">
                                    <h3 className="text-3xl font-black text-white mb-8">{isHebrew ? 'סיכום הסל שלך' : 'Review Your Cart'}</h3>
                                    
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Icons.Sparkles className="w-32 h-32 text-white" />
                                        </div>
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div>
                                                <div className="text-xs font-black text-purple-400 uppercase tracking-widest mb-2">{plan.name}</div>
                                                <div className="text-4xl font-black text-white mb-2">{plan.credits} Credits</div>
                                                <p className="text-slate-400">{plan.desc}</p>
                                            </div>
                                            <div className="text-4xl font-black text-white">₪{plan.price}</div>
                                        </div>
                                        <div className="h-px bg-white/10 my-8"></div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {plan.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                                    <div className="w-5 h-5 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400">
                                                        <Icons.Check className="w-3 h-3" />
                                                    </div>
                                                    {f}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <Icons.Shield className="w-8 h-8 text-green-500" />
                                            <div className="text-left rtl:text-right">
                                                <div className="text-sm font-bold text-white">Payment Secure</div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-widest">SSL Encrypted Transaction</div>
                                            </div>
                                        </div>
                                        <Button onClick={() => setStep('payment')} className="w-full sm:w-auto px-12 py-4 text-lg">
                                            {isHebrew ? 'המשך לתשלום' : 'Proceed to Payment'}
                                            <Icons.ChevronLeft className={`w-5 h-5 ltr:rotate-180 ${isHebrew ? 'mr-2' : 'ml-2'}`} />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-in slide-in-from-right-8 duration-500">
                                    <div className="flex items-center gap-4 mb-8">
                                        <button onClick={() => setStep('cart')} className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400">
                                            <Icons.ChevronLeft className={`w-6 h-6 ${isHebrew ? '' : 'rotate-180'}`} />
                                        </button>
                                        <h3 className="text-3xl font-black text-white">{isHebrew ? 'פרטי תשלום' : 'Payment Details'}</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{isHebrew ? 'שם על הכרטיס' : 'Cardholder Name'}</label>
                                            <input 
                                                type="text" 
                                                placeholder="ISRAEL ISRAELI"
                                                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white focus:border-purple-500 outline-none transition-all placeholder:text-slate-700 font-bold"
                                                value={cardData.name}
                                                onChange={e => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{isHebrew ? 'מספר כרטיס אשראי' : 'Card Number'}</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    placeholder="0000 0000 0000 0000"
                                                    maxLength={19}
                                                    className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white focus:border-purple-500 outline-none transition-all placeholder:text-slate-700 font-mono tracking-[0.2em] text-lg"
                                                    value={cardData.number}
                                                    onChange={e => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                                                />
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-2">
                                                    <div className="w-10 h-6 bg-slate-800 rounded border border-white/10 flex items-center justify-center"><Icons.CreditCard className="w-4 h-4 opacity-50" /></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{isHebrew ? 'תוקף' : 'Expiry'}</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="MM / YY"
                                                    maxLength={5}
                                                    className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white focus:border-purple-500 outline-none transition-all placeholder:text-slate-700 font-mono text-lg"
                                                    value={cardData.expiry}
                                                    onChange={e => {
                                                        let v = e.target.value.replace(/[^0-9]/g, '');
                                                        if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                                                        setCardData({...cardData, expiry: v});
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CVC</label>
                                                <input 
                                                    type="password" 
                                                    placeholder="•••"
                                                    maxLength={3}
                                                    className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white focus:border-purple-500 outline-none transition-all placeholder:text-slate-700 font-mono text-lg"
                                                    value={cardData.cvc}
                                                    onChange={e => setCardData({...cardData, cvc: e.target.value.replace(/[^0-9]/g, '')})}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <button 
                                                onClick={handleProcessPayment}
                                                disabled={!cardData.number || !cardData.name || cardData.cvc.length < 3}
                                                className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black py-5 rounded-[1.5rem] shadow-[0_20px_50px_-10px_rgba(168,85,247,0.5)] transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:scale-100"
                                            >
                                                <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[45deg] -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
                                                <span className="flex items-center justify-center gap-3 text-xl">
                                                    {isHebrew ? `בצע תשלום - ₪${plan.price}` : `Confirm Payment - ₪${plan.price}`}
                                                    <Icons.Lock className="w-5 h-5 opacity-70" />
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT SIDEBAR: ORDER SUMMARY (Always Visible on MD+) */}
                        <div className="w-full md:w-[380px] bg-slate-900/80 p-8 md:p-10 border-t md:border-t-0 ltr:md:border-l rtl:md:border-r border-white/10 flex flex-col">
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">{isHebrew ? 'סיכום הזמנה' : 'Order Summary'}</h4>
                            
                            <div className="space-y-6 flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-white font-bold">{plan.name}</div>
                                        <div className="text-xs text-slate-500 mt-1">{plan.credits} Credits included</div>
                                    </div>
                                    <div className="text-white font-bold">₪{plan.price}</div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{isHebrew ? 'מע"מ (17%)' : 'VAT (17%)'}</span>
                                    <span className="text-slate-300">₪0.00</span>
                                </div>
                                <div className="h-px bg-white/5"></div>
                                <div className="flex justify-between items-baseline pt-4">
                                    <span className="text-lg font-bold text-white">{isHebrew ? 'סה"כ' : 'Total'}</span>
                                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">₪{plan.price}</div>
                                </div>
                            </div>

                            <div className="mt-12 space-y-4">
                                <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase tracking-widest bg-black/30 p-4 rounded-xl border border-white/5">
                                    <Icons.Shield className="w-4 h-4 text-green-500" />
                                    <span>{isHebrew ? 'התשלום מאובטח בתקן PCI-DSS' : 'Fully Secured via PCI-DSS'}</span>
                                </div>
                                <div className="flex justify-center gap-4 opacity-30 grayscale">
                                    <div className="w-10 h-6 bg-white rounded-sm"></div>
                                    <div className="w-10 h-6 bg-white rounded-sm"></div>
                                    <div className="w-10 h-6 bg-white rounded-sm"></div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutModal;