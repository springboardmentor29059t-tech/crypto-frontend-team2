import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Map, Target, ShieldCheck, Zap, ArrowRight, Activity, FileText, Eye, Bell } from 'lucide-react';

const LearningHub: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Section 1: Welcome / Hero Section */}
            <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
                <div className="relative z-10 space-y-6 md:w-1/2 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-full border border-indigo-500/20 text-xs font-black uppercase tracking-widest">
                        <BookOpen size={14} /> Knowledge Protocol
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">
                        Welcome to <br /> <span className="text-indigo-500">Crypto Tracker</span>
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Your complete solution for investment tracking, risk analysis, and scam prevention.
                        Designed for investors who demand clarity and security in their portfolio management.
                    </p>
                </div>
                <div className="md:w-1/2">
                    <img
                        src="/assets/learning_hub.png"
                        alt="Learning Hub"
                        className="w-full max-w-md mx-auto drop-shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                    />
                </div>
            </div>

            {/* Section 2: Key Features Overview */}
            <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 pl-4 border-l-4 border-indigo-500">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Feature 1: Dashboard */}
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] space-y-4 hover:border-indigo-500/50 transition-all group">
                        <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                            <Map size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Dashboard</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            A dual-view interface showing Global Market Trends alongside your Personal Portfolio Node.
                        </p>
                    </div>

                    {/* Feature 2: Portfolio */}
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] space-y-4 hover:border-yellow-500/50 transition-all group">
                        <div className="w-12 h-12 bg-yellow-600/10 rounded-2xl flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                            <Target size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Portfolio Management</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Track P&L across assets, manage holdings, and calculate weightage for better decision making.
                        </p>
                    </div>

                    {/* Feature: Taxation */}
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] space-y-4 hover:border-green-500/50 transition-all group">
                        <div className="w-12 h-12 bg-green-600/10 rounded-2xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Taxation & P&L</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Automated tax reporting with FIFO calculations for Short-Term and Long-Term capital gains.
                        </p>
                    </div>

                    {/* Feature 3: Scam Scanner */}
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] space-y-4 hover:border-red-500/50 transition-all group">
                        <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Scam Scanner</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Verify token contract legitimacy against the CryptoScamDB registry to avoid rugpulls.
                        </p>
                    </div>

                    {/* Feature 4: Risk Analysis */}
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] space-y-4 hover:border-orange-500/50 transition-all group">
                        <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                            <Activity size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Risk Analysis</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Evaluate market volatility and personal portfolio diversification risks with real-time scoring.
                        </p>
                    </div>

                    {/* Feature 5: Exports */}
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] space-y-4 hover:border-teal-500/50 transition-all group">
                        <div className="w-12 h-12 bg-teal-600/10 rounded-2xl flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">CSV / PDF Export</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Generate comprehensive reports for auditing, strategy review, and external record keeping.
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 3 & 4: How It Helps & CTA */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-500/20">
                <div className="space-y-4 md:max-w-xl">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">How This Helps You</h2>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-white/80 font-medium">
                            <Zap size={18} className="text-yellow-400 shrink-0 mt-1" />
                            <span>Better Investment Tracking: Real-time P&L and asset performance.</span>
                        </li>
                        <li className="flex items-start gap-3 text-white/80 font-medium">
                            <Zap size={18} className="text-yellow-400 shrink-0 mt-1" />
                            <span>Risk Awareness: Understand exposure before it becomes a loss.</span>
                        </li>
                        <li className="flex items-start gap-3 text-white/80 font-medium">
                            <Zap size={18} className="text-yellow-400 shrink-0 mt-1" />
                            <span>Scam Prevention: Verify assets before capitalizing.</span>
                        </li>
                        <li className="flex items-start gap-3 text-white/80 font-medium">
                            <Zap size={18} className="text-yellow-400 shrink-0 mt-1" />
                            <span>Smarter Decision-Making: Data-driven insights for growth.</span>
                        </li>
                    </ul>
                </div>
                <button
                    onClick={() => navigate('/learning-hub/explore')}
                    className="bg-white text-indigo-600 font-black px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-slate-100 transition-all active:scale-95 text-xs uppercase tracking-widest whitespace-nowrap"
                >
                    Start Exploration <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default LearningHub;
