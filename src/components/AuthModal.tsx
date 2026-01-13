import React, { useState } from 'react';
import { Icons } from './Icons';
import { Button } from './Button';
import { login, loginWithSocial } from '../services/authService';
import { User } from '../types';

export const AuthModal: React.FC<{ 
    isOpen: boolean, 
    onClose: () => void, 
    onLoginSuccess: (user: User) => void 
}> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        
        setIsLoading(true);
        try {
            // We pass the name if provided, otherwise the service will use the email prefix
            const user = await login(email, name);
            onLoginSuccess(user);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        setSocialLoading(provider);
        try {
            const user = await loginWithSocial(provider);
            onLoginSuccess(user);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSocialLoading(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                        <Icons.Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-400">Sign in to start creating</p>
                </div>

                <div className="space-y-3 mb-6">
                    <button 
                        onClick={() => handleSocialLogin('google')}
                        disabled={!!socialLoading || isLoading}
                        className="w-full bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:scale-100"
                    >
                        {socialLoading === 'google' ? (
                            <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></span>
                        ) : (
                            <Icons.Google className="w-5 h-5" />
                        )}
                        Continue with Google
                    </button>

                    <button 
                        onClick={() => handleSocialLogin('apple')}
                        disabled={!!socialLoading || isLoading}
                        className="w-full bg-white hover:bg-slate-100 text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:scale-100"
                    >
                        {socialLoading === 'apple' ? (
                            <span className="w-5 h-5 border-2 border-slate-400 border-t-black rounded-full animate-spin"></span>
                        ) : (
                            <Icons.Apple className="w-5 h-5" />
                        )}
                        Continue with Apple
                    </button>
                </div>

                <div className="relative flex items-center gap-4 mb-6">
                    <div className="h-px bg-white/10 flex-1"></div>
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Or continue with email</span>
                    <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600"
                            placeholder="Full Name (Optional)"
                        />
                    </div>
                    <div>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600"
                            placeholder="name@company.com"
                        />
                    </div>
                    
                    <Button type="submit" isLoading={isLoading} disabled={!!socialLoading} className="w-full py-4 text-lg !bg-slate-800 hover:!bg-slate-700 !border-slate-700">
                        Start Trial
                    </Button>

                    <p className="text-center text-xs text-slate-500 mt-4">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;