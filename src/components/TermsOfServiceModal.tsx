import React, { useState } from 'react';
import { Icons } from './Icons';

interface TermsOfServiceModalProps {
    onClose: () => void;
}

type Language = 'he' | 'en';

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ onClose }) => {
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
                                {language === 'he' ? 'תנאי שימוש' : 'Terms of Service'}
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                {language === 'he' ? 'עודכן לאחרונה: 17.12.2025' : 'Last updated: December 17, 2025'}
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
                            <section>
                                <p className="mb-4">
                                    הגלישה והשימוש באתר <strong>StudiPlayAi.com</strong> מהווים הסכמה לתנאי שימוש אלה.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">1. תיאור השירות</h3>
                                <p>
                                    StudiPlayAi מספקת פלטפורמה מבוססת בינה מלאכותית (AI) ליצירה, עריכה ועיבוד של תמונות ותוכן חזותי.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">2. זכאות</h3>
                                <p>
                                    השימוש באתר מותר לבני 18 ומעלה, או באישור אפוטרופוס חוקי לקטינים.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">3. חשבונות</h3>
                                <p>
                                    המשתמש אחראי לשמירת על סודיות פרטי ההתחברות שלו ועל כל פעילות המתבצעת בחשבונו.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">4. מנויים ותשלומים</h3>
                                <ul className="list-disc pr-5 space-y-1">
                                    <li>השירותים ניתנים על בסיס מנוי חודשי מתחדש.</li>
                                    <li>החיוב מתבצע מראש.</li>
                                    <li>החברה רשאית לעדכן מחירים ומסלולים בהודעה מראש.</li>
                                    <li>החיוב מתבצע באמצעות ספקי סליקה צד שלישי.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">5. הצהרת AI</h3>
                                <p>
                                    תוצרי הבינה המלאכותית מסופקים כ־AS IS, אך החברה עושה מאמצים סבירים לספק שירות יציב ואמין. אנו לא מתחייבים לדיוק מוחלט, איכות ספציפית או התאמה למטרה מסוימת.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">6. אחריות על תוכן</h3>
                                <p>
                                    רשאי להעלות תוכן רק מי שבבעלותו הזכויות עליו או שקיבל הרשאה חוקית לכך. המשתמש מעניק לפלטפורמה רישיון מוגבל לעבד את התוכן לצורך מתן השירות בלבד.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">7. שימוש אסור</h3>
                                <p className="mb-2">אין לעשות שימוש בשירות ל:</p>
                                <ul className="list-disc pr-5 space-y-1">
                                    <li>פעילות בלתי חוקית.</li>
                                    <li>הפרת זכויות יוצרים או פרטיות.</li>
                                    <li>ניסיון לפגוע במערכת או לנצל אותה לרעה.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">8. זמינות השירות</h3>
                                <p>
                                    אנו לא מתחייבים לשירות רציף ללא תקלות, ורשאים לשנות או להפסיק פיצ'רים בכל עת.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">9. הגבלת אחריות</h3>
                                <p>
                                    השירות מסופק כ־AS IS, אך החברה עושה מאמצים סבירים לספק שירות יציב ואמין. StudioPlay לא תישא באחריות לכל נזק ישיר או עקיף הנובע מהשימוש בפלטפורמה.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">10. הדין החל</h3>
                                <p>
                                    על תנאים אלה יחולו דיני מדינת ישראל.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">11. יצירת קשר ופרטי העסק</h3>
                                <ul className="list-none space-y-1 bg-slate-800 p-4 rounded-xl border border-white/5">
                                    <li>🏢 <strong>StudioPlay</strong></li>
                                    <li>👤 <strong>בעלים:</strong> מיכה לסרי</li>
                                    <li>💼 <strong>סוג עסק:</strong> עוסק מורשה (ישראל)</li>
                                    <li>📧 <strong>דוא"ל:</strong> <a href="mailto:studioplayai1@gmail.com" className="text-purple-400 hover:underline">studioplayai1@gmail.com</a></li>
                                    <li>📞 <strong>טלפון:</strong> 052-3040000</li>
                                </ul>
                            </section>
                        </>
                    ) : (
                        <>
                            <section>
                                <p className="mb-4">
                                    By accessing or using <strong>StudiPlayAi.com</strong>, you agree to these Terms of Service.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">1. Service Description</h3>
                                <p>
                                    StudiPlayAi provides an AI-based platform for image creation, editing, and processing.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">2. Eligibility</h3>
                                <p>
                                    You must be at least 18 years old or have legal guardian approval.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">3. Accounts</h3>
                                <p>
                                    Users are responsible for maintaining the confidentiality of their login credentials and all activity under their account.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">4. Subscriptions & Payments</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Services are offered on a recurring subscription basis.</li>
                                    <li>Payments are charged in advance.</li>
                                    <li>Pricing and plans may change with notice.</li>
                                    <li>Billing is handled via third-party providers.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">5. AI Disclaimer</h3>
                                <p>
                                    AI-generated content is provided "AS IS", however, the company makes reasonable efforts to provide a stable and reliable service. We do not guarantee accuracy, quality, or suitability.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">6. Content Responsibility</h3>
                                <p>
                                    You may upload content only if you own the rights or have legal permission. You grant the platform a limited license to process content solely for service delivery.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">7. Prohibited Use</h3>
                                <p className="mb-2">You may not:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Use the service for illegal activities.</li>
                                    <li>Violate intellectual property or privacy rights.</li>
                                    <li>Attempt to disrupt or exploit the system.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">8. Service Availability</h3>
                                <p>
                                    We do not guarantee uninterrupted service and may modify or discontinue features at any time.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">9. Limitation of Liability</h3>
                                <p>
                                    The service is provided "AS IS", however, the company makes reasonable efforts to provide a stable and reliable service. StudioPlay shall not be liable for any direct or indirect damages resulting from use of the platform.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">10. Governing Law</h3>
                                <p>
                                    These terms are governed by the laws of the State of Israel.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">11. Business Information & Contact</h3>
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

export default TermsOfServiceModal;