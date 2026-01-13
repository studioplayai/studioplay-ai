import React, { useState } from 'react';
import { Icons } from './Icons';
import { AppLanguage } from '../types';
import { TRANSLATIONS } from '../translations';

interface ContactModalProps {
    onClose: () => void;
    language: AppLanguage;
}

export const ContactModal: React.FC<ContactModalProps> = ({ onClose, language: initialLanguage }) => {
    // Local state for language within the modal
    const [currentLang, setCurrentLang] = useState<AppLanguage>(initialLanguage);
    const [formState, setFormState] = useState({ name: '', email: '', message: '', mood: 'question' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const t = (key: string, section = 'contact') => {
        // @ts-ignore
        return TRANSLATIONS[currentLang]?.[section]?.[key] || key;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Create FormData object
        const formData = new FormData();
        // Standard fields for FormSubmit
        formData.append('email', formState.email); // Acts as Reply-To
        formData.append('name', formState.name);
        formData.append('message', formState.message);
        
        // Custom fields
        formData.append('mood', formState.mood);
        formData.append('language_context', currentLang);
        
        // Config fields
        // Simplified subject to ensure deliverability through strict spam filters
        formData.append('_subject', `New Message from ${formState.name} - StudioPlay`);
        formData.append('_template', 'table');
        formData.append('_captcha', 'false'); // Disable captcha for smoother flow

        try {
            // Use the specific AJAX endpoint
            const response = await fetch("https://formsubmit.co/ajax/studioplayai1@gmail.com", {
                method: "POST",
                body: formData,
                headers: { 
                    'Accept': 'application/json' 
                }
            });

            const result = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                setFormState({ name: '', email: '', message: '', mood: 'question' });
            } else {
                console.error("Submission failed", result);
                alert("Could not send message automatically. Please use the email link below.");
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Network error. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleManualMailto = () => {
        const subject = `StudioPlay Inquiry: ${formState.mood}`;
        const body = `Name: ${formState.name}\nEmail: ${formState.email}\n\nMessage:\n${formState.message}`;
        window.open(`mailto:studioplayai1@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    const moodOptions = [
        { id: 'question', icon: '🤔', label: t('moodQuestion') },
        { id: 'bug', icon: '🐛', label: t('moodBug') },
        { id: 'idea', icon: '💡', label: t('moodIdea') },
        { id: 'love', icon: '😍', label: t('moodLove') },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-heebo">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative w-full max-w-5xl bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95" dir={currentLang === 'he' ? 'rtl' : 'ltr'}>
                
                {/* Left Side: Info & Vibe */}
                <div className="w-full md:w-2/5 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-8 flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative Blobs */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-black text-white mb-4 leading-tight">
                            {t('title')} <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">{t('subtitleHighlight')}</span>
                        </h2>
                        <p className="text-slate-300 mb-8 leading-relaxed">
                            {t('description')}
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                                    <Icons.Send className="w-5 h-5 text-purple-300" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{t('emailUs')}</h4>
                                    <p className="text-slate-400 text-sm">studioplayai1@gmail.com</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{t('emailHumor')}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                                    <Icons.Whatsapp className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{t('whatsappUs')}</h4>
                                    <p className="text-slate-400 text-sm">052-3040000</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{t('whatsappHumor')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-green-400 uppercase tracking-widest">{t('statusOnline')}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            {t('statusDesc')}
                        </p>
                    </div>
                </div>

                {/* Right Side: The Form */}
                <div className="w-full md:w-3/5 bg-slate-950 p-8 flex flex-col relative">
                    
                    {/* Header Controls (Lang Switch & Close) */}
                    <div className={`absolute top-6 flex items-center gap-3 z-20 ${currentLang === 'he' ? 'left-6' : 'right-6'}`}>
                        {/* Language Toggle */}
                        <div className="bg-slate-800/80 p-1 rounded-lg flex items-center border border-white/5 backdrop-blur-sm">
                            <button 
                                onClick={() => setCurrentLang('he')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${currentLang === 'he' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                עברית
                            </button>
                            <button 
                                onClick={() => setCurrentLang('en')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${currentLang === 'en' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                English
                            </button>
                        </div>

                        {/* Close Button */}
                        <button 
                            onClick={onClose} 
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors bg-slate-800/50 backdrop-blur-sm border border-white/5"
                        >
                            <Icons.X className="w-5 h-5" />
                        </button>
                    </div>

                    {isSuccess ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-50 duration-500">
                            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                <Icons.Check className="w-12 h-12 text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{t('successTitle')}</h3>
                            <p className="text-slate-400 max-w-xs mx-auto mb-8">
                                {t('successDesc')}
                            </p>
                            <button onClick={onClose} className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:scale-105 transition-transform">
                                {t('close')}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full mt-8 md:mt-0">
                            <h3 className="text-xl font-bold text-white mb-6">{t('formTitle')}</h3>
                            
                            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                {/* Mood Selector */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">{t('moodLabel')}</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {moodOptions.map(option => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setFormState({...formState, mood: option.id})}
                                                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                                                    formState.mood === option.id 
                                                    ? 'bg-purple-600/20 border-purple-500 text-white' 
                                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                                                }`}
                                            >
                                                <span className="text-2xl">{option.icon}</span>
                                                <span className="text-[10px] font-bold">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1.5 block">{t('fieldName')}</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formState.name}
                                            onChange={(e) => setFormState({...formState, name: e.target.value})}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors"
                                            placeholder={t('placeholderName')}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1.5 block">{t('fieldEmail')}</label>
                                        <input 
                                            type="email" 
                                            required
                                            value={formState.email}
                                            onChange={(e) => setFormState({...formState, email: e.target.value})}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors"
                                            placeholder={t('placeholderEmail')}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 mb-1.5 block">{t('fieldMessage')}</label>
                                    <textarea 
                                        required
                                        value={formState.message}
                                        onChange={(e) => setFormState({...formState, message: e.target.value})}
                                        className="w-full h-32 bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors resize-none placeholder:text-slate-600"
                                        placeholder={t('placeholderMessage')}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            {t('submitBtn')} 
                                            <Icons.Send className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1" />
                                        </>
                                    )}
                                </button>
                                
                                <div className="text-center">
                                    <button 
                                        type="button"
                                        onClick={handleManualMailto}
                                        className="text-[10px] text-slate-500 hover:text-purple-400 transition-colors underline"
                                    >
                                        {currentLang === 'he' ? 'לא עובד? לחץ לשליחה ידנית במייל' : 'Not working? Click here to send email manually'}
                                    </button>
                                    <p className="text-[10px] text-slate-600 mt-1">
                                        {t('privacyNote')}
                                    </p>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactModal;