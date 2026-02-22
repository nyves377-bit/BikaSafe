import React, { useState } from 'react';
import api from '../api/instance';
import { ShieldCheck, User, Smartphone, Building, Hash, ArrowRight, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';
import Logo from '../components/Logo';

const SignupPage: React.FC = () => {
    const [formData, setFormData] = useState({
        phone: '',
        name: '',
        password: '',
        groupName: '',
        registrationId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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
                    By registering, you agree to BikaSafe's <Link to="/terms" className="text-slate-400 hover:text-white transition-colors underline decoration-slate-700 underline-offset-4">Terms</Link> and <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors underline decoration-slate-700 underline-offset-4">Privacy Policy</Link>.
                </p>

                <div className="mt-8 flex justify-center items-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    <ShieldCheck className="w-5 h-5 text-brand-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Verified Secure by BikaSafe</span>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
