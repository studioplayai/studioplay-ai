
import { User } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const normalizePlan = (p: any): User["plan"] => {
  const v = String(p || "").toLowerCase();
  if (
    v === "agency" ||
    v === "free" ||
    v === "pro" ||
    v === "basic" ||
    v === "max"
  ) {
    return v as User["plan"];
  }
  return "free";
};


const CURRENT_USER_KEY = 'studioplay_current_user_v1';
export const ADMIN_EMAIL = 'admin@studioplay.ai';

const isIgnorableError = (e: any): boolean => {
    const msg = String(e?.message || e || '').toLowerCase();
    const code = String(e?.code || '');
    return (
        msg.includes('failed to fetch') || 
        msg.includes('network') || 
        msg.includes('load failed') || 
        msg.includes('violates row-level security') ||
        code === '42501'
    );
};

let lastHeartbeatAt = 0;
const HEARTBEAT_MIN_MS = 30_000; // פעם ב-30 שניות


export const updateHeartbeat = async (userId: string, activity: string = 'Browsing') => {
  const now = Date.now();
  if (now - lastHeartbeatAt < HEARTBEAT_MIN_MS) return;
  lastHeartbeatAt = now;

  // Heartbeat must never break the app
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        last_seen: new Date().toISOString(),
        current_activity: activity,
      })
      .eq('id', userId);

    // If schema doesn't have current_activity OR profile row doesn't exist / RLS blocks it → ignore
    if (error) {
      const msg = String((error as any).message || '');
      const code = String((error as any).code || '');
      if (msg.includes('current_activity') || code.includes('PGRST204')) {
        // try update only last_seen (still ignore errors)
        await supabase
          .from('profiles')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', userId);
        return;
      }

      // any other heartbeat error: ignore (optional log)
      // console.warn('Heartbeat ignored:', error);
      return;
    }
  } catch {
    // ignore all
    return;
  }
};


   

export const ensureUserInDB = async (_user: User) => {
  // 🚫 Client must NEVER write to profiles
  return;
};


// Fix for error in components/AuthModal.tsx on line 5: Added missing export
/**
 * Handles social login via Supabase OAuth or mock for local development.
 */
export const loginWithSocial = async (provider: 'google' | 'apple'): Promise<User> => {
  if (!isSupabaseConfigured()) {
    // Mock fallback for local development without Supabase
    return login(`${provider}-user@example.com`, `Social ${provider} User`);
  }

  const redirectTo =
  typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : undefined;


  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: redirectTo ? { redirectTo } : undefined,
  });

  if (error) throw error;

  // OAuth redirects away; return a never-resolving promise to stop UI flow safely
  return new Promise<User>(() => {});
};


export const login = async (email: string, name?: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const displayName = name || email.split('@')[0];
    const isAdmin = email === ADMIN_EMAIL;
    
    let user: User;

    if (isSupabaseConfigured()) {
        try {
            const { data: existingUser, error: fetchError } = await supabase
  .from('profiles')
  .select('*')
  .eq('email', email)
  .maybeSingle(); // ✅


            if (fetchError || !existingUser) {
                user = {
                    id: crypto.randomUUID(),
                    email,
                    name: displayName,
                    role: isAdmin ? 'admin' : 'user',
                    credits: isAdmin ? 999999 : 3,
                    plan: isAdmin ? 'agency' : 'free',
                    joinedAt: Date.now()
                };
                ensureUserInDB(user);
            } else {
                user = {
                    id: existingUser.id,
                    email: existingUser.email,
                    name: existingUser.name,
                    role: existingUser.role,
                    credits: existingUser.credits,
                    plan: normalizePlan(existingUser.plan),
                    joinedAt: new Date(existingUser.joined_at).getTime(),
                    lastSeen: existingUser.last_seen ? new Date(existingUser.last_seen).getTime() : undefined,
                    currentActivity: existingUser.current_activity
                };
            }
        } catch (e) {
            user = createLocalUser(email, displayName, isAdmin);
        }
    } else {
        user = createLocalUser(email, displayName, isAdmin);
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
};

const createLocalUser = (email: string, name: string, isAdmin: boolean): User => ({
    id: `local-${Date.now()}`,
    email,
    name,
    role: isAdmin ? 'admin' : 'user',
    credits: isAdmin ? 999999 : 3,
    plan: normalizePlan(isAdmin ? 'agency' : 'free'),
    joinedAt: Date.now()
});

export const logout = async () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    if (isSupabaseConfigured()) {
        await supabase.auth.signOut().catch(() => {});
    }
};

export const getCurrentUser = (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    if (!userStr || userStr === "null") return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
};

