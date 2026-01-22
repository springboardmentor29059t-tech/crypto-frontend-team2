import React from 'react';
import { Link } from 'react-router-dom';
import InteractiveHeroImage from './InteractiveHeroImage';

const EntryLandingHero: React.FC = () => {
    return (
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                {/* Left Content */}
                <div className="text-left space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-bold mb-4 hover:border-yellow-500/30 transition-all cursor-default animate-fade-in">
                        <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                        LIVE PROTOCOL V4.0
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
                        Track & Secure Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">Cryptocurrency Portfolio</span>
                    </h1>

                    <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl">
                        Advanced analytics and secure portfolio management for growing your crypto investments. Monitor global markets and audit your assets in real-time.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button
                            onClick={() => document.getElementById('access-hub')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                        >
                            Sign In
                        </button>
                        <Link
                            to="/register"
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>

                {/* Right Image */}
                <div className="relative">
                    <InteractiveHeroImage />
                </div>
            </div>
        </section>
    );
};

export default EntryLandingHero;
