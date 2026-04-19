import React from 'react';
import { Shield, Users, Target, Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const MissionPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-500 selection:text-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/">
                        <Logo className="scale-90" theme="light" />
                    </Link>
                    <Link to="/" className="text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </nav>

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-none mb-12 animate-fade-in">
                        Our Mission: <span className="bg-gradient-to-r from-brand-600 to-emerald-600 bg-clip-text text-transparent italic">Digitizing Community Trust</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed mb-20">
                        BikaSafe was founded on the belief that community savings (Ikimina/VSLA) shouldn't be limited by paper ledgers or lack of transparency. We build the digital infrastructure to empower the next billion savers.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-premium hover:border-brand-500/20 hover:shadow-2xl hover:shadow-brand-500/5 transition-all group">
                            <div className="bg-brand-50 w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-500">
                                <Shield className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">Radical Transparency</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                We eliminate the "black box" of paper bookkeeping. Every contribution and loan is recorded, encrypted, and accessible to every member in real-time.
                            </p>
                        </div>

                        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-premium hover:border-brand-500/20 hover:shadow-2xl hover:shadow-brand-500/5 transition-all group">
                            <div className="bg-emerald-50 w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500">
                                <Users className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">Financial Inclusion</h3>
                                                        <p className="text-slate-500 font-medium leading-relaxed">
                                We bridge the gap between traditional community finance and modern digital tools, ensuring every member has absolute clarity and control over their collective savings.
                            </p>
                        </div>

                        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-premium hover:border-brand-500/20 hover:shadow-2xl hover:shadow-brand-500/5 transition-all group">
                            <div className="bg-amber-50 w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-500">
                                <Target className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">Institutional Grade Security</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Community savings deserve institutional-grade protection. We bring multi-sig treasury approvals and audit-ready reporting to local saving groups.
                            </p>
                        </div>

                        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-premium hover:border-brand-500/20 hover:shadow-2xl hover:shadow-brand-500/5 transition-all group">
                            <div className="bg-red-50 w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 group-hover:bg-red-500 group-hover:text-white transition-colors duration-500">
                                <Heart className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">Community Focused</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                BikaSafe was built for the people, by the people. We are committed to supporting the social fabrics of community-led finance across Rwanda and beyond.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                        "Enabling prosperity through digitized community trust."
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MissionPage;
