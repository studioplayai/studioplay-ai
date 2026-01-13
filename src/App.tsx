const LS_CHECKOUT_DOMAIN = "https://checkout.studioplayai.com";
import React, { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { AppState, GeneratedItem, ProcessingStatus, TOOLS_CATEGORIES, ToolMode, TOOL_PRESETS, CampaignSettings, ReelsVideoSettings, MoodSettings, TemplateBuilderSettings, AppLanguage, User, HEBREW_FONTS, TEXT_LAYOUTS, COLLAGE_LAYOUTS, MarketingIdeas } from './types';
import { processImageWithGemini, enhanceUserPrompt, generateStrategicMarketingPlan, generateMarketingIdeas } from './services/geminiService';
import { generateVideoFromImage } from './services/veoService';
import { generateCollageImage } from './services/canvasService';
import { getCurrentUser, updateUserCredits, logout, updateHeartbeat, login, ADMIN_EMAIL } from './services/authService';
import { processSuccessfulPayment } from './services/paymentService';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { Icons } from './components/Icons';
import { Button } from './components/Button';
import { ImageEditor } from './components/ImageEditor';
import { Workspace } from './components/Workspace';
import { UserDashboard } from './components/UserDashboard';
import { TRANSLATIONS } from './translations';

// LocalStorage keys / plan ids (used in handleBuy)
const LS_BASIC = 'basic';
const LS_PRO = 'pro';
const LS_PRO_MAX = 'promax';


// Lazy loaded components
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const PrivacyPolicyModal = lazy(() => import('./components/PrivacyPolicyModal'));
const RefundPolicyModal = lazy(() => import('./components/RefundPolicyModal'));
const TermsOfServiceModal = lazy(() => import('./components/TermsOfServiceModal'));
const AboutUsModal = lazy(() => import('./components/AboutUsModal'));
const ContactModal = lazy(() => import('./components/ContactModal'));
const PricingModal = lazy(() => import('./components/PricingModal'));
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const SocialShareModal = lazy(() => import('./components/SocialShareModal'));

const useTranslation = (lang: AppLanguage) => {
    return useCallback((key: string, section?: keyof typeof TRANSLATIONS.he) => {
        const dict = TRANSLATIONS[lang];
        if (section && (dict as any)[section] && (dict as any)[section][key]) {
            return (dict as any)[section][key];
        }
        return (dict as any)[key] || key;
    }, [lang]);
};

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'scissors': return <Icons.Scissors />;
    case 'camera': return <Icons.Camera />;
    case 'image': return <Icons.Image />;
    case 'wand': return <Icons.Wand />;
    case 'palette': return <Icons.Palette />;
    case 'scan': return <Icons.Scan />;
    case 'sun': return <Icons.Sun />;
    case 'blur': return <Icons.Blur />;
    case 'layers': return <Icons.Layers />;
    case 'megaphone': return <Icons.Megaphone />;
    case 'layout': return <Icons.Layout />;
    case 'star': return <Icons.Star />;
    case 'grid': return <Icons.Grid />;
    case 'box': return <Icons.Box />;
    case 'feather': return <Icons.Feather />;
    case 'brush': return <Icons.Brush />;
    case 'film': return <Icons.Film />;
    case 'send': return <Icons.Send />;
    case 'split': return <Icons.LayoutSplit />;
    case 'three': return <Icons.LayoutThree />;
    case 'type': return <Icons.Type />;
    case 'lightbulb': return <Icons.Lightbulb />;
    default: return <Icons.Sparkles />;
  }
};

const FeatureLargeCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, color: string }> = ({ icon, title, desc, color }) => (
    <div className="bg-slate-900/40 border border-white/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-right hover:bg-slate-800/60 transition-all hover:scale-[1.02] group h-full flex flex-col relative overflow-hidden backdrop-blur-md">
        <div className={`absolute -top-10 -left-10 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl group-hover:bg-${color}-500/20 transition-all`}></div>
        <div className={`w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-${color}-400 group-hover:scale-110 group-hover:text-${color}-300 transition-all shadow-xl border border-white/5`}>
            {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6 md:w-8 md:h-8' })}
        </div>
        <h3 className="text-xl md:text-2xl font-black mb-3 text-white tracking-tight">{title}</h3>
        <p className="text-xs md:text-sm text-slate-400 leading-relaxed flex-1">{desc}</p>
        <div className={`mt-6 w-8 h-1 bg-${color}-500 rounded-full group-hover:w-16 transition-all`}></div>
    </div>
);

const AudienceCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
    <div className="bg-slate-900/30 border border-white/5 p-6 md:p-8 rounded-[1.5rem] text-center hover:bg-white/5 transition-all h-full">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600/10 rounded-full flex items-center justify-center mb-4 mx-auto text-purple-400">
            {icon}
        </div>
        <h3 className="text-lg md:text-xl font-black mb-3 text-white">{title}</h3>
        <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{desc}</p>
    </div>
);

const StepCard: React.FC<{ number: string, title: string, desc: string }> = ({ number, title, desc }) => (
    <div className="bg-slate-900/30 border border-white/5 p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] text-right flex flex-col gap-3 relative group overflow-hidden h-full">
        <div className="text-5xl md:text-7xl font-black text-white/5 absolute top-6 left-6 group-hover:text-purple-500/10 transition-colors pointer-events-none">{number}</div>
        <h3 className="text-xl md:text-2xl font-black text-white relative z-10">{title}</h3>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed relative z-10">{desc}</p>
    </div>
);

