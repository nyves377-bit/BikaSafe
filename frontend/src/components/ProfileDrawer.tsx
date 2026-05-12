import React, { useState, useEffect } from 'react';
import {
    X, User, Phone, Mail, Shield, Wallet, TrendingUp,
    AlertCircle, CheckCircle2, Edit3, Save, Loader2,
    Calendar, ShieldCheck, FileCheck, Key
} from 'lucide-react';
import api from '../api/instance';
import { cn } from '../utils/cn';

interface ProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: any;
    onProfileUpdated: (updatedUser: any) => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose, currentUser, onProfileUpdated }) => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
        }
    }, [isOpen]);

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get('/api/auth/me');
            setProfile(data);
            setEditName(data.name || '');
            setEditEmail(data.email || '');
            setEditPhone(data.phone || '');
        } catch (err: any) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editName.trim()) { setError('Name is required'); return; }
        if (editPhone && editPhone.length !== 10) { setError('Phone must be exactly 10 digits'); return; }
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const { data } = await api.patch('/api/auth/profile', {
                name: editName,
                phone: editPhone,
                email: editEmail || null
            });
            setProfile((prev: any) => ({ ...prev, ...data.user }));
            setSuccess('Profile updated successfully!');
            setEditing(false);
            // Update local storage and parent
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            const updated = { ...stored, name: data.user.name, phone: data.user.phone, email: data.user.email };
            localStorage.setItem('user', JSON.stringify(updated));
            onProfileUpdated(updated);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const roleColor = (role: string) => {
        if (role === 'ADMIN') return 'bg-red-500/15 text-red-400 border-red-500/20';
        if (role === 'TREASURER') return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
        return 'bg-brand-500/15 text-brand-400 border-brand-500/20';
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={cn(
                "fixed right-0 top-0 h-full w-full max-w-[480px] bg-[#0d1322] border-l border-white/10 z-50 overflow-y-auto shadow-2xl",
                "transform transition-transform duration-300",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Header */}
                <div className="sticky top-0 bg-[#0d1322]/95 backdrop-blur-xl border-b border-white/8 px-8 py-5 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-500/15 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-brand-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white">My Profile</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Account settings</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:text-white hover:bg-white/8 rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Loading state */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
                            <p className="text-slate-500 font-medium">Loading profile...</p>
                        </div>
                    )}

                    {!loading && error && !profile && (
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                            <p className="text-sm text-red-300 font-medium">{error}</p>
                        </div>
                    )}

                    {!loading && profile && (
                        <>
                            {/* Avatar + role badge */}
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 bg-brand-500/20 rounded-[24px] flex items-center justify-center text-4xl font-black text-brand-300 border-2 border-brand-500/20 shadow-xl shadow-brand-500/10">
                                    {profile.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white">{profile.name}</h3>
                                    <span className={cn(
                                        "inline-block mt-1 text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest",
                                        roleColor(profile.role)
                                    )}>
                                        {profile.role}
                                    </span>
                                    <p className="text-[11px] text-slate-500 mt-1.5 font-bold">{profile.group?.name}</p>
                                </div>
                            </div>

                            {/* Success / Error */}
                            {success && (
                                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl animate-fade-in">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    <p className="text-sm text-emerald-300 font-medium">{success}</p>
                                </div>
                            )}
                            {error && (
                                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-fade-in">
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                    <p className="text-sm text-red-300 font-medium">{error}</p>
                                </div>
                            )}

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    {
                                        label: 'Total Saved',
                                        value: `RWF ${(profile.stats?.totalContributed || 0).toLocaleString()}`,
                                        icon: Wallet,
                                        color: 'text-brand-400'
                                    },
                                    {
                                        label: 'Contributions',
                                        value: profile.stats?.contributionCount || 0,
                                        icon: TrendingUp,
                                        color: 'text-emerald-400'
                                    },
                                    {
                                        label: 'Penalties',
                                        value: profile.stats?.unpaidPenalties || 0,
                                        icon: AlertCircle,
                                        color: profile.stats?.unpaidPenalties > 0 ? 'text-red-400' : 'text-slate-500'
                                    }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/4 border border-white/6 rounded-2xl p-4 text-center">
                                        <stat.icon className={cn("w-5 h-5 mx-auto mb-2", stat.color)} />
                                        <p className="text-white font-black text-lg leading-tight">{stat.value}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Profile fields */}
                            <div className="bg-white/4 border border-white/8 rounded-[24px] overflow-hidden">
                                <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Personal Info</h4>
                                    {!editing ? (
                                        <button
                                            onClick={() => { setEditing(true); setSuccess(''); setError(''); }}
                                            className="flex items-center gap-1.5 text-[11px] font-black text-brand-400 hover:text-brand-300 transition-colors"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setEditing(false); setError(''); setSuccess(''); }}
                                                className="text-[11px] font-bold text-slate-500 hover:text-slate-300 transition-colors px-3 py-1"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="flex items-center gap-1.5 text-[11px] font-black text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-all"
                                            >
                                                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="divide-y divide-white/5">
                                    {/* Name */}
                                    <div className="px-6 py-4 flex items-center gap-4">
                                        <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Full Name</p>
                                            {editing ? (
                                                <input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-brand-500/50 transition-all"
                                                />
                                            ) : (
                                                <p className="text-white font-bold text-sm">{profile.name}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="px-6 py-4 flex items-center gap-4">
                                        <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Phone Number</p>
                                            {editing ? (
                                                <input
                                                    value={editPhone}
                                                    onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                    maxLength={10}
                                                    className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-brand-500/50 transition-all"
                                                />
                                            ) : (
                                                <p className="text-white font-bold text-sm">{profile.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="px-6 py-4 flex items-center gap-4">
                                        <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Email Address</p>
                                            {editing ? (
                                                <input
                                                    value={editEmail}
                                                    onChange={(e) => setEditEmail(e.target.value)}
                                                    placeholder="Optional"
                                                    type="email"
                                                    className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-brand-500/50 transition-all placeholder:text-slate-600"
                                                />
                                            ) : (
                                                <p className={cn("font-bold text-sm", profile.email ? "text-white" : "text-slate-600 italic")}>
                                                    {profile.email || 'Not set'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* National ID (read-only) */}
                                    <div className="px-6 py-4 flex items-center gap-4">
                                        <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                                            <Shield className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">National ID</p>
                                            <p className={cn("font-bold text-sm tracking-wider", profile.nationalId ? "text-white" : "text-slate-600 italic")}>
                                                {profile.nationalId || 'Not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Member since */}
                                    <div className="px-6 py-4 flex items-center gap-4">
                                        <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Member Since</p>
                                            <p className="text-white font-bold text-sm">
                                                {new Date(profile.createdAt).toLocaleDateString('en-RW', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Group info */}
                            <div className="bg-white/4 border border-white/8 rounded-[24px] p-6">
                                <h4 className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-4">Group Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Group Name', value: profile.group?.name },
                                        { label: 'Plan Tier', value: profile.group?.tier },
                                        { label: 'Contribution', value: `RWF ${(profile.group?.contributionAmt || 0).toLocaleString()}` },
                                        { label: 'Frequency', value: profile.group?.frequency },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{item.label}</p>
                                            <p className="text-white font-bold text-sm">{item.value || '—'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Membership agreement status */}
                            <div className={cn(
                                "rounded-[20px] p-5 border flex items-center gap-4",
                                profile.agreedToRules
                                    ? "bg-emerald-500/8 border-emerald-500/20"
                                    : "bg-amber-500/8 border-amber-500/20"
                            )}>
                                {profile.agreedToRules
                                    ? <FileCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                                    : <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />}
                                <div>
                                    <p className={cn("text-sm font-black", profile.agreedToRules ? "text-emerald-300" : "text-amber-300")}>
                                        {profile.agreedToRules ? 'Membership Agreement Signed' : 'Agreement Pending'}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        {profile.agreedToRules
                                            ? `Signed on ${new Date(profile.agreedAt).toLocaleDateString()}`
                                            : 'Please sign from your dashboard overview.'}
                                    </p>
                                </div>
                            </div>

                            {/* Recent Loans */}
                            {profile.recentLoans && profile.recentLoans.length > 0 && (
                                <div className="bg-white/4 border border-white/8 rounded-[24px] overflow-hidden">
                                    <div className="px-6 py-4 border-b border-white/6">
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">My Recent Loans</h4>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {profile.recentLoans.map((loan: any) => (
                                            <div key={loan.id} className="px-6 py-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-white font-bold text-sm">RWF {loan.amount.toLocaleString()}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold">
                                                        {new Date(loan.createdAt).toLocaleDateString()} · {loan.interestRate}% interest
                                                    </p>
                                                </div>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                                    loan.status === 'ACTIVE' ? "bg-emerald-500/15 text-emerald-400" :
                                                    loan.status === 'REPAID' ? "bg-slate-500/15 text-slate-400" :
                                                    loan.status === 'PENDING' ? "bg-brand-500/15 text-brand-400" :
                                                    loan.status === 'OVERDUE' ? "bg-red-500/15 text-red-400" :
                                                    "bg-white/5 text-slate-500"
                                                )}>{loan.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Security section */}
                            <div className="bg-white/4 border border-white/8 rounded-[24px] p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-brand-500/15 rounded-xl flex items-center justify-center">
                                        <Key className="w-5 h-5 text-brand-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">Password</p>
                                        <p className="text-[11px] text-slate-500">Keep your account secure</p>
                                    </div>
                                </div>
                                <a
                                    href="/forgot-password"
                                    className="text-[11px] font-black text-brand-400 hover:text-brand-300 bg-brand-500/10 px-3 py-2 rounded-lg transition-all"
                                >
                                    Reset Password
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProfileDrawer;
