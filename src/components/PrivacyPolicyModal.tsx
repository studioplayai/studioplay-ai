import React, { useState } from 'react';
import { Icons } from './Icons';

interface PrivacyPolicyModalProps {
    onClose: () => void;
}

type Language = 'he' | 'en';

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
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
                                {language === 'he' ? 'מדיניות פרטיות' : 'Privacy Policy'}
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
                                    ברוכים הבאים לאתר <strong>StudiPlayAi.com</strong> (להלן: "האתר"). אנו מכבדים את פרטיות המשתמשים שלנו ומחויבים להגן על המידע האישי הנאסף במסגרת השימוש באתר ובשירותים המוצעים בו.
                                </p>
                                <p>
                                    מדיניות פרטיות זו מסבירה איזה מידע אנו אוספים, כיצד אנו משתמשים בו, וכיצד אנו שומרים עליו – בהתאם לדין החל, לרבות חוק הגנת הפרטיות, התשמ"א–1981 והתקנות מכוחו.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">1. איסוף מידע</h3>
                                <p className="mb-2">בעת השימוש באתר, ייתכן וייאסף מידע מהסוגים הבאים:</p>
                                
                                <div className="mb-4">
                                    <strong className="text-purple-400 block mb-1">א. מידע אישי שמוזן על-ידי המשתמש</strong>
                                    <ul className="list-disc pr-5 space-y-1">
                                        <li>שם מלא</li>
                                        <li>כתובת דוא"ל</li>
                                        <li>מספר טלפון</li>
                                        <li>פרטי התחברות לחשבון</li>
                                        <li>פרטי תשלום ומנוי (מעובדים ומאובטחים באמצעות ספקי סליקה חיצוניים בלבד)</li>
                                        <li>תכנים שהמשתמש מעלה למערכת, לרבות תמונות וקבצים</li>
                                    </ul>
                                </div>

                                <div>
                                    <strong className="text-purple-400 block mb-1">ב. מידע טכני וסטטיסטי</strong>
                                    <ul className="list-disc pr-5 space-y-1">
                                        <li>כתובת IP</li>
                                        <li>מיקום גיאוגרפי כללי</li>
                                        <li>סוג דפדפן, מערכת הפעלה ומכשיר</li>
                                        <li>זמני כניסה, משך שימוש ופעולות שבוצעו באפליקציה</li>
                                        <li>דפים נצפים ונתוני שימוש כלליים</li>
                                    </ul>
                                    <p className="mt-2 text-sm text-slate-500">מידע זה נאסף באמצעים אוטומטיים כגון Cookies, כלי אנליטיקה וטכנולוגיות דומות.</p>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">2. שימוש במידע</h3>
                                <p className="mb-2">המידע שנאסף ישמש למטרות הבאות:</p>
                                <ul className="list-disc pr-5 space-y-1">
                                    <li>הפעלת האפליקציה ומתן שירותי AI ליצירה ועיבוד תמונות</li>
                                    <li>ניהול מנויים חודשיים וחיובים</li>
                                    <li>זיהוי משתמשים ואבטחת חשבונות</li>
                                    <li>שיפור ביצועי המערכת, חוויית המשתמש ואיכות התוצרים</li>
                                    <li>התאמת תכנים, פיצ'רים והצעות שימוש</li>
                                    <li>יצירת קשר עם המשתמש לצרכי שירות, תמיכה ועדכונים תפעוליים</li>
                                    <li>שליחת דיוור שיווקי, בכפוף להסכמת המשתמש ובהתאם לחוק</li>
                                    <li>עמידה בדרישות חוקיות, רגולטוריות ובינלאומיות</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">3. דיוור שיווקי</h3>
                                <p>
                                    האתר עשוי לשלוח הודעות שיווקיות בדוא"ל, SMS או באמצעים אחרים – רק לאחר קבלת הסכמה מפורשת מהמשתמש. ניתן להסיר את עצמך מרשימת התפוצה בכל עת באמצעות קישור ההסרה או פנייה אלינו.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">4. Cookies וכלי צד שלישי</h3>
                                <p className="mb-2">
                                    האתר עושה שימוש ב-Cookies ובכלי צד שלישי לצורך תפעול שוטף, ניתוח נתונים, ניהול מנויים ושיפור השירות.
                                </p>
                                <p className="mb-2">בין היתר, האתר עשוי להשתמש ב:</p>
                                <ul className="list-disc pr-5 space-y-1">
                                    <li>כלי אנליטיקה (כגון Google Analytics)</li>
                                    <li>שירותי סליקה ומנויים</li>
                                    <li>שירותי אחסון ועיבוד נתונים בענן</li>
                                    <li>מערכות דיוור, תמיכה ואוטומציה</li>
                                </ul>
                                <p className="mt-2">
                                    המשתמש רשאי לחסום או למחוק Cookies דרך הגדרות הדפדפן, אך ייתכן שחלק מהפונקציות לא יעבדו כראוי.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">5. מסירת מידע לצדדים שלישיים</h3>
                                <p className="mb-2">האתר לא יעביר מידע אישי לצדדים שלישיים, אלא במקרים הבאים:</p>
                                <ul className="list-disc pr-5 space-y-1">
                                    <li>לצורך אספקת השירות (כגון חברות סליקה, אחסון, דיוור)</li>
                                    <li>כאשר קיימת חובה חוקית לעשות כן</li>
                                    <li>במקרה של הפרת תנאי השימוש או פעילות בלתי חוקית</li>
                                    <li>בהסכמת המשתמש</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">6. אבטחת מידע</h3>
                                <p className="mb-2">
                                    אנו מיישמים אמצעי אבטחה מתקדמים ומקובלים בתעשייה, לרבות הצפנה, הגבלת גישה, ניטור מערכות ושימוש בתשתיות ענן מאובטחות.
                                </p>
                                <p>
                                    עם זאת, מאחר ומדובר בשירות אינטרנטי גלובלי המבוסס על "AS IS", לא ניתן להבטיח אבטחה מוחלטת, והמשתמש מצהיר כי הוא מודע לכך והשימוש נעשה באחריותו.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">7. זכות עיון, תיקון ומחיקה</h3>
                                <p>
                                    בהתאם לחוק, כל משתמש זכאי לעיין במידע האישי שנשמר אודותיו, לבקש את תיקונו או את מחיקתו. ניתן לפנות אלינו באמצעות פרטי הקשר המפורטים להלן.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">8. שמירת מידע</h3>
                                <p>
                                    המידע האישי והתכנים נשמרים כל עוד קיים חשבון משתמש פעיל או מנוי, וכן למשך הזמן הדרוש לצורך תפעול השירות, עמידה בהתחייבויות חוקיות ושיפור המערכת.
                                    משתמש רשאי לבקש מחיקת חשבונו והמידע האישי שלו, בכפוף למגבלות חוקיות וטכניות.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">9. שינויים במדיניות הפרטיות</h3>
                                <p>
                                    החברה שומרת לעצמה את הזכות לעדכן מדיניות פרטיות זו מעת לעת, בין היתר עקב שינויים טכנולוגיים, משפטיים או עסקיים.
                                    המשך שימוש באתר לאחר פרסום העדכון מהווה הסכמה למדיניות המעודכנת.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">10. יצירת קשר ופרטי העסק</h3>
                                <ul className="list-none space-y-1 bg-slate-800 p-4 rounded-xl border border-white/5">
                                    <li>🏢 <strong>StudioPlay</strong></li>
                                    <li>👤 <strong>בעלים:</strong> מיכה לסרי</li>
                                    <li>💼 <strong>סוג עסק:</strong> עוסק מורשה (ישראל)</li>
                                    <li>📧 <strong>דוא"ל:</strong> <a href="mailto:studioplayai1@gmail.com" className="text-purple-400 hover:underline">studioplayai1@gmail.com</a></li>
                                    <li>📞 <strong>טלפון:</strong> 052-3040000</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">11. שימוש בבינה מלאכותית (AI) ועיבוד תמונות</h3>
                                <p className="mb-2">
                                    האפליקציה עושה שימוש בטכנולוגיות בינה מלאכותית לצורך יצירה, עיבוד, שיפור ועריכת תמונות ותכנים חזותיים.
                                </p>
                                <div className="mb-2">בעת העלאת תמונות או קבצים למערכת:</div>
                                <ul className="list-disc pr-5 space-y-1 mb-2">
                                    <li>המשתמש מצהיר כי הוא בעל הזכויות בתוכן או שיש לו הרשאה חוקית לעשות בו שימוש</li>
                                    <li>המשתמש מעניק לאתר רישיון מוגבל לצורך עיבוד התוכן באמצעות מערכות AI</li>
                                    <li>התכנים עשויים לעבור עיבוד אוטומטי באמצעות שרתים וגורמי צד שלישי טכנולוגיים</li>
                                </ul>
                                <p className="text-sm text-slate-400">
                                    האתר אינו עושה שימוש בתכנים שהועלו לצורך פרסום, מכירה או שימוש מסחרי חיצוני – אלא אם צוין אחרת או ניתנה הסכמה מפורשת.
                                    המשתמש מודע לכך שתוצרי AI מסופקים כ־AS IS, אך החברה עושה מאמצים סבירים לספק שירות יציב ואמין. האחריות לשימוש בתוצרים חלה על המשתמש בלבד.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">12. משתמשים בינלאומיים ו-GDPR</h3>
                                <p className="mb-2">האתר פונה למשתמשים מכל העולם, לרבות מדינות האיחוד האירופי.</p>
                                <p className="mb-2">בהתאם ל-GDPR ולחוקי פרטיות בינלאומיים, למשתמשים עומדות הזכויות הבאות:</p>
                                <ul className="list-disc pr-5 space-y-1 mb-2">
                                    <li>קבלת מידע על הנתונים הנשמרים אודותיהם</li>
                                    <li>בקשה לתיקון, הגבלה או מחיקה של מידע אישי</li>
                                    <li>בקשה לייצוא הנתונים (Data Portability)</li>
                                    <li>התנגדות לעיבוד מידע מסוים</li>
                                </ul>
                                <p>בקשות בנושא זה ניתן להפנות לפרטי הקשר המצוינים לעיל.</p>
                            </section>

                            <div className="pt-6 border-t border-white/10 text-center text-sm text-slate-500">
                                השימוש באתר ובאפליקציה מהווה הסכמה מלאה למדיניות פרטיות זו.
                            </div>
                        </>
                    ) : (
                        <>
                            <section>
                                <p className="mb-4">
                                    Welcome to <strong>StudiPlayAi.com</strong> (the "Website" or "Application"), operated by <strong>StudioPlay</strong> ("we", "our", or "the Company"). We respect your privacy and are committed to protecting your personal information.
                                </p>
                                <p>
                                    This Privacy Policy explains how we collect, use, store, and protect information when you use our AI-powered services.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">1. Information We Collect</h3>
                                
                                <div className="mb-4">
                                    <strong className="text-purple-400 block mb-1">a. Information You Provide</strong>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Full name</li>
                                        <li>Email address</li>
                                        <li>Phone number</li>
                                        <li>Account login details</li>
                                        <li>Subscription and payment information (processed via third-party payment providers only)</li>
                                        <li>Images, files, or content uploaded to the platform</li>
                                    </ul>
                                </div>

                                <div>
                                    <strong className="text-purple-400 block mb-1">b. Technical & Usage Data</strong>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>IP address</li>
                                        <li>General geographic location</li>
                                        <li>Browser, device, and operating system</li>
                                        <li>Usage activity, session duration, and features used</li>
                                        <li>Cookies and similar tracking technologies</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">2. Use of Information</h3>
                                <p className="mb-2">We use the collected information to:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Provide and operate AI image generation and processing services</li>
                                    <li>Manage subscriptions and billing</li>
                                    <li>Authenticate users and secure accounts</li>
                                    <li>Improve system performance and user experience</li>
                                    <li>Provide customer support and service notifications</li>
                                    <li>Send marketing communications (with consent)</li>
                                    <li>Comply with legal and regulatory obligations</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">3. AI & Image Processing</h3>
                                <p className="mb-2">
                                    By uploading images or content, you confirm that you own the rights or have legal permission to use them.
                                </p>
                                <p className="mb-2">
                                    Uploaded content is processed automatically using AI systems for the sole purpose of providing the service. We do not sell or publicly use uploaded content without explicit consent.
                                </p>
                                <p>
                                    AI-generated outputs are provided "AS IS", however, the company makes reasonable efforts to provide a stable and reliable service. Use of results is at your own responsibility.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">4. Cookies & Third-Party Services</h3>
                                <p className="mb-2">
                                    We use cookies and third-party tools such as analytics, cloud infrastructure, payment processors, and automation services.
                                </p>
                                <p>
                                    You may disable cookies in your browser settings, though some features may not function properly.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">5. Data Sharing</h3>
                                <p className="mb-2">We do not sell personal data. Information may be shared only:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>With trusted service providers necessary to operate the platform</li>
                                    <li>When legally required</li>
                                    <li>With user consent</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">6. Data Security</h3>
                                <p>
                                    We implement industry-standard security measures. However, as this service is provided "AS IS", no system is 100% secure, and use of the service is at your own risk.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">7. International Users & GDPR</h3>
                                <p>
                                    We serve users worldwide, including the EU. Users may request access, correction, deletion, or export of their personal data, in accordance with GDPR and applicable laws.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-3">8. Business Information & Contact</h3>
                                <ul className="list-none space-y-1 bg-slate-800 p-4 rounded-xl border border-white/5">
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

export default PrivacyPolicyModal;