
import { Transaction, User } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { updateUserCredits } from './authService';

const isNetworkError = (e: any): boolean => {
    const msg = String(e?.message || e || '').toLowerCase();
    return msg.includes('failed to fetch') || msg.includes('network') || msg.includes('load failed');
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
    if (!isSupabaseConfigured()) return [];
    
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return (data || []).filter(Boolean).map(t => ({
            id: t.id || Math.random().toString(),
            userId: t.user_id,
            amount: t.amount || 0,
            currency: t.currency || 'ILS',
            status: t.status || 'pending',
            date: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
            planName: t.plan_name || 'unknown',
            lemonSqueezyId: t.ls_id
        }));
    } catch (error: any) {
        if (!isNetworkError(error)) {
            console.error('Fetch transactions error:', error.message || error);
        }
        return [];
    }
};

export const generateLemonSqueezyCheckout = (planId: string, user: User) => {
    const PRODUCTS: Record<string, {name: string, price: number, credits: number}> = {
        'basic': { name: 'Basic Plan', price: 39.95, credits: 35 },
        'pro': { name: 'Pro Plan', price: 59.95, credits: 80 },
        'promax': { name: 'Pro Max Plan', price: 89.99, credits: 120 },
    };

    const product = PRODUCTS[planId];
    if(!product) throw new Error("Invalid product");

    return `?payment_success=true&plan=${planId}&amount=${product.price}&credits=${product.credits}`;
};

export const processSuccessfulPayment = async (planId: string, amount: number, credits: number, user: User) => {
    if (!user?.id) return null;

    if (isSupabaseConfigured()) {
        try {
            const { error } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    amount,
                    currency: 'ILS',
                    status: 'paid',
                    plan_name: planId,
                    ls_id: `ls-${Math.floor(Math.random() * 10000)}`
                });
            
            if (error) console.error("Error recording transaction:", error.message);
        } catch (e) {
            // Silently fail transaction log in local mode/network error
        }
    }

    return await updateUserCredits(user.id, credits, (planId === 'pro' || planId === 'promax') ? 'pro' : 'free');
};

export const injectMockTransactions = async () => {
    if (!isSupabaseConfigured()) return;

    try {
        const { data: profiles } = await supabase.from('profiles').select('id').limit(3);
        if (!profiles || profiles.length === 0) return;

        for (const profile of profiles) {
            if (!profile?.id) continue;
            await supabase.from('transactions').insert({
                user_id: profile.id,
                amount: 59.95,
                currency: 'ILS',
                status: 'paid',
                plan_name: 'Pro Plan'
            });
        }
    } catch (e) {
        // Ignore errors during mock injection
    }
};
