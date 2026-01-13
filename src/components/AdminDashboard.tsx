import React, { useEffect, useState, useRef } from 'react';
import { Icons } from './Icons';
import { Button } from './Button';
import { User, Transaction } from '../types';
import { getAllUsers, updateUserCredits, injectMockUsers, updateHeartbeat } from '../services/authService';
import { getAllTransactions, injectMockTransactions } from '../services/paymentService';

export const AdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [filterActiveOnly, setFilterActiveOnly] = useState(false);
    
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [creditChange, setCreditChange] = useState<number>(0);
    const [selectedPlan, setSelectedPlan] = useState<'free'|'pro'|'agency'>('free');

    const simulationInterval = useRef<any>(null);

    const loadData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        const [u, t] = await Promise.all([getAllUsers(), getAllTransactions()]);
        
        setUsers((u || []).filter(Boolean).sort((a, b) => b.joinedAt - a.joinedAt));
        setTransactions((t || []).filter(Boolean).sort((a, b) => b.date - a.date));
        setLastUpdated(new Date());
        
        if (!silent) setIsLoading(false);
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(() => {
            loadData(true);
        }, 5000);

        return () => {
            clearInterval(interval);
            if (simulationInterval.current) clearInterval(simulationInterval.current);
        };
    }, []);

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setCreditChange(0);
        setSelectedPlan(user.plan);
    };

    const handleSaveUser = async () => {
        if (!editingUser) return;
        await updateUserCredits(editingUser.id, creditChange, selectedPlan);
        await loadData(true);
        setEditingUser(null);
    };

    const handleSimulateTraffic = async () => {
        setIsLoading(true);
        await injectMockUsers();
        await injectMockTransactions();
        
        const allUsers = await getAllUsers();
        const demoUser = allUsers.find(u => u && u.email === 'sarah.design@gmail.com');
        
        if (demoUser) {
            updateHeartbeat(demoUser.id, 'Creating Campaign Shot');
            if (simulationInterval.current) clearInterval(simulationInterval.current);
            simulationInterval.current = setInterval(() => {
                if (demoUser?.id) updateHeartbeat(demoUser.id, 'Adjusting Lighting');
            }, 4000);
        }

        await loadData();
        setIsLoading(false);
    };

    const totalRevenue = transactions.reduce((sum, t) => sum + (t?.amount || 0), 0);
    
    const isOnline = (user: User) => {
        if (!user || !user.lastSeen) return false;
        // Consider online if seen in the last 45 seconds
        return (Date.now() - user.lastSeen) < 45000;
    };
    
    const getLastSeenText = (timestamp?: number) => {
        if (!timestamp) return 'Never';
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `Just now`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return 'Offline';
    };
    
    const activeUsers = users.filter(isOnline);
    const activeUsersCount = activeUsers.length;

    const displayedUsers = filterActiveOnly ? activeUsers : users;

    return (
        <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto font-heebo text-slate-200">
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-white/5 p-6 hidden md:flex flex-col">
                <div className="flex items-center gap-2 mb-10">
                    <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Icons.Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg">Admin Panel</span>
                </div>
                
                <nav className="space-y-2 flex-1">
                    <button className="w-full flex items-center justify-between px-4 py-3 bg-purple-600/20 text-purple-300 rounded-xl font-medium">
                        <div className="flex items-center gap-3">
                            <Icons.LayoutGrid className="w-5 h-5"/> Dashboard
                        </div>
                        {activeUsersCount > 0 && (
                            <span className="bg-green-500 text-black text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">{activeUsersCount}</span>
                        )}
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
                        <Icons.Box className="w-5 h-5"/> Products
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
                        <Icons.Zap className="w-5 h-5"/> Webhooks
                    </button>
                </nav>

                <button onClick={onClose} className="flex items-center gap-2 text-slate-500 hover:text-white mt-auto">
                    <Icons.ChevronRight className="w-4 h-4 rotate-180"/> Back to App
                </button>
            </div>

            <div className="md:ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            Real-Time Monitoring
                            <span className="flex items-center gap-1 text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded-full border border-green-500/20 animate-pulse">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                LIVE
                            </span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Live data feed. Updates every 5 seconds. Last update: {lastUpdated.toLocaleTimeString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button 
                            onClick={handleSimulateTraffic} 
                            disabled={isLoading}
                            variant="secondary"
                            className="!py-2 !px-4 !text-xs !bg-slate-800 border-slate-700 hover:bg-slate-700"
                        >
                            {isLoading ? 'Loading...' : '⚡ Simulate Active Users'}
                        </Button>
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <span className="text-sm text-slate-400">admin@studioplay.ai</span>
                            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white shadow-lg relative">
                                AD
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950"></div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Active Now</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-black text-white">{activeUsersCount}</h3>
                            <span className="text-green-400 text-xs flex items-center gap-1 animate-pulse">
                                <Icons.Zap className="w-3 h-3 fill-current"/> LIVE
                            </span>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Revenue</p>
                        <h3 className="text-4xl font-black text-white">₪{totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Users</p>
                        <h3 className="text-4xl font-black text-white">{users.length}</h3>
                    </div>
                    <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Transactions</p>
                        <h3 className="text-4xl font-black text-white">{transactions.length}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Icons.Bot className="w-5 h-5 text-purple-400"/>
                                User Sessions & Activity
                            </h3>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setFilterActiveOnly(!filterActiveOnly)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterActiveOnly ? 'bg-green-600 border-green-500 text-white shadow-lg' : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'}`}
                                >
                                    {filterActiveOnly ? 'Showing Active Only' : 'Show All Users'}
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 sticky top-0 backdrop-blur-md border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Current Activity</th>
                                        <th className="px-6 py-4">Credits</th>
                                        <th className="px-6 py-4">Plan</th>
                                        <th className="px-6 py-4 text-right">Last Heartbeat</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {displayedUsers.map(u => {
                                        const online = isOnline(u);
                                        return (
                                            <tr key={u.id} className={`hover:bg-white/[0.03] transition-colors group ${online ? 'bg-green-500/[0.02]' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative">
                                                            <span className={`block w-3 h-3 rounded-full ${online ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse' : 'bg-slate-700'}`}></span>
                                                            {online && <span className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75"></span>}
                                                        </div>
                                                        <span className={`text-[10px] uppercase font-black tracking-widest ${online ? 'text-green-400' : 'text-slate-600'}`}>{online ? 'Online' : 'Offline'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${online ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                            {u.name?.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-200">{u.name}</span>
                                                            <span className="text-[10px] text-slate-500 font-mono">{u.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {online ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1 bg-purple-500/10 rounded text-purple-400">
                                                                <Icons.Wand className="w-3 h-3"/>
                                                            </div>
                                                            <span className="text-white font-medium italic">{u.currentActivity || 'Navigating...'}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-600 italic">No current session</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-mono text-lg font-bold ${u.credits < 5 ? 'text-red-500' : 'text-green-400'}`}>{u.credits}</span>
                                                        <Icons.Zap className="w-3 h-3 text-slate-600"/>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${u.plan === 'pro' || u.plan === 'agency' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-slate-800 border-white/5 text-slate-400'}`}>
                                                        {u.plan}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                                                        {online ? 'Active' : getLastSeenText(u.lastSeen)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleEditUser(u)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                                        <Icons.Edit className="w-4 h-4"/>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {editingUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <h2 className="text-xl font-bold text-white mb-4">Manage User</h2>
                        <p className="text-sm text-slate-400 mb-6">{editingUser.email}</p>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Add Credits (Current: {editingUser.credits})</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        value={creditChange}
                                        onChange={(e) => setCreditChange(Number(e.target.value))}
                                        className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white flex-1"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">Positive adds credits, negative removes.</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Change Plan</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['free', 'pro', 'agency'].map((plan) => (
                                        <button
                                            key={plan}
                                            onClick={() => setSelectedPlan(plan as any)}
                                            className={`py-2 px-3 rounded-lg text-sm font-bold border transition-all ${
                                                selectedPlan === plan 
                                                ? 'bg-purple-600 border-purple-500 text-white' 
                                                : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                                            }`}
                                        >
                                            {plan.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                <Button onClick={handleSaveUser} className="flex-1 py-3 text-sm">Save Changes</Button>
                                <button 
                                    onClick={() => setEditingUser(null)} 
                                    className="flex-1 py-3 text-sm font-bold bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;