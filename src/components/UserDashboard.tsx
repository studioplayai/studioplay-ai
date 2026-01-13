
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { User, Transaction, AppLanguage } from '../types';
import { getAllTransactions } from '../services/paymentService';
import { updateUserProfile, claimDailyBonus } from '../services/authService';
import { TRANSLATIONS } from '../translations';

interface UserDashboardProps {
    user: User;
    onClose: () => void;
    onLogout: () => void;
    onUserUpdate: (updatedUser: User) => void;
    onBuyMore: () => void;
    language: AppLanguage;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ 
    user, 
    onClose, 
    onLogout, 
    onUserUpdate,
    onBuyMore,
    language 
}) => {
    const t = (key: string) => {
        // @ts-ignore
        return TRANSLATIONS[language][key] || key;
    };

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [bonusMessage, setBonusMessage] = useState<string | null>(null);
    const [timeToNext, setTimeToNext] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.id) return;
            try {
                const allTx = await getAllTransactions();
                const userTx = (allTx || [])
                    .filter(tx => tx && tx.userId === user.id)
                    .sort((a, b) => b.date - a.date);
                setTransactions(userTx);
            } catch (err) {
                console.error("History fetch error", err);
            }
        };
        fetchHistory();
    }, [user?.id]);

    useEffect(() => {
        const checkBonusTime = () => {
            if (!user?.id) return;
            const lastReward = localStorage.getItem(`studioplay_last_reward_${user.id}`);
            if (lastReward) {
                const now = Date.now();
                const elapsed = now - parseInt(lastReward);
                // Identifier cannot start with a digit
                const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
                
                if (elapsed < TWENTY_FOUR_HOURS_MS) {
                    const remaining = TWENTY_FOUR_HOURS_MS - elapsed;
                    const hours = Math.floor(remaining / (1000 * 60 * 60));
                    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                    setTimeToNext(`${hours}h ${minutes}m`);
                } else {
                    setTimeToNext(null);
                }
            }
        };
        checkBonusTime();
        const timer = setInterval(checkBonusTime, 60000);
        return () => clearInterval(timer);
    }, [user.id, bonusMessage]);

    const handleClaimBonus = async () => {
        const updated = await claimDailyBonus(user.id);
        if (updated) {
            onUserUpdate(updated);
            setBonusMessage(t('bonusClaimed'));
            setTimeout(() => setBonusMessage(null), 3000);
        }
    };

    const handleSaveProfile = async () => {
        if (!editName.trim() || !user?.id) return;
        setIsSaving(true);
        try {
            const updated = await updateUserProfile(user.id, editName);
            if (updated) {
                onUserUpdate(updated);
                setIsEditing(false);
            }
        } catch (e) {
            console.error("Failed to update profile", e);
        } finally {
            setIsSaving(false);
        }
    };

    const getPlanLabel = (plan: string) => {
        switch(plan) {
            case 'pro': return t('planLabelPro');
            case 'agency': return t('planLabelAgency');
            default: return t('planLabelFree');
        }
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-200 font-heebo" dir={language === 'he' ? 'rtl' : 'ltr'}>
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative w-full max-w-4xl bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                
                {/* Sidebar / Profile Summary */}
                <div className="w-full md:w-80 bg-slate-900/50 p-6 md:p-8 flex flex-col items-center text-center border-b md:border-b-0 ltr:md:border-r rtl:md:border-l border-white/5">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 p-1 mb-4 shadow-xl shadow-purple-500/20">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-black text-white uppercase">
                            {user.name?.slice(0, 2) || 'UP'}
                        </div>
                    </div>
                    
                    {isEditing ? (
                        <div className="mb-4 w-full">
                            <input 
                                type="text" 
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-center text-white mb-2"
                                autoFocus
                            />
                            <div className="flex gap-2 justify-center">
                                <button onClick={handleSaveProfile} disabled={isSaving} className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-md transition-colors">
                                    {isSaving ? '...' : t('saveChanges')}
                                </button>
                                <button onClick={() => { setIsEditing(false); setEditName(user.name); }} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-md transition-colors">
                                    {t('cancel')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                {user.name}
                                <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-white transition-colors">
                                    <Icons.Edit className="w-4 h-4"/>
                                </button>
                            </h2>
                            <p className="text-sm text-slate-400 mb-6">{user.email}</p>
                        </>
                    )}

                    <div className="w-full space-y-4 mb-8">
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('currentPlan')}</div>
                            <div className="text-lg font-bold text-white flex items-center justify-center gap-2">
                                {user.plan === 'pro' && <Icons.Zap className="w-4 h-4 text-yellow-400" />}
                                {getPlanLabel(user.plan)}
                            </div>
                        </div>
                        
                        {/* Daily Bonus Section */}
                        <div className="bg-gradient-to-tr from-pink-500/10 to-purple-500/10 p-4 rounded-2xl border border-pink-500/20">
                            <div className="text-[10px] text-pink-400 font-black uppercase tracking-widest mb-2 flex items-center justify-center gap-1">
                                <Icons.Gift className="w-3 h-3"/> {t('dailyBonus')}
                            </div>
                            {timeToNext ? (
                                <div className="text-xs text-slate-500 font-bold">
                                    {t('nextBonusIn')} <span className="font-mono">{timeToNext}</span>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleClaimBonus}
                                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold py-2 rounded-xl shadow-lg animate-pulse"
                                >
                                    {t('claimGift')}
                                </button>
                            )}
                            {bonusMessage && <div className="text-[10px] text-green-400 mt-2 font-bold animate-bounce">{bonusMessage}</div>}
                        </div>
                    </div>

                    <button onClick={onLogout} className="mt-auto text-sm text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors">
                        <Icons.X className="w-4 h-4" /> {t('logout')}
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-slate-950">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-white">{t('myAccount')}</h2>
                        <button onClick={onClose} className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white transition-colors">
                            <Icons.X className="w-5 h-5"/>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-purple-900/30 to-slate-900 p-6 rounded-2xl border border-purple-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Icons.Zap className="w-24 h-24 text-purple-500"/>
                            </div>
                            <h3 className="text-slate-400 text-sm font-bold uppercase mb-2">{t('creditsLeft')}</h3>
                            <div className="text-4xl font-black text-white mb-4">{user.credits}</div>
                            <button 
                                onClick={onBuyMore}
                                className="bg-white text-purple-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-purple-100 transition-colors shadow-lg shadow-purple-900/20 flex items-center gap-2"
                            >
                                <Icons.Zap className="w-4 h-4"/> {t('buyCredits')}
                            </button>
                        </div>
                    </div>

                    {/* History */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Icons.Layout className="w-5 h-5 text-slate-400"/>
                            {t('history')}
                        </h3>
                        
                        <div className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden">
                            {transactions.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="px-6 py-4 text-start">{t('date')}</th>
                                            <th className="px-6 py-4 text-start">{t('item')}</th>
                                            <th className="px-6 py-4 text-start">{t('amount')}</th>
                                            <th className="px-6 py-4 text-start">{t('status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {transactions.map(tx => (
                                            <tr key={tx.id} className="hover:bg-white/5 transition-colors text-slate-300">
                                                <td className="px-6 py-4 font-mono">{new Date(tx.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-bold text-white">{tx.planName === 'basic' ? 'Basic (35)' : tx.planName === 'pro' ? 'Pro (80)' : 'Pro Max (120)'}</td>
                                                <td className="px-6 py-4">₪{tx.amount}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${tx.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    <Icons.Box className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                                    <p>{t('noTransactions')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
