import React from 'react';
import { ArrowLeft, ShieldCheck, Database, EyeOff, FileKey, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const PrivacyPage: React.FC = () => {
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
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Privacy Policy</h1>
                    <p className="text-lg text-slate-500">Last Updated: October 2023</p>
                </div>

                <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100 text-slate-600 space-y-12">

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                                <Database className="w-5 h-5 text-brand-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">1. Information We Collect</h2>
                        </div>
                        <p className="leading-relaxed mb-4">
                            To provide our digital ledger and group management services, we must collect the following information:
                        </p>
                        <ul className="space-y-4 ml-4">
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                                <span><strong className="text-slate-900">Personal Identifiers:</strong> Name, Phone Number, and National ID numbers (used strictly for unique member identification to prevent fraud).</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                                <span><strong className="text-slate-900">Financial Data:</strong> Records of your contributions, outstanding loan balances, and assigned penalties within your specific Ikimina group.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                                <span><strong className="text-slate-900">Group Association:</strong> The IDs and Names of the savings groups you belong to.</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <FileKey className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">2. How We Use Your Information</h2>
                        </div>
                        <p className="leading-relaxed">
                            The information collected is used exclusively to facilitate the operations of your savings group. This includes generating financial statements, tracking loan approvals, calculating member trust scores, and maintaining immutable audit logs for your Group Administrators to review.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">3. Data Security & Encryption</h2>
                        </div>
                        <p className="leading-relaxed">
                            Security is our highest priority. All account passwords are encrypted using Bcrypt hashing algorithms before being stored in our relational database. Authentication is handled via secure JSON Web Tokens (JWT). We employ industry-standard security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal and financial data.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                <Share2 className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">4. Data Sharing and Disclosure</h2>
                        </div>
                        <p className="leading-relaxed">
                            BikaSafe <strong>does not</strong> sell, trade, or rent your personal identification information to others. Your financial records are visible only to the authorized members and administrators of your specific group. We do not share data with third-party marketing agencies.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                <EyeOff className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">5. Your Rights</h2>
                        </div>
                        <p className="leading-relaxed">
                            You have the right to access the personal information we hold about you. Members may view their complete contribution and loan history via their dashboard at any time. If you wish to have your data completely removed from the platform, you must first clear any active loans and have your Group Administrator process your departure.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPage;
