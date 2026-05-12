import React, { useState, useEffect } from 'react';
import { Wallet, Users, TrendingUp, CreditCard, FileText, LogOut, Search, Bell, Plus, Download, ChevronRight, AlertCircle, ArrowUpRight, ArrowDownLeft, ShieldCheck, CheckCircle2, MoreVertical, Filter, Printer, FileCheck, Lock, Upload, Megaphone, Trash2, Calendar, X, Vote, CheckSquare, Layers, Heart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generatePDFStatement, exportToExcel, generateAgreementPDF } from '../utils/exports';
import { cn } from '../utils/cn';
import Logo from '../components/Logo';
import api from '../api/instance';
import NotificationCenter from '../components/NotificationCenter';
import ProfileDrawer from '../components/ProfileDrawer';
import { GoalModal, ChangePasswordModal, RecordContributionModal, AddMemberModal, LoanRequestModal, WithdrawalRequestModal, AnnouncementModal, MeetingModal, PollModal, LoanCalculator, FinanceChart } from '../components/dashboard/Modals';


// import axios from 'axios'; (removed in favor of api instance)


const Dashboard: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        totalSavings: 0,
        totalSocial: 0,
        availableFunds: 0,
                savingsGoal: 0,
        memberCount: 0,
        activeLoans: 0,
        activeLoanAmount: 0,
        trustScore: 0,
        groupName: ''
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
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
    const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
    const [isPollModalOpen, setIsPollModalOpen] = useState(false);
    const [dismissedBanner, setDismissedBanner] = useState(false);
    const [meetings, setMeetings] = useState<any[]>([]);
    const [polls, setPolls] = useState<any[]>([]);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            fetchDashboardData(parsed);
            fetchAnnouncements();

            // Force password change for users with temporary password
            if (parsed.mustChangePassword || localStorage.getItem('mustChangePassword') === 'true') {
                setIsChangePasswordModalOpen(true);
            }
        }
    }, []);

    const fetchDashboardData = async (currentUser?: any) => {
        const activeUser = currentUser || user;
        try {
            setLoading(true);
            const [statsRes, contribRes, membersRes, loansRes, penaltiesRes, payoutsRes, meetingsRes, pollsRes] = await Promise.all([
                api.get('/api/groups/stats'),
                api.get('/api/contributions'),
                api.get('/api/groups/members'),
                api.get('/api/loans'),
                api.get('/api/penalties'),
                api.get('/api/payouts'),
                api.get('/api/meetings'),
                api.get('/api/polls')
            ]);
            setStats(statsRes.data);
            // Handle paginated responses: extract .data array if present
            setContributions(contribRes.data?.data || contribRes.data || []);
            setMembers(membersRes.data || []);
            setLoans(loansRes.data?.data || loansRes.data || []);
            setPenalties(penaltiesRes.data?.data || penaltiesRes.data || []);
            setPayouts(payoutsRes.data?.data || payoutsRes.data || []);
            setMeetings(meetingsRes.data || []);
            setPolls(pollsRes.data || []);

            if (activeUser?.role === 'ADMIN' || activeUser?.role === 'TREASURER') {
                const auditRes = await api.get('/api/audit');
                setAuditLogs(auditRes.data?.data || auditRes.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/api/announcements');
            setAnnouncements(res.data);
        } catch (err) {
            console.error('Failed to fetch announcements', err);
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

    const handleDownloadExcel = async () => {
        try {
            const response = await api.get('/api/reports/excel', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `BikaSafe_Report_${stats.groupName.replace(/\s+/g, '_')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Failed to download Excel report', err);
            alert('Failed to download Excel report');
        }
    };

    const handleEmailReport = async () => {
        const email = prompt('Enter the email address to receive the report:', user?.email || '');
        if (!email) return;

        try {
            await api.post('/api/reports/email', { email });
            alert(`Report has been sent to ${email}`);
        } catch (err: any) {
            console.error('Failed to send email report', err);
            const errorMsg = err.response?.data?.error || 'Failed to send email report';
            const errorDetail = err.response?.data?.details ? `\n\nDetails: ${err.response.data.details}` : '';
            const errorTip = err.response?.data?.tip ? `\n\nTip: ${err.response.data.tip}` : '';
            alert(`${errorMsg}${errorDetail}${errorTip}`);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('agreement', file);

        try {
            setLoading(true);
            const res = await api.post('/api/upload/agreement', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(res.data.message);
            // Update local user state
            const updatedUser = { ...user, agreedToRules: true, agreedAt: new Date().toISOString(), agreementUrl: res.data.url };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            fetchDashboardData();
        } catch (err: any) {
            console.error('Upload failed', err);
            alert(err.response?.data?.error || 'Upload failed');
        } finally {
            setLoading(false);
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
        { icon: CheckSquare, label: 'Meetings' },
        { icon: AlertCircle, label: 'Penalties' },
        { icon: Vote, label: 'Governance' },
        { icon: Layers, label: 'Share-Out' },
        { icon: Megaphone, label: 'Announcements' },
        { icon: FileText, label: 'Reports' },
        ...(user?.role === 'ADMIN' || user?.role === 'TREASURER' ? [{ icon: ShieldCheck, label: 'History' }] : []),
    ];

    // ── Real chart data: contributions aggregated by last 6 months ────────
    const chartData = (() => {
        const months: { name: string; amount: number }[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = d.toLocaleString('default', { month: 'short' });
            const total = contributions
                .filter(c => {
                    const t = new Date(c.timestamp);
                    return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth() && c.fundType !== 'SOCIAL';
                })
                .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
            months.push({ name: label, amount: total });
        }
        return months;
    })();

    // ── Real trust score: 0-100 based on behaviour ───────────────────────
    const trustScore = (() => {
        if (!contributions.length && !penalties.length && !loans.length) return 0;
        let score = 100;
        const unpaidPenalties = penalties.filter((p: any) => p.status === 'UNPAID').length;
        const totalPenalties = penalties.length;
        const lateMissed = contributions.filter((c: any) => c.status === 'LATE' || c.status === 'MISSED').length;
        const totalContributions = contributions.length;
        const overdueLoans = loans.filter((l: any) => l.status === 'OVERDUE').length;
        if (unpaidPenalties > 0) score -= Math.min(40, unpaidPenalties * 10);
        if (totalContributions > 0) score -= Math.min(30, Math.round((lateMissed / totalContributions) * 30));
        if (overdueLoans > 0) score -= Math.min(30, overdueLoans * 15);
        return Math.max(0, score);
    })();

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

                        <div className="glass-card rounded-[28px] shadow-dark-card border border-white/5 overflow-hidden">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <h3 className="font-extrabold text-xl text-white">Recent Contributions</h3>
                                <button onClick={() => setActiveTab('Contribute')} className="text-brand-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                    View History <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-2">
                                {loading ? (
                                    <div className="p-8 text-center text-slate-500 font-medium">Loading contributions...</div>
                                ) : contributions.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 font-medium whitespace-pre-wrap">No contributions recorded yet.{"\n"}Click "Record Entry" to start.</div>
                                ) : contributions
                                    .filter(c =>
                                        c.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        c.amount.toString().includes(searchTerm)
                                    )
                                    .slice(0, 5).map((item, idx) => (
                                        <div key={idx} className="p-6 rounded-2xl flex items-center gap-5 hover:bg-white/5 transition-all cursor-pointer group">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-brand-500/10 group-hover:text-brand-400 transition-colors">
                                                {item.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-200">{item.user?.name || 'Unknown'}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{item.refNo || `#${item.id.slice(0, 6)}`} • {new Date(item.timestamp).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-white tracking-tight">+{item.amount.toLocaleString()}</p>
                                                <span className={cn(
                                                    "text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider",
                                                    item.status === 'PAID' ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
                                                )}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="glass-card rounded-[28px] shadow-dark-card border border-white/5 overflow-hidden p-8 relative group">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-extrabold text-xl text-white">Savings Trends</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-brand-500 rounded-full" />
                                    <span className="text-xs font-bold text-slate-500">Last 6 Months (RWF)</span>
                                </div>
                            </div>

                            <FinanceChart data={chartData} />
                        </div>
                    </div>

                    <div className="space-y-8">
                        {penalties.filter(p => p.status === 'UNPAID').length > 0 ? (
                            <div className="bg-amber-500/10 border border-amber-500/20 text-white rounded-[28px] p-8 shadow-dark-card relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="bg-amber-500/20 w-fit p-3 rounded-2xl mb-6">
                                        <AlertCircle className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <h3 className="font-black text-xl mb-2 leading-tight text-amber-300">Penalties Detected</h3>
                                    <p className="text-amber-400/80 text-sm font-medium mb-8 leading-relaxed">
                                        There are {penalties.filter(p => p.status === 'UNPAID').length} unpaid penalties in the group. Please resolve these to maintain a high trust score.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('Reports')}
                                        className="w-full bg-amber-500 text-white py-4 rounded-2xl text-sm font-black hover:bg-amber-400 transition-all active:scale-95"
                                    >
                                        Review Penalties
                                    </button>
                                </div>
                                <AlertCircle className="absolute -bottom-10 -right-10 w-40 h-40 text-amber-500 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                            </div>
                        ) : (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-white rounded-[28px] p-8 shadow-dark-card relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="bg-emerald-500/20 w-fit p-3 rounded-2xl mb-6">
                                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h3 className="font-black text-xl mb-2 leading-tight text-emerald-300">All Clear</h3>
                                    <p className="text-emerald-400/80 text-sm font-medium mb-8 leading-relaxed">
                                        Your group is in good standing. No overdue payments or penalties detected this cycle.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('Reports')}
                                        className="w-full bg-emerald-500 text-white py-4 rounded-2xl text-sm font-black hover:bg-emerald-400 transition-all active:scale-95"
                                    >
                                        View Full Report
                                    </button>
                                </div>
                                <CheckCircle2 className="absolute -bottom-10 -right-10 w-40 h-40 text-emerald-500 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                            </div>
                        )}

                        {user?.agreedToRules ? (
                            <div className="glass-card border border-white/8 rounded-[28px] p-8 shadow-dark-card flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className="bg-emerald-500/15 w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-400">
                                        <FileCheck className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white">Signed Agreement</h4>
                                        <p className="text-xs text-slate-500 font-bold">
                                            {user?.agreementUrl ? "Physical copy uploaded & verified" : `Digital membership verified on ${new Date(user?.agreedAt).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {user?.agreementUrl && (
                                        <a
                                            href={user.agreementUrl.startsWith('http') ? user.agreementUrl : `${api.defaults.baseURL}/uploads/${user.agreementUrl.replace(/^uploads\//, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-3 bg-brand-500/10 text-brand-400 rounded-xl hover:bg-brand-500/20 transition-all"
                                        >
                                            <FileText className="w-5 h-5" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => generateAgreementPDF(user.name, stats.groupName || "BikaSafe Group", new Date(user.agreedAt).toLocaleDateString())}
                                        className="p-3 bg-white/5 text-slate-500 rounded-xl hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                                        title="Download Digital Copy"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <label className="p-3 bg-white/5 text-slate-500 rounded-xl hover:text-brand-400 hover:bg-brand-500/10 transition-all cursor-pointer" title="Upload Scanned Copy">
                                        <Upload className="w-5 h-5" />
                                        <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-brand-600 text-white rounded-[32px] p-8 shadow-2xl shadow-brand-500/20 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="bg-white/20 w-fit p-3 rounded-2xl mb-6">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-black text-xl mb-2 leading-tight">Membership Agreement</h3>
                                    <p className="text-brand-100 text-sm font-medium mb-8 leading-relaxed">
                                        Please review and sign the group rules. Alternatively, scan your physical agreement and upload it below.
                                    </p>
                                    <div className="space-y-4">
                                        <button
                                            onClick={handleSignAgreement}
                                            className="w-full bg-white text-brand-600 py-4 rounded-2xl text-sm font-black hover:bg-brand-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" /> Sign Digital Agreement
                                        </button>
                                        <label className="w-full bg-brand-500/30 border border-brand-400/30 text-white py-4 rounded-2xl text-sm font-black hover:bg-brand-500/50 transition-all cursor-pointer flex items-center justify-center gap-2">
                                            <Download className="w-4 h-4 rotate-180" />
                                            <span>Upload Scanned Copy</span>
                                            <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} />
                                        </label>
                                    </div>
                                </div>
                                <FileText className="absolute -bottom-10 -right-10 w-40 h-40 text-white opacity-10 group-hover:scale-110 transition-transform duration-700" />
                            </div>
                        )}

                        <div className="bg-brand-500/10 border border-brand-500/20 text-white rounded-[28px] p-8 shadow-dark-card animate-glow-pulse relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <p className="text-xs font-bold text-brand-400 uppercase tracking-widest">Available Treasury Funds</p>
                                    <ShieldCheck className="w-5 h-5 text-brand-400" />
                                </div>
                                <p className="text-4xl font-black mb-1 text-white">RWF {stats?.availableFunds?.toLocaleString() || '0'}</p>
                                <p className="text-xs text-brand-400/80 font-bold opacity-80 uppercase tracking-wider mb-8">
                                    Total Savings: RWF {stats?.totalSavings?.toLocaleString() || '0'}
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {(user?.role === 'ADMIN' || user?.role === 'TREASURER') && (
                                        <button
                                            onClick={() => setIsWithdrawalModalOpen(true)}
                                            className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border border-white/10"
                                        >
                                            <ArrowUpRight className="w-4 h-4" /> Withdraw
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsRecordModalOpen(true)}
                                        className="bg-brand-500 text-white py-4 rounded-2xl text-xs font-black hover:bg-brand-400 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Contribute
                                    </button>
                                </div>
                            </div>
                            <Wallet className="absolute -bottom-10 -right-10 w-40 h-40 text-brand-400 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        <div
                            onClick={() => {
                                if (user?.role === 'ADMIN') setIsGoalModalOpen(true);
                                else alert(`Current saving progress: ${Math.round((stats.totalSavings / (stats.savingsGoal || 5000000)) * 100)}% of the group target.`);
                            }}
                            className="glass-card border border-white/8 text-white rounded-[28px] p-8 relative overflow-hidden shadow-dark-card cursor-pointer hover:scale-[1.02] transition-all"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Savings Goal</p>
                                    <TrendingUp className="w-5 h-5 text-brand-400" />
                                </div>
                                <p className="text-3xl font-black mb-1 text-white">{Math.round((stats.totalSavings / (stats.savingsGoal || 5000000)) * 100)}%</p>
                                <p className="text-xs text-slate-500 font-bold mb-6">
                                    RWF {stats.totalSavings.toLocaleString()} / {(stats.savingsGoal || 5000000).toLocaleString()}
                                </p>
                                <div className="w-full bg-white/5 rounded-full h-3.5 mb-2 p-1">
                                    <div
                                        className="bg-gradient-to-r from-brand-500 to-emerald-400 h-full rounded-full shadow-lg shadow-brand-500/30"
                                        style={{ width: `${Math.min(100, (stats.totalSavings / (stats.savingsGoal || 5000000)) * 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-4">
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
                <div className="glass-card rounded-[28px] shadow-dark-card border border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-extrabold text-xl text-white">Group Members</h3>
                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={() => setIsAddMemberModalOpen(true)}
                                className="bg-brand-500 text-white px-8 py-4 rounded-2xl text-sm font-black hover:bg-brand-400 transition-all flex items-center gap-2 shadow-xl shadow-brand-500/20 active:scale-95"
                            >
                                <Plus className="w-5 h-5" /> Add Member
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/3">
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Member Name</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">National ID</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Agreement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members
                                    .filter(m =>
                                        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        m.phone.includes(searchTerm) ||
                                        (m.nationalId && m.nationalId.includes(searchTerm))
                                    )
                                    .map((m, i) => {
                                        const handleToggleActive = async () => {
                                            const action = m.isActive ? 'deactivate' : 'reactivate';
                                            if (!window.confirm(`Are you sure you want to ${action} ${m.name}?`)) return;
                                            try {
                                                await api.patch(`/api/groups/${action}-member/${m.id}`);
                                                fetchDashboardData();
                                            } catch (err: any) {
                                                alert(err.response?.data?.error || `Failed to ${action} member`);
                                            }
                                        };
                                        return (
                                        <tr key={i} className={cn(
                                            "border-t border-white/5 transition-colors",
                                            m.isActive ? "hover:bg-white/3" : "opacity-50 bg-red-500/5"
                                        )}>
                                            <td className="px-8 py-5 font-bold text-slate-200">
                                                <span>{m.name}</span>
                                                {!m.isActive && <span className="ml-2 text-[9px] font-black text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">Inactive</span>}
                                            </td>
                                            <td className="px-8 py-5 text-slate-500 font-medium">{m.phone}</td>
                                            <td className="px-8 py-5 text-slate-500 font-medium tracking-wider">{m.nationalId || '-'}</td>
                                            <td className="px-8 py-5">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                                    m.role === 'ADMIN' ? "bg-red-500/10 text-red-400" :
                                                        m.role === 'TREASURER' ? "bg-amber-500/10 text-amber-400" :
                                                            "bg-brand-500/10 text-brand-400"
                                                )}>
                                                    {m.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    {m.agreedToRules ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                                                            <FileCheck className="w-3 h-3" /> SIGNED
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-slate-500 bg-white/5 px-2 py-1 rounded-md">
                                                            PENDING
                                                        </span>
                                                    )}
                                                    {m.agreementUrl && (
                                                        <a
                                                            href={m.agreementUrl.startsWith('http') ? m.agreementUrl : `${api.defaults.baseURL}/uploads/${m.agreementUrl.replace(/^uploads\//, '')}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 bg-brand-500/10 text-brand-400 rounded-lg hover:bg-brand-500/20 transition-all"
                                                            title="View Document"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    {!m.agreementUrl && m.agreedToRules && (
                                                        <button
                                                            onClick={() => generateAgreementPDF(m.name, stats.groupName || "BikaSafe Group", new Date(m.agreedAt || Date.now()).toLocaleDateString())}
                                                            className="p-1.5 bg-white/5 text-slate-500 rounded-lg hover:text-brand-400 transition-all"
                                                            title="Generate Digital PDF"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            {user?.role === 'ADMIN' && m.role !== 'ADMIN' && (
                                                <td className="px-4 py-5">
                                                    <button
                                                        onClick={handleToggleActive}
                                                        title={m.isActive ? 'Deactivate' : 'Reactivate'}
                                                        className={cn("p-1.5 rounded-lg transition-all", m.isActive ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20")}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                        );
                                    })}
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

                    <div className="glass-card rounded-[28px] shadow-dark-card border border-white/5 overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-extrabold text-xl text-white">Loan History</h3>
                            <button
                                onClick={() => setIsLoanModalOpen(true)}
                                className="bg-white/10 text-white px-5 py-3 rounded-2xl text-xs font-black hover:bg-white/20 transition-all shadow-lg active:scale-95 flex items-center gap-2 border border-white/10"
                            >
                                <Plus className="w-4 h-4" />
                                New Request
                            </button>
                        </div>
                        <div className="p-4">
                            {processedLoans.length === 0 && myPendingLoans.length === 0 && pendingLoans.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="bg-white/5 w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto text-slate-600 mb-6">
                                        <TrendingUp className="w-10 h-10" />
                                    </div>
                                    <p className="text-slate-500 font-bold">No processed loans yet.</p>
                                    <p className="text-xs text-slate-600 mt-2 font-medium">Loans waiting for approval will appear above.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/3">
                                                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Borrower</th>
                                                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loans.map((l, i) => (
                                                <React.Fragment key={i}>
                                                <tr className="border-t border-white/5 hover:bg-white/3 transition-colors">
                                                    <td className="px-8 py-5 font-bold text-slate-200">
                                                        {l.user?.name}
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Ref: {l.refNo || `#${l.id.slice(0, 6)}`}</p>
                                                    </td>
                                                    <td className="px-8 py-5 font-black text-white">RWF {l.amount.toLocaleString()}</td>
                                                    <td className="px-8 py-5 text-slate-500 font-medium text-xs">{new Date(l.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-8 py-5">
                                                        <span className={cn(
                                                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                                            l.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-400" :
                                                                l.status === 'REJECTED' ? "bg-red-500/10 text-red-400" :
                                                                    l.status === 'APPROVED' ? "bg-amber-500/10 text-amber-400" :
                                                                        "bg-white/5 text-slate-500"
                                                        )}>
                                                            {l.status === 'APPROVED' ? 'DISBURSING' : l.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                                {l.status === 'ACTIVE' && (
                                                    <tr key={`amort-${i}`} className="bg-white/2 border-t border-white/5">
                                                        <td colSpan={4} className="px-8 py-4">
                                                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                                                                <p className="text-xs font-black text-brand-400 uppercase tracking-widest mb-2">Amortization Schedule</p>
                                                                <div className="grid grid-cols-4 gap-4 text-[10px] text-slate-400 font-bold mb-1">
                                                                    <span>Installment</span>
                                                                    <span>Principal</span>
                                                                    <span>Interest</span>
                                                                    <span>Payment</span>
                                                                </div>
                                                                {Array.from({length: 3}).map((_, idx) => {
                                                                    // Simplified amortization for demo
                                                                    const totalPay = l.amount * (1 + l.interestRate / 100);
                                                                    const payment = totalPay / 3;
                                                                    const date = new Date(l.createdAt);
                                                                    date.setMonth(date.getMonth() + idx + 1);
                                                                    return (
                                                                    <div key={idx} className="grid grid-cols-4 gap-4 text-xs font-medium text-slate-300 py-1 border-t border-slate-700/30">
                                                                        <span>{date.toLocaleDateString()}</span>
                                                                        <span>RWF {(l.amount/3).toFixed(0)}</span>
                                                                        <span>RWF {((l.amount * l.interestRate/100)/3).toFixed(0)}</span>
                                                                        <span className="text-white font-bold">RWF {payment.toFixed(0)}</span>
                                                                    </div>
                                                                )})}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                                </React.Fragment>
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
                <div className="glass-card rounded-[28px] shadow-dark-card border border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-extrabold text-xl text-white">All Contributions</h3>
                        <button onClick={() => setIsRecordModalOpen(true)} className="bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/20 transition-all border border-white/10">
                            Add Entry
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/3">
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Fund</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contributions.map((c, i) => (
                                    <tr key={i} className="border-t border-white/5 hover:bg-white/3 transition-colors">
                                        <td className="px-8 py-5 font-bold text-slate-200">{c.user?.name}</td>
                                        <td className="px-8 py-5 font-black text-white">RWF {c.amount.toLocaleString()}</td>
                                        <td className="px-8 py-5 font-bold text-slate-400 text-xs tracking-wider">{c.fundType === 'SOCIAL' ? '💖 SOCIAL' : '💰 SAVINGS'}</td>
                                        <td className="px-8 py-5 text-slate-500 font-medium">{new Date(c.timestamp).toLocaleDateString()}</td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                                c.status === 'PAID' ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
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
                            <button onClick={handleExportPDF} className="glass-card border border-white/8 text-slate-300 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                                <Printer className="w-4 h-4" /> PDF Report
                            </button>
                            <button onClick={handleDownloadExcel} className="glass-card border border-white/8 text-slate-300 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                                <Download className="w-4 h-4" /> Excel Export
                            </button>
                            <button onClick={handleEmailReport} className="glass-card border border-white/8 text-slate-300 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                                <Bell className="w-4 h-4" /> Email Report
                            </button>
                            {user?.agreedToRules && (
                                <button
                                    onClick={() => generateAgreementPDF(user.name, "BikaSafe Group", new Date(user.agreedAt).toLocaleDateString())}
                                    className="bg-brand-500/10 border border-brand-500/20 text-brand-400 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-brand-500/20 transition-all flex items-center gap-2"
                                >
                                    <FileCheck className="w-4 h-4" /> Membership Cert
                                </button>
                            )}
                        </div>
                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={triggerPenaltyCheck}
                                className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-amber-500/20 transition-all flex items-center gap-2"
                            >
                                <AlertCircle className="w-4 h-4" /> Trigger Penalty Check
                            </button>
                        )}
                    </div>

                    <div className="glass-card rounded-[32px] shadow-dark-card border border-white/5 overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-black tracking-tight text-white">Financial Ledger</h3>
                                <p className="text-sm text-slate-500 font-bold">Comprehensive transaction history</p>
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Filter by member..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-dark rounded-xl py-3 pl-11 pr-6 text-sm font-bold w-full md:w-64"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/3">
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                        <th className="px-4 py-5 font-black text-slate-500"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledger.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-20 text-center text-slate-500 font-bold">
                                                No transactions found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : ledger.map((item, idx) => (
                                        <tr key={idx} className="border-t border-white/5 hover:bg-white/3 transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className={cn(
                                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase",
                                                    item.type === 'CONTRIBUTION' ? "bg-emerald-500/10 text-emerald-400" :
                                                        item.type === 'LOAN' ? "bg-blue-500/10 text-blue-400" :
                                                            item.type === 'PAYOUT' ? "bg-purple-500/10 text-purple-400" :
                                                                "bg-amber-500/10 text-amber-400"
                                                )}>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full",
                                                        item.type === 'CONTRIBUTION' ? "bg-emerald-400" :
                                                            item.type === 'LOAN' ? "bg-blue-400" :
                                                                item.type === 'PAYOUT' ? "bg-purple-400" :
                                                                    "bg-amber-400"
                                                    )} />
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-300">{item.member}</td>
                                            <td className={cn(
                                                "px-8 py-6 text-sm font-black text-right tracking-tight",
                                                item.amount > 0 ? "text-emerald-400" : "text-slate-300"
                                            )}>
                                                {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()} RWF
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={cn(
                                                    "text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider",
                                                    item.status === 'PAID' || item.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-400" :
                                                        item.status === 'UNPAID' ? "bg-red-500/10 text-red-400" : "bg-white/5 text-slate-500"
                                                )}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-6 text-right">
                                                <button className="p-2 text-slate-700 hover:text-slate-400 transition-colors">
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
                <div className="glass-card rounded-[28px] shadow-dark-card border border-white/5 overflow-hidden animate-fade-in">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="font-extrabold text-xl text-white">Audit Logs</h3>
                            <p className="text-sm text-slate-500 font-medium">System activities and history</p>
                        </div>
                        <span className="bg-white/5 text-slate-400 px-3 py-1 rounded-lg text-[10px] font-black border border-white/5">{auditLogs.length} EVENTS</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/3">
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">User</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-500 font-bold">No activity logs found.</td>
                                    </tr>
                                ) : (
                                    auditLogs.map((log, i) => (
                                        <tr key={i} className="border-t border-white/5 hover:bg-white/3 transition-colors">
                                            <td className="px-8 py-5">
                                                <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-wider border border-white/8">
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-slate-200">{log.user?.name || 'System'}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">{log.user?.role || ''}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500 font-medium bg-white/3 p-2 rounded-lg border border-white/5">
                                                    {log.details}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-[11px] text-slate-500 font-bold">
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

        if (activeTab === 'Announcements') {
            const typeConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
                MEETING: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <Calendar className="w-4 h-4" /> },
                URGENT:  { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: <AlertCircle className="w-4 h-4" /> },
                REMINDER:{ color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  icon: <Bell className="w-4 h-4" /> },
                GENERAL: { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: <Megaphone className="w-4 h-4" /> },
            };

            const handleDelete = async (id: string) => {
                if (!confirm('Delete this announcement?')) return;
                try {
                    await api.delete(`/api/announcements/${id}`);
                    setAnnouncements(prev => prev.filter(a => a.id !== id));
                } catch (err: any) {
                    alert(err.response?.data?.error || 'Failed to delete');
                }
            };

            return (
                <div className="space-y-8 animate-fade-in">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Group Announcements</h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">{announcements.length} active {announcements.length === 1 ? 'announcement' : 'announcements'}</p>
                        </div>
                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={() => setIsAnnouncementModalOpen(true)}
                                className="bg-brand-500 text-white px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-brand-500/20 hover:bg-brand-400 transition-all active:scale-95"
                            >
                                <Plus className="w-5 h-5" /> New Announcement
                            </button>
                        )}
                    </div>

                    {/* Feed */}
                    {announcements.length === 0 ? (
                        <div className="glass-card border border-white/5 rounded-[28px] py-24 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-[24px] flex items-center justify-center mb-6">
                                <Megaphone className="w-10 h-10 text-slate-600" />
                            </div>
                            <p className="text-slate-400 font-bold text-lg">No announcements yet</p>
                            <p className="text-slate-600 text-sm mt-2">{user?.role === 'ADMIN' ? 'Click "New Announcement" to post the first one.' : 'Your admin will post announcements here.'}</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {announcements.map((a) => {
                                const cfg = typeConfig[a.type] || typeConfig.GENERAL;
                                return (
                                    <div key={a.id} className="glass-card border border-white/5 rounded-[28px] p-8 shadow-dark-card relative group hover:border-white/10 transition-all">
                                        {/* Type badge + title row */}
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest border', cfg.bg, cfg.color, cfg.border)}>
                                                    {cfg.icon} {a.type}
                                                </span>
                                                <h3 className="text-lg font-black text-white">{a.title}</h3>
                                            </div>
                                            {user?.role === 'ADMIN' && (
                                                <button
                                                    onClick={() => handleDelete(a.id)}
                                                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Body */}
                                        <p className="text-slate-300 text-sm font-medium leading-relaxed mb-5">{a.body}</p>

                                        {/* Footer: event date + author + time */}
                                        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/5">
                                            {a.eventDate && (
                                                <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{new Date(a.eventDate).toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                </div>
                                            )}
                                            <div className="ml-auto flex items-center gap-3">
                                                <div className="w-7 h-7 bg-brand-500/20 text-brand-400 rounded-lg flex items-center justify-center text-xs font-black border border-brand-500/20">
                                                    {a.author?.name?.[0] || 'A'}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-slate-400">{a.author?.name || 'Admin'}</p>
                                                    <p className="text-[10px] text-slate-600 font-bold">{new Date(a.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        if (activeTab === 'Meetings') {
            return (
                <div className="glass-card rounded-[28px] shadow-dark-card border border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-extrabold text-xl text-white">Group Meetings</h3>
                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={() => setIsMeetingModalOpen(true)}
                                className="bg-brand-500 text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-brand-400 transition-all flex items-center gap-2 shadow-xl shadow-brand-500/20 active:scale-95"
                            >
                                <Plus className="w-5 h-5" /> Log Meeting
                            </button>
                        )}
                    </div>
                    <div className="p-8">
                        {meetings.length === 0 ? (
                            <div className="text-center text-slate-500 font-medium py-10">No meetings recorded yet.</div>
                        ) : (
                            <div className="space-y-4">
                                {meetings.map(m => (
                                    <div key={m.id} className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-lg text-white mb-1">{m.title}</h4>
                                            <p className="text-xs text-brand-400 font-black tracking-widest">{new Date(m.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                           <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-xl text-xs font-black">
                                               {m.attendances.filter((a: any) => a.status === 'PRESENT').length} Present
                                           </span>
                                           <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-xl text-xs font-black">
                                               {m.attendances.filter((a: any) => a.status === 'ABSENT').length} Absent
                                           </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (activeTab === 'Governance') {
            return (
                <div className="glass-card rounded-[28px] shadow-dark-card border border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-extrabold text-xl text-white">Democratic Polling</h3>
                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={() => setIsPollModalOpen(true)}
                                className="bg-brand-500 text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-brand-400 transition-all flex items-center gap-2 shadow-xl"
                            >
                                <Plus className="w-5 h-5" /> Create Poll
                            </button>
                        )}
                    </div>
                    <div className="p-8">
                        {polls.length === 0 ? (
                            <div className="text-center text-slate-500 font-medium py-10">No active polls.</div>
                        ) : (
                            <div className="space-y-4">
                                {polls.map(p => {
                                    const totalVotes = p.voices?.length || 0;
                                    const yesVotes = p.voices?.filter((v: any) => v.choice === 'YES').length || 0;
                                    const yesPercent = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
                                    const hasVoted = p.voices?.some((v: any) => v.userId === user?.id);

                                    return (
                                    <div key={p.id} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-lg text-white">{p.title}</h4>
                                                <p className="text-sm text-slate-400 mt-1">{p.description}</p>
                                            </div>
                                            <span className={cn("px-3 py-1 rounded-full text-[10px] font-black tracking-widest", p.status === 'OPEN' ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400")}>{p.status}</span>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                                <span>{yesPercent.toFixed(0)}% Approval</span>
                                                <span>{totalVotes} Votes Total</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-500" style={{ width: `${yesPercent}%` }} />
                                            </div>
                                        </div>

                                        {p.status === 'OPEN' && !hasVoted && (
                                            <div className="flex gap-4 mt-4">
                                                <button onClick={async () => {
                                                    await api.post(`/api/polls/${p.id}/vote`, { choice: 'YES' });
                                                    fetchDashboardData();
                                                }} className="flex-1 bg-emerald-500/20 text-emerald-400 py-3 rounded-xl font-black hover:bg-emerald-500/30 transition-all">Vote YES</button>
                                                <button onClick={async () => {
                                                    await api.post(`/api/polls/${p.id}/vote`, { choice: 'NO' });
                                                    fetchDashboardData();
                                                }} className="flex-1 bg-red-500/20 text-red-400 py-3 rounded-xl font-black hover:bg-red-500/30 transition-all">Vote NO</button>
                                            </div>
                                        )}
                                        {hasVoted && <p className="text-center text-xs font-bold text-brand-400 mt-4">You have voted on this poll.</p>}
                                    </div>
                                )})}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (activeTab === 'Penalties') {
            const handleWaive = async (id: string) => {
                if (!confirm('Are you sure you want to completely waive this fine?')) return;
                try {
                    await api.post(`/api/penalties/${id}/waive`);
                    fetchDashboardData();
                } catch (err: any) {
                    alert(err.response?.data?.error || 'Failed to waive penalty');
                }
            };

            return (
                <div className="glass-card rounded-[28px] shadow-dark-card border border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-extrabold text-xl text-white">Group Penalties & Fines</h3>
                    </div>
                    <div className="p-8">
                        {penalties.length === 0 ? (
                            <div className="text-center text-slate-500 font-medium py-10">No penalties recorded.</div>
                        ) : (
                            <div className="space-y-4">
                                {penalties.map(p => (
                                    <div key={p.id} className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-lg text-white mb-1">{p.user?.name}</h4>
                                            <p className="text-xs text-slate-400 font-medium mb-1">{p.reason}</p>
                                            <p className="text-xs font-black tracking-widest text-brand-400">RWF {p.amount.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={cn("px-3 py-1 rounded-xl text-[10px] font-black uppercase",
                                                p.status === 'UNPAID' ? "bg-red-500/20 text-red-400" :
                                                    p.status === 'PAID' ? "bg-emerald-500/20 text-emerald-400" :
                                                        "bg-slate-500/20 text-slate-400"
                                            )}>{p.status}</span>

                                            {(user?.role === 'ADMIN' || user?.role === 'TREASURER') && p.status === 'UNPAID' && (
                                                <button
                                                    onClick={() => handleWaive(p.id)}
                                                    className="bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-xl shadow-brand-500/20 hover:bg-brand-400 transition-all active:scale-95"
                                                >
                                                    Waive Fine
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (activeTab === 'Share-Out') {
            const totalGroupFunds = stats.totalSavings + (penalties.reduce((sum, p) => sum + p.amount, 0));
            // simplified ratio per member
            const memberShares = members.map(m => {
                const memberTotal = contributions.filter(c => c.userId === m.id && c.status === 'PAID').reduce((sum, c) => sum + c.amount, 0);
                const percentage = totalGroupFunds > 0 ? (memberTotal / totalGroupFunds) : 0;
                return { ...m, memberTotal, percentage };
            }).sort((a,b) => b.percentage - a.percentage);

            return (
                <div className="glass-card rounded-[28px] shadow-dark-card border border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="font-extrabold text-xl text-white">End-of-Cycle Share-Out Calculator</h3>
                            <p className="text-xs text-brand-400 font-bold uppercase tracking-widest mt-1">Total Divisible Pool: RWF {totalGroupFunds.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/3">
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Member Name</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Contributed</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Share %</th>
                                    <th className="px-8 py-4 text-[11px] font-black text-brand-400 uppercase tracking-widest">Dividend Payout</th>
                                </tr>
                            </thead>
                            <tbody>
                                {memberShares.map((m, i) => (
                                    <tr key={i} className="border-t border-white/5 hover:bg-white/3 transition-colors">
                                        <td className="px-8 py-5 font-bold text-slate-200">{m.name}</td>
                                        <td className="px-8 py-5 text-slate-500 font-medium">RWF {m.memberTotal.toLocaleString()}</td>
                                        <td className="px-8 py-5 text-slate-500 font-medium tracking-wider">{(m.percentage * 100).toFixed(2)}%</td>
                                        <td className="px-8 py-5 font-black text-brand-400">RWF {(totalGroupFunds * m.percentage).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#020817] text-slate-100 font-sans relative overflow-x-hidden">
            {/* Ambient background orbs */}
            <div className="glow-orb w-[600px] h-[600px] bg-brand-500/5 top-[-200px] left-[-200px]" />
            <div className="glow-orb w-[500px] h-[500px] bg-blue-500/5 bottom-[-200px] right-[-100px]" />
            {/* Sidebar (Desktop) */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-[#0a0f1e]/95 border-r border-white/5 hidden lg:flex flex-col z-20 backdrop-blur-xl">
                <div className="p-8 border-b border-white/5">
                    <Logo size="md" theme="dark" />
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-6">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setActiveTab(item.label)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200",
                                activeTab === item.label
                                    ? "bg-brand-500/10 text-brand-400 nav-active-glow border border-brand-500/20"
                                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 flex flex-col gap-1">
                    <button
                        onClick={() => setIsChangePasswordModalOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all"
                    >
                        <Lock className="w-5 h-5 text-slate-500" />
                        Security
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen relative z-10">
                {/* Top Header */}
                <header className="bg-[#0a0f1e]/80 backdrop-blur-xl sticky top-0 border-b border-white/5 z-10 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative max-w-md w-full hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search contributions, members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-dark w-full rounded-2xl py-2.5 pl-11 pr-4 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsNotificationsOpen(true)}
                            className="p-2.5 bg-white/5 text-slate-400 rounded-xl relative hover:text-brand-400 transition-all hover:bg-white/10 border border-white/5"
                        >
                            <Bell className="w-5 h-5" />
                            {auditLogs.length > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full border-2 border-[#0a0f1e] animate-pulse" />
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('Reports')}
                            className="hidden md:flex p-2.5 bg-brand-500/10 text-brand-400 rounded-xl items-center gap-2 hover:bg-brand-500/20 transition-all border border-brand-500/20"
                        >
                            <Download className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-wider">Quick Export</span>
                        </button>
                        <div className="h-8 w-[1px] bg-white/8 mx-2" />
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setIsProfileOpen(true)}
                            title="View my profile"
                        >
                            <div className="bg-brand-500/20 text-brand-400 w-10 h-10 rounded-xl flex items-center justify-center font-bold border border-brand-500/20">
                                {user?.name?.[0] || 'U'}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-bold leading-tight text-slate-200">{user?.name || 'User'}</p>
                                <p className="text-[10px] text-brand-400 font-black uppercase tracking-widest">{stats.groupName || 'BikaSafe Group'}</p>
                                <p className="text-[11px] text-slate-500 font-bold uppercase">{user?.role || 'Member'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Pinned announcement banner for URGENT/MEETING */}
                {!dismissedBanner && announcements.filter(a => a.type === 'URGENT' || a.type === 'MEETING').length > 0 && (() => {
                    const banner = announcements.find(a => a.type === 'URGENT') || announcements.find(a => a.type === 'MEETING');
                    if (!banner) return null;
                    const isUrgent = banner.type === 'URGENT';
                    return (
                        <div className={cn(
                            'flex items-start gap-4 px-6 py-4 border-b',
                            isUrgent ? 'bg-red-500/10 border-red-500/15' : 'bg-emerald-500/8 border-emerald-500/15'
                        )}>
                            <div className={cn('p-2 rounded-xl flex-shrink-0 mt-0.5', isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400')}>
                                {isUrgent ? <AlertCircle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn('text-sm font-black', isUrgent ? 'text-red-300' : 'text-emerald-300')}>{banner.title}</p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{banner.body}</p>
                                {banner.eventDate && (
                                    <p className={cn('text-[10px] font-bold mt-1', isUrgent ? 'text-red-400' : 'text-emerald-400')}>
                                        📅 {new Date(banner.eventDate).toLocaleDateString('en-RW', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setDismissedBanner(true)}
                                className="p-1.5 text-slate-500 hover:text-slate-300 flex-shrink-0 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })()}

                <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in">
                    {/* Welcome & Global Actions */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <span className="text-brand-400 font-bold text-sm tracking-wider uppercase">Your Dashboard</span>
                            <h1 className="text-4xl font-black tracking-tight mt-1 text-white">Group Summary</h1>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {user?.role === 'ADMIN' && (
                                <button
                                    onClick={() => setIsAddMemberModalOpen(true)}
                                    className="bg-white/5 border border-white/10 text-slate-300 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/10 hover:text-white transition-all text-sm active:scale-95"
                                >
                                    <Users className="w-4 h-4" />
                                    Add Member
                                </button>
                            )}
                            <button className="bg-white/5 border border-white/10 text-slate-300 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/10 hover:text-white transition-all text-sm active:scale-95">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button
                                onClick={() => setIsRecordModalOpen(true)}
                                className="bg-brand-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-brand-500/20 hover:bg-brand-400 transition-all text-sm active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                Record Entry
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {[
                            { label: 'Total Savings', value: `RWF ${stats.totalSavings.toLocaleString()}`, change: '+12%', up: true, icon: Wallet, iconBg: 'bg-brand-500/15 text-brand-400' },
                            { label: 'Social Fund', value: `RWF ${stats.totalSocial.toLocaleString()}`, change: 'Emergency', up: true, icon: Heart, iconBg: 'bg-rose-500/15 text-rose-400' },
                            { label: 'Active Loans', value: `RWF ${stats.activeLoanAmount.toLocaleString()}`, change: `${stats.activeLoans} Active`, up: stats.activeLoans > 0, icon: TrendingUp, iconBg: 'bg-blue-500/15 text-blue-400' },
                            { label: 'Members', value: `${stats.memberCount} Players`, change: '+2', up: true, icon: Users, iconBg: 'bg-indigo-500/15 text-indigo-400' },
                            { label: 'Trust Score', value: `${trustScore}%`, change: trustScore >= 80 ? 'Excellent' : trustScore >= 50 ? 'Good' : 'Needs Work', up: trustScore >= 50, icon: ShieldCheck, iconBg: 'bg-emerald-500/15 text-emerald-400' },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card p-7 rounded-[28px] shadow-dark-card hover:shadow-dark-card-hover transition-all duration-300 group cursor-default">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={cn("p-3.5 rounded-2xl transition-transform group-hover:scale-110", stat.iconBg)}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div className={cn("flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full", stat.up ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                                        {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                                        {stat.change}
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-slate-500 mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-black tracking-tight text-white">{stat.value}</h3>
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
                    members={members}
                    user={user}
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
                    onClose={() => {
                        // Only allow closing if not forced
                        if (!user?.mustChangePassword && localStorage.getItem('mustChangePassword') !== 'true') {
                            setIsChangePasswordModalOpen(false);
                        }
                    }}
                    onSuccess={() => {
                        setIsChangePasswordModalOpen(false);
                        // Clear the forced password change flag
                        localStorage.removeItem('mustChangePassword');
                        const updatedUser = { ...user, mustChangePassword: false };
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        alert("Password updated successfully! Please use your new password next time you sign in.");
                    }}
                />
            )}

            <NotificationCenter 
                isOpen={isNotificationsOpen} 
                onClose={() => setIsNotificationsOpen(false)} 
                logs={auditLogs} 
            />

            {/* Announcement Modal */}
            {isAnnouncementModalOpen && (
                <AnnouncementModal
                    onClose={() => setIsAnnouncementModalOpen(false)}
                    onSuccess={(newAnnouncement) => {
                        setAnnouncements(prev => [newAnnouncement, ...prev]);
                        setIsAnnouncementModalOpen(false);
                        setDismissedBanner(false);
                    }}
                />
            )}

            {/* Meeting Modal */}
            {isMeetingModalOpen && (
                <MeetingModal
                    members={members}
                    onClose={() => setIsMeetingModalOpen(false)}
                    onSuccess={() => {
                        setIsMeetingModalOpen(false);
                        fetchDashboardData();
                    }}
                />
            )}

            {/* Poll Modal */}
            {isPollModalOpen && (
                <PollModal
                    onClose={() => setIsPollModalOpen(false)}
                    onSuccess={() => {
                        setIsPollModalOpen(false);
                        fetchDashboardData();
                    }}
                />
            )}

            {/* Profile Drawer */}
            <ProfileDrawer
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                currentUser={user}
                onProfileUpdated={(updatedUser) => setUser(updatedUser)}
            />
        </div>

    );
};

export default Dashboard;