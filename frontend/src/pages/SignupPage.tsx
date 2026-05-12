import React, { useState } from 'react';
import api from '../api/instance';
// ── PAYMENT IMPORTS (kept for future use) ──────────────────────────────────
// import { Shield, Lock, User, Phone, Mail, Building, ArrowRight, CheckCircle2, ChevronRight, Check, Hash, AlertCircle, ShieldCheck, CreditCard, Smartphone } from 'lucide-react';
import { Lock, User, Mail, Building, ArrowRight, CheckCircle2, Hash, AlertCircle, ShieldCheck, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';
import Logo from '../components/Logo';

const SignupPage: React.FC = () => {
    const [formData, setFormData] = useState({
        phone: '',
        name: '',
        password: '',
        groupName: '',
        registrationId: '',
        nationalId: '',
        email: '',
        tier: 'FREE', // Default tier
        billingCycle: 'ANNUAL' as 'MONTHLY' | 'ANNUAL'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    // ── PAYMENT STATE (kept for future use) ─────────────────────────────────
    // const [showPaymentModal, setShowPaymentModal] = useState(false);
    // const [paymentProcessing, setPaymentProcessing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        const { phone, name, password, groupName, registrationId } = formData;

        if (!phone || !name || !password || !groupName || !registrationId) {
            setError('Please fill in all fields to continue');
            return;
        }

        if (phone.length !== 10) {
            setError('Phone number must be exactly 10 digits');
            return;
        }

        // Password validation: min 6 chars, letter, number, and symbol
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 6 characters and include a letter, number, and special character (@$!%*#?&)');
            return;
        }

        // ── PAYMENT GATE (kept for future use) ──────────────────────────────
        // if (formData.tier === 'ELITE') {
        //     setShowPaymentModal(true);
        //     return;
        // }

        executeRegistration();
    };

    const executeRegistration = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/api/auth/register', formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setSuccess(true);
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2000);
        } catch (err: any) {
            const backendError = err.response?.data?.error;
            const backendDetails = err.response?.data?.details;
            setError(backendError ? `${backendError}${backendDetails ? `: ${backendDetails}` : ''}` : 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

            <div className="max-w-[480px] w-full animate-slide-up relative z-10">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <Logo size="lg" className="mb-2" />
                </div>

                {/* Card Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-white/10 shadow-2xl">
                    {success ? (
                        <div className="py-10 text-center animate-fade-in">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="text-emerald-400 w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome Aboard!</h2>
                            <p className="text-slate-400">Your account and group have been created. Redirecting to your dashboard...</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Create Group</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Start your digital Ikimina journey. As the creator, you will be the group administrator.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-fade-in">
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-200 font-medium leading-relaxed">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleRegister} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="John Doe"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                                <Smartphone className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                                placeholder="07xxxxxxxx"
                                                maxLength={10}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="admin@example.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">National ID</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                                <Hash className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                name="nationalId"
                                                value={formData.nationalId}
                                                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                                placeholder="1199..."
                                                maxLength={16}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Group Business Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                            <Building className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            name="groupName"
                                            value={formData.groupName}
                                            onChange={handleChange}
                                            placeholder="Emerald Savings Group"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Group Registration ID</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                            <Hash className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            name="registrationId"
                                            value={formData.registrationId}
                                            onChange={handleChange}
                                            placeholder="RCA-2024-XXXX"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                {/* ── SUBSCRIPTION PLAN SELECTOR (kept for future payment activation) ──
                                <div className="space-y-3 mb-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Subscription Plan</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, tier: 'FREE' })}
                                            className={cn(
                                                "p-4 rounded-2xl border transition-all text-left",
                                                formData.tier === 'FREE'
                                                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                                                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                            )}
                                        >
                                            <p className="text-sm font-bold">Free Core</p>
                                            <p className="text-[10px] opacity-60">Up to 25 members</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, tier: 'ELITE' })}
                                            className={cn(
                                                "p-4 rounded-2xl border transition-all text-left relative overflow-hidden",
                                                formData.tier === 'ELITE'
                                                    ? "bg-brand-500/10 border-brand-500/50 text-brand-400"
                                                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                            )}
                                        >
                                            <div className="absolute top-0 right-0 bg-brand-500 text-white px-2 py-0.5 text-[8px] font-black uppercase">Elite</div>
                                            <p className="text-sm font-bold">Elite</p>
                                            <p className="text-[10px] opacity-60">Unlimited members</p>
                                        </button>
                                    </div>
                                </div>

                                {formData.tier === 'ELITE' && (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Billing Cycle</span>
                                            <span className="text-[10px] font-bold text-brand-400">Annual Discount Applied</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, billingCycle: 'MONTHLY' })}
                                                className={cn(
                                                    "py-3 rounded-xl text-xs font-bold transition-all",
                                                    formData.billingCycle === 'MONTHLY'
                                                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                                                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                                                )}
                                            >
                                                Monthly (5k)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, billingCycle: 'ANNUAL' })}
                                                className={cn(
                                                    "py-3 rounded-xl text-xs font-bold transition-all",
                                                    formData.billingCycle === 'ANNUAL'
                                                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                                                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                                                )}
                                            >
                                                Annual (50k)
                                            </button>
                                        </div>
                                    </div>
                                )}
                                ── END SUBSCRIPTION PLAN SELECTOR ── */}

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 ml-1">Min. 6 chars with letter, number & symbol</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={cn(
                                        "w-full py-4 px-6 rounded-2xl font-bold text-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl mt-4",
                                        loading ? "bg-slate-700 cursor-not-allowed" : "bg-slate-700 hover:bg-slate-600 shadow-slate-900/40"
                                    )}
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Create Secure Account
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-slate-500 text-sm mt-6">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-brand-400 hover:text-brand-300 font-bold transition-colors">
                                        Sign In
                                    </Link>
                                </p>
                            </form>
                        </>
                    )}
                </div>

                {/* Footer Section */}
                <p className="mt-10 text-center text-slate-500 text-sm">
                    By registering, you agree to BikaSafe's <Link to="/terms" className="text-slate-400 hover:text-white transition-colors underline decoration-slate-700 underline-offset-4">Terms</Link>, <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors underline decoration-slate-700 underline-offset-4">Privacy Policy</Link>, and <Link to="/audit-policy" className="text-slate-400 hover:text-white transition-colors underline decoration-slate-700 underline-offset-4">Audit Policy</Link>.
                </p>

                <div className="mt-8 flex justify-center items-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    <ShieldCheck className="w-5 h-5 text-brand-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Verified Secure by BikaSafe</span>
                </div>
            </div>

                        {/* ── PAYMENT ACTIVATION MODAL (kept for future use — uncomment to re-enable) ──
            {showPaymentModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[40px] p-10 relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        {!paymentProcessing ? (
                            <>
                                <div className="bg-brand-500/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                                    <CreditCard className="w-8 h-8 text-brand-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white text-center mb-2">Elite Activation</h3>
                                <p className="text-slate-400 text-sm text-center mb-8 font-medium italic">
                                    Payment of <strong>RWF {formData.billingCycle === 'ANNUAL' ? '50,000' : '5,000'}</strong> will be deposited to the BikaSafe Official Treasury Account.
                                </p>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Phone Number</label>
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-brand-400" />
                                            <input
                                                type="text"
                                                defaultValue={formData.phone}
                                                className="bg-transparent border-none text-white text-sm focus:ring-0 w-full font-bold"
                                                placeholder="078... / 079..."
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setPaymentProcessing(true);
                                            setTimeout(() => {
                                                setShowPaymentModal(false);
                                                executeRegistration();
                                            }, 5000);
                                        }}
                                        className="w-full bg-brand-600 text-white py-5 rounded-[24px] text-sm font-black hover:bg-brand-500 transition-all shadow-xl shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        Pay RWF {formData.billingCycle === 'ANNUAL' ? '50,000' : '5,000'} Now
                                    </button>
                                    <button
                                        onClick={() => setShowPaymentModal(false)}
                                        className="w-full py-4 text-slate-500 text-xs font-bold hover:text-white transition-colors"
                                    >
                                        Cancel & Switch to Free
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-10">
                                <div className="relative w-24 h-24 mx-auto mb-8">
                                    <div className="absolute inset-0 border-4 border-brand-500/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Lock className="w-8 h-8 text-brand-400" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Waiting for PIN...</h3>
                                <p className="text-slate-400 text-sm font-medium">We've sent a secure payment push to your phone. Please enter your PIN to confirm payment.</p>
                                <div className="mt-8 flex justify-center gap-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-brand-500/5 rounded-full blur-3xl"></div>
                    </div>
                </div>
            )}
            ── END PAYMENT MODAL ── */}
        </div>
    );
};

export default SignupPage;
