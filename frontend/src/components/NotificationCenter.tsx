import React from 'react';
import { Bell, X, Info, CheckCircle2, AlertCircle, TrendingUp, Wallet, Users, Clock } from 'lucide-react';
import { cn } from '../utils/cn';

interface AuditLog {
    id: string;
    action: string;
    details: string;
    timestamp: string;
    user?: {
        name: string;
        role: string;
    };
}

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
    logs: AuditLog[];
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, logs }) => {
    const getActionStyles = (action: string) => {
        const lowerAction = action.toLowerCase();
        if (lowerAction.includes('contribution') || lowerAction.includes('paid')) {
            return { icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' };
        }
        if (lowerAction.includes('loan')) {
            return { icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50' };
        }
        if (lowerAction.includes('payout')) {
            return { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' };
        }
        if (lowerAction.includes('member') || lowerAction.includes('register')) {
            return { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' };
        }
        if (lowerAction.includes('error') || lowerAction.includes('failed')) {
            return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' };
        }
        return { icon: Info, color: 'text-slate-600', bg: 'bg-slate-50' };
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] transition-all duration-500">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" 
                onClick={onClose}
            />
            
            {/* Panel */}
            <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white/90 backdrop-blur-xl shadow-2xl border-l border-white/50 flex flex-col p-0 overflow-hidden transform animate-in slide-in-from-right duration-300">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Bell className="w-6 h-6 text-brand-600" />
                            Activity Notifications
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Live Group Updates</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {logs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12">
                            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mb-6">
                                <Clock className="w-10 h-10" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">Silence in the Group</h3>
                            <p className="text-sm text-slate-400 font-medium">New activities will appear here in real-time as your members transact.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log) => {
                                const { icon: ActionIcon, color, bg } = getActionStyles(log.action);
                                return (
                                    <div 
                                        key={log.id} 
                                        className="group p-5 rounded-[24px] bg-white border border-slate-50 hover:border-brand-100 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="flex gap-4 relative z-10">
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", bg, color)}>
                                                <ActionIcon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        {log.action.replace(/_/g, ' ')}
                                                    </p>
                                                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="font-bold text-slate-900 text-sm leading-snug mb-1 group-hover:text-brand-600 transition-colors">
                                                    {log.details}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center text-[8px] font-black text-slate-500">
                                                        {log.user?.name?.[0] || 'U'}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-500">
                                                        {log.user?.name || 'System Auto'} • {new Date(log.timestamp).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Premium background accent */}
                                        <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-[0.03] -translate-y-1/2 translate-x-1/2 blur-2xl rounded-full transition-all group-hover:opacity-[0.08]", bg)} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                    >
                        Dismiss All
                    </button>
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-4">
                        Locked & Encrypted Activity Log
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;
