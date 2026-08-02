import React, { useEffect, useRef, useState } from 'react';
import { Shield, Users, ArrowRight, Lock, FileCheck, TrendingUp, ShieldCheck, CheckCircle2, ChevronRight, Phone, Mail, Zap, BarChart3, Fingerprint, Globe, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

// ─── Animated Counter ────────────────────────────────────────
const AnimatedCounter: React.FC<{ target: number; suffix?: string; prefix?: string; duration?: number }> = ({ target, suffix = '', prefix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasAnimated.current) {
                hasAnimated.current = true;
                let start = 0;
                const step = target / (duration / 16);
                const timer = setInterval(() => {
                    start += step;
                    if (start >= target) { setCount(target); clearInterval(timer); }
                    else setCount(Math.floor(start));
                }, 16);
            }
        }, { threshold: 0.3 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// ─── Scroll Reveal Hook ──────────────────────────────────────
const useReveal = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setVisible(true);
        }, { threshold: 0.1 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return { ref, visible };
};

const RevealSection: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
    const { ref, visible } = useReveal();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(40px)',
                transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
            }}
        >
            {children}
        </div>
    );
};

// ─── Particle Canvas ─────────────────────────────────────────
const ParticleCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const particles: { x: number; y: number; vx: number; vy: number; r: number; opacity: number }[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.4 + 0.1,
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
                ctx.fill();
            });

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - dist / 150)})`;
                        ctx.stroke();
                    }
                }
            }
            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

// ─── Main Landing Page ───────────────────────────────────────
// ─── FAQ Section ─────────────────────────────────────────────
const FAQ_ITEMS = [
    {
        q: 'Is BikaSafe free to use?',
        a: 'BikaSafe offers a free Starter plan for groups of up to 10 members. For larger groups or advanced features like automated email reports and unlimited loan management, a Pro plan is available at a low monthly fee.'
    },
    {
        q: 'Do members need to create individual accounts?',
        a: 'The group admin registers the group and then adds each member from the dashboard. Members receive a temporary password via their phone number and can log in immediately — no complicated sign-up required.'
    },
    {
        q: 'Is our financial data secure?',
        a: 'Yes. All data is encrypted in transit (HTTPS/TLS) and at rest. Authentication uses signed JWT tokens with expiry, and all sensitive actions are recorded in an audit log accessible only to the admin.'
    },
    {
        q: 'Can we access BikaSafe on mobile phones?',
        a: 'Absolutely. BikaSafe is fully responsive and works on any smartphone browser. There is no app to download — simply open the link and log in. The interface is optimised for small screens with a dedicated mobile navigation bar.'
    },
    {
        q: 'What happens if a member misses a contribution?',
        a: 'The system automatically flags overdue contributions and can apply a late penalty fee after a configurable grace period. Admins can waive penalties individually if needed. All penalty history is visible in the Penalties tab.'
    },
];

const FAQSection: React.FC = () => {
    const [openIdx, setOpenIdx] = useState<number | null>(null);
    return (
        <section className="py-24 px-6">
            <div className="max-w-3xl mx-auto">
                <RevealSection>
                    <div className="text-center mb-14">
                        <p className="text-xs font-black text-brand-400 uppercase tracking-[0.2em] mb-4">FAQ</p>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Frequently asked questions</h2>
                        <p className="text-slate-400 font-medium">Everything you need to know about BikaSafe.</p>
                    </div>
                </RevealSection>
                <div className="space-y-3">
                    {FAQ_ITEMS.map((faq, i) => (
                        <RevealSection key={i} delay={i * 0.05}>
                            <div className="bg-white/[0.03] border border-white/[0.07] rounded-[20px] overflow-hidden">
                                <button
                                    onClick={() => setOpenIdx(openIdx === i ? null : i)}
                                    className="w-full flex items-center justify-between px-7 py-5 text-left gap-4"
                                >
                                    <span className="font-bold text-white text-sm leading-snug">{faq.q}</span>
                                    <span className={`text-slate-500 transition-transform duration-200 shrink-0 ${openIdx === i ? 'rotate-45' : ''}`}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                    </span>
                                </button>
                                {openIdx === i && (
                                    <div className="px-7 pb-6 text-slate-400 text-sm font-medium leading-relaxed border-t border-white/[0.05] pt-4">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        </RevealSection>
                    ))}
                </div>
            </div>
        </section>
    );
};

const LandingPage: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { title: "Multi-Signature Treasury", desc: "Two-official verification for every disbursement. Zero funds leave without dual approval — bank-grade security for community thrift.", icon: Shield, color: "from-violet-500 to-purple-600", glow: "violet" },
        { title: "Digital Bylaws & Agreements", desc: "Members digitally sign group rules. Legally binding, timestamped, and permanently stored in your group's audit ledger.", icon: Lock, color: "from-blue-500 to-cyan-500", glow: "blue" },
        { title: "Complete Audit Trail", desc: "Every action tracked — contributions, approvals, logins. Full transparency for members, treasurers, and external auditors.", icon: ShieldCheck, color: "from-emerald-500 to-green-500", glow: "emerald" },
        { title: "Smart Loan Lifecycle", desc: "Apply, approve, disburse, and repay — all tracked with automated interest calculations and deadline enforcement.", icon: TrendingUp, color: "from-amber-500 to-orange-500", glow: "amber" },
        { title: "Role-Based Access", desc: "Admins, Treasurers, Members, Auditors — each role has precisely the permissions they need. No more, no less.", icon: Users, color: "from-pink-500 to-rose-500", glow: "pink" },
        { title: "Instant PDF & Excel Reports", desc: "Auto-generate audit-ready financial statements. Professional reports for NGOs, regulators, and community meetings.", icon: FileCheck, color: "from-teal-500 to-cyan-600", glow: "teal" },
    ];

    const stats = [
        { value: 256, suffix: "-bit", label: "AES Encryption" },
        { value: 2, suffix: "x", label: "Signature Required" },
        { value: 100, suffix: "%", label: "Audit Transparency" },
        { value: 24, suffix: "/7", label: "Access Anywhere" },
    ];

    const steps = [
        { num: "01", title: "Register Your Group", desc: "Create your digital Ikimina in 60 seconds. Add your group name, registration ID, and become the founding admin." },
        { num: "02", title: "Onboard Members", desc: "Invite members with their phone numbers. Each gets a unique, secure temporary password and defined role." },
        { num: "03", title: "Start Saving", desc: "Record contributions, enforce group rules automatically, and watch your collective savings grow in real-time." },
        { num: "04", title: "Grow Together", desc: "Process loans, manage payouts with dual approval, and export professional reports for full accountability." },
    ];

    return (
        <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">

            {/* ───── Navigation ───── */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#030712]/90 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/20' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Logo size="sm" />
                    <div className="hidden md:flex items-center gap-10">
                        <a href="#features" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors relative group">
                            Features
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300" />
                        </a>
                        <a href="#how" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors relative group">
                            How It Works
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300" />
                        </a>
                        <a href="#pricing" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors relative group">
                            Pricing
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300" />
                        </a>
                        <Link to="/mission" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors relative group">
                            Mission
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300" />
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors px-5 py-2.5">
                            Sign In
                        </Link>
                        <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                            Get Started
                        </Link>
                    </div>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2">
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-[#030712]/98 backdrop-blur-2xl border-t border-white/5 animate-in slide-in-from-top duration-200">
                        <div className="px-6 py-6 flex flex-col gap-4">
                            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-slate-300 py-3 border-b border-white/5">Features</a>
                            <a href="#how" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-slate-300 py-3 border-b border-white/5">How It Works</a>
                            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-slate-300 py-3 border-b border-white/5">Pricing</a>
                            <Link to="/login" className="text-base font-semibold text-slate-300 py-3 border-b border-white/5">Sign In</Link>
                            <Link to="/register" className="bg-indigo-600 text-white py-4 rounded-2xl text-center font-bold mt-2">Get Started</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* ───── Hero Section ───── */}
            <header className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <ParticleCanvas />
                {/* Radial glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-500/8 rounded-full blur-[180px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030712] to-transparent z-10 pointer-events-none" />

                <div className="relative z-20 max-w-5xl mx-auto px-6 text-center pt-20">
                    {/* Badge */}
                    <RevealSection>
                        <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full mb-8 backdrop-blur-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500" />
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-300">Digitizing Trust for Community Savings</span>
                        </div>
                    </RevealSection>

                    {/* Headline */}
                    <RevealSection delay={0.1}>
                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-8">
                            <span className="text-white">The Operating</span>
                            <br />
                            <span className="text-white">System for </span>
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent italic">
                                Community Thrift.
                            </span>
                        </h1>
                    </RevealSection>

                    {/* Subheadline */}
                    <RevealSection delay={0.2}>
                        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 font-medium leading-relaxed mb-12">
                            BikaSafe brings institutional-grade security, real-time analytics, and digital transparency to your Village Savings and Loan Association.
                        </p>
                    </RevealSection>

                    {/* CTAs */}
                    <RevealSection delay={0.3}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register" className="w-full sm:w-auto group bg-indigo-600 text-white px-10 py-5 rounded-2xl text-lg font-black hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/25 flex items-center justify-center gap-3 active:scale-95 hover:shadow-indigo-500/40">
                                Get Started Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/login" className="w-full sm:w-auto bg-white/5 text-white border border-white/10 px-10 py-5 rounded-2xl text-lg font-black hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95 backdrop-blur-sm">
                                Sign In
                            </Link>
                        </div>
                    </RevealSection>

                    {/* Hero Stats Strip */}
                    <RevealSection delay={0.5}>
                        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-white/5 rounded-3xl overflow-hidden border border-white/5">
                            {stats.map((s, i) => (
                                <div key={i} className="bg-[#030712]/90 backdrop-blur-sm p-6 md:p-8 text-center">
                                    <div className="text-3xl md:text-4xl font-black text-white mb-1 tabular-nums">
                                        <AnimatedCounter target={s.value} suffix={s.suffix} />
                                    </div>
                                    <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </RevealSection>
                </div>
            </header>

            {/* ───── Features Section ───── */}
            <section id="features" className="relative py-32 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[200px] pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <RevealSection>
                        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 mb-6">
                                    <div className="w-5 h-0.5 bg-indigo-500" />
                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-[0.15em]">Platform Capabilities</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">Built for the next billion savers.</h2>
                                <p className="text-lg text-slate-400 font-medium leading-relaxed">
                                    BikaSafe eliminates the opacity of paper-based ledgers by providing a secure, digital bridge for community finance.
                                </p>
                            </div>
                        </div>
                    </RevealSection>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <RevealSection key={i} delay={i * 0.08}>
                                <div className="group relative bg-white/[0.02] backdrop-blur-sm p-8 rounded-3xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 cursor-default overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-2">
                                    {/* Top gradient line */}
                                    <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                                        <f.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-3 group-hover:text-indigo-200 transition-colors">{f.title}</h3>
                                    <p className="text-slate-400 font-medium leading-relaxed text-sm">{f.desc}</p>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───── How It Works ───── */}
            <section id="how" className="relative py-32 px-6 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent">
                <div className="max-w-4xl mx-auto">
                    <RevealSection>
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center gap-2 mb-6">
                                <div className="w-5 h-0.5 bg-indigo-500" />
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-[0.15em]">The Journey</span>
                                <div className="w-5 h-0.5 bg-indigo-500" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">How BikaSafe Works</h2>
                            <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto">From group creation to transparent financial reporting — in four simple steps.</p>
                        </div>
                    </RevealSection>

                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-pink-500/50 hidden md:block" />

                        <div className="space-y-6">
                            {steps.map((step, i) => (
                                <RevealSection key={i} delay={i * 0.12}>
                                    <div className="group flex gap-8 items-start p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all duration-500 hover:translate-x-2">
                                        <div className="hidden md:flex shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center text-2xl font-black text-white shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                                            {step.num}
                                        </div>
                                        <div>
                                            <span className="md:hidden text-xs font-black text-indigo-400 tracking-[0.15em] uppercase mb-2 block">Step {step.num}</span>
                                            <h4 className="text-xl font-black text-white mb-2 group-hover:text-indigo-200 transition-colors">{step.title}</h4>
                                            <p className="text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                </RevealSection>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ───── Security Trust Banner ───── */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealSection>
                        <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 p-12 md:p-20">
                            {/* Abstract pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                            </div>
                            <div className="relative z-10 grid md:grid-cols-3 gap-10 text-center">
                                <div>
                                    <Fingerprint className="w-10 h-10 mx-auto mb-4 text-white/90" />
                                    <h3 className="text-xl font-black text-white mb-2">End-to-End Encrypted</h3>
                                    <p className="text-sm text-white/70 font-medium">All data encrypted at rest and in transit. Your financial records are mathematically secure.</p>
                                </div>
                                <div>
                                    <BarChart3 className="w-10 h-10 mx-auto mb-4 text-white/90" />
                                    <h3 className="text-xl font-black text-white mb-2">Real-Time Analytics</h3>
                                    <p className="text-sm text-white/70 font-medium">Track savings growth, loan performance, and member compliance with live dashboards.</p>
                                </div>
                                <div>
                                    <Globe className="w-10 h-10 mx-auto mb-4 text-white/90" />
                                    <h3 className="text-xl font-black text-white mb-2">Access Anywhere</h3>
                                    <p className="text-sm text-white/70 font-medium">Cloud-based platform accessible from any device. Desktop, tablet, or mobile phone.</p>
                                </div>
                            </div>
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ───── Pricing Section ───── */}
            <section id="pricing" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <RevealSection>
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center gap-2 mb-6">
                                <div className="w-5 h-0.5 bg-indigo-500" />
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-[0.15em]">Pricing</span>
                                <div className="w-5 h-0.5 bg-indigo-500" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Sustainable Pricing for Stable Growth</h2>
                            <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">Transparent models designed to scale with your community, from local groups to nation-wide NGOs.</p>
                        </div>
                    </RevealSection>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {/* Free Tier */}
                        <RevealSection delay={0}>
                            <div className="bg-white/[0.02] backdrop-blur-sm p-10 rounded-[32px] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500">
                                <div className="mb-8">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-4">Community Core</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-white">Free</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-10">
                                    {['Up to 25 members', 'Core Digital Ledger', 'Basic Multi-Sig', 'Standard Reporting'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/register" className="block w-full py-4 text-center border border-white/10 text-white rounded-2xl font-bold hover:bg-white/5 transition-all active:scale-95">
                                    Start Free
                                </Link>
                            </div>
                        </RevealSection>

                        {/* Elite Tier */}
                        <RevealSection delay={0.1}>
                            <div className="relative bg-gradient-to-b from-indigo-500/10 to-purple-500/5 backdrop-blur-sm p-10 rounded-[32px] border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 md:scale-105 z-10">
                                <div className="absolute top-6 right-6 bg-indigo-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    Popular
                                </div>
                                <div className="mb-8">
                                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.15em] mb-4">Elite Group</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-white">RWF 50k</span>
                                        <span className="text-slate-500 text-sm font-bold">/year</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Or RWF 5,000 per month</p>
                                </div>
                                <ul className="space-y-4 mb-10">
                                    {['Unlimited members', 'Advanced Analytics', 'Priority Support', 'Performance Alerts', 'Dedicated Onboarding'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-200 font-medium text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/register" className="block w-full py-4 text-center bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                                    Go Elite
                                </Link>
                            </div>
                        </RevealSection>

                        {/* Enterprise Tier */}
                        <RevealSection delay={0.2}>
                            <div className="bg-white/[0.02] backdrop-blur-sm p-10 rounded-[32px] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500">
                                <div className="mb-8">
                                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.15em] mb-4">Enterprise</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-white">Custom</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    {['NGO Partner Portal', 'White-label instances', 'Full API access', 'Impact Manager', 'Custom Audit Reports'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                                        <Phone className="w-4 h-4 text-emerald-400" />
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Phone</p>
                                            <p className="text-sm font-bold text-white">+250 787 510 908</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                                        <Mail className="w-4 h-4 text-emerald-400" />
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Email</p>
                                            <p className="text-sm font-bold text-white">nyves377@gmail.com</p>
                                        </div>
                                    </div>
                                </div>
                                <a href="tel:+250787510908" className="block w-full py-4 text-center bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 active:scale-95">
                                    Contact Us
                                </a>
                            </div>
                        </RevealSection>
                    </div>
                </div>
            </section>

            {/* ───── Testimonials ───── */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <RevealSection>
                        <div className="text-center mb-16">
                            <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">What Groups Say</p>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                                Trusted by Ikimina leaders
                            </h2>
                            <p className="text-slate-400 font-medium max-w-xl mx-auto">
                                Real groups, real results. Hear from the treasurers and admins who manage their community savings with BikaSafe.
                            </p>
                        </div>
                    </RevealSection>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                name: 'Uwimana Clarisse',
                                role: 'Group Treasurer · Kigali',
                                avatar: 'UC',
                                color: 'from-indigo-500 to-purple-500',
                                stars: 5,
                                quote: 'Before BikaSafe, we tracked everything in notebooks. Now I can see every contribution, penalty, and loan in seconds. The PDF reports alone save me hours every month.',
                            },
                            {
                                name: 'Nshimiyimana Jean',
                                role: 'Group Admin · Huye',
                                avatar: 'NJ',
                                color: 'from-emerald-500 to-teal-500',
                                stars: 5,
                                quote: 'The loan management feature changed everything. Members apply digitally, I approve with one click, and the amortization schedule is automatically calculated. No more disputes.',
                            },
                            {
                                name: 'Mukamana Aline',
                                role: 'Member · Musanze',
                                avatar: 'MA',
                                color: 'from-rose-500 to-pink-500',
                                stars: 5,
                                quote: 'I can check my contribution history and trust score from my phone anytime. It makes me feel accountable and proud of my record. The group has never been more transparent.',
                            },
                        ].map((t, i) => (
                            <RevealSection key={i} delay={i * 0.1}>
                                <div className="bg-white/[0.03] border border-white/[0.07] rounded-[28px] p-8 hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-500 flex flex-col h-full">
                                    {/* Stars */}
                                    <div className="flex gap-1 mb-5">
                                        {Array.from({ length: t.stars }).map((_, s) => (
                                            <span key={s} className="text-amber-400 text-sm">★</span>
                                        ))}
                                    </div>
                                    {/* Quote */}
                                    <p className="text-slate-300 font-medium text-sm leading-relaxed flex-1 mb-6">
                                        "{t.quote}"
                                    </p>
                                    {/* Author */}
                                    <div className="flex items-center gap-4 pt-5 border-t border-white/[0.06]">
                                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black text-xs shrink-0`}>
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm">{t.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───── FAQ ───── */}
            <FAQSection />

            {/* ───── Final CTA ───── */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto">
                    <RevealSection>
                        <div className="relative text-center py-24 px-8 rounded-[48px] overflow-hidden">
                            {/* Background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-[#0f0f2e] to-purple-950/80 rounded-[48px] border border-white/[0.08]" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

                            <div className="relative z-10">
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to secure your<br />group's future?</h2>
                                <p className="text-slate-400 text-lg font-medium mb-12 max-w-lg mx-auto">Join the communities already trusting BikaSafe to digitize their legacy thrift.</p>
                                <Link to="/register" className="inline-flex items-center gap-3 bg-indigo-600 text-white px-12 py-5 rounded-2xl text-lg font-black hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 hover:shadow-indigo-500/40 group">
                                    Create Free Group
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ───── Footer ───── */}
            <footer className="border-t border-white/[0.06] pt-20 pb-10 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2 md:col-span-1">
                            <Logo size="sm" className="mb-6" />
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                BikaSafe is a community-first fintech platform focusing on transparent and inclusive financial growth.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-black text-white mb-6 uppercase tracking-[0.15em] text-xs">Product</h4>
                            <ul className="space-y-3 text-sm font-medium text-slate-500">
                                <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
                                <li><a href="#how" className="hover:text-indigo-400 transition-colors">How It Works</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-white mb-6 uppercase tracking-[0.15em] text-xs">Company</h4>
                            <ul className="space-y-3 text-sm font-medium text-slate-500">
                                <li><Link to="/mission" className="hover:text-indigo-400 transition-colors">Mission</Link></li>
                                <li><a href="mailto:hello@bikasafe.rw" className="hover:text-indigo-400 transition-colors">Contact Us</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-white mb-6 uppercase tracking-[0.15em] text-xs">Legal</h4>
                            <ul className="space-y-3 text-sm font-medium text-slate-500">
                                <li><Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms</Link></li>
                                <li><Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy</Link></li>
                                <li><Link to="/audit-policy" className="hover:text-indigo-400 transition-colors">Audit Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/[0.06] pt-10">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.12em]">© 2026 BikaSafe. Empowering communities together.</p>
                        <div className="flex gap-8">
                            <a href="https://twitter.com/bikasafe" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-indigo-400 transition-all font-black text-xs uppercase tracking-[0.12em]">Twitter</a>
                            <a href="https://linkedin.com/company/bikasafe" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-indigo-400 transition-all font-black text-xs uppercase tracking-[0.12em]">LinkedIn</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
