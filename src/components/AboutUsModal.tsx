import React, { useState } from 'react';
import { Icons } from './Icons';

interface AboutUsModalProps {
    onClose: () => void;
}

type Language = 'he' | 'en';

export const AboutUsModal: React.FC<AboutUsModalProps> = ({ onClose }) => {
    const [language, setLanguage] = useState<Language>('he');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-heebo">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onClose}></div>
            
            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95" dir={language === 'he' ? 'rtl' : 'ltr'}>
                
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Icons.Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">
                                {language === 'he' ? 'מי אנחנו' : 'About Us'}
                            </h2>
                        </div>
                        {/* Language Toggle */}
                        <div className="bg-slate-800 p-1 rounded-lg flex items-center border border-white/5">
                            <button 
                                onClick={() => setLanguage('he')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'he' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                עברית
                            </button>
                            <button 
                                onClick={() => setLanguage('en')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'en' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                English
                            </button>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <Icons.X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className={`p-8 overflow-y-auto custom-scrollbar text-slate-300 leading-relaxed space-y-8 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                    
                    {language === 'he' ? (
                        <>
                            <section>
                                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                                    מי אנחנו
                                </h3>
                                <p>
                                    אנחנו <strong>StudioPlay AI</strong>, פלטפורמה דיגיטלית מתקדמת ליצירה, עיבוד ושיפור תמונות באמצעות טכנולוגיות חכמות ושילוב יכולות AI מתקדמות. המערכת נבנתה מתוך צורך אמיתי של יוצרים, בעלי עסקים ומשווקים לייצר תוכן חזותי איכותי – במהירות, בפשטות וללא ידע טכני מוקדם.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-pink-500 rounded-full"></div>
                                    מה השירות שלנו
                                </h3>
                                <div className="mb-4">
                                    StudioPlay AI מאפשרת למשתמשים:
                                    <ul className="list-disc pr-5 mt-3 space-y-2">
                                        <li>להעלות תמונות</li>
                                        <li>ליצור ולעבד תמונות בעזרת מערכת חכמה</li>
                                        <li>לייצר תוכן חזותי מקצועי לשיווק, מדיה חברתית, מוצרים ופרויקטים דיגיטליים</li>
                                    </ul>
                                </div>
                                <p>הכול דרך ממשק פשוט, נגיש ומהיר, מכל מכשיר.</p>
                            </section>

                            <section>
                                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                    למה האתר קיים
                                </h3>
                                <p>
                                    האתר והאפליקציה נוצרו כדי לחסוך זמן, כסף ותהליכים מורכבים, ולאפשר לכל משתמש – פרטי או עסקי – ליהנות מתוצאות ויזואליות ברמה גבוהה, ללא צורך בתוכנות כבדות או ידע מקצועי בעיצוב. המטרה שלנו היא להנגיש כלים חכמים ליצירת תוכן איכותי, בצורה יעילה ובטוחה.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                                    מי עומד מאחורי StudioPlay AI
                                </h3>
                                <p>
                                    הפלטפורמה מופעלת על-ידי <strong>StudioPlay</strong>, עסק דיגיטלי עצמאי המתמחה בפיתוח פתרונות יצירתיים, מערכות חכמות ושירותי תוכן מבוססי טכנולוגיה. אנו מחויבים לשקיפות, פרטיות המשתמשים, חוויית שימוש איכותית ותמיכה מתמשכת.
                                </p>
                            </section>
                        </>
                    ) : (
                        <>
                            <section>
                                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                                    Who We Are
                                </h3>
                                <p>
                                    We are <strong>StudioPlay AI</strong>, an advanced digital platform for creating, processing, and enhancing images using smart technologies and cutting-edge AI capabilities. The system was built out of a genuine need for creators, business owners, and marketers to produce high-quality visual content – quickly, simply, and without prior technical expertise.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-pink-500 rounded-full"></div>
                                    Our Service
                                </h3>
                                <div className="mb-4">
                                    StudioPlay AI allows users to:
                                    <ul className="list-disc pl-5 mt-3 space-y-2">
                                        <li>Upload images seamlessly</li>
                                        <li>Create and process images using an intelligent AI system</li>
                                        <li>Generate professional visual content for marketing, social media, product listings, and digital projects</li>
                                    </ul>
                                </div>
                                <p>All through a simple, accessible, and fast interface, available on any device.</p>
                            </section>

                            <section>
                                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                    Why We Exist
                                </h3>
                                <p>
                                    The website and application were designed to save time, money, and simplify complex design workflows. We enable every user – whether private or professional – to enjoy high-level visual results without the need for heavy software or specialized design knowledge. Our mission is to make smart content creation tools accessible, efficient, and secure for everyone.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                                    Who is Behind StudioPlay AI
                                </h3>
                                <p>
                                    The platform is operated by <strong>StudioPlay</strong>, an independent digital business specializing in creative solutions, intelligent systems, and technology-driven content services. We are dedicated to transparency, user privacy, delivering a premium user experience, and providing ongoing support.
                                </p>
                            </section>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AboutUsModal;