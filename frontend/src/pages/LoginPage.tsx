import React, { useState } from 'react';
import api from '../api/instance';
import { ShieldCheck, Lock, ArrowRight, Smartphone, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';
import Logo from '../components/Logo';

const LoginPage: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!phone || !password) {
            setError('Please enter your phone number and password');
            return;
        }
        if (phone.length !== 10) {
            setError('Phone number must be exactly 10 digits');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/api/auth/login', { phone, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // If user has a temporary password, redirect to dashboard with forced change
            if (data.user.mustChangePassword) {
                localStorage.setItem('mustChangePassword', 'true');
            }

            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/api/auth/demo-login');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard';
        } catch (err: any) {
            setError('Demo login failed. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <div className="min-h-screen w-full bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

            <div className="max-w-[440px] w-full animate-slide-up relative z-10">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10">
                    <Logo size="lg" className="mb-2" />
                    <p className="text-slate-400 font-medium text-center">
                        Secure Savings Management for Rwandan Ikimina
                    </p>
                </div>

                {/* Card Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-white/10 shadow-2xl">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Sign in to access your group savings and manage contributions.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-fade-in">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-200 font-medium leading-relaxed">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        onKeyDown={handleKeyDown}
                                        placeholder="07xxxxxxxx"
                                        maxLength={10}
                                        id="login-phone"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all text-lg font-medium"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 ml-1">
                                    First-time signing in? Use your phone number and the temporary password provided by your admin.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="••••••••"
                                        id="login-password"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-600 outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all text-lg font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-brand-400 transition-colors"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="flex justify-end">
                                    <Link
                                        to="/forgot-password"
                                        className="text-[11px] text-brand-400 hover:text-brand-300 font-bold transition-colors"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            id="login-submit"
                            className={cn(
                                "w-full py-4 px-6 rounded-2xl font-bold text-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl",
                                loading ? "bg-brand-600/60 cursor-not-allowed" : "bg-brand-600 hover:bg-brand-500 shadow-brand-600/20"
                            )}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        {/* Demo Login — only visible in development */}
                        <div className="pt-4 border-t border-white/10 mt-6 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F172A] px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                or
                            </div>
                            <button
                                onClick={handleDemoLogin}
                                disabled={loading}
                                id="demo-login"
                                className="w-full py-4 px-6 rounded-2xl font-black text-brand-900 bg-brand-400 hover:bg-brand-300 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-brand-500/20 mt-6"
                            >
                                Login as Demo Admin
                            </button>
                            <p className="text-[10px] text-center text-slate-500 mt-3 px-4">
                                One-click access for portfolio reviewers. Not available in production.
                            </p>
                        </div>

                        <p className="text-center text-slate-500 text-sm pt-4">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-bold transition-colors">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer Section */}
                <p className="mt-10 text-center text-slate-500 text-sm">
                    By continuing, you agree to BikaSafe's <Link to="/terms" className="text-slate-400 hover:text-white transition-colors underline decoration-slate-700 underline-offset-4">Terms</Link> and <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors underline decoration-slate-700 underline-offset-4">Privacy Policy</Link>.
                </p>

                <div className="mt-8 flex justify-center items-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    <ShieldCheck className="w-5 h-5 text-brand-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">End-to-End Encrypted</span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
