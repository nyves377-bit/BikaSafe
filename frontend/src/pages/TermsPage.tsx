import React from 'react';
import { ArrowLeft, ShieldCheck, Scale, FileText, Users, Lock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const TermsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-500/30">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            to="/login"
                            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Logo theme="light" size="sm" />
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-16">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Terms of Service</h1>
                    <p className="text-lg text-slate-500">Last Updated: October 2023</p>
                </div>

                <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100 text-slate-600 space-y-12">

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                                <Scale className="w-5 h-5 text-brand-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">1. Acceptance of Terms</h2>
                        </div>
                        <p className="leading-relaxed">
                            By accessing and using BikaSafe ("the Platform"), you accept and agree to be bound by the terms and provisions of this agreement. The Platform is designed to facilitate the management of informal savings groups (Ikimina). If you do not agree to these terms, you must not use the Platform.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">2. User Roles and Responsibilities</h2>
                        </div>
                        <p className="leading-relaxed mb-4">
                            The Platform operates on a strict Role-Based Access Control (RBAC) system:
                        </p>
                        <ul className="space-y-4 ml-4">
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                                <span><strong className="text-slate-900">Admins & Treasurers:</strong> Are solely responsible for accuracy when recording contributions and initiating manual payouts outside the platform. BikaSafe does not hold funds.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                                <span><strong className="text-slate-900">Members:</strong> Are responsible for verifying their contributions on their dashboard and reporting discrepancies to their Group Administrator.</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">3. Dual-Signature Protocol</h2>
                        </div>
                        <p className="leading-relaxed">
                            All loan payouts and treasury withdrawals require cryptographic approval from two distinct authorized officials within your group. By using the platform, you acknowledge that BikaSafe is not liable for funds disbursed maliciously if both authorized credentials (passwords/OTPs) are compromised by members of your own group.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">4. Financial Disclaimer</h2>
                        </div>
                        <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
                            <p className="text-orange-800 font-medium leading-relaxed">
                                BikaSafe acts strictly as a <strong>Digital Ledger and Accounting Tool</strong>. We are not a bank, financial institution, or mobile money operator. We do not hold, transfer, or manage real currency directly. All physical transfers of funds (via Cash, Mobile Money, or Bank Transfer) occur entirely outside of the Platform's infrastructure.
                            </p>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">5. Account Security</h2>
                        </div>
                        <p className="leading-relaxed">
                            You are responsible for maintaining the confidentiality of your password and One-Time Passwords (OTPs). You agree not to disclose your credentials to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-slate-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">6. Modifications to Terms</h2>
                        </div>
                        <p className="leading-relaxed">
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. We will notify group administrators of any significant changes.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default TermsPage;
