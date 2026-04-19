import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#020817] flex items-center justify-center px-6">
                    <div className="max-w-md w-full text-center">
                        {/* Icon */}
                        <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 border border-red-500/20">
                            <AlertCircle className="w-10 h-10 text-red-400" />
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-black text-white tracking-tight mb-3">
                            Something went wrong
                        </h1>

                        {/* Description */}
                        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                            An unexpected error occurred. This has been logged and our team will look into it.
                            You can try refreshing the page or going back to the home screen.
                        </p>

                        {/* Error details (dev only) */}
                        {this.state.error && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 text-left">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Error Details</p>
                                <p className="text-xs text-red-300 font-mono break-all leading-relaxed">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={this.handleRetry}
                                className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-4 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex-1 bg-brand-500 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-brand-500/20 hover:bg-brand-400 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Home className="w-4 h-4" />
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