export const getAllUsers = async (): Promise<User[]> => {
    if (!isSupabaseConfigured()) return [];
    try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        return data.map(u => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            credits: u.credits,
            plan: u.plan,
            joinedAt: new Date(u.joined_at).getTime(),
            lastSeen: u.last_seen ? new Date(u.last_seen).getTime() : undefined,
            currentActivity: u.current_activity
        }));
    } catch (error: any) {
        if (!isIgnorableError(error)) {
            console.error('Fetch users error:', error?.message || 'Unknown error');
        }
        return [];
    }
};

export const updateUserProfile = async (userId: string, name: string): Promise<User | null> => {
    if (!isSupabaseConfigured()) {
        const local = getCurrentUser();
        if (local && local.id === userId) {
            const updated = { ...local, name };
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
            return updated;
        }
        return null;
    }

    try {
        const { data, error } = await supabase
  .from('profiles')
  .update({ name })
  .eq('id', userId)
  .select()
  .maybeSingle(); // ✅

if (error) throw error;
if (!data) return null; // לא להפיל

        
        const updatedUser: User = {
            id: data.id,
            email: data.email,
            name: data.name,
            role: data.role,
            credits: data.credits,
            plan: data.plan,
            joinedAt: new Date(data.joined_at).getTime(),
            lastSeen: data.last_seen ? new Date(data.last_seen).getTime() : undefined,
            currentActivity: data.current_activity
        };

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        return updatedUser;
    } catch (e) {
        return null;
    }
};

export const updateUserCredits = async (userId: string, creditsToAdd: number, plan?: string): Promise<User | null> => {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    let newCredits = currentUser.credits + creditsToAdd;
    if (currentUser.role === 'admin' && creditsToAdd < 0) {
        newCredits = currentUser.credits; // Admins don't lose credits
    }

    if (!isSupabaseConfigured()) {
        const updated = { ...currentUser, credits: Math.max(0, newCredits) };
        if (plan) updated.plan = plan as any;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
        return updated;
    }

    try {
        const updates: any = { credits: Math.max(0, newCredits) };
        if (plan) updates.plan = plan;

        const { data, error } = await supabase
  .from('profiles')
  .update(updates)
  .eq('id', userId)
  .select()
  .maybeSingle(); // ✅ במקום single

if (error) throw error;

// אם אין row (עדיין לא נוצר / RLS), לא להפיל את האפליקציה
if (!data) {
  // אפשר פשוט להחזיר את currentUser המקומי עם credits מעודכנים
  const updated: User = { ...currentUser, credits: Math.max(0, newCredits), plan: normalizePlan(plan || currentUser.plan),
 };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
  return updated;
}


        const updatedUser: User = {
            id: data.id,
            email: data.email,
            name: data.name,
            role: data.role,
            credits: data.credits,
            plan: data.plan,
            joinedAt: new Date(data.joined_at).getTime(),
            lastSeen: data.last_seen ? new Date(data.last_seen).getTime() : undefined,
            currentActivity: data.current_activity
        };

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        return updatedUser;
    } catch (e) {
        const updated = { ...currentUser, credits: Math.max(0, newCredits) };
        if (plan) updated.plan = plan as any;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
        return updated;
    }
};

export const injectMockUsers = async () => {
    if (!isSupabaseConfigured()) return;
    const mockUsers = [
        { email: 'sarah.design@gmail.com', name: 'Sarah Designer', credits: 15, plan: 'pro', activity: 'AI Editor' },
        { email: 'mike.ecommerce@yahoo.com', name: 'Mike Ecom', credits: 2, plan: 'free', activity: 'Background Blending' },
        { email: 'nina.art@icloud.com', name: 'Nina Art', credits: 45, plan: 'pro', activity: 'Creating Campaign Shot' },
    ];

    for (const u of mockUsers) {
        const user: User = {
            id: crypto.randomUUID(),
            email: u.email,
            name: u.name,
            role: 'user',
            credits: u.credits,
            plan: u.plan as any,
            joinedAt: Date.now() - Math.floor(Math.random() * 100000000),
            currentActivity: u.activity
        };
        await ensureUserInDB(user);
    }
};

export const claimDailyBonus = async (userId: string): Promise<User | null> => {
    const user = getCurrentUser();
    if (!user || user.id !== userId) return null;

    const lastReward = localStorage.getItem(`studioplay_last_reward_${userId}`);
    const now = Date.now();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    if (lastReward && (now - parseInt(lastReward)) < TWENTY_FOUR_HOURS_MS) {
        return null;
    }

    const updated = await updateUserCredits(userId, 1);
    if (updated) {
        localStorage.setItem(`studioplay_last_reward_${userId}`, now.toString());
    }
    return updated;
};
