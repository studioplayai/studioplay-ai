import React from 'react';
import { Icons } from './Icons';
import { AppLanguage } from '../types';
import { TRANSLATIONS } from '../translations';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPlan: (planId: string) => void;
    language: AppLanguage;
}

const PricingCard: React.FC<{ 
    title: string; 
    subtitle: string; 
    price: number; 
    features: string[]; 
    isPopular?: boolean; 
    onSelect: () => void; 
    chooseText: string; 
    cancelText: string; 
    isHebrew: boolean;
}> = ({ title, subtitle, price, features, isPopular, onSelect, chooseText, cancelText, isHebrew }) => (
    <div 
        className={`relative rounded-[32px] p-1 transition-all duration-300 hover:scale-[1.02] cursor-pointer group flex flex-col h-full ${isPopular ? 'bg-gradient-to-b from-yellow-400 via-orange-500 to-purple-600 shadow-[0_0_50px_-10px_rgba(234,179,8,0.4)] ring-1 ring-yellow-400/50 z-10' : 'bg-slate-800/80 border border-white/5 hover:border-white/20'}`}
        onClick={onSelect}
    >
        {isPopular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-2 whitespace-nowrap">
                <Icons.Star className="w-3 h-3 fill-black"/> MOST POPULAR
            </div>
        )}
        <div className={`h-full rounded-[28px] p-6 flex flex-col items-center text-center ${isPopular ? 'bg-[#120f0d]/95' : 'bg-slate-900/95'}`}>
            <h3 className={`text-xl font-black mb-1 ${isPopular ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500' : 'text-white'}`}>{title}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{subtitle}</p>
            <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black text-white">{price}</span>
                <span className="text-xl font-bold text-slate-400">₪</span>
            </div>
            <div className="text-[10px] text-slate-500 mb-6">/ month</div>
            <div className="w-full h-px bg-white/10 mb-6"></div>
            <ul className="space-y-3 w-full mb-8 flex-1">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 rtl:text-right ltr:text-left text-xs text-slate-300">
                        <div className={`mt-0.5 rounded-full p-0.5 shrink-0 ${isPopular ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 text-slate-400'}`}>
                            <Icons.Check className="w-2.5 h-2.5" />
                        </div>
                        <span className="font-medium">{feature}</span>
                    </li>
                ))}
            </ul>
            <button className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isPopular ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:shadow-lg hover:shadow-yellow-500/25' : 'bg-white text-slate-900 hover:bg-slate-200'}`}>
                {chooseText}
            </button>
            <p className="text-[9px] text-slate-500 mt-4 flex items-center gap-1"><Icons.Refresh className="w-2.5 h-2.5"/> {cancelText}</p>
        </div>
    </div>
);

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSelectPlan, language }) => {
    if (!isOpen) return null;

    const t = (key: string) => {
        // @ts-ignore
        return TRANSLATIONS[language][key] || key;
    };

    const isHebrew = language === 'he';

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 font-heebo" dir={isHebrew ? 'rtl' : 'ltr'}>
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
            
            <div className="relative w-full max-w-6xl bg-slate-900/40 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden p-8 md:p-12 animate-in zoom-in-95 duration-300">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-4">
                        <Icons.Zap className="w-3.5 h-3.5" /> {t('pricingTitle')}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">{t('pricingDesc')}</h2>
                    <p className="text-slate-400 text-lg">{isHebrew ? 'המשך ליצור ללא מגבלות עם החבילה המתאימה לך' : 'Continue creating without limits with the right plan'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    <PricingCard 
                        title={t('planBasic')} 
                        subtitle={t('planBasicSub')} 
                        price={39.95} 
                        chooseText={t('subscribe')} 
                        cancelText={t('cancelAnytime')} 
                        onSelect={() => onSelectPlan('basic')} 
                        isHebrew={isHebrew}
                        features={isHebrew ? ["35 קרדיטים חודשיים", "יצירת תמונות מקצועיות", "גישה לכל הכלים", "מתאים למשתמשים מתחילים"] : ["35 Monthly Credits", "Professional image creation", "Full tool access", "Great for beginners"]}
                    />
                    <PricingCard 
                        title={t('planPro')} 
                        subtitle={t('planProSub')} 
                        price={59.95} 
                        isPopular 
                        chooseText={t('subscribe')} 
                        cancelText={t('cancelAnytime')} 
                        onSelect={() => onSelectPlan('pro')} 
                        isHebrew={isHebrew}
                        features={isHebrew ? ["80 קרדיטים חודשיים", "עיבודים בעדיפות גבוהה", "אידיאלי ליוצרי תוכן", "ללא סימן מים (Watermark)"] : ["80 Monthly Credits", "Priority Processing", "Ideal for creators", "No Watermark"]}
                    />
                    <PricingCard 
                        title={t('planProMax')} 
                        subtitle={t('planProMaxSub')} 
                        price={89.99} 
                        chooseText={t('subscribe')} 
                        cancelText={t('cancelAnytime')} 
                        onSelect={() => onSelectPlan('promax')} 
                        isHebrew={isHebrew}
                        features={isHebrew ? ["120 קרדיטים חודשיים", "נפח עבודה מקסימלי", "תמיכה מועדפת", "שימוש מסחרי מלא"] : ["120 Monthly Credits", "Maximum workflow volume", "Priority support", "Full commercial rights"]}
                    />
                </div>

                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 text-slate-500 hover:text-white transition-colors"
                >
                    <Icons.X className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
};

export default PricingModal;