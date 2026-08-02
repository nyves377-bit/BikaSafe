import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    toast: {
        success: (title: string, message?: string, duration?: number) => void;
        error: (title: string, message?: string, duration?: number) => void;
        info: (title: string, message?: string, duration?: number) => void;
        warning: (title: string, message?: string, duration?: number) => void;
    };
    dismiss: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const counter = useRef(0);

    const add = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
        const id = `toast-${++counter.current}`;
        setToasts(prev => [...prev, { id, type, title, message, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (title: string, message?: string, duration?: number) => add('success', title, message, duration),
        error:   (title: string, message?: string, duration?: number) => add('error', title, message, duration ?? 6000),
        info:    (title: string, message?: string, duration?: number) => add('info', title, message, duration),
        warning: (title: string, message?: string, duration?: number) => add('warning', title, message, duration),
    };

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
            <ToastContainer toasts={toasts} dismiss={dismiss} />
        </ToastContext.Provider>
    );
};

// ─── Toast Container ──────────────────────────────────────────────────────────
const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error:   <AlertCircle  className="w-5 h-5 text-red-400 shrink-0" />,
    info:    <Info         className="w-5 h-5 text-blue-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
};

const styleMap: Record<ToastType, string> = {
    success: 'border-emerald-500/30 bg-emerald-500/10',
    error:   'border-red-500/30 bg-red-500/10',
    info:    'border-blue-500/30 bg-blue-500/10',
    warning: 'border-amber-500/30 bg-amber-500/10',
};

const ToastContainer: React.FC<{ toasts: Toast[]; dismiss: (id: string) => void }> = ({ toasts, dismiss }) => {
    if (!toasts.length) return null;

    return (
        <div
            className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
            aria-live="polite"
            aria-label="Notifications"
        >
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`
                        pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl
                        border backdrop-blur-xl shadow-2xl shadow-black/30
                        max-w-sm w-full animate-slide-in-right
                        ${styleMap[t.type]}
                    `}
                    style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1) forwards' }}
                    role="alert"
                >
                    {iconMap[t.type]}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white leading-tight">{t.title}</p>
                        {t.message && (
                            <p className="text-xs text-slate-400 font-medium mt-0.5 leading-relaxed">{t.message}</p>
                        )}
                    </div>
                    <button
                        onClick={() => dismiss(t.id)}
                        className="p-1 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/10 shrink-0"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};
