import React from 'react';
import { BookOpen, ShieldCheck, PieChart, Activity, TrendingUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Guidelines: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-12">
            <Link to="/learning-hub" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={16} /> Back to Learning Hub
            </Link>

            {/* Header */}
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                    Platform <span className="text-indigo-500">Guidelines</span>
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl">
                    Welcome to the Sovereign Terminal. This guide outlines the operational protocols for maximizing your portfolio tracking efficiency and security.
                </p>
            </div>

            {/* Overview Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-12">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
                    <Activity className="text-yellow-500" /> System Overview
                </h2>
                <div className="space-y-6 text-slate-400 leading-relaxed">
                    <p>
                        The Crypto Portfolio Tracker is an advanced analytics engine designed for real-time wealth monitoring.
                        It integrates live market data with your personal asset ledger to provide a consolidated view of your financial standing across USD and INR currencies.
                    </p>
                    <p>
                        Our architecture emphasizes privacy and direct execution. No third-party custodians hold your keys here; we simply track and analyze the data you provide via manual entry or CSV imports.
                    </p>
                </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 mb-6">
                        <PieChart size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">1. Portfolio Entry</h3>
                    <ul className="space-y-3 text-slate-400 text-sm">
                        <li className="flex gap-2">
                            <span className="text-white font-bold">Manual:</span>
                            Navigate to the Portfolio page, select "Personal Node", and click "New Asset" to add individual holdings.
                        </li>
                        <li className="flex gap-2">
                            <span className="text-white font-bold">Bulk Import:</span>
                            Use the CSV Upload module to import standard exchange exports for Holdings and Trade History.
                        </li>
                    </ul>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 mb-6">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">2. Security & Risk</h3>
                    <ul className="space-y-3 text-slate-400 text-sm">
                        <li className="flex gap-2">
                            <span className="text-white font-bold">Scam Scanner:</span>
                            Before investing in a new token, run it through our Scam Scanner to check against known fraud databases.
                        </li>
                        <li className="flex gap-2">
                            <span className="text-white font-bold">Risk Analysis:</span>
                            Monitor the "Risk Analysis" tab to see your volatility exposure and diversification score.
                        </li>
                    </ul>
                </div>
            </div>

            {/* Best Practices */}
            <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-[2.5rem] p-8 md:p-12">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <TrendingUp className="text-indigo-400" /> Best Practices
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <div className="text-white font-bold text-lg">Regular Audits</div>
                        <p className="text-slate-400 text-sm">Export your portfolio to PDF weekly to maintain a snapshot history of your wealth progression.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="text-white font-bold text-lg">Accurate Basis</div>
                        <p className="text-slate-400 text-sm">Ensure your "Average Buy Price" is accurate. This is critical for P&L calculations.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="text-white font-bold text-lg">Stay Updated</div>
                        <p className="text-slate-400 text-sm">Refresh market data frequently during high volatility periods to get the latest valuations.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Guidelines;
