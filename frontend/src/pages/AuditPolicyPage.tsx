import React from 'react';
import { ArrowLeft, FileCheck, Shield, Scale, Activity, ClipboardCheck, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const AuditPolicyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-500/30">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            to="/"
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
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 text-emerald-600">Audit & Transparency Policy</h1>
                    <p className="text-lg text-slate-500">How we ensure 100% accountability in community finance.</p>
                </div>

                <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100 text-slate-600 space-y-12">

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <FileCheck className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">1. Immutable Ledger Logs</h2>
                        </div>
                        <p className="leading-relaxed">
                            Every financial event on BikaSafe—including contributions, loan requests, and approval signatures—is logged with an immutable timestamp and user identifier. This digital paper trail cannot be edited or deleted by any user, including Group Administrators, ensuring that the history of your "Ikimina" remains untampered.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <History className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">2. Real-Time Member Verification</h2>
                        </div>
                                                                            <p className="leading-relaxed">
                            BikaSafe operates on a "Trust but Verify" model. While Treasurers record data, every member has real-time access to their own contribution statement. We encourage monthly self-audits where members compare their physical receipts/official payment records with the BikaSafe dashboard.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                <ClipboardCheck className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">3. Multi-Official Approval</h2>
                        </div>
                        <p className="leading-relaxed">
                            To prevent administrative fraud, any outflow of "data-funds" (payout approval) must be dual-signed by two authorized officials. Our system audits these signatures to ensure they came from distinct devices and accounts, preventing a single person from controlling the entire group's digital records.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">4. Discrepancy Reporting</h2>
                        </div>
                        <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
                            <p className="text-orange-800 font-medium leading-relaxed">
                                If an error is identified in the ledger, the Administrator must record a "Correction Entry" rather than editing the original record. This "Double-Entry" style auditing ensures that mistakes and their subsequent fixes are both visible to the group members and NGO partners.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="mt-12 p-8 bg-slate-900 rounded-[32px] text-center">
                    <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Designed for Audit-Readiness</h3>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        BikaSafe data is structured to be compatible with international NGO reporting standards and local VSLA regulatory requirements.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default AuditPolicyPage;
