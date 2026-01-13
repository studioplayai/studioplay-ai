import React, { useState } from 'react';
import { Icons } from './Icons';

interface RefundPolicyModalProps {
    onClose: () => void;
}

type Language = 'he' | 'en';

export const RefundPolicyModal: React.FC<RefundPolicyModalProps> = ({ onClose }) => {
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
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {language === 'he' ? 'מדיניות החזרים וביטולים' : 'Refund & Cancellation Policy'}
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                {language === 'he' ? 'עודכן לאחרונה: 20.05.2024' : 'Last updated: May 20, 2024'}
                            </p>
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
                            <section className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl">
                                <p className="text-purple-300 font-bold text-lg">
                                    ביטול עסקה בהתאם לתקנות הגנת הצרכן (ביטול עסקה), התשע"א-2010 וחוק הגנת הצרכן, התשמ"א-1981.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">1. סוג השירות</h3>
                                <p>
                                    האתר מספק שירות דיגיטלי מבוסס מנוי (SaaS) הכולל שימוש באפליקציית בינה מלאכותית (AI) ליצירה, עיבוד ועריכת תמונות ותכנים חזותיים.
                                </p>
                                <p className="mt-2">
                                    מאחר ומדובר בטובין הניתנים להקלטה, לשעתוק או לשכפול, שהצרכן פתח את אריזתם המקורית (גישה לתוכן דיגיטלי), ובהתאם לחוק, זכות הביטול מוגבלת מרגע תחילת השימוש בשירות.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">2. מנויים חודשיים וביטול</h3>
                                <ul className="list-disc pr-5 space-y-2">
                                    <li>ניתן לבטל את המנוי בכל עת. הביטול יפסיק את החיוב הבא באופן אוטומטי.</li>
                                    <li>הודעת ביטול תישלח בכתב באמצעות דוא"ל או דרך אזור ניהול המנוי באתר.</li>
                                    <li>בהתאם לחוק, אם בוטלה עסקת מכר מרחוק של שירות מתמשך, יופסק החיוב תוך 3 ימי עסקים מהודעת הביטול (או 6 ימים בדואר רשום).</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">3. דמי ביטול והחזרים</h3>
                                <ul className="list-disc pr-5 space-y-2">
                                    <li className="text-white font-bold">ניתן לקבל החזר כספי תוך 7 ימים ממועד הרכישה, בתנאי שלא נעשה שימוש מהותי בשירות.</li>
                                    <li>עבור שירות דיגיטלי שהשימוש בו החל, לא יינתן החזר כספי רטרואקטיבי בגין התקופה שחלפה.</li>
                                    <li>במקרה של ביטול עסקה חד פעמית לפני תחילת מתן השירות, ינוכו דמי ביטול בשיעור של 5% ממחיר העסקה או 100 ש"ח, לפי הנמוך מביניהם.</li>
                                    <li>זיכוי כספי יבוצע לאמצעי התשלום ממנו בוצעה העסקה בלבד.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">4. מקרים חריגים</h3>
                                <p>
                                    החברה מחויבת לשביעות רצון הלקוח. במקרים של תקלות טכניות מהותיות אשר מנעו את השימוש בקרדיטים שנרכשו, ייבחן החזר כספי או זיכוי בקרדיטים חלופיים לפי שיקול דעת החברה.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">5. יצירת קשר לביטולים ופרטי העסק</h3>
                                <ul className="list-none space-y-1 bg-slate-800 p-4 rounded-xl border border-white/5">
                                    <li>🏢 <strong>StudioPlay</strong></li>
                                    <li>👤 <strong>בעלים:</strong> מיכה לסרי</li>
                                    <li>💼 <strong>סוג עסק:</strong> עוסק מורשה (ישראל)</li>
                                    <li>📧 <strong>דוא"ל:</strong> <a href="mailto:studioplayai1@gmail.com" className="text-purple-400 hover:underline">studioplayai1@gmail.com</a></li>
                                    <li>📞 <strong>וואטסאפ שירות:</strong> 052-3040000</li>
                                </ul>
                            </section>

                            <div className="pt-6 border-t border-white/10 text-center text-sm text-slate-500">
                                תקנון זה עודכן בהתאם לחוק הגנת הצרכן בישראל.
                            </div>
                        </>
                    ) : (
                        <>
                            <section className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-300">
                                <p className="font-bold">
                                    Cancellation is handled in accordance with the Israeli Consumer Protection Regulations (Cancellation of a Transaction), 2010, and the Consumer Protection Law, 1981.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">1. Service Type</h3>
                                <p>
                                    StudioPlay provides digital SaaS (Software as a Service) powered by AI. Access to digital content is provided immediately upon subscription.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">2. Cancellation Policy</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>You may cancel your recurring subscription at any time.</li>
                                    <li>Cancellation requests can be made via email or user dashboard.</li>
                                    <li>Billing will stop starting from the next cycle following the cancellation request.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">3. Refunds</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li className="text-white font-bold">Refunds are available within 7 days from purchase, provided the service was not materially used.</li>
                                    <li>Due to the nature of digital goods (reproducible content), refunds are generally not provided for periods where the service was accessible.</li>
                                    <li>Legal cancellation fees (5% or 100 NIS, whichever is lower) may apply to non-subscription transactions canceled before use.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">4. Support & Business Information</h3>
                                <ul className="list-none space-y-1 bg-slate-800 p-4 rounded-xl border border-white/5 text-left">
                                    <li>🏢 <strong>StudioPlay</strong></li>
                                    <li>👤 <strong>Owner:</strong> Micha Lasri</li>
                                    <li>💼 <strong>Business type:</strong> Sole Proprietor (Israel)</li>
                                    <li>📧 <strong>Email:</strong> <a href="mailto:studioplayai1@gmail.com" className="text-purple-400 hover:underline">studioplayai1@gmail.com</a></li>
                                    <li>📞 <strong>Phone:</strong> +972-52-3040000</li>
                                </ul>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RefundPolicyModal;