const PricingCard: React.FC<{ 
    title: string; 
    subtitle: string; 
    price: string; 
    features: string[]; 
    isPopular?: boolean; 
    onSelect: () => void; 
    buttonText: string;
    lang: AppLanguage;
}> = ({ title, subtitle, price, features, isPopular, onSelect, buttonText, lang }) => (
    <div className={`relative rounded-[2rem] md:rounded-[2.5rem] p-0.5 flex flex-col h-full transition-all duration-300 ${isPopular ? 'bg-gradient-to-b from-yellow-400 via-orange-500 to-purple-600 shadow-[0_0_50px_-10px_rgba(234,179,8,0.4)] z-10 scale-[1.02]' : 'bg-slate-900/30 border border-white/5'}`}>
        {isPopular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap z-20">
                <Icons.Star className="w-3 h-3 fill-black"/> MOST POPULAR <Icons.Star className="w-3 h-3 fill-black"/>
            </div>
        )}
        <div className={`relative z-10 h-full rounded-[1.9rem] md:rounded-[2.3rem] p-6 md:p-10 flex flex-col ${isPopular ? 'bg-[#120f0d]' : 'bg-transparent'}`}>
            <h3 className={`text-xl md:text-2xl font-black mb-1 ${isPopular ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500' : 'text-white'}`}>{title}</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">{subtitle}</p>
            <div className="flex items-baseline gap-2 mb-6">
                <span className="text-xl font-black text-slate-400">₪</span>
                <span className="text-4xl md:text-5xl font-black text-white">{price}</span>
                <span className="text-xs text-slate-500">/ month</span>
            </div>
            <div className="space-y-3 md:space-y-4 mb-10 flex-1">
                {features.map((f, i) => (
                    <div key={i} className="flex items-center justify-end gap-3 text-xs md:text-sm text-slate-300">
                        {f} <Icons.CheckCircle className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isPopular ? 'text-yellow-500' : 'text-purple-500'}`} />
                    </div>
                ))}
            </div>
            <button 
                onClick={onSelect}
                className={`w-full py-3 md:py-4 rounded-xl font-black text-sm md:text-base transition-all ${isPopular ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg hover:shadow-yellow-500/20' : 'border border-white/20 text-white hover:bg-white/5'}`}
            >
                {buttonText}
            </button>
        </div>
    </div>
);

const ShowcaseCard: React.FC<{ image: string, tag: string, label: string, rotate?: string }> = ({ image, tag, label, rotate = "0deg" }) => (
    <div 
      className="relative w-48 h-64 md:w-64 md:h-80 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl flex-shrink-0 group hover:scale-105 transition-transform duration-500 mx-3 md:mx-4"
      style={{ transform: `rotate(${rotate})` }}
    >
        <img src={image} alt={label} className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
        <div className="absolute bottom-6 left-6 right-6 text-right">
            <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-purple-400 mb-1">{tag}</div>
            <div className="text-xl md:text-2xl font-black text-white">{label}</div>
        </div>
        <div className="absolute inset-0 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] pointer-events-none"></div>
    </div>
);

const ScrollingShowcase: React.FC = () => {
    const samplesRow1 = [
        { image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop', tag: 'AI Generated', label: 'Watch', rotate: '-2deg' },
        { image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop', tag: 'AI Generated', label: 'Sneakers', rotate: '1deg' },
        { image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop', tag: 'AI Generated', label: 'Tech', rotate: '-1deg' },
        { image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop', tag: 'AI Generated', label: 'Shoes', rotate: '2deg' },
        { image: 'https://images.unsplash.com/photo-1505751172107-160a373b578c?q=80&w=600&auto=format&fit=crop', tag: 'AI Generated', label: 'Headphones', rotate: '-1deg' },
    ];

    const samplesRow2 = [
        { image: 'https://images.unsplash.com/photo-1584917062255-c81121d1e72b?q=80&w=600&auto=format&fit=crop', tag: 'Studio Quality', label: 'Bag', rotate: '-2deg' },
        { image: 'https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?q=80&w=600&auto=format&fit=crop', tag: 'AI Generated', label: 'Cream', rotate: '1deg' },
        { image: 'https://images.unsplash.com/photo-1511499767390-a8a1962ae007?q=80&w=600&auto=format&fit=crop', tag: 'Studio Quality', label: 'Glasses', rotate: '3deg' },
        { image: 'https://images.unsplash.com/photo-1526170315870-ef68460d28ed?q=80&w=600&auto=format&fit=crop', tag: 'AI Generated', label: 'Tech', rotate: '1deg' },
        { image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=600&auto=format&fit=crop', tag: 'AI Generated', label: 'Style', rotate: '-2deg' },
    ];

    return (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-10 flex flex-col gap-4 md:gap-6">
            <div className="flex animate-scroll-left whitespace-nowrap">
                {[...samplesRow1, ...samplesRow1, ...samplesRow1, ...samplesRow1, ...samplesRow1].map((sample, idx) => (
                    <ShowcaseCard key={`r1-${idx}`} {...sample} />
                ))}
            </div>
            <div className="flex animate-scroll-right whitespace-nowrap">
                {[...samplesRow2, ...samplesRow2, ...samplesRow2, ...samplesRow2, ...samplesRow2].map((sample, idx) => (
                    <ShowcaseCard key={`r2-${idx}`} {...sample} />
                ))}
            </div>
        </div>
    );
};

const VideoGenerationOverlay: React.FC<{ progress: number, status: string, lang: AppLanguage, tool: ToolMode }> = ({ progress, status, lang, tool }) => {
    const statusMessages: Record<string, { he: string, en: string }> = {
        'INITIALIZING': { he: 'מכין את הסטודיו...', en: 'Preparing the studio...' },
        'STRATEGIZING': { he: 'מתכנן אסטרטגיה שיווקית חכמה...', en: 'Planning smart marketing strategy...' },
        'ANALYZING': { he: 'מנתח את התמונה והקומפוזיציה...', en: 'Analyzing image and composition...' },
        'MOTION_PLANNING': { he: 'מתכנן את תנועת המצלמה...', en: 'Planning camera motion...' },
        'RENDERING': { he: 'יוצר תוצאה באיכות גבוהה...', en: 'Generating high-quality result...' },
        'FINALIZING': { he: 'מעבד את התוצר הסופי...', en: 'Processing final output...' },
        'DOWNLOADING': { he: 'מוריד את התוצאה...', en: 'Downloading result...' },
        'COMPLETED': { he: 'הכל מוכן!', en: 'Everything is ready!' }
    };

    const getTitle = () => {
        if (tool === ToolMode.AI_SMART_IDEAS) return lang === 'he' ? 'בונה אסטרטגיה שיווקית' : 'Building Marketing Strategy';
        if (tool === ToolMode.SOCIAL_POST) return lang === 'he' ? 'מעצב פוסט שיווקי חכם' : 'Designing Smart Magic Post';
        if (tool === ToolMode.REELS_GENERATOR) return lang === 'he' ? 'יוצר את הוידאו שלך' : 'Creating Your Video';
        if (tool === ToolMode.MOCKUP_GENERATOR) return lang === 'he' ? 'מעבד מוקאפ חכם...' : 'Processing Smart Mockup...';
        return lang === 'he' ? 'מעבד את הקסם...' : 'Processing Magic...';
    };

    const currentMsg = statusMessages[status] || statusMessages['RENDERING'];
    const displayMsg = lang === 'he' ? currentMsg.he : currentMsg.en;

    const Icon = tool === ToolMode.AI_SMART_IDEAS ? Icons.Lightbulb : (tool === ToolMode.REELS_GENERATOR ? Icons.Film : Icons.Sparkles);

    return (
        <div className="absolute inset-0 z-[45] bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center rounded-[2rem]">
            <div className="relative w-24 h-24 md:w-28 md:h-28 mb-8 md:mb-10">
                <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-500 rounded-full animate-spin border-t-transparent shadow-[0_0_20px_rgba(168,85,247,0.5)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-purple-400 animate-pulse" />
                </div>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white mb-3 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                {getTitle()}
            </h2>
            <p className="text-purple-300 font-bold mb-6 h-6 text-xs md:text-sm">{displayMsg}</p>
            <div className="w-full max-w-xs bg-slate-900 h-2.5 md:h-3 rounded-full border border-white/10 overflow-hidden relative mb-3">
                <div 
                    className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                    style={{ width: `${progress}%` }}
                ></div>
                <div className="absolute inset-0 bg-white/10 animate-shimmer skew-x-[-20deg]"></div>
            </div>
            <div className="flex justify-between w-full max-w-xs text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
                <span>{progress}%</span>
                <span>{lang === 'he' ? 'מעבד...' : 'Processing...'}</span>
            </div>
        </div>
    );
};

const getInitialState = (): AppState => ({
  appLanguage: 'he',
  originalImage: null,
  generatedItems: [],
  status: ProcessingStatus.IDLE,
  currentTool: ToolMode.AI_SMART_IDEAS,
  errorMessage: null,
  promptInput: '',
  selectedOption: null,
  campaignSettings: { 
    showText: false, title: '', price: '', discount: '', style: 'יוקרתי', aspectRatio: '1:1', language: 'hebrew', textStyle: 'modern', font: 'Heebo',
    titleTransform: { x: 50, y: 30, scale: 1, rotation: 0 },
    priceTransform: { x: 50, y: 50, scale: 1, rotation: 0 },
    discountTransform: { x: 50, y: 70, scale: 1, rotation: 0 }
  },
  socialPostSettings: { language: 'hebrew' },
  reelsVideoSettings: { logo: null, caption: '', style: 'zoom_in', aspectRatio: '9:16' },
  selectedTemplateId: null,
  marketingNiche: 'fashion',
  marketingCopy: null, 
  marketingVariations: null,
  collageImages: [],
  activeCollageLayout: 'grid-2x2',
  collageAspectRatio: '1:1',
  moodSettings: { style: 'Modern Clean', aspectRatio: '1:1' },
  templateBuilderSettings: { creationType: 'post', aspectRatio: '1:1', style: 'מודרני ונקי (Modern)', primaryColor: '#8b5cf6', headline: '', ctaText: 'SHOP NOW', font: 'Heebo' },
  showWatermark: true,
  watermarkPosition: { x: 3, y: 97 }, 
  savedPresets: [],
  enableDeepThinking: false,
  showAuthModal: false,
  showAdminDashboard: false,
  generatedIdeas: null
});

const LandingPage: React.FC<{ onStart: () => void, language: AppLanguage, setLanguage: (lang: AppLanguage) => void, onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void, onOpenPrivacy: () => void, onOpenRefund: () => void, onOpenTOS: () => void, onOpenAbout: () => void, onOpenContact: () => void }> = ({ onStart, language, setLanguage, onUpload, onOpenPrivacy, onOpenRefund, onOpenTOS, onOpenAbout, onOpenContact }) => {
  const t = useTranslation(language);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const LS_BASIC   = "https://app.lemonsqueezy.com/share/726853";
  const LS_PRO     = "https://YOUR-LEMON-DOMAIN/checkout/buy/YYYYYYYY";
  const LS_PRO_MAX = "https://YOUR-LEMON-DOMAIN/checkout/buy/ZZZZZZZZ";





  return (
    <div className={`min-h-screen flex flex-col relative overflow-x-hidden text-slate-100 font-heebo bg-[#050810]`}>
      <div className="fixed top-0 left-0 right-0 h-[800px] bg-[radial-gradient(circle_at_50%_0%,_rgba(139,92,246,0.15),transparent_70%)] pointer-events-none z-0"></div>
      
      <nav className="relative z-20 px-4 md:px-6 py-4 md:py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Icons.Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight">StudioPlay<span className="text-purple-400">AI</span></span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
                <button onClick={onStart} className="hover:text-white transition-colors">{t('enterSystem')}</button>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md rounded-full p-0.5 md:p-1 flex items-center border border-white/5 shadow-inner">
                <button 
                  onClick={() => setLanguage('he')} 
                  className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-black transition-all duration-300 ${language === 'he' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  עברית
                </button>
                <button 
                  onClick={() => setLanguage('en')} 
                  className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-black transition-all duration-300 ${language === 'en' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  English
                </button>
            </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center pt-8 md:pt-12 pb-20 px-4 text-center max-w-7xl mx-auto w-full">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 px-4 md:px-5 py-2 rounded-full mb-6 md:mb-8 backdrop-blur-md cursor-pointer group" onClick={onStart}>
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span></span>
            <span className="text-[10px] md:text-xs font-bold tracking-wide text-white group-hover:text-pink-200 transition-colors">{t('giftBadge')}</span>
            <Icons.ChevronLeft className="w-3 h-3 text-white/50 group-hover:-translate-x-1 transition-transform rtl:group-hover:translate-x-1" />
        </div>

        <h1 className="text-3xl md:text-8xl font-black tracking-tight mb-4 md:mb-6 leading-[1.1] md:leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 max-w-5xl">
            {t('heroTitle')} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
                {t('heroSubtitle')}
            </span>
        </h1>

        <p className="text-sm md:text-xl text-slate-400 max-w-2xl mb-8 md:mb-12 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {t('heroDesc')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 md:gap-5 w-full justify-center items-center mb-16 md:mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <button onClick={onStart} className="group relative px-8 md:px-10 py-4 md:py-5 bg-white text-slate-900 rounded-[1.5rem] md:rounded-[2rem] font-black text-lg md:text-xl hover:scale-105 transition-all duration-300 shadow-[0_15px_40px_-10px_rgba(255,255,255,0.4)] w-full sm:w-auto overflow-hidden">
                <div className="relative flex flex-col items-center leading-none">
                    <span className="flex items-center justify-center gap-3">
                        {t('startFree')} <Icons.Gift className="w-5 h-5 md:w-6 md:h-6 text-pink-600"/>
                    </span>
                    <span className="text-[9px] md:text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mt-1.5">
                        {t('startFreeSubtitle')}
                    </span>
                </div>
            </button>
            <button className="px-8 md:px-10 py-4 md:py-5 bg-slate-900/50 border border-white/10 text-white rounded-[1.5rem] md:rounded-[2rem] font-bold text-lg md:text-xl hover:bg-slate-800 transition-all w-full sm:w-auto backdrop-blur-sm">
                {t('seeExamples')}
            </button>
        </div>

        <div className="w-full max-w-7xl mb-24 md:mb-40">
            <div className="text-center mb-10 md:mb-16">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 md:mb-6 tracking-tight">הכלים העוצמתיים שלנו</h2>
                <p className="text-slate-500 text-base md:text-xl">כל מה שהעסק שלך צריך כדי להתבלט ברשתות החברתיות</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                <FeatureLargeCard icon={<Icons.Film />} color="blue" title={t('featureVideo')} desc={t('featureVideoDesc')} />
                <FeatureLargeCard icon={<Icons.Wand />} color="purple" title={t('featureCampaign')} desc={t('featureCampaignDesc')} />
                <FeatureLargeCard icon={<Icons.Scissors />} color="pink" title={t('featureBG')} desc={t('featureBGDesc')} />
                <FeatureLargeCard icon={<Icons.Box />} color="orange" title={t('toolMockup')} desc={t('featureEcommerceDesc')} />
                <FeatureLargeCard icon={<Icons.Scan />} color="green" title={t('featureEnhance')} desc={t('featureEnhanceDesc')} />
                <FeatureLargeCard icon={<Icons.Layout />} color="yellow" title={t('featureSocial')} desc={t('featureSocialDesc')} />
            </div>
        </div>

        <div className="w-full max-w-5xl mb-24 md:mb-32 px-2">
            <div className="text-center mb-8 md:mb-10">
                <div className="text-[9px] md:text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-2 md:mb-3">{t('demoSimulation')}</div>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-3 md:mb-4">{t('demoTitle')}</h2>
                <p className="text-slate-500 text-sm md:text-lg">{t('demoSubtitle')}</p>
            </div>
            
            <div className="bg-slate-900/30 border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 backdrop-blur-xl relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/5 to-transparent rounded-[2rem] md:rounded-[3rem]"></div>
                <div className="relative z-10 border-2 border-dashed border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-10 md:p-24 flex flex-col items-center justify-center hover:border-purple-500/30 transition-colors">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform">
                        <Icons.Upload className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
                    </div>
                    <h3 className="text-xl md:text-3xl font-black text-white mb-2">{t('demoDropText')}</h3>
                    <div className="text-slate-500 font-bold mb-6 md:mb-8 uppercase tracking-widest text-xs md:sm">{t('demoOr')}</div>
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="bg-white text-slate-900 px-8 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:scale-105 transition-transform shadow-xl"
                    >
                        {t('demoButton')}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                          onUpload(e);
                          onStart();
                      }} 
                    />
                </div>
            </div>
        </div>

        <ScrollingShowcase />

        <div className="w-full max-w-7xl mt-24 md:mt-32 mb-24 md:mb-40">
            <div className="text-center mb-10 md:mb-16">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-4 md:mb-6 tracking-tight">{t('targetAudienceTitle')}</h2>
                <p className="text-slate-500 text-base md:text-xl">{t('targetAudienceSubtitle')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                <AudienceCard icon={<Icons.LayoutGrid className="w-6 h-6 md:w-7 md:h-7"/>} title={t('target1Title')} desc={t('target1Desc')} />
                <AudienceCard icon={<Icons.Wand className="w-6 h-6 md:w-7 md:h-7"/>} title={t('target2Title')} desc={t('target2Desc')} />
                <AudienceCard icon={<Icons.Feather className="w-6 h-6 md:w-7 md:h-7"/>} title={t('target3Title')} desc={t('target3Desc')} />
                <AudienceCard icon={<Icons.Megaphone className="w-6 h-6 md:w-7 md:h-7"/>} title={t('target4Title')} desc={t('target4Desc')} />
            </div>
        </div>

        <div className="w-full max-w-7xl mb-24 md:mb-40">
            <div className="text-center mb-10 md:mb-20">
                <h2 className="text-4xl md:text-7xl font-black text-white mb-4 md:mb-6 tracking-tight">{t('howItWorks')}</h2>
                <p className="text-slate-500 text-base md:text-xl">{t('howItWorksDesc')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <StepCard number="01" title={t('step1Title')} desc={t('step1Desc')} />
                <StepCard number="02" title={t('step2Title')} desc={t('step2Desc')} />
                <StepCard number="03" title={t('step3Title')} desc={t('step3Desc')} />
            </div>
        </div>

        <div className="w-full max-w-7xl mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] md:text-xs font-bold mb-6 md:mb-8">
                <Icons.Zap className="w-4 h-4" /> חבילות חודשיות
            </div>
            <div className="text-right mb-10 md:mb-20">
                <h2 className="text-4xl md:text-7xl font-black text-white mb-4 md:mb-6 tracking-tight leading-tight">בחר את החבילה המתאימה לך ושדרג את העסק שלך עוד היום</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 items-stretch px-2 md:px-0">
                <PricingCard 
                    title={t('planProMax')}
                    subtitle={t('planProMaxSub')}
                    price="89.99"
                    features={[t('selectedImages'), 'נפח עבודה מקסימלי', 'תמיכה מועדפת', 'יצירת תוכן בקנה מידה גדול']}
                    onSelect={() => (window.location.href = LS_PRO_MAX)}
                    buttonText={t('subscribe')}
                    lang={language}
                />
                <PricingCard 
                    title={t('planPro')}
                    subtitle={t('planProSub')}
                    price="59.95"
                    isPopular
                    features={['80 קרדיטים חודשיים', 'יותר חופש ויצירתיות', 'אידיאלי ליוצרי תוכן ומשפיענים', 'עבודה שוטפת ללא מגבלות']}
                    onSelect={() => (window.location.href = LS_PRO)}
                    buttonText={t('subscribe')}
                    lang={language}
                />
                <PricingCard 
                    title={t('planBasic')}
                    subtitle={t('planBasicSub')}
                    price="39.95"
                    features={['35 קרדיטים חודשיים', 'יצירת תמונות ועיצובים מקצועיים', 'גישה מלאה למערכת', 'מתאים למשתמשים מתחילים']}
                    onSelect={() => (window.location.href = LS_BASIC)}
                    buttonText={t('subscribe')}
                    lang={language}
                />
            </div>
            <p className="mt-8 md:mt-12 text-center text-slate-600 text-xs md:text-sm">{t('cancelAnytime')}</p>
        </div>
      </main>

      <footer className="relative bg-[#050810] border-t border-white/5 py-10 md:py-16 px-6 z-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10">
              <div className="flex items-center gap-2 opacity-80">
                  <div className="w-6 h-6 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                    <Icons.Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-slate-300">StudioPlay AI</span>
              </div>
              <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-xs md:text-sm text-slate-500">
                  <button className="hover:text-white transition-colors" onClick={onOpenAbout}>{t('aboutUs')}</button>
                  <button className="hover:text-white transition-colors" onClick={onOpenTOS}>{t('termsOfService')}</button>
                  <button className="hover:text-white transition-colors" onClick={onOpenPrivacy}>{t('privacyPolicy')}</button>
                  <button className="hover:text-white transition-colors" onClick={onOpenRefund}>{t('refundPolicy')}</button>
                  <button className="hover:text-white transition-colors" onClick={onOpenContact}>{t('contactUs')}</button>
              </div>
              <div className="text-[10px] md:text-xs text-slate-600">{t('footerRights')}</div>
          </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {

  


  const [state, setState] = useState<AppState>(getInitialState());
  const t = useTranslation(state.appLanguage);
  const [user, setUser] = useState<User | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(TOOLS_CATEGORIES[0].id);
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showUserDashboard, setShowUserDashboard] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);
  const [showTOS, setShowTOS] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false); 
  const [showGallery, setShowGallery] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeResultUrl, setActiveResultUrl] = useState<string | null>(null);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTarget, setShareTarget] = useState<GeneratedItem | null>(null);

  const [hasUserApiKey, setHasUserApiKey] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoStatus, setVideoStatus] = useState('INITIALIZING');

  const [showPricingModal, setShowPricingModal] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string>('pro');
  const [showCheckout, setShowCheckout] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const replaceInputRef = useRef<HTMLInputElement>(null);
  const collageInputRef = useRef<HTMLInputElement>(null);
  const updateState = (updates: Partial<AppState>) => setState(prev => ({ ...prev, ...updates }));


   useEffect(() => {
  console.log("AUTH MARKER ✅ useEffect ran", window.location.href);

  // 🧹 Silence noisy AbortError (does NOT hide real errors)
const abortHandler = (event: PromiseRejectionEvent) => {
  const reason: any = (event as any).reason;
  if (
    reason?.name === "AbortError" ||
    String(reason).includes("AbortError")
  ) {
    event.preventDefault();
  }
};

window.addEventListener("unhandledrejection", abortHandler);

return () => {
  window.removeEventListener("unhandledrejection", abortHandler);
};




   if (!isSupabaseConfigured()) return;

   // ✅ Manual hash -> session (fallback when detectSessionInUrl fails)
(async () => {
  try {
    const hash = window.location.hash || "";
    if (hash.includes("access_token=") && hash.includes("refresh_token=")) {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const access_token = params.get("access_token") || "";
      const refresh_token = params.get("refresh_token") || "";

      console.log("AUTH: hash tokens found", {
        hasAccess: !!access_token,
        hasRefresh: !!refresh_token,
      });

      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        console.log("AUTH: setSession result", { ok: !!data?.session, error });

        // ניקוי hash כדי שלא יחזור שוב ברענון
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname + window.location.search
        );
      }
    }
  } catch (e) {
    console.error("AUTH: setSession from hash failed", e);
  }
})();
// ✅ Lightweight bootstrap: אם כבר יש session – להדליק isStarted



    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
  console.log("AUTH: onAuthStateChange", _event, session?.user?.email);

  try {
  if (session?.user) {
  // 🔥 נכנסים לאפליקציה מיד
  setIsStarted(true);

  const email = session.user.email || "";
  const name =
    (session.user.user_metadata?.full_name as string) ||
    (session.user.user_metadata?.name as string) ||
    "";

  try {
    await login(email, name);
  } catch (e) {
    console.error("login() failed (ignored)", e);
  }
}

} catch (e) {
  console.error("onAuthStateChange failed", e);
}

});


    return () => sub.subscription.unsubscribe();
  }, []);

  const checkApiKey = useCallback(async () => {
  const aistudio = (window as any).aistudio;

  if (aistudio?.hasSelectedApiKey) {
    const hasKey = await aistudio.hasSelectedApiKey();
    setHasUserApiKey(hasKey);
    return hasKey;
  }

  return false;
}, []);


  useEffect(() => {
    document.documentElement.dir = state.appLanguage === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = state.appLanguage;
  }, [state.appLanguage]);

  useEffect(() => {
    const handlePaymentRedirect = async () => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment_success') === 'true') {
            const planId = params.get('plan');
            const credits = parseInt(params.get('credits') || '0');
            const amount = parseFloat(params.get('amount') || '0');
            const currentUser = getCurrentUser();
            if (currentUser && planId && credits > 0) {
                setIsVerifyingPayment(true);
                try {
                    const updatedUser = await processSuccessfulPayment(planId, amount, credits, currentUser);
                    if (updatedUser) setUser(updatedUser);
                    window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
                } catch (e) { console.error(e); } finally { setIsVerifyingPayment(false); }
            }
        }
    };
    handlePaymentRedirect();
  }, []);

  useEffect(() => {
    checkApiKey();

    if (isSupabaseConfigured()) {
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                const sUser = session.user;
                const isAdmin = sUser.email === ADMIN_EMAIL;
                const { data: existingUser, error: fetchProfileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', sUser.id)
  .maybeSingle(); // ✅ לא נופל אם אין שורה

  if (fetchProfileError) {
  console.warn('[profiles] fetch failed:', fetchProfileError);
}


                let finalUser: User;
                if (!existingUser) {
                    finalUser = {
                        id: sUser.id, email: sUser.email!, name: sUser.user_metadata.full_name || sUser.email!.split('@')[0],
                        role: isAdmin ? 'admin' : 'user', credits: isAdmin ? 999999 : 3, plan: isAdmin ? 'agency' : 'free',
                        joinedAt: Date.now()
                    };
                    // TEMP DISABLED – do not write to profiles from client
// await supabase.from('profiles').upsert({
//   id: finalUser.id,
//   email: finalUser.email,
//   name: finalUser.name,
//   credits: finalUser.credits,
//   plan: finalUser.plan,
//   role: finalUser.role,
//   joinedAt: finalUser.joinedAt,
// });

                } else {
                    finalUser = { id: existingUser.id, email: existingUser.email, name: existingUser.name, role: existingUser.role, credits: existingUser.credits, plan: existingUser.plan, joinedAt: new Date(existingUser.joined_at).getTime(), lastSeen: existingUser.last_seen ? new Date(existingUser.last_seen).getTime() : undefined, currentActivity: existingUser.current_activity };
                }
                // ✅ Ensure profile row exists (prevents 406 on PATCH later)
try {
  await supabase
    .from('profiles')
    .upsert(
      {
        id: finalUser.id,
        email: finalUser.email,
        name: finalUser.name,
        credits: finalUser.credits,
        plan: finalUser.plan,
        role: finalUser.role,
        joined_at: new Date(finalUser.joinedAt).toISOString(),
        last_seen: new Date().toISOString(),
        current_activity: state.currentTool || 'Browsing',
      },
      { onConflict: 'id' }
    );
} catch (e) {
  console.warn('profiles upsert failed', e);
}

                setUser(finalUser);
                localStorage.setItem('studioplay_current_user_v1', JSON.stringify(finalUser));
                setIsStarted(true);
                syncHistoryWithSupabase(finalUser.id);
            }
        });
    }

    const currentUser = getCurrentUser();
    if (currentUser) {
        setUser(currentUser);
        syncHistoryWithSupabase(currentUser.id);
    }
  }, [checkApiKey]);

  const syncHistoryWithSupabase = async (userId: string) => {
    if (!isSupabaseConfigured() || !userId) return;
    try {
      const { data } = await supabase.from('generated_items').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (data) {
        const items: GeneratedItem[] = data.filter(Boolean).map((item: any) => ({ 
            id: item.id || Date.now().toString(), url: item.url || '', mediaType: item.media_type || 'image', type: item.tool_mode || ToolMode.AI_EDITOR, description: item.description || '', timestamp: item.timestamp ? new Date(item.timestamp).getTime() : Date.now() 
        }));
        updateState({ generatedItems: items });
        if (items.length > 0) setActiveResultUrl(items[0].url);
      }
    } catch (e) {}
  };

  useEffect(() => {
      if (!user?.id) return;
      const sendHeartbeat = () => updateHeartbeat(user.id, state.currentTool || 'Browsing');
      sendHeartbeat();
      const interval = setInterval(sendHeartbeat, 10000); 
      return () => clearInterval(interval);
  }, [user?.id, state.currentTool]);

  useEffect(() => {
      const currentCat = TOOLS_CATEGORIES.find(c => c.id === activeCategory);
      if (currentCat?.tools?.length) updateState({ currentTool: currentCat.tools[0].id });
  }, [activeCategory]);

  const handleStart = () => {
    if (user) setIsStarted(true);
    else updateState({ showAuthModal: true });
  };

  const handleLoginSuccess = (loggedInUser: User) => {
      if (loggedInUser) {
          setUser(loggedInUser);
          setIsStarted(true);
          updateState({ showAuthModal: false });
          syncHistoryWithSupabase(loggedInUser.id);
      }
  };

  const handleBuy = (planId: string) => {
  const urlByPlan: Record<string, string> = {
    basic: LS_BASIC,
    pro: LS_PRO,
    promax: LS_PRO_MAX,
  };

  const url = urlByPlan[planId];
  if (url) {
    window.location.href = url;
    return;
  }

  // fallback (אם אי פעם יתווסף plan חדש)
  setCheckoutPlanId(planId);
  setShowPricingModal(false);
  setShowCheckout(true);
};


  const handlePaymentCompleted = async (planId: string, amount: number, credits: number) => {
      if (!user) { setShowCheckout(false); updateState({ showAuthModal: true }); return; }
      const updatedUser = await processSuccessfulPayment(planId, amount, credits, user);
      if (updatedUser) setUser(updatedUser);
      setShowCheckout(false);
  };

  const handleOpenSelectKey = async () => {
  const aistudio = (window as any).aistudio;

  if (aistudio?.openSelectKey) {
    await aistudio.openSelectKey();
    setHasUserApiKey(true);
    handleGenerate();
  }
};


  const handleDownload = (url: string, mediaType: string = 'image') => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `studioplay-${Date.now()}.${mediaType === 'video' ? 'mp4' : 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleDeleteItem = async (itemId: string) => {
      if (!confirm(state.appLanguage === 'he' ? 'האם למחוק פריט זה מהגלריה?' : 'Delete this item from gallery?')) return;
      
      const itemToDelete = state.generatedItems.find(i => i.id === itemId);
      const updatedItems = state.generatedItems.filter(item => item.id !== itemId);
      updateState({ generatedItems: updatedItems });
      
      if (activeResultUrl === itemToDelete?.url) {
          setActiveResultUrl(null);
      }

      if (isSupabaseConfigured() && user?.id) {
          try {
              await supabase.from('generated_items').delete().eq('id', itemId).eq('user_id', user.id);
          } catch (e) {
              console.error("Database deletion failed", e);
          }
      }
  };

  const handleGenerate = async () => {
    console.log("[GEN] start", {
  tool: state.currentTool,
  hasImage: !!state.originalImage,
  hasCollage: state.collageImages?.length,
  hasUser: !!user,
  credits: user?.credits,
});

    const isIdeasMode = state.currentTool === ToolMode.AI_SMART_IDEAS;
    const isReelsMode = state.currentTool === ToolMode.REELS_GENERATOR;
    const isMagicPostMode = state.currentTool === ToolMode.SOCIAL_POST;
    const isMockupMode = state.currentTool === ToolMode.MOCKUP_GENERATOR;
    
    if (!isIdeasMode && state.currentTool !== ToolMode.PRODUCT_COLLAGE && !state.originalImage) {
        setShowMobileSettings(true);
        return;
    };
    if (state.currentTool === ToolMode.PRODUCT_COLLAGE && state.collageImages.length === 0) {
  console.log("[GEN] early return: no collage images");
  return;
}

    
    // Proactive check for paid API key required for Reels/Veo
    if (isReelsMode && !hasUserApiKey) {
  console.log("[GEN] early return: reels mode needs api key");
  await handleOpenSelectKey();
  return;
}


    if (!user || user.credits <= 0) {
  console.log("[GEN] early return: no user or no credits", { hasUser: !!user, credits: user?.credits });
  setShowPricingModal(true);
  return;
}

    
    setIsProcessing(true);
    updateState({ status: ProcessingStatus.PROCESSING, errorMessage: null });
    setShowMobileSettings(false);
    
    try {
        let resultUrl: string = "";
        let finalPrompt = state.promptInput;

        console.log("[PROMPT FINAL]", finalPrompt);


        if (isIdeasMode) {
            setVideoStatus('STRATEGIZING');
            setVideoProgress(15);
            const ideas = await generateMarketingIdeas(
                state.marketingNiche,
                state.promptInput || 'Standard Post',
                state.appLanguage === 'he' ? 'Hebrew' : 'English'
            );
            updateState({ generatedIdeas: ideas, status: ProcessingStatus.SUCCESS });
            const updatedUser = await updateUserCredits(user.id, -1); 
            if (updatedUser) setUser(updatedUser);
            setIsProcessing(false);
            return;
        }

        if (isMagicPostMode || (isMockupMode && state.campaignSettings.showText)) {
            setVideoStatus('STRATEGIZING');
            setVideoProgress(15);
            
            const strategy = await generateStrategicMarketingPlan(
                state.promptInput || 'Standard Post', 
                state.marketingNiche,
                state.appLanguage === 'he' ? 'Hebrew' : 'English',
                state.selectedOption
            );
            
            finalPrompt = strategy.imagePrompt;
            updateState({
                marketingVariations: strategy.variations,
                campaignSettings: {
                    ...state.campaignSettings,
                    showText: true,
                    title: strategy.variations[0].title,
                    price: strategy.variations[0].subtitle,
                    discount: strategy.variations[0].footer,
                    textStyle: strategy.layoutStyle as any,
                    titleTransform: { x: strategy.titlePos.x, y: strategy.titlePos.y, scale: 1, rotation: 0 },
                    priceTransform: { x: strategy.pricePos.x, y: strategy.pricePos.y, scale: 1, rotation: 0 },
                    discountTransform: { x: strategy.discountPos.x, y: strategy.discountPos.y, scale: 1, rotation: 0 },
                }
            });
            
            if (isMockupMode) {
                setVideoStatus('ANALYZING');
                setVideoProgress(30);
            }
            
            setVideoStatus('RENDERING');
            setVideoProgress(45);
        } else if (isMockupMode) {
            setVideoStatus('ANALYZING');
            setVideoProgress(30);
            setVideoStatus('RENDERING');
            setVideoProgress(45);
        }

        if (isReelsMode) {
             setVideoProgress(5);
             setVideoStatus('INITIALIZING');
             resultUrl = await generateVideoFromImage(state.originalImage!, state.reelsVideoSettings, (status: string, prog: number) => {
                 setVideoStatus(status);
                 setVideoProgress(prog);
             });
        } else if (state.currentTool === ToolMode.PRODUCT_COLLAGE) {
             resultUrl = await generateCollageImage(state.collageImages, state.activeCollageLayout);
        } else {
             if (isMockupMode) {
                setVideoStatus('FINALIZING');
                setVideoProgress(85);
             }
             const styleSelected =
  (state.campaignSettings as any)?.stylePreset ||
  state.selectedOption ||
  (state.campaignSettings as any)?.style ||
  "Auto/Default";

console.log("[STYLE SOURCES]", {
  stylePreset: (state.campaignSettings as any)?.stylePreset,
  style: (state.campaignSettings as any)?.style,
  selectedOption: state.selectedOption,
});

const styleAdapter = `
STYLE ADAPTER (interpret the selected style into concrete visual changes):
- Apply the selected style primarily to the MAIN SUBJECT (materials/finish, lighting, color grading, shadows, highlights, reflections, texture).
- Background may change subtly, but the subject must show the strongest style change.
- Keep camera angle and composition the same.
- No warping: do not change subject geometry, brand marks, text, logos, or identity.
- Integrate realistically: correct contact shadow, reflection direction, and consistent light source.
`.trim();

const universalSubjectLock = `
UNIVERSAL SUBJECT LOCK (MUST FOLLOW):
- Keep the MAIN SUBJECT the same (identity, shape, geometry). No deformations.
- Do NOT add/remove parts or accessories.
- Do NOT change existing text/logos/branding.
- Changes allowed: lighting, color grading, reflections, surface finish, texture realism, background mood (subtle).
`.trim();

const userReq = (finalPrompt && finalPrompt.trim())
  ? finalPrompt.trim()
  : "Apply the selected style to the main subject while preserving its identity and shape.";

const socialStylePrompt = `
STYLE: ${styleSelected}

