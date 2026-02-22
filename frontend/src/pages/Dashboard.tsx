import React, { useState, useEffect } from 'react';
import { Wallet, Users, TrendingUp, CreditCard, FileText, LogOut, Search, Bell, Plus, Download, ChevronRight, AlertCircle, ArrowUpRight, ArrowDownLeft, ShieldCheck, CheckCircle2, MoreVertical, Filter, Printer, FileCheck, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generatePDFStatement, exportToExcel, generateAgreementPDF } from '../utils/exports';
import { cn } from '../utils/cn';
import Logo from '../components/Logo';
import api from '../api/instance';
// import axios from 'axios'; (removed in favor of api instance)

const Dashboard: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        totalSavings: 0,
        availableFunds: 0,
        savingsGoal: 5000000,
        memberCount: 0,
        activeLoans: 0,
        trustScore: 0
    });
    const [contributions, setContributions] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loans, setLoans] = useState<any[]>([]);
    const [penalties, setPenalties] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
    const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            fetchDashboardData();
        }
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, contribRes, membersRes, loansRes, penaltiesRes, payoutsRes] = await Promise.all([
                api.get('/api/groups/stats'),
                api.get('/api/contributions'),
                api.get('/api/groups/members'),
                api.get('/api/loans'),
                api.get('/api/penalties'),
                api.get('/api/payouts')
            ]);
            setStats(statsRes.data);
            setContributions(contribRes.data);
            setMembers(membersRes.data);
            setLoans(loansRes.data);
            setPenalties(penaltiesRes.data);
            setPayouts(payoutsRes.data);

            if (user?.role === 'ADMIN' || user?.role === 'TREASURER') {
                const auditRes = await api.get('/api/audit');
                setAuditLogs(auditRes.data);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSignAgreement = async () => {
        try {
            const res = await api.post('/api/groups/sign-agreement');
            const updatedUser = { ...user, ...res.data.user };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            fetchDashboardData();
        } catch (err) {
            console.error('Failed to sign agreement', err);
        }
    };

    const handleApprovePayout = async (id: string) => {
        try {
            await api.post(`/api/payouts/${id}/approve`);
            fetchDashboardData();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to approve payout');
        }
    };

    const handleUpdateGoal = async (newGoal: number) => {
        try {
            await api.patch('/api/groups/goal', { goal: newGoal });
            fetchDashboardData();
            setIsGoalModalOpen(false);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to update savings goal');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const navItems = [
        { icon: Wallet, label: 'Overview' },
        { icon: Users, label: 'Members' },
        { icon: TrendingUp, label: 'Loans' },
        { icon: CreditCard, label: 'Contribute' },
        { icon: FileText, label: 'Reports' },
        ...(user?.role === 'ADMIN' || user?.role === 'TREASURER' ? [{ icon: ShieldCheck, label: 'History' }] : []),
    ];

    const renderTabContent = () => {
        if (activeTab === 'Overview') {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        {user?.role === 'MEMBER' && loans.some(l => l.userId === user?.id && (l.status === 'PENDING' || l.status === 'APPROVED')) && (
                            <div className="bg-amber-600 text-white rounded-[32px] p-8 shadow-2xl shadow-amber-500/20 relative overflow-hidden group animate-pulse-soft">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-white/20 p-2 rounded-xl">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-amber-100">Loan Status Update</p>
                                    </div>
                                    {loans.filter(l => l.userId === user?.id && (l.status === 'PENDING' || l.status === 'APPROVED')).map((l, i) => (
                                        <div key={i} className="mb-4 last:mb-0">
                                            <h3 className="font-black text-2xl mb-1">RWF {l.amount.toLocaleString()}</h3>
                                            <p className="text-amber-100 text-sm font-medium mb-6">
                                                {l.status === 'PENDING'
                                                    ? "Your application is being reviewed by the group officials."
                                                    : "Approved! Waiting for the Treasurer to sign the final disbursement."}
                                            </p>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setActiveTab('Loans')}
                                        className="w-full bg-white text-amber-600 py-4 rounded-2xl text-sm font-black hover:bg-amber-50 transition-all active:scale-95"
                                    >
                                        View Loan Details
                                    </button>
                                </div>
                                <ShieldCheck className="absolute -bottom-10 -right-10 w-40 h-40 text-white opacity-10 group-hover:scale-110 transition-transform duration-700" />
                            </div>
                        )}

                        {/* Prominent Treasury Actions for Admins/Treasurers */}
                        {(user?.role === 'ADMIN' || user?.role === 'TREASURER') && payouts.filter(p => p.status === 'PENDING').length > 0 && (
                            <div className="bg-slate-900 text-white rounded-[32px] p-10 shadow-2xl shadow-slate-900/40 relative overflow-hidden group border border-slate-800">
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-brand-500 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                                                <ShieldCheck className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-2xl tracking-tight">Treasury Approvals</h3>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Action Required: {payouts.filter(p => p.status === 'PENDING').length} Signatures</p>
                                            </div>
                                        </div>
                                        <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                                            Secure Flow
                                        </span>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-[28px] p-6 border border-slate-700/50 mb-8">
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="bg-brand-500/10 p-2 rounded-lg">
                                                <Lock className="w-4 h-4 text-brand-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-200">2-Official Security Enabled</p>
                                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                    BikaSafe payouts require two unique signatures. If you requested this payout, a different official must sign it.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {payouts.filter(p => p.status === 'PENDING').map((p, idx) => (
                                                <div key={idx} className="bg-slate-900/50 p-6 rounded-2xl flex items-center justify-between gap-6 border border-slate-700 group/item hover:border-brand-500/30 transition-all">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="text-lg font-black text-white">RWF {p.amount.toLocaleString()}</p>
                                                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-bold"># {p.id.slice(0, 8)}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 font-medium truncate italic">"{p.description}"</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleApprovePayout(p.id)}
                                                        className="bg-brand-600 text-white px-6 py-4 rounded-xl hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/20 active:scale-95 flex items-center gap-2 group-hover/item:scale-105"
                                                    >
                                                        <ShieldCheck className="w-5 h-5" />
                                                        <span className="font-black text-xs">Sign Payout</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                        Verified & Encrypted Treasury Transaction
                                    </p>
                                </div>
                                <Wallet className="absolute -bottom-20 -left-20 w-80 h-80 text-white opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                            </div>
                        )}

                        <div className="bg-white rounded-[32px] shadow-premium border border-white overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="font-extrabold text-xl">Recent Contributions</h3>
                                <button onClick={() => setActiveTab('Contribute')} className="text-brand-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                    View History <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-2">
                                {loading ? (
                                    <div className="p-8 text-center text-slate-400 font-medium">Loading contributions...</div>
                                ) : contributions.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 font-medium whitespace-pre-wrap">No contributions recorded yet.{"\n"}Click "Record Entry" to start.</div>
                                ) : contributions
                                    .filter(c =>
                                        c.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        c.amount.toString().includes(searchTerm)
                                    )
                                    .slice(0, 5).map((item, idx) => (
                                        <div key={idx} className="p-6 rounded-2xl flex items-center gap-5 hover:bg-slate-50 transition-all cursor-pointer group">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                                                {item.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900">{item.user?.name || 'Unknown'}</p>
                                                <p className="text-xs text-slate-400 font-medium">{new Date(item.timestamp).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-slate-900 tracking-tight">+{item.amount.toLocaleString()}</p>
                                                <span className={cn(
                                                    "text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider",
                                                    item.status === 'PAID' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                                                )}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] shadow-premium border border-white overflow-hidden p-8">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-extrabold text-xl">Savings Trends</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-brand-600 rounded-full" />
                                    <span className="text-xs font-bold text-slate-400">Total Savings (RWF)</span>
                                </div>
                            </div>
                            <FinanceChart data={[
                                { name: 'Jan', amount: 1200000 },
                                { name: 'Feb', amount: 1800000 },
                                { name: 'Mar', amount: 2400000 },
                                { name: 'Apr', amount: 3100000 },
                                { name: 'May', amount: stats.totalSavings || 3750000 },
                            ]} />
                        </div>
                    </div>

                    <div className="space-y-8">
                        {penalties.filter(p => p.status === 'UNPAID').length > 0 ? (
                            <div className="bg-amber-600 text-white rounded-[32px] p-8 shadow-2xl shadow-amber-500/20 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="bg-white/20 w-fit p-3 rounded-2xl mb-6">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-black text-xl mb-2 leading-tight">Penalties Detected</h3>
                                    <p className="text-amber-100 text-sm font-medium mb-8 leading-relaxed">
                                        There are {penalties.filter(p => p.status === 'UNPAID').length} unpaid penalties in the group. Please resolve these to maintain a high trust score.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('Reports')}
                                        className="w-full bg-white text-amber-600 py-4 rounded-2xl text-sm font-black hover:bg-amber-50 transition-all active:scale-95"
                                    >
                                        Review Penalties
                                    </button>
                                </div>
                                <AlertCircle className="absolute -bottom-10 -right-10 w-40 h-40 text-white opacity-10 group-hover:scale-110 transition-transform duration-700" />
                            </div>
                        ) : (
                            <div className="bg-emerald-600 text-white rounded-[32px] p-8 shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="bg-white/20 w-fit p-3 rounded-2xl mb-6">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-black text-xl mb-2 leading-tight">All Clear</h3>
                                    <p className="text-emerald-100 text-sm font-medium mb-8 leading-relaxed">
                                        Your group is in good standing. No overdue payments or penalties detected this cycle.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('Reports')}
                                        className="w-full bg-white text-emerald-600 py-4 rounded-2xl text-sm font-black hover:bg-emerald-50 transition-all active:scale-95"
                                    >
                                        View Full Report
                                    </button>
                                </div>
                                <CheckCircle2 className="absolute -bottom-10 -right-10 w-40 h-40 text-white opacity-10 group-hover:scale-110 transition-transform duration-700" />
                            </div>
                        )}

                        {user?.agreedToRules ? (
                            <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <FileCheck className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900">Signed Agreement</h4>
                                        <p className="text-xs text-slate-400 font-bold">Membership verified on {new Date(user.agreedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => generateAgreementPDF(user.name, "BikaSafe Group", new Date(user.agreedAt).toLocaleDateString())}
                                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-brand-600 hover:bg-brand-50 transition-all"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="bg-brand-600 text-white rounded-[32px] p-8 shadow-2xl shadow-brand-500/20 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="bg-white/20 w-fit p-3 rounded-2xl mb-6">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-black text-xl mb-2 leading-tight">Membership Agreement</h3>
                                    <p className="text-brand-100 text-sm font-medium mb-8 leading-relaxed">
                                        Please review and sign the group rules to finalize your membership and access all features.
                                    </p>
                                    <button
                                        onClick={handleSignAgreement}
                                        className="w-full bg-white text-brand-600 py-4 rounded-2xl text-sm font-black hover:bg-brand-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Sign Digital Agreement
                                    </button>
                                </div>
                                <FileText className="absolute -bottom-10 -right-10 w-40 h-40 text-white opacity-10 group-hover:scale-110 transition-transform duration-700" />
                            </div>
                        )}

                        <div className="bg-brand-600 text-white rounded-[32px] p-8 shadow-2xl shadow-brand-500/20 relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <p className="text-xs font-bold text-brand-100 uppercase tracking-widest">Available Treasury Funds</p>
                                    <ShieldCheck className="w-5 h-5 text-brand-200" />
                                </div>
                                <p className="text-4xl font-black mb-1">RWF {stats?.availableFunds?.toLocaleString() || '0'}</p>
                                <p className="text-xs text-brand-100 font-bold opacity-80 uppercase tracking-wider mb-8">
                                    Total Savings: RWF {stats?.totalSavings?.toLocaleString() || '0'}
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {(user?.role === 'ADMIN' || user?.role === 'TREASURER') && (
                                        <button
                                            onClick={() => setIsWithdrawalModalOpen(true)}
                                            className="bg-white/20 hover:bg-white/30 text-white py-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border border-white/10"
                                        >
                                            <ArrowUpRight className="w-4 h-4" /> Withdraw
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsRecordModalOpen(true)}
                                        className="bg-white text-brand-600 py-4 rounded-2xl text-xs font-black hover:bg-brand-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Contribute
                                    </button>
                                </div>
                            </div>
                            <Wallet className="absolute -bottom-10 -right-10 w-40 h-40 text-white opacity-10 group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        <div
                            onClick={() => {
                                if (user?.role === 'ADMIN') setIsGoalModalOpen(true);
                                else alert(`Current saving progress: ${Math.round((stats.totalSavings / (stats.savingsGoal || 5000000)) * 100)}% of the group target.`);
                            }}
                            className="bg-slate-900 text-white rounded-[32px] p-8 relative overflow-hidden shadow-2xl shadow-slate-900/40 cursor-pointer hover:scale-[1.02] transition-all"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Savings Goal</p>
                                    <TrendingUp className="w-5 h-5 text-brand-400" />
                                </div>
                                <p className="text-3xl font-black mb-1">{Math.round((stats.totalSavings / (stats.savingsGoal || 5000000)) * 100)}%</p>
                                <p className="text-xs text-slate-400 font-bold mb-6">
                                    RWF {stats.totalSavings.toLocaleString()} / {(stats.savingsGoal || 5000000).toLocaleString()}
                                </p>
                                <div className="w-full bg-slate-800 rounded-full h-3.5 mb-2 p-1">
                                    <div
                                        className="bg-gradient-to-r from-brand-500 to-emerald-500 h-full rounded-full shadow-lg shadow-brand-500/20"
                                        style={{ width: `${Math.min(100, (stats.totalSavings / (stats.savingsGoal || 5000000)) * 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">
                                    {user?.role === 'ADMIN' ? 'Click to set new group goal' : 'Safe & Encrypted Storage'}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            );
        }

        if (activeTab === 'Members') {
            return (
                <div className="bg-white rounded-[32px] shadow-premium border border-white overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="font-extrabold text-xl">Group Members</h3>
                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={() => setIsAddMemberModalOpen(true)}
                                className="bg-brand-600 text-white px-8 py-4 rounded-2xl text-sm font-black hover:bg-brand-700 transition-all flex items-center gap-2 shadow-xl shadow-brand-500/20 active:scale-95"
                            >
                                <Plus className="w-5 h-5" /> Add Member
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Member Name</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">National ID</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members
                                    .filter(m =>
                                        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        m.phone.includes(searchTerm) ||
                                        (m.nationalId && m.nationalId.includes(searchTerm))
                                    )
                                    .map((m, i) => (
                                        <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5 font-bold text-slate-900">{m.name}</td>
                                            <td className="px-8 py-5 text-slate-500 font-medium">{m.phone}</td>
                                            <td className="px-8 py-5 text-slate-500 font-medium tracking-wider">{m.nationalId || '-'}</td>
                                            <td className="px-8 py-5">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                                    m.role === 'ADMIN' ? "bg-red-50 text-red-600" :
                                                        m.role === 'TREASURER' ? "bg-amber-50 text-amber-600" :
                                                            "bg-brand-50 text-brand-600"
                                                )}>
                                                    {m.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (activeTab === 'Loans') {
            const pendingLoans = loans.filter(l => l.status === 'PENDING');
            const myPendingLoans = loans.filter(l => l.userId === user?.id && (l.status === 'PENDING' || l.status === 'APPROVED'));
            const processedLoans = loans.filter(l => l.status !== 'PENDING' && l.status !== 'APPROVED');

            const handleStatusUpdate = async (loanId: string, status: string) => {
                try {
                    await api.patch(`/api/loans/${loanId}/status`, { status });
                    fetchDashboardData();
                } catch (err: any) {
                    alert(err.response?.data?.error || 'Failed to update loan status');
                }
            };

            return (
                <div className="space-y-10">
                    {/* Admin/Treasurer Approval Section */}
                    {(user?.role === 'ADMIN' || user?.role === 'TREASURER') && pendingLoans.length > 0 && (
                        <div className="bg-amber-50 rounded-[32px] border-2 border-amber-100 overflow-hidden shadow-xl shadow-amber-500/10 animate-pulse-soft">
                            <div className="p-8 border-b border-amber-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-6 h-6 text-amber-600" />
                                    <h3 className="font-extrabold text-xl text-amber-900">Pending Approvals</h3>
                                </div>
                                <span className="bg-amber-200 text-amber-900 px-3 py-1 rounded-full text-xs font-black">
                                    {pendingLoans.length} REQUESTS
                                </span>
                            </div>
                            <div className="p-2 space-y-2">
                                {pendingLoans.map((l, i) => (
                                    <div key={i} className="bg-white m-2 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border border-amber-100/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center font-black text-amber-600 text-lg">
                                                {l.user?.name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{l.user?.name}</p>
                                                <p className="text-xs text-slate-400 font-medium">Requested RWF {l.amount.toLocaleString()} @ {l.interestRate}%</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleStatusUpdate(l.id, 'REJECTED')}
                                                className="px-6 py-3 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-50 transition-all"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(l.id, 'APPROVED')}
                                                className="bg-amber-600 text-white px-8 py-3 rounded-xl text-xs font-black hover:bg-amber-700 shadow-lg shadow-amber-600/20 transition-all active:scale-95"
                                            >
                                                Approve & Request Payout
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Member's Own Pending Requests */}
                    {user?.role === 'MEMBER' && myPendingLoans.length > 0 && (
                        <div className="bg-brand-50 rounded-[32px] border-2 border-brand-100 overflow-hidden shadow-xl shadow-brand-500/10">
                            <div className="p-8 border-b border-brand-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-6 h-6 text-brand-600" />
                                    <h3 className="font-extrabold text-xl text-brand-900">My Loan Requests</h3>
                                </div>
                                <span className="bg-brand-200 text-brand-900 px-3 py-1 rounded-full text-xs font-black lowercase tracking-widest leading-none">
                                    {myPendingLoans.length} active applications
                                </span>
                            </div>
                            <div className="p-4 space-y-4">
                                {myPendingLoans.map((l, i) => (
                                    <div key={i} className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-brand-100/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center font-black text-brand-600">
                                                <Wallet className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">RWF {l.amount.toLocaleString()}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Target: {new Date(l.deadline).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                            l.status === 'APPROVED' ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-slate-100 text-slate-600"
                                        )}>
                                            {l.status === 'APPROVED' ? 'Awaiting Payout' : 'Awaiting Approval'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-[32px] shadow-premium border border-white overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="font-extrabold text-xl">Loan History</h3>
                            <button
                                onClick={() => setIsLoanModalOpen(true)}
                                className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-xs font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New Request
                            </button>
                        </div>
                        <div className="p-4">
                            {processedLoans.length === 0 && myPendingLoans.length === 0 && pendingLoans.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="bg-slate-50 w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto text-slate-300 mb-6">
                                        <TrendingUp className="w-10 h-10" />
                                    </div>
                                    <p className="text-slate-400 font-bold">No processed loans yet.</p>
                                    <p className="text-xs text-slate-400 mt-2 font-medium">Loans waiting for approval will appear above.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Borrower</th>
                                                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loans.map((l, i) => (
                                                <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-5 font-bold text-slate-900">{l.user?.name}</td>
                                                    <td className="px-8 py-5 font-black text-slate-900">RWF {l.amount.toLocaleString()}</td>
                                                    <td className="px-8 py-5 text-slate-500 font-medium text-xs">{new Date(l.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-8 py-5">
                                                        <span className={cn(
                                                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                                            l.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600" :
                                                                l.status === 'REJECTED' ? "bg-red-50 text-red-600" :
                                                                    l.status === 'APPROVED' ? "bg-amber-50 text-amber-600" :
                                                                        "bg-slate-50 text-slate-600"
                                                        )}>
                                                            {l.status === 'APPROVED' ? 'DISBURSING' : l.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <LoanCalculator />
                </div>
            );
        }

        if (activeTab === 'Contribute') {
            return (
                <div className="bg-white rounded-[32px] shadow-premium border border-white overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="font-extrabold text-xl">All Contributions</h3>
                        <button onClick={() => setIsRecordModalOpen(true)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
                            Add Entry
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contributions.map((c, i) => (
                                    <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 font-bold text-slate-900">{c.user?.name}</td>
                                        <td className="px-8 py-5 font-black text-slate-900">RWF {c.amount.toLocaleString()}</td>
                                        <td className="px-8 py-5 text-slate-500 font-medium">{new Date(c.timestamp).toLocaleDateString()}</td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                                c.status === 'PAID' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                                            )}>
                                                {c.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (activeTab === 'Reports') {
            const ledger = [
                ...contributions.map(c => ({
                    id: c.id,
                    type: 'CONTRIBUTION',
                    member: c.user?.name,
                    amount: c.amount,
                    date: c.timestamp,
                    status: c.status
                })),
                ...loans.filter(l => l.status === 'ACTIVE').map(l => ({
                    id: l.id,
                    type: 'LOAN',
                    member: l.user?.name,
                    amount: -l.amount,
                    date: l.createdAt,
                    status: l.status
                })),
                ...penalties.map(p => ({
                    id: p.id,
                    type: 'PENALTY',
                    member: p.user?.name,
                    amount: -p.amount,
                    date: p.timestamp,
                    status: p.status
                })),
                ...payouts.filter(p => p.status === 'APPROVED').map(p => ({
                    id: p.id,
                    type: 'PAYOUT',
                    member: p.requestedBy?.name,
                    amount: -p.amount,
                    date: p.createdAt,
                    status: p.status
                }))
            ].filter(item =>
                item.member?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.type.toLowerCase().includes(searchTerm.toLowerCase())
            ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const handleExportPDF = () => {
                const exportData = ledger.map(item => ({
                    Date: new Date(item.date).toLocaleDateString(),
                    Member: item.member,
                    Type: item.type,
                    Amount: item.amount.toLocaleString(),
                    Status: item.status
                }));
                generatePDFStatement(exportData, 'BikaSafe Group Ledger', `Ledger_${new Date().toISOString().split('T')[0]}`);
            };

            const handleExportExcel = () => {
                const exportData = ledger.map(item => ({
                    Date: new Date(item.date).toLocaleDateString(),
                    Member: item.member,
                    Type: item.type,
                    Amount: item.amount,
                    Status: item.status
                }));
                exportToExcel(exportData, `Ledger_${new Date().toISOString().split('T')[0]}`);
            };

            const triggerPenaltyCheck = async () => {
                try {
                    await api.post('/api/penalties/trigger-check');
                    fetchDashboardData();
                } catch (err) {
                    console.error('Failed to trigger penalty check', err);
                }
            };

            return (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex flex-wrap gap-3">
                            <button onClick={handleExportPDF} className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                                <Printer className="w-4 h-4" /> PDF Report
                            </button>
                            <button onClick={handleExportExcel} className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                                <Download className="w-4 h-4" /> Excel Export
                            </button>
                            {user?.agreedToRules && (
                                <button
                                    onClick={() => generateAgreementPDF(user.name, "BikaSafe Group", new Date(user.agreedAt).toLocaleDateString())}
                                    className="bg-brand-50 border border-brand-100 text-brand-700 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-brand-100 transition-all flex items-center gap-2 shadow-sm"
                                >
                                    <FileCheck className="w-4 h-4" /> Membership Cert
                                </button>
                            )}
                        </div>
                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={triggerPenaltyCheck}
                                className="bg-amber-100 text-amber-700 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-amber-200 transition-all flex items-center gap-2"
                            >
                                <AlertCircle className="w-4 h-4" /> Trigger Penalty Check
                            </button>
                        )}
                    </div>

                    <div className="bg-white rounded-[40px] shadow-premium border border-white overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-black tracking-tight">Financial Ledger</h3>
                                <p className="text-sm text-slate-400 font-bold">Comprehensive transaction history</p>
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Filter by member..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-50 border-none rounded-xl py-3 pl-11 pr-6 text-sm font-bold focus:ring-2 focus:ring-brand-500/10 w-full md:w-64 outline-none"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                        <th className="px-4 py-5 font-black text-slate-400"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledger.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold">
                                                No transactions found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : ledger.map((item, idx) => (
                                        <tr key={idx} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className={cn(
                                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase",
                                                    item.type === 'CONTRIBUTION' ? "bg-emerald-50 text-emerald-600" :
                                                        item.type === 'LOAN' ? "bg-blue-50 text-blue-600" :
                                                            item.type === 'PAYOUT' ? "bg-purple-50 text-purple-600" :
                                                                "bg-amber-50 text-amber-600"
                                                )}>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full",
                                                        item.type === 'CONTRIBUTION' ? "bg-emerald-600" :
                                                            item.type === 'LOAN' ? "bg-blue-600" :
                                                                item.type === 'PAYOUT' ? "bg-purple-600" :
                                                                    "bg-amber-600"
                                                    )} />
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-500">
                                                {new Date(item.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-900">
                                                {item.member}
                                            </td>
                                            <td className={cn(
                                                "px-8 py-6 text-sm font-black text-right tracking-tight",
                                                item.amount > 0 ? "text-emerald-600" : "text-slate-900"
                                            )}>
                                                {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()} RWF
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={cn(
                                                    "text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider",
                                                    item.status === 'PAID' || item.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600" :
                                                        item.status === 'UNPAID' ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
                                                )}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-6 text-right">
                                                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'History') {
            return (
                <div className="bg-white rounded-[32px] shadow-premium border border-white overflow-hidden animate-fade-in">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h3 className="font-extrabold text-xl">Audit Logs</h3>
                            <p className="text-sm text-slate-400 font-medium">System activities and history</p>
                        </div>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black">{auditLogs.length} EVENTS</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">User</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">No activity logs found.</td>
                                    </tr>
                                ) : (
                                    auditLogs.map((log, i) => (
                                        <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider border border-slate-200">
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-slate-900">{log.user?.name || 'System'}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{log.user?.role || ''}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                    {log.details}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-[11px] text-slate-400 font-bold">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
            {/* Sidebar (Desktop) */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-20">
                <div className="p-8">
                    <Logo size="md" theme="light" />
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setActiveTab(item.label)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all",
                                activeTab === item.label
                                    ? "bg-brand-50 text-brand-700 shadow-sm"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
                    <button
                        onClick={() => setIsChangePasswordModalOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        <Lock className="w-5 h-5 text-slate-400" />
                        Security
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen">
                {/* Top Header */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 border-b border-slate-200 z-10 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative max-w-md w-full hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search contributions, members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-100 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => alert("Notifications: No new activities since your last login.")}
                            className="p-2.5 bg-slate-100 text-slate-500 rounded-xl relative hover:text-brand-600 transition-all hover:bg-slate-200"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <button
                            onClick={() => setActiveTab('Reports')}
                            className="hidden md:flex p-2.5 bg-brand-50 text-brand-600 rounded-xl items-center gap-2 hover:bg-brand-100 transition-all border border-brand-200/50"
                        >
                            <Download className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-wider">Quick Export</span>
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200 mx-2" />
                        <div className="flex items-center gap-3">
                            <div className="bg-brand-100 text-brand-700 w-10 h-10 rounded-xl flex items-center justify-center font-bold">
                                {user?.name?.[0] || 'U'}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-bold leading-tight">{user?.name || 'User'}</p>
                                <p className="text-[11px] text-slate-400 font-bold uppercase">{user?.role || 'Member'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in">
                    {/* Welcome & Global Actions */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <span className="text-brand-600 font-bold text-sm tracking-wider uppercase">Your Dashboard</span>
                            <h1 className="text-4xl font-black tracking-tight mt-1">Group Summary</h1>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {user?.role === 'ADMIN' && (
                                <button
                                    onClick={() => setIsAddMemberModalOpen(true)}
                                    className="bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all text-sm shadow-sm active:scale-95"
                                >
                                    <Users className="w-4 h-4" />
                                    Add Member
                                </button>
                            )}
                            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all text-sm shadow-sm active:scale-95">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button
                                onClick={() => setIsRecordModalOpen(true)}
                                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all text-sm active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                Record Entry
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Savings', value: `RWF ${stats.totalSavings.toLocaleString()}`, change: '+12%', up: true, icon: Wallet, color: 'brand' },
                            { label: 'Active Loans', value: `RWF ${stats.activeLoans}`, change: '-5%', up: false, icon: TrendingUp, color: 'blue' },
                            { label: 'Members', value: `${stats.memberCount} Players`, change: '+2', up: true, icon: Users, color: 'indigo' },
                            { label: 'Trust Score', value: `${stats.trustScore}%`, change: '+0.5', up: true, icon: ShieldCheck, color: 'emerald' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-7 rounded-[32px] shadow-premium border border-white hover:border-slate-200 transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={cn("p-3.5 rounded-2xl transition-transform group-hover:scale-110", `bg-${stat.color}-50 text-${stat.color}-600`)}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div className={cn("flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full", stat.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                                        {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                                        {stat.change}
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-slate-400 mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
                            </div>
                        ))}
                    </div>

                    {/* Dynamic Content Based on activeTab */}
                    {renderTabContent()}
                </div>
            </main>

            {/* Record Entry Modal */}
            {isRecordModalOpen && (
                <RecordContributionModal
                    onClose={() => setIsRecordModalOpen(false)}
                    onSuccess={() => {
                        setIsRecordModalOpen(false);
                        fetchDashboardData();
                    }}
                />
            )}

            {/* Add Member Modal */}
            {isAddMemberModalOpen && (
                <AddMemberModal
                    onClose={() => setIsAddMemberModalOpen(false)}
                    onSuccess={() => {
                        setIsAddMemberModalOpen(false);
                        fetchDashboardData();
                    }}
                />
            )}

            {/* Loan Request Modal */}
            {isLoanModalOpen && (
                <LoanRequestModal
                    onClose={() => setIsLoanModalOpen(false)}
                    onSuccess={() => {
                        setIsLoanModalOpen(false);
                        fetchDashboardData();
                    }}
                />
            )}

            {/* Withdrawal Request Modal */}
            {isWithdrawalModalOpen && (
                <WithdrawalRequestModal
                    onClose={() => setIsWithdrawalModalOpen(false)}
                    onSuccess={() => {
                        setIsWithdrawalModalOpen(false);
                        fetchDashboardData();
                    }}
                />
            )}

            {/* Savings Goal Modal */}
            {isGoalModalOpen && (
                <GoalModal
                    currentGoal={stats.savingsGoal}
                    onClose={() => setIsGoalModalOpen(false)}
                    onSuccess={(newGoal) => handleUpdateGoal(newGoal)}
                />
            )}

            {/* Change Password Modal */}
            {isChangePasswordModalOpen && (
                <ChangePasswordModal
                    onClose={() => setIsChangePasswordModalOpen(false)}
                    onSuccess={() => {
                        setIsChangePasswordModalOpen(false);
                        alert("Password updated successfully! Please use your new password next time you sign in.");
                    }}
                />
            )}
        </div>
    );
};

interface ModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

interface GoalModalProps {
    currentGoal: number;
    onClose: () => void;
    onSuccess: (goal: number) => void;
}

const GoalModal: React.FC<GoalModalProps> = ({ currentGoal, onClose, onSuccess }) => {
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
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-all outline-none"
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Goal'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const ChangePasswordModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Security Setting</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <Plus className="w-5 h-5 rotate-45 text-slate-400" />
                    </button>
                </div>
                <p className="text-slate-500 font-bold mb-8 text-sm leading-relaxed">
                    Update your password to keep your account secure.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Current Password</label>
                        <input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">New Password</label>
                        <input
                            required
                            type="password"
                            placeholder="Min. 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Confirm New Password</label>
                        <input
                            required
                            type="password"
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-all outline-none"
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

const RecordContributionModal: React.FC<ModalProps> = ({ onClose, onSuccess }) => {
    const [members, setMembers] = useState<any[]>([]);
    const [selectedMember, setSelectedMember] = useState('');
    const [amount, setAmount] = useState('');
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black tracking-tight">Record Entry</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <Plus className="w-5 h-5 rotate-45 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Member</label>
                        <select
                            value={selectedMember}
                            onChange={(e) => setSelectedMember(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-all outline-none"
                        >
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Amount (RWF)</label>
                        <input
                            type="number"
                            required
                            placeholder="e.g. 10000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-all outline-none"
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold px-1">{error}</p>}

                    <button
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Recording...' : 'Confirm Entry'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const AddMemberModal: React.FC<ModalProps> = ({ onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
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
            await api.post('/api/groups/add-member', { name, phone, role, nationalId });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black tracking-tight">Add Member</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <Plus className="w-5 h-5 rotate-45 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                        <input
                            required
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Phone Number (10 Digits)</label>
                        <input
                            required
                            type="tel"
                            maxLength={10}
                            placeholder="07xxxxxxxx"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">National ID (16 Digits)</label>
                        <input
                            type="text"
                            maxLength={16}
                            placeholder="Enter 16-digit ID"
                            value={nationalId}
                            onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-all outline-none"
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

const LoanRequestModal: React.FC<ModalProps> = ({ onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [interestRate, setInterestRate] = useState('5'); // Default 5%
    const [deadline, setDeadline] = useState('');
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
                deadline: new Date(deadline).toISOString()
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to request loan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black tracking-tight">Request Loan</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <Plus className="w-5 h-5 rotate-45 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Amount (RWF)</label>
                        <input
                            required
                            type="number"
                            placeholder="e.g. 50000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Interest Rate (%)</label>
                        <input
                            required
                            type="number"
                            placeholder="5"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Repayment Deadline</label>
                        <input
                            required
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-all outline-none"
                        />
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

const WithdrawalRequestModal: React.FC<ModalProps> = ({ onClose, onSuccess }) => {
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 relative">
                <button onClick={onClose} className="absolute right-8 top-8 text-slate-300 hover:text-slate-900 transition-colors">
                    <Plus className="w-6 h-6 rotate-45" />
                </button>
                <div className="mb-10">
                    <div className="bg-brand-50 w-16 h-16 rounded-[24px] flex items-center justify-center text-brand-600 mb-6">
                        <ArrowUpRight className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">Request Withdrawal</h2>
                    <p className="text-slate-400 font-bold mt-2">Treasury fund distribution</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (RWF)</label>
                        <input
                            type="number"
                            required
                            placeholder="e.g., 50000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-slate-50 border-none rounded-2xl w-full py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Description / Purpose</label>
                        <textarea
                            required
                            placeholder="e.g., Social security payment for Member X"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-slate-50 border-none rounded-2xl w-full py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-brand-500/10 transition-all outline-none min-h-[120px]"
                        />
                    </div>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold leading-relaxed">
                            {error}
                        </div>
                    )}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-slate-900 text-white w-full py-5 rounded-[24px] font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const FinanceChart = ({ data }: { data: any[] }) => (
    <div className="h-[300px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(val) => `RWF ${val / 1000}k`} />
                <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 900, color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

const LoanCalculator: React.FC = () => {
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

export default Dashboard;
