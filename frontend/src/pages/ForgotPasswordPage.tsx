import React, { useState } from 'react';
import api from '../api/instance';
import { ShieldCheck, Smartphone, Lock, KeyRound, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';
import Logo from '../components/Logo';

type Step = 'phone' | 'otp' | 'success';

const ForgotPasswordPage: React.FC = () => {
    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');

    const handleRequestOtp = async () => {
        if (!phone || phone.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/api/auth/forgot-password', { phone });
            setInfo('An OTP has been sent to your phone. Enter it below.');
            setStep('otp');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!otp || otp.length < 4) {
            setError('Please enter the OTP from your SMS');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/api/auth/reset-password', { phone, otp, newPassword });
            setStep('success');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

            <div className="max-w-[440px] w-full animate-slide-up relative z-10">
                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <Logo size="lg" className="mb-2" />
                    <p className="text-slate-400 font-medium text-center">
                        Secure Savings Management for Rwandan Ikimina
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-white/10 shadow-2xl">

                    {/* Step: Success */}
                    {step === 'success' && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-emerald-500/15 rounded-[20px] flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2">Password Reset!</h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                Your password has been updated successfully. You can now sign in with your new password.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 bg-brand-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-brand-400 transition-all shadow-xl shadow-brand-500/20 active:scale-95"
                            >
                                Go to Login <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    )}

                    {/* Step: Phone entry */}
                    {step === 'phone' && (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Enter your registered phone number. We'll send you a one-time code via SMS.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-fade-in">
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-200 font-medium">{error}</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="tel"
                                            id="fp-phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            onKeyDown={(e) => e.key === 'Enter' && handleRequestOtp()}
                                            placeholder="07xxxxxxxx"
                                            maxLength={10}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all text-lg font-medium"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleRequestOtp}
                                    disabled={loading}
                                    id="fp-send-otp"
                                    className={cn(
                                        "w-full py-4 px-6 rounded-2xl font-bold text-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl",
                                        loading ? "bg-slate-700 cursor-not-allowed" : "bg-brand-500 hover:bg-brand-400 shadow-brand-500/20"
                                    )}
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Send OTP <ArrowRight className="w-5 h-5" /></>
                                    )}
                                </button>

                                <div className="text-center">
                                    <Link to="/login" className="text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1">
                                        <ArrowLeft className="w-4 h-4" /> Back to Login
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step: OTP + new password */}
                    {step === 'otp' && (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Enter OTP</h2>
                                {info && (
                                    <p className="text-emerald-400 text-sm font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                                        {info}
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-fade-in">
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-200 font-medium">{error}</p>
                                </div>
                            )}

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">OTP Code</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                            <KeyRound className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            id="fp-otp"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="6-digit code"
                                            maxLength={6}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all text-lg font-mono tracking-[0.3em] text-center"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="password"
                                            id="fp-new-password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="At least 6 characters"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all text-lg font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="password"
                                            id="fp-confirm-password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                                            placeholder="Repeat new password"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all text-lg font-medium"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleResetPassword}
                                    disabled={loading}
                                    id="fp-reset-submit"
                                    className={cn(
                                        "w-full py-4 px-6 rounded-2xl font-bold text-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl",
                                        loading ? "bg-slate-700 cursor-not-allowed" : "bg-brand-500 hover:bg-brand-400 shadow-brand-500/20"
                                    )}
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Reset Password <ArrowRight className="w-5 h-5" /></>
                                    )}
                                </button>

                                <div className="flex items-center justify-between text-sm">
                                    <button
                                        onClick={() => { setStep('phone'); setError(''); }}
                                        className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Change number
                                    </button>
                                    <button
                                        onClick={handleRequestOtp}
                                        disabled={loading}
                                        className="text-brand-400 hover:text-brand-300 font-bold transition-colors"
                                    >
                                        Resend OTP
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-8 flex justify-center items-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    <ShieldCheck className="w-5 h-5 text-brand-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">End-to-End Encrypted</span>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