GOAL:
Apply the selected style while PRESERVING the original subject.
The style must be visible on the SUBJECT itself, not only on the background.

OBJECT AWARENESS (CRITICAL):
First, identify what the MAIN SUBJECT is in the image.

Rules:
- If the subject is a PRODUCT (glasses, jewelry, accessories, items):
  Apply the selected style to the PRODUCT itself:
  materials, finishes, reflections, highlights, surface texture, premium lighting.
  Do NOT add people unless they already exist.

- If the subject is a PERSON or MODEL:
  Apply the style through clothing, fabric, pose mood, lighting, and environment,
  while keeping identity, anatomy, and face unchanged.

- If the subject is FOOD:
  Apply the style through plating, lighting, color temperature, and freshness.
  Never alter the food shape or ingredients.

- If the subject is a FLAT LAY or STATIC OBJECT:
  Apply the style through composition, surface material, shadows, and lighting direction.

The style must ADAPT TO the subject.
Do NOT replace the subject.
Do NOT change the subject type.


CREATIVE CONSTRAINTS:
- Be creative within the selected style, but never at the expense of subject integrity.
- Produce a professional commercial result, not abstract AI art.
- Prefer subtle, premium, realistic changes over dramatic or random alterations.

UNIVERSAL SUBJECT LOCK (MUST FOLLOW):
- Keep the MAIN SUBJECT exactly the same (identity, shape, geometry).
- Do NOT add or remove objects, accessories, or body parts.
- Do NOT distort, reshape, or beautify unnaturally.
- Preserve pose, framing, camera angle, logos, and existing text.

