import React, { useState, useEffect } from 'react';
import { Wallet, Users, TrendingUp, CreditCard, FileText, LogOut, Search, Bell, Plus, Download, ChevronRight, AlertCircle, ArrowUpRight, ArrowDownLeft, ShieldCheck, CheckCircle2, MoreVertical, Filter, Printer, FileCheck, Lock, Upload, Megaphone, Trash2, Calendar, X, Vote, CheckSquare, Layers, Heart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../utils/cn';
import api from '../../api/instance';

interface ModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

interface GoalModalProps {
    currentGoal: number;
    onClose: () => void;
    onSuccess: (goal: number) => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({ currentGoal, onClose, onSuccess }) => {
    const [goal, setGoal] = useState(currentGoal.toString());
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        onSuccess(parseFloat(goal));
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black tracking-tight">Set Savings Goal</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <Plus className="w-5 h-5 rotate-45 text-slate-400" />
                    </button>
                </div>
                <p className="text-slate-500 font-bold mb-8 text-sm leading-relaxed">
                    Set a target amount for your group to achieve. This will be visible to all members.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Target Amount (RWF)</label>
                        <input
                            required
                            type="number"
                            placeholder="e.g. 10000000"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-brand-500 text-white py-5 rounded-[24px] font-black text-sm shadow-xl shadow-brand-500/20 hover:bg-brand-400 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Goal'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const ChangePasswordModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.post('/api/auth/change-password', {
                currentPassword,
                newPassword
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card border border-white/10 rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Security Setting</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <Plus className="w-5 h-5 rotate-45 text-slate-500" />
                    </button>
                </div>
                <p className="text-slate-400 font-bold mb-8 text-sm leading-relaxed">
                    Update your password to keep your account secure.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Current Password</label>
                        <input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">New Password</label>
                        <input
                            required
                            type="password"
                            placeholder="Min. 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Confirm New Password</label>
                        <input
                            required
                            type="password"
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold leading-relaxed animate-fade-in border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Changing...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const RecordContributionModal: React.FC<ModalProps> = ({ onClose, onSuccess }) => {
    const [members, setMembers] = useState<any[]>([]);
    const [selectedMember, setSelectedMember] = useState('');
    const [amount, setAmount] = useState('');
    const [fundType, setFundType] = useState('SAVINGS');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const { data } = await api.get('/api/groups/members');
                setMembers(data);
                if (data.length > 0) setSelectedMember(data[0].id);
            } catch (err) {
                console.error('Failed to fetch members');
            }
        };
        fetchMembers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/api/contributions/record', {
                userId: selectedMember,
                amount: parseFloat(amount),
                fundType,
                status: 'PAID'
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to record contribution');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card border border-white/10 rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black tracking-tight text-white">Record Entry</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <Plus className="w-5 h-5 rotate-45 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Member</label>
                        <select
                            value={selectedMember}
                            onChange={(e) => setSelectedMember(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        >
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Amount (RWF)</label>
                        <input
                            type="number"
                            required
                            placeholder="e.g. 10000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Fund Type</label>
                        <select
                            value={fundType}
                            onChange={(e) => setFundType(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        >
                            <option value="SAVINGS">Savings Pool</option>
                            <option value="SOCIAL">Social Fund</option>
                        </select>
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold px-1">{error}</p>}

                    <button
                        disabled={loading}
                        className="w-full bg-brand-500 text-white py-5 rounded-[24px] font-black text-sm shadow-xl shadow-brand-500/20 hover:bg-brand-400 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Recording...' : 'Confirm Entry'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const AddMemberModal: React.FC<ModalProps> = ({ onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [nationalId, setNationalId] = useState('');
    const [role, setRole] = useState('MEMBER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length !== 10) {
            setError('Phone number must be exactly 10 digits');
            return;
        }
        if (nationalId.length > 0 && nationalId.length !== 16) {
            setError('National ID must be exactly 16 digits');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.post('/api/groups/add-member', { name, phone, role, nationalId, email });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card border border-white/10 rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black tracking-tight text-white">Add Member</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <Plus className="w-5 h-5 rotate-45 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                        <input
                            required
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Phone Number (10 Digits)</label>
                        <input
                            required
                            type="tel"
                            maxLength={10}
                            placeholder="07xxxxxxxx"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                        <input
                            type="email"
                            placeholder="member@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">National ID (16 Digits)</label>
                        <input
                            type="text"
                            maxLength={16}
                            placeholder="Enter 16-digit ID"
                            value={nationalId}
                            onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        >
                            <option value="MEMBER">Member</option>
                            <option value="TREASURER">Treasurer</option>
                            <option value="AUDITOR">Auditor</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold px-1">{error}</p>}

                    <button
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : 'Add Member'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const LoanRequestModal: React.FC<ModalProps & { members: any[], user: any }> = ({ onClose, onSuccess, members, user }) => {
    const [amount, setAmount] = useState('');
    const [interestRate, setInterestRate] = useState('5'); // Default 5%
    const [deadline, setDeadline] = useState('');
    const [guarantorId, setGuarantorId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/api/loans/request', {
                amount: parseFloat(amount),
                interestRate: parseFloat(interestRate),
                deadline: new Date(deadline).toISOString(),
                guarantorId: guarantorId || undefined
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to request loan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card border border-white/10 rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black tracking-tight text-white">Request Loan</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <Plus className="w-5 h-5 rotate-45 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Amount (RWF)</label>
                        <input
                            required
                            type="number"
                            placeholder="e.g. 50000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Interest Rate (%)</label>
                        <input
                            required
                            type="number"
                            placeholder="5"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Repayment Deadline</label>
                        <input
                            required
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Guarantor (Optional)</label>
                        <select
                            value={guarantorId}
                            onChange={(e) => setGuarantorId(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold"
                        >
                            <option value="">-- No Guarantor --</option>
                            {members.filter(m => m.id !== user?.id).map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold px-1">{error}</p>}

                    <button
                        disabled={loading}
                        className="w-full bg-brand-600 text-white py-5 rounded-[24px] font-black text-sm shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const WithdrawalRequestModal: React.FC<ModalProps> = ({ onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/api/payouts/request', {
                amount: parseFloat(amount),
                description
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to request withdrawal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fade-in">
            <div className="glass-card border border-white/10 w-full max-w-md rounded-[40px] shadow-2xl p-10 relative">
                <button onClick={onClose} className="absolute right-8 top-8 text-slate-600 hover:text-slate-300 transition-colors">
                    <Plus className="w-6 h-6 rotate-45" />
                </button>
                <div className="mb-10">
                    <div className="bg-brand-500/15 w-16 h-16 rounded-[24px] flex items-center justify-center text-brand-400 mb-6">
                        <ArrowUpRight className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-white">Request Withdrawal</h2>
                    <p className="text-slate-500 font-bold mt-2">Treasury fund distribution</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount (RWF)</label>
                        <input
                            type="number"
                            required
                            placeholder="e.g., 50000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input-dark rounded-2xl w-full py-4 px-6 text-sm font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Description / Purpose</label>
                        <textarea
                            required
                            placeholder="e.g., Social security payment for Member X"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input-dark rounded-2xl w-full py-4 px-6 text-sm font-bold min-h-[120px]"
                        />
                    </div>
                    {error && (
                        <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-2xl text-xs font-bold leading-relaxed">
                            {error}
                        </div>
                    )}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-brand-500 text-white w-full py-5 rounded-[24px] font-black text-sm shadow-xl shadow-brand-500/20 hover:bg-brand-400 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const FinanceChart = ({ data }: { data: any[] }) => (
    <div className="h-[300px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#475569' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#475569' }} tickFormatter={(val) => `RWF ${val / 1000}k`} />
                <Tooltip
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', padding: '12px', background: '#0d1424' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 900, color: '#a7f3d0' }}
                    labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

export const LoanCalculator: React.FC = () => {
    const [amount, setAmount] = useState('50000');
    const [rate, setRate] = useState('5');
    const [months, setMonths] = useState('3');

    const principal = parseFloat(amount) || 0;
    const interest = principal * (parseFloat(rate) / 100) * (parseFloat(months));
    const total = principal + interest;

    return (
        <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-brand-500/20 p-2 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-brand-400" />
                    </div>
                    <h4 className="font-black text-lg">Loan Calculator</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Principal (RWF)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-slate-800 border-none rounded-xl w-full py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-brand-500/50 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Rate (%)</label>
                        <input
                            type="number"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            className="bg-slate-800 border-none rounded-xl w-full py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-brand-500/50 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Months)</label>
                        <input
                            type="number"
                            value={months}
                            onChange={(e) => setMonths(e.target.value)}
                            className="bg-slate-800 border-none rounded-xl w-full py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-brand-500/50 outline-none"
                        />
                    </div>
                </div>

                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Interest</p>
                        <p className="text-xl font-black text-brand-400">RWF {interest.toLocaleString()}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-700 hidden md:block" />
                    <div className="text-right md:text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Repayment</p>
                        <p className="text-2xl font-black text-white">RWF {total.toLocaleString()}</p>
                    </div>
                    <div className="flex-1" />
                    <p className="text-[10px] text-slate-500 font-medium italic">* This is a simulation based on simple interest rules.</p>
                </div>
            </div>
            <TrendingUp className="absolute -bottom-10 -right-10 w-40 h-40 text-brand-500 opacity-5 group-hover:scale-110 transition-transform duration-700" />
        </div>
    );
};

export const AnnouncementModal: React.FC<{ onClose: () => void; onSuccess: (a: any) => void }> = ({ onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [type, setType] = useState('GENERAL');
    const [eventDate, setEventDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const typeOptions = [
        { value: 'GENERAL',  label: '📌 General',  color: 'text-blue-400' },
        { value: 'MEETING',  label: '📅 Meeting',  color: 'text-emerald-400' },
        { value: 'URGENT',   label: '⚠️ Urgent',   color: 'text-red-400' },
        { value: 'REMINDER', label: '🔔 Reminder', color: 'text-purple-400' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!title.trim() || !body.trim()) {
            setError('Title and message are required.');
            return;
        }
        try {
            setLoading(true);
            const res = await api.post('/api/announcements', {
                title: title.trim(),
                body: body.trim(),
                type,
                eventDate: eventDate || undefined,
            });
            onSuccess(res.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to post announcement.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card border border-white/10 rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-500/15 text-brand-400 rounded-2xl flex items-center justify-center border border-brand-500/20">
                            <Megaphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-white">New Announcement</h2>
                            <p className="text-xs text-slate-500 font-medium">Post a message to all group members</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Type selector */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Announcement Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {typeOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setType(opt.value)}
                                    className={cn(
                                        'px-4 py-3 rounded-2xl text-sm font-bold border transition-all text-left',
                                        type === opt.value
                                            ? 'border-brand-500/40 bg-brand-500/10 text-brand-300'
                                            : 'border-white/8 bg-white/3 text-slate-400 hover:bg-white/8'
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Title</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g., Monthly Meeting — April 2026"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold text-sm"
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Message</label>
                        <textarea
                            required
                            placeholder="Write the full announcement details here..."
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            rows={4}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-medium text-sm resize-none"
                        />
                    </div>

                    {/* Event Date (optional) */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">
                            Event Date <span className="normal-case font-medium text-slate-600">(optional)</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={eventDate}
                            onChange={e => setEventDate(e.target.value)}
                            className="input-dark w-full rounded-2xl px-5 py-4 font-bold text-sm"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-2xl text-xs font-bold">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-4 rounded-[20px] font-bold text-sm hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-brand-500 text-white py-4 rounded-[20px] font-black text-sm shadow-xl shadow-brand-500/20 hover:bg-brand-400 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Posting...' : <><Megaphone className="w-4 h-4" /> Post Announcement</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export const MeetingModal: React.FC<{ members: any[], onClose: () => void; onSuccess: () => void }> = ({ members, onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({});

    useEffect(() => {
        const init = {} as Record<string, 'PRESENT' | 'ABSENT'>;
        members.forEach(m => init[m.id] = 'PRESENT'); // default present
        setAttendance(init);
    }, [members]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            setLoading(true);
            const attendanceList = Object.entries(attendance).map(([userId, status]) => ({ userId, status }));
            await api.post('/api/meetings', { title, date: new Date(date).toISOString(), attendanceList });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create meeting');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card border border-white/10 rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black tracking-tight text-white">Log Meeting</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100/10 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        required type="text" placeholder="Meeting Title"
                        value={title} onChange={e => setTitle(e.target.value)}
                        className="input-dark w-full rounded-2xl px-5 py-4 font-bold text-sm"
                    />
                    <input
                        required type="datetime-local"
                        value={date} onChange={e => setDate(e.target.value)}
                        className="input-dark w-full rounded-2xl px-5 py-4 font-bold text-sm"
                    />

                    <div className="pt-4 border-t border-white/10">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Roll Call</h4>
                        <div className="space-y-2">
                            {members.map(m => (
                                <div key={m.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="font-bold text-sm text-slate-200">{m.name}</span>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setAttendance({...attendance, [m.id]: 'PRESENT'})} className={cn("px-3 py-1 rounded-lg text-[10px] font-black", attendance[m.id] === 'PRESENT' ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-500")}>Present</button>
                                        <button type="button" onClick={() => setAttendance({...attendance, [m.id]: 'ABSENT'})} className={cn("px-3 py-1 rounded-lg text-[10px] font-black", attendance[m.id] === 'ABSENT' ? "bg-red-500/20 text-red-400" : "bg-white/5 text-slate-500")}>Absent</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold px-1">{error}</p>}
                    <button disabled={loading} className="w-full bg-brand-500 text-white py-4 rounded-[20px] font-black text-sm hover:focus-visible">
                        {loading ? 'Saving...' : 'Save Meeting & Issue Penalties'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const PollModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            setLoading(true);
            await api.post('/api/polls', { title, description });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create poll');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card border border-white/10 rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black tracking-tight text-white">Create Poll</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100/10 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        required type="text" placeholder="Poll Question"
                        value={title} onChange={e => setTitle(e.target.value)}
                        className="input-dark w-full rounded-2xl px-5 py-4 font-bold text-sm"
                    />
                    <textarea
                        required placeholder="Additional detail..."
                        value={description} onChange={e => setDescription(e.target.value)}
                        className="input-dark w-full rounded-2xl px-5 py-4 font-bold text-sm resize-none" rows={3}
                    />

                    {error && <p className="text-red-500 text-xs font-bold px-1">{error}</p>}
                    <button disabled={loading} className="w-full bg-brand-500 text-white py-4 rounded-[20px] font-black text-sm hover:focus-visible">
                        {loading ? 'Creating...' : 'Open Polling'}
                    </button>
                </form>
            </div>
        </div>
    );
};