STYLE APPLICATION (DO THIS INSTEAD):
- Apply the selected style primarily to the SUBJECT:
  lighting, materials/finish, reflections, shadows, color grading, texture realism.
- Background changes are allowed but must remain subtle and supportive.
- Maintain realistic contact shadows, correct reflection direction, and depth.

QUALITY CHECKLIST (MUST PASS):
- Subject clearly matches the selected style.
- Subject remains realistic and intact (no artifacts or warping).
- Lighting and reflections are consistent and physically plausible.
- Subject is the visual hero, background does not overpower it.
- No extra text, symbols, fingers, objects, or distortions.

If any of the above checks fail:
Regenerate internally and return a corrected image.
If subject preservation is not possible, return the original image unchanged.

USER REQUEST:
${finalPrompt || ""}
`.trim();






console.log("STYLE_SELECTED =", styleSelected);
console.log("SOCIAL_STYLE_PROMPT =", socialStylePrompt);

console.log("[GEN] BEFORE GEMINI", { tool: state.currentTool, styleSelected });


             resultUrl = await processImageWithGemini(
                state.originalImage!, 
                state.currentTool, 
                socialStylePrompt,
                state.selectedOption, 
                state.campaignSettings, 
                state.moodSettings, 
                state.collageImages.map(c => c.url), 
                state.templateBuilderSettings, 
                state.enableDeepThinking || isMagicPostMode
             );
// 🔧 Normalize Gemini result (sometimes returns JSON instead of direct image)
if (typeof resultUrl === "string" && resultUrl.trim().startsWith("{")) {
  try {
    const parsed = JSON.parse(resultUrl);

    const img =
      (typeof parsed?.enhancedImage === "string" && parsed.enhancedImage) ||
      (typeof parsed?.enhancedDataUrl === "string" && parsed.enhancedDataUrl) ||
      (typeof parsed?.image === "string" && parsed.image) ||
      (typeof parsed?.url === "string" && parsed.url);

    if (img) {
      resultUrl = img;
    }
  } catch {
    // ignore parse errors – fallback handled later
  }
}

             console.log("[GEN] AFTER GEMINI", { hasResult: !!resultUrl, resultPrefix: (resultUrl || "").slice(0, 30) });

        }
        
       updateUserCredits(user.id, -1)
        .then((updatedUser) => {
          if (updatedUser) setUser(updatedUser);
          })
          .catch((e) => console.error("updateUserCredits failed", e));


        const newItem: GeneratedItem = { id: Date.now().toString(), url: resultUrl, mediaType: isReelsMode ? 'video' : 'image', type: state.currentTool, description: state.promptInput || state.selectedOption || 'Generated', timestamp: Date.now() };
        if (isSupabaseConfigured() && user?.id) {
            // ✅ SOCIAL_POST returns JSON: { enhancedImage, post }
// Replace newItem.url with enhancedImage so the UI shows the upgraded image.
if (state.currentTool === ToolMode.SOCIAL_POST && typeof newItem.url === "string") {
  const raw = newItem.url.trim();
  if (raw.startsWith("{")) {

    try {
      const data = JSON.parse(raw);
      console.log("SOCIAL_POST parsed:", data);


      const img =
  (typeof data?.enhancedImage === "string" && data.enhancedImage) ||
  (typeof data?.enhancedDataUrl === "string" && data.enhancedDataUrl);

if (img) {
  newItem.url = img; // זה מה שה־Workspace יציג
}


      if (data?.post) {
        updateState({ generatedIdeas: data.post }); // ✅ so Workspace can show post content
      }
    } catch {
      // keep original url if parsing fails
    }
  }
}
const isBase64Image =
  typeof newItem.url === "string" &&
  newItem.url.startsWith("data:image");

if (isBase64Image) {
  // ✅ להציג למשתמש מיד
  updateState({
    generatedItems: [newItem, ...state.generatedItems],
    status: ProcessingStatus.SUCCESS,
  });
  setActiveResultUrl(newItem.url);

  console.log("Skipping Supabase save (Base64 image)");

  return; // ⛔ לא להגיע ל-insert בכלל
}


            try { await supabase.from('generated_items').insert({ user_id: user.id, url: newItem.url, media_type: newItem.mediaType, tool_mode: newItem.type, description: newItem.description }); } catch (supaError) {}
        }
        updateState({ generatedItems: [newItem, ...state.generatedItems], status: ProcessingStatus.SUCCESS });
        setActiveResultUrl(newItem.url);
    } catch (error: any) {
        let errorMsg = String(error.message || error);
        console.error("Generation error:", errorMsg);
        
        if (errorMsg === "SERVER_OVERLOADED" || errorMsg.includes("503") || errorMsg.includes("overloaded")) {
          errorMsg = state.appLanguage === 'he' 
            ? "השרתים עמוסים כרגע עקב ביקוש רב. אנחנו מנסים שוב באופן אוטומטי, אנא המתן רגע או נסה שוב בעוד דקה."
            : "Servers are currently overloaded due to high demand. We are retrying automatically, please wait a moment or try again in a minute.";
        }
        

        if (errorMsg.includes("Requested entity was not found.") || errorMsg.includes("API_KEY_REQUIRED") || errorMsg.includes("permission denied") || errorMsg.includes("API key not valid")) {
            setHasUserApiKey(false);
            updateState({ 
                status: ProcessingStatus.ERROR, 
                errorMessage: (
                    <div className="flex flex-col items-center gap-3 p-2">
                        <span className="font-bold text-center">{state.appLanguage === 'he' ? "נדרשת הפעלת מנוע הרינדור (Rendering Engine)" : "Rendering Engine Activation Required"}</span>
                        <p className="text-[10px] opacity-80 max-w-xs text-center">{state.appLanguage === 'he' ? "ליצירת וידאו ו-PRO, עליך לחבר את המנוע האישי שלך (Paid API Project)." : "To generate Video and PRO features, please connect your creative engine (Paid API Project)."}</p>
                        <div className="flex gap-2">
                             <Button onClick={handleOpenSelectKey} variant="secondary" className="!py-1.5 !px-4 !text-xs !bg-white !text-black border-none hover:!bg-slate-200">
                                {state.appLanguage === 'he' ? "הפעל מנוע" : "Activate Engine"}
                             </Button>
                             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] flex items-center gap-1 underline text-blue-400">{t('billingInfo')} <Icons.Globe className="w-3 h-3"/></a>
                        </div>
                    </div>
                )
            });
        } else {
            updateState({ status: ProcessingStatus.ERROR, errorMessage: errorMsg || "Failed to generate" });
        }
    } finally {
  setIsProcessing(false);
}

  };

  const handleImageReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              const newImage = (ev.target as FileReader).result as string;
              updateState({ originalImage: newImage, generatedItems: [], collageImages: [], status: ProcessingStatus.IDLE });
              setActiveResultUrl(null);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleCollageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = Array.from(e.target.files ?? []) as File[];
      files.forEach(file => {
          const reader = new FileReader();
          reader.onload = (ev) => {
              const url = (ev.target as FileReader).result as string;
              const newItem: GeneratedItem = { id: Date.now().toString() + Math.random(), url, mediaType: 'image', type: ToolMode.PRODUCT_COLLAGE, description: 'Collage Item', timestamp: Date.now() };
              updateState({ collageImages: [...state.collageImages, newItem].slice(0, 5) });
          };
          reader.readAsDataURL(file);
      });
  };

  const renderSettingsContent = () => {
    const category = TOOLS_CATEGORIES.find(c => c.id === activeCategory);
    if (!category) return null;
    const isCollageMode = state.currentTool === ToolMode.PRODUCT_COLLAGE;
    const isIdeasMode = state.currentTool === ToolMode.AI_SMART_IDEAS;
    const isHebrew = state.appLanguage === 'he';
    
    return (
        <div className="h-full flex flex-col">
            <div className="p-5 md:p-6 border-b border-white/5 flex justify-between items-center bg-slate-900 md:bg-transparent">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">{t(category.titleKey)}</h2>
                <button onClick={() => setShowMobileSettings(false)} className="md:hidden p-2 text-slate-400 bg-white/5 rounded-full"><Icons.X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6 pb-24">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('selectTool')}</label>
                    <div className="grid grid-cols-1 gap-2">
                        {category.tools && category.tools.map(tool => (
                            <button key={tool.id} onClick={() => updateState({ currentTool: tool.id })} className={`flex items-center gap-3 p-3 rounded-xl text-left rtl:text-right transition-all border group relative overflow-hidden ${state.currentTool === tool.id ? 'bg-purple-600/10 border-purple-500 text-white' : 'bg-slate-800/30 border-white/5 text-slate-400'}`}>
                                <div className={state.currentTool === tool.id ? 'text-purple-400' : 'text-slate-500'}>{getIcon(tool.icon)}</div>
                                <div className="flex-1"><div className="flex items-center justify-between"><span className="text-sm font-bold">{t(tool.labelKey)}</span>{tool.isPro && <span className="text-[9px] bg-gradient-to-r from-amber-400 to-orange-500 text-black px-1.5 rounded font-bold">PRO</span>}</div></div>
                            </button>
                        ))}
                    </div>
                </div>

                {isCollageMode && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-400">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">{t('collageLayout')}</label>
                            <div className="grid grid-cols-2 gap-2">
                                {COLLAGE_LAYOUTS.map(layout => (
                                    <button 
                                        key={layout.id} 
                                        onClick={() => updateState({ activeCollageLayout: layout.id })}
                                        className={`flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl border transition-all ${state.activeCollageLayout === layout.id ? 'bg-purple-600/10 border-purple-500 text-white' : 'bg-slate-800/30 border-white/5 text-slate-400 hover:bg-slate-800/50'}`}
                                    >
                                        {getIcon(layout.icon)}
                                        <span className="text-[10px] font-black">{t(layout.labelKey)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">{t('addProducts')}</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                                <button 
                                    onClick={() => collageInputRef.current?.click()}
                                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-dashed border-white/10 bg-slate-800/30 flex items-center justify-center text-slate-500 hover:border-purple-500 hover:text-purple-400 transition-all shrink-0"
                                >
                                    <Icons.Plus className="w-6 h-6" />
                                </button>
                                {state.collageImages.map((img) => (
                                    <div key={img.id} className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border border-white/10 shrink-0 group">
                                        <img src={img.url} className="w-full h-full object-cover" alt="Collage part" />
                                        <button 
                                            onClick={() => updateState({ collageImages: state.collageImages.filter(item => item.id !== img.id) })}
                                            className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                        >
                                            <Icons.Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <input type="file" multiple ref={collageInputRef} className="hidden" accept="image/*" onChange={handleCollageUpload} />
                        </div>
                    </div>
                )}

                {isIdeasMode && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-3 text-yellow-500 mb-2">
                            <Icons.Lightbulb className="w-5 h-5 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                            <h4 className="font-bold text-sm uppercase tracking-wider">{t('giveMeIdeas')}</h4>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{t('ideasDescription')}</p>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">בחר נישה</label>
                                <select value={state.marketingNiche} onChange={(e) => updateState({ marketingNiche: e.target.value as any })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-yellow-500 transition-colors"><option value="fashion">אופנה וסטייל</option><option value="jewelry">תכשיטים ויוקרה</option><option value="beauty">ביוטי וטיפוח</option><option value="electronics">טכנולוגיה וגאדג'טים</option><option value="home">עיצוב הבית</option><option value="general">כללי / מותג אחר</option></select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">תיאור העסק (אופציונלי)</label>
                                <textarea value={state.promptInput} onChange={(e) => updateState({ promptInput: e.target.value })} placeholder="מה אתה מוכר? מי קהל היעד?" className="w-full h-20 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none resize-none focus:border-yellow-500 transition-colors" />
                            </div>
                        </div>
                    </div>
                )}

                {!isIdeasMode && !isCollageMode && (
                    <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{t('styleTemplate')}</label>
                            <select value={state.selectedOption || ''} onChange={(e) => updateState({ selectedOption: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500 transition-colors"><option value="">Auto / Default</option>{TOOL_PRESETS[state.currentTool]?.map(opt => (<option key={opt.id} value={opt.id}>{t(opt.labelKey)}</option>))}</select>
                        </div>
                    </div>
                )}

                {!isIdeasMode && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{t('prompt')}</label>
                            <button onClick={async () => { if (!state.promptInput) return; const enhanced = await enhanceUserPrompt(state.promptInput); updateState({ promptInput: enhanced }); }} className="text-[10px] text-purple-400 flex items-center gap-1"> <Icons.Sparkles className="w-3 h-3"/> {t('enhancePrompt')}</button>
                        </div>
                        <textarea value={state.promptInput} onChange={(e) => updateState({ promptInput: e.target.value })} placeholder="Describe changes..." className="w-full h-24 bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none resize-none focus:border-purple-500 transition-colors" />
                    </div>
                )}

                <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in duration-500">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('design')}</label>
                    
                    <button 
                        onClick={() => updateState({ showWatermark: !state.showWatermark })}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${state.showWatermark ? 'bg-purple-600/10 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-slate-800/30 border-white/5 text-slate-400 hover:bg-slate-800/50'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${state.showWatermark ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                <Icons.Feather className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold">{t('watermark')}</span>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${state.showWatermark ? 'bg-purple-500' : 'bg-slate-700'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${state.showWatermark ? 'right-1' : 'left-1'}`} />
                        </div>
                    </button>

                    <button 
                        onClick={() => updateState({ campaignSettings: { ...state.campaignSettings, showText: !state.campaignSettings.showText } })}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${state.campaignSettings.showText ? 'bg-purple-600/10 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-slate-800/30 border-white/5 text-slate-400 hover:bg-slate-800/50'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${state.campaignSettings.showText ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                <Icons.Type className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold">{t('marketingText')}</span>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${state.campaignSettings.showText ? 'bg-purple-500' : 'bg-slate-700'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${state.campaignSettings.showText ? 'right-1' : 'left-1'}`} />
                        </div>
                    </button>

                    {state.campaignSettings.showText && (
                        <div className="space-y-4 p-3 bg-white/5 border border-white/10 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                            {state.marketingVariations && (
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{isHebrew ? 'בחר וריאציית תוכן' : 'Choose AI Variation'}</label>
                                    <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
                                        {state.marketingVariations.map((v, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => updateState({ campaignSettings: { ...state.campaignSettings, title: v.title, price: v.subtitle, discount: v.footer } })}
                                                className={`px-3 py-2 rounded-lg border text-[10px] font-bold whitespace-nowrap transition-all ${state.campaignSettings.title === v.title ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-white'}`}
                                            >
                                                Var {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{t('title')}</label>
                                <input 
                                    type="text" 
                                    value={state.campaignSettings.title} 
                                    onChange={(e) => updateState({ campaignSettings: { ...state.campaignSettings, title: e.target.value } })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{t('subtitle')}</label>
                                    <input 
                                        type="text" 
                                        value={state.campaignSettings.price} 
                                        onChange={(e) => updateState({ campaignSettings: { ...state.campaignSettings, price: e.target.value } })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{t('footer')}</label>
                                    <input 
                                        type="text" 
                                        value={state.campaignSettings.discount} 
                                        onChange={(e) => updateState({ campaignSettings: { ...state.campaignSettings, discount: e.target.value } })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-purple-500 transition-colors"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-2 space-y-3 border-t border-white/5">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{t('designStyle')}</label>
                                    <select 
                                        value={state.campaignSettings.textStyle} 
                                        onChange={(e) => updateState({ campaignSettings: { ...state.campaignSettings, textStyle: e.target.value as any } })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-purple-500 transition-colors"
                                    >
                                        {TEXT_LAYOUTS.map(layout => (
                                            <option key={layout.id} value={layout.id}>{t(layout.labelKey)}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{isHebrew ? 'מיקום מהיר' : 'Quick Placement'}</label>
                                    <div className="grid grid-cols-3 gap-1">
                                        <button 
                                            onClick={() => updateState({ campaignSettings: { ...state.campaignSettings, titleTransform: { ...state.campaignSettings.titleTransform!, y: 20 }, priceTransform: { ...state.campaignSettings.priceTransform!, y: 35 }, discountTransform: { ...state.campaignSettings.discountTransform!, y: 50 } } })}
                                            className="bg-slate-900 hover:bg-slate-800 text-[9px] font-black py-1.5 rounded-lg border border-white/5 text-white"
                                        >
                                            {isHebrew ? 'למעלה' : 'TOP'}
                                        </button>
                                        <button 
                                            onClick={() => updateState({ campaignSettings: { ...state.campaignSettings, titleTransform: { ...state.campaignSettings.titleTransform!, y: 45 }, priceTransform: { ...state.campaignSettings.priceTransform!, y: 55 }, discountTransform: { ...state.campaignSettings.discountTransform!, y: 65 } } })}
                                            className="bg-slate-900 hover:bg-slate-800 text-[9px] font-black py-1.5 rounded-lg border border-white/5 text-white"
                                        >
                                            {isHebrew ? 'מרכז' : 'CENTER'}
                                        </button>
                                        <button 
                                            onClick={() => updateState({ campaignSettings: { ...state.campaignSettings, titleTransform: { ...state.campaignSettings.titleTransform!, y: 70 }, priceTransform: { ...state.campaignSettings.priceTransform!, y: 80 }, discountTransform: { ...state.campaignSettings.discountTransform!, y: 90 } } })}
                                            className="bg-slate-900 hover:bg-slate-800 text-[9px] font-black py-1.5 rounded-lg border border-white/5 text-white"
                                        >
                                            {isHebrew ? 'למטה' : 'BOTTOM'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{t('font')}</label>
                                    <select 
                                        value={state.campaignSettings.font} 
                                        onChange={(e) => updateState({ campaignSettings: { ...state.campaignSettings, font: e.target.value } })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-purple-500 transition-colors"
                                    >
                                        {HEBREW_FONTS.map(f => (
                                            <option key={f.id} value={f.id} style={{ fontFamily: `'${f.id}', sans-serif` }}>{f.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="p-4 md:p-5 border-t border-white/5 bg-slate-900 md:bg-slate-900/95 backdrop-blur-2xl shrink-0 flex flex-col gap-3">
                <Button onClick={handleGenerate} isLoading={isProcessing} disabled={isProcessing || (!isIdeasMode && !isCollageMode && !state.originalImage) || (isCollageMode && state.collageImages.length === 0)} className={`w-full py-4 text-xl md:text-2xl font-black rounded-[1.2rem] md:rounded-[1.6rem] shadow-2xl group border-none ${isIdeasMode ? 'bg-gradient-to-r from-yellow-400 to-orange-600 text-black shadow-yellow-500/30' : 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 shadow-purple-500/30'}`}>
                    <span className="flex items-center gap-3">
                        {isIdeasMode ? t('giveMeIdeas') : t('runMagic')} 
                        {isIdeasMode ? <Icons.Lightbulb className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-125 transition-transform" /> : <Icons.Zap className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-125 transition-transform" />}
                    </span>
                </Button>
                {isCollageMode && (
                    <button 
                        onClick={async () => {
                            if (state.collageImages.length === 0) return;
                            const result = await generateCollageImage(state.collageImages, state.activeCollageLayout);
                            const link = document.createElement('a');
                            link.download = `studioplay-collage-${Date.now()}.png`;
                            link.href = result;
                            link.click();
                        }}
                        className="w-full py-2.5 md:py-3 text-[10px] md:text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-white/5 flex items-center justify-center gap-2 transition-all"
                    >
                        <Icons.Download className="w-3.5 h-3.5 md:w-4 md:h-4" /> {t('downloadCollage')}
                    </button>
                )}
            </div>
        </div>
    );
};

  // Main UI components rendered based on state
  return (
    <div className="min-h-screen bg-[#050810] text-slate-100 font-heebo selection:bg-purple-500/30">
      {!isStarted ? (
        <LandingPage 
          onStart={handleStart} 
          language={state.appLanguage} 
          setLanguage={(lang) => updateState({ appLanguage: lang })} 
          onUpload={handleImageReplace}
          onOpenPrivacy={() => setShowPrivacyPolicy(true)}
          onOpenRefund={() => setShowRefundPolicy(true)}
          onOpenTOS={() => setShowTOS(true)}
          onOpenAbout={() => setShowAbout(true)}
          onOpenContact={() => setShowContact(true)}
        />
      ) : (
        <div className="h-screen flex flex-col overflow-hidden">
          {/* Main App Topbar */}
          <header className="h-14 md:h-20 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 flex items-center justify-between shrink-0 relative z-30">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsStarted(false)}>
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Icons.Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <span className="text-lg md:text-xl font-bold tracking-tight hidden sm:inline">StudioPlay<span className="text-purple-400">AI</span></span>
                </div>
             </div>

             <div className="flex items-center gap-3 md:gap-5">
                <button 
                    onClick={() => setShowGallery(!showGallery)} 
                    className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border text-[10px] md:text-xs font-black transition-all ${showGallery ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <Icons.History className="w-4 h-4" /> {t('myGallery')}
                </button>
                {user?.role === 'admin' && (
                    <button onClick={() => updateState({ showAdminDashboard: true })} className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 text-xs font-black transition-all">
                        <Icons.Shield className="w-4 h-4"/> ADMIN PANEL
                    </button>
                )}
                <div className="bg-slate-800/50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl flex items-center gap-2 md:gap-3 border border-white/5 group hover:border-purple-500/30 transition-all cursor-pointer" onClick={() => setShowPricingModal(true)}>
                    <Icons.Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-400 group-hover:animate-pulse" />
                    <span className="text-sm font-black">{user?.credits || 0}</span>
                    <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase hidden sm:inline">{t('creditsLeft')}</span>
                </div>
                <button onClick={() => setShowUserDashboard(true)} className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-0.5 shadow-lg hover:scale-105 transition-all">
                   <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center text-xs md:text-sm font-black uppercase text-white">
                      {user?.name?.slice(0,2) || 'UP'}
                   </div>
                </button>
             </div>
          </header>

          <main className="flex-1 flex overflow-hidden relative">
            {/* Sidebar Tools Categories */}
            <div className="w-14 md:w-24 bg-slate-950 border-r border-white/5 flex flex-col items-center py-4 md:py-6 gap-4 md:gap-6 shrink-0 relative z-20 overflow-y-auto no-scrollbar">
                {TOOLS_CATEGORIES.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => {
                            setActiveCategory(cat.id);
                            if (window.innerWidth < 768) setShowMobileSettings(true);
                        }}
                        className={`w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-1 transition-all relative group shrink-0 ${activeCategory === cat.id ? 'bg-purple-600/10 text-purple-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <div className="scale-75 md:scale-100">{getIcon(cat.tools[0].icon)}</div>
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-1 whitespace-nowrap bg-slate-800 px-2 py-0.5 rounded shadow-xl z-50">{t(cat.titleKey)}</span>
                        {activeCategory === cat.id && <div className="absolute left-0 top-2 bottom-2 w-1 bg-purple-500 rounded-r-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#0a0f1d] relative">
                {/* Secondary Sidebar (Tool Options) */}
                <div className="hidden md:block w-80 lg:w-96 border-r border-white/5 bg-slate-900/30 overflow-hidden relative z-10">
                    {renderSettingsContent()}
                </div>

                {/* Workspace / Canvas */}
                <div className="flex-1 flex flex-col p-3 md:p-8 overflow-hidden relative">
                    {isProcessing && <VideoGenerationOverlay progress={videoProgress} status={videoStatus} lang={state.appLanguage} tool={state.currentTool} />}
                    <div className="flex-1 overflow-hidden">
                        <Workspace 
                            originalImage={state.originalImage || ''} 
                            generatedImage={activeResultUrl} 
                            activeTool={state.currentTool}
                            isCollageMode={state.currentTool === ToolMode.PRODUCT_COLLAGE}
                            collageImages={state.collageImages}
                            collageLayout={state.activeCollageLayout}
                            onRemoveFromCollage={(id) => updateState({ collageImages: state.collageImages.filter(img => img.id !== id) })}
                            onUploadToCollage={() => collageInputRef.current?.click()}
                            onEdit={() => setShowImageEditor(true)}
                            onUploadNew={() => replaceInputRef.current?.click()}
                            showWatermark={state.showWatermark}
                            watermarkPosition={state.watermarkPosition}
                            onWatermarkMove={(pos) => updateState({ watermarkPosition: pos })}
                            campaignSettings={state.campaignSettings}
                            templateBuilderSettings={state.templateBuilderSettings}
                            onCampaignSettingChange={(f, v) => updateState({ campaignSettings: { ...state.campaignSettings, [f]: v } })}
                            language={state.appLanguage}
                            marketingIdeas={state.generatedIdeas}
                        />
                    </div>
                </div>

                {/* Mobile Tools Overlay Trigger */}
                <button 
                    onClick={() => setShowMobileSettings(true)}
                    className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white z-[35] border-4 border-slate-900"
                >
                    <Icons.Wand className="w-7 h-7" />
                </button>
            </div>

            {/* Left Gallery Panel (Collapsible) - MOVED TO THE LEFT SIDE OF CONTENT */}
            {showGallery && (
                <div className="w-40 md:w-56 bg-slate-900/80 border-l border-white/5 flex flex-col shrink-0 animate-in slide-in-from-right-4 duration-300 relative z-10">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/20">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Icons.History className="w-4 h-4 text-purple-500" /> {t('myGallery')}
                        </span>
                        <button onClick={() => setShowGallery(false)} className="p-1 hover:bg-white/10 rounded text-slate-500"><Icons.X className="w-4 h-4" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        {state.generatedItems.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => setActiveResultUrl(item.url)}
                                className={`aspect-square rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${activeResultUrl === item.url ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-white/5 hover:border-white/20'}`}
                            >
                                {item.mediaType === 'video' ? (
                                    <video src={item.url} className="w-full h-full object-cover" />
                                ) : (
                                    <img src={item.url} className="w-full h-full object-cover" alt="Generated history" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                    <button onClick={(e) => { e.stopPropagation(); handleDownload(item.url, item.mediaType); }} className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/40"><Icons.Download className="w-3.5 h-3.5" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); setShareTarget(item); setShowShareModal(true); }} className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/40"><Icons.Share className="w-3.5 h-3.5" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }} className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg hover:bg-red-500/60 hover:text-white transition-colors"><Icons.Trash className="w-3.5 h-3.5" /></button>
                                </div>
                                {item.mediaType === 'video' && <div className="absolute top-1 left-1 bg-black/60 rounded p-0.5"><Icons.Film className="w-2.5 h-2.5 text-white" /></div>}
                            </div>
                        ))}
                        {state.generatedItems.length === 0 && (
                            <div className="py-20 text-center text-slate-700 italic text-[10px] md:text-xs">
                                {t('emptyPlaceDesc')}
                            </div>
                        )}
                    </div>
                </div>
            )}
          </main>
        </div>
      )}

      {/* Modals & Overlays */}
      {showMobileSettings && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center md:hidden">
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowMobileSettings(false)}></div>
              <div className="relative w-full max-h-[85vh] bg-slate-900 border-t border-white/10 rounded-t-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col">
                  <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1"></div>
                  <div className="flex-1 overflow-hidden">
                    {renderSettingsContent()}
                  </div>
              </div>
          </div>
      )}

      {showImageEditor && state.originalImage && (
          <ImageEditor 
            imageSrc={state.originalImage} 
            language={state.appLanguage}
            onSave={(newImg) => { updateState({ originalImage: newImg, status: ProcessingStatus.IDLE }); setShowImageEditor(false); }} 
            onCancel={() => setShowImageEditor(false)} 
          />
      )}

      <Suspense fallback={null}>
          {showShareModal && shareTarget && (
              <SocialShareModal 
                isOpen={showShareModal} 
                onClose={() => setShowShareModal(false)} 
                imageSrc={shareTarget.url} 
                defaultCaption={shareTarget.description}
                campaignSettings={state.campaignSettings}
                showWatermark={state.showWatermark}
                watermarkPosition={state.watermarkPosition}
                language={state.appLanguage}
              />
          )}

          {state.showAdminDashboard && (
            <AdminDashboard onClose={() => updateState({ showAdminDashboard: false })} />
          )}

          {state.showAuthModal && (
            <AuthModal
              isOpen={state.showAuthModal}
              onClose={() => updateState({ showAuthModal: false })}
              onLoginSuccess={handleLoginSuccess}
            />
          )}

          {showPrivacyPolicy && (
            <PrivacyPolicyModal onClose={() => setShowPrivacyPolicy(false)} />
          )}

          {showRefundPolicy && (
            <RefundPolicyModal onClose={() => setShowRefundPolicy(false)} />
          )}

          {showTOS && (
            <TermsOfServiceModal onClose={() => setShowTOS(false)} />
          )}

          {showAbout && (
            <AboutUsModal onClose={() => setShowAbout(false)} />
          )}

          {showContact && (
            <ContactModal
              language={state.appLanguage}
              onClose={() => setShowContact(false)}
            />
          )}

          {showPricingModal && (
            <PricingModal
              isOpen={showPricingModal}
              onClose={() => setShowPricingModal(false)}
              onSelectPlan={handleBuy}
              language={state.appLanguage}
            />
          )}

          {showCheckout && (
            <CheckoutModal
              isOpen={showCheckout}
              onClose={() => setShowCheckout(false)}
              planId={checkoutPlanId}
              user={user}
              onPaymentSuccess={handlePaymentCompleted}
              language={state.appLanguage}
            />
          )}
      </Suspense>

      {showUserDashboard && user && (
          <UserDashboard 
            user={user} 
            onClose={() => setShowUserDashboard(false)} 
            onLogout={async () => { await logout(); setUser(null); setIsStarted(false); setShowUserDashboard(false); }} 
            onUserUpdate={(u) => setUser(u)}
            onBuyMore={() => { setShowUserDashboard(false); setShowPricingModal(true); }}
            language={state.appLanguage}
          />
      )}

      <input type="file" ref={replaceInputRef} className="hidden" accept="image/*" onChange={handleImageReplace} />
      
      {isVerifyingPayment && (
          <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-black text-white">{state.appLanguage === 'he' ? 'מעדכן את החשבון...' : 'Updating account...'}</h2>
          </div>
      )}
    </div>
  );
};

export default App;
