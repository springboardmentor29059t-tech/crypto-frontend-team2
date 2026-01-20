import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { ShieldCheck, ShieldAlert, Shield, RefreshCcw, Fingerprint } from 'lucide-react';

const SafetyGauge = () => {
  const [data, setData] = useState({
    score: 0,
    label: 'INITIALIZING',
    scannedAssets: 0,
    rating: 'NEUTRAL'
  });
  const [loading, setLoading] = useState(true);

  const fetchSafety = useCallback(async () => {
    try {
      setLoading(true);
      // ✅ Handshake with /portfolio/safety-summary
      const res = await api.get(`/portfolio/safety-summary?t=${Date.now()}`);

      const safetyNode = res.data;

      setData({
        score: safetyNode.score || 0,
        label: safetyNode.rating || 'NEUTRAL', // Using 'rating' as the label for consistency
        scannedAssets: safetyNode.scannedAssets || 0,
        rating: safetyNode.rating || 'NEUTRAL'
      });
    } catch (err) {
      console.error("🛡️ Safety Node: Handshake Refused.", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSafety();

    // Sync safety score whenever a refresh pulse is triggered globally
    const handleRefresh = () => fetchSafety();
    window.addEventListener('refreshPortfolio', handleRefresh);
    window.addEventListener('watchlistUpdate', handleRefresh); // Sync on watchlist changes too

    return () => {
      window.removeEventListener('refreshPortfolio', handleRefresh);
      window.removeEventListener('watchlistUpdate', handleRefresh);
    };
  }, [fetchSafety]);

  const getStatusColor = (rating) => {
    const text = rating?.toUpperCase();
    if (['HEALTHY', 'SECURE', 'EXCELLENT'].includes(text)) return 'text-emerald-500';
    if (['VULNERABLE', 'CAUTION', 'WARNING'].includes(text)) return 'text-amber-500';
    if (['CRITICAL', 'DANGER', 'RISKY'].includes(text)) return 'text-rose-500';
    return 'text-slate-500';
  };

  // ✅ SVG Circle Math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[320px] transition-all duration-500 hover:border-slate-700/50">

      {/* 📡 SYNC STATUS */}
      <div className="absolute top-6 right-6 z-30">
        {loading ? (
          <RefreshCcw size={14} className="text-blue-500 animate-spin" />
        ) : (
          <Fingerprint size={16} className="text-slate-700 animate-pulse" />
        )}
      </div>

      <Shield className="absolute -bottom-6 -right-6 text-slate-800/10" size={140} />

      <div className="w-full flex justify-between items-start mb-6 z-10">
        <div className="flex flex-col">
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            Security Pulse
          </h3>
          <span className="text-slate-700 text-[8px] font-bold uppercase tracking-widest mt-1">
            Build: Ledger_7.0
          </span>
        </div>
      </div>

      <div className="relative mb-8 group cursor-help">
        {/* Glow Layer */}
        <div className={`absolute inset-0 rounded-full blur-2xl opacity-10 transition-all duration-1000 ${getStatusColor(data.rating).replace('text-', 'bg-')}`} />

        <svg className="w-40 h-40 transform -rotate-90 relative z-10">
          {/* Track */}
          <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800/50" />
          {/* Progress Gauge */}
          <circle
            cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * data.score) / 100}
            strokeLinecap="round"
            className={`transition-all duration-[2000ms] ease-in-out ${getStatusColor(data.rating)}`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">{data.score}%</span>
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Integrity</span>
        </div>
      </div>

      <div className="w-full text-center z-10 space-y-4">
        <div className="bg-slate-950/50 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
            <p className={`text-xs font-black tracking-[0.3em] uppercase ${getStatusColor(data.rating)}`}>
              {data.label}
            </p>
            <div className="h-[1px] w-6 bg-slate-800 mx-auto my-2" />
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
              {data.scannedAssets} Logic Audits Completed
            </p>
        </div>

        {data.score < 60 && data.scannedAssets > 0 && !loading && (
          <div className="flex items-center justify-center gap-2 bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl animate-in fade-in slide-in-from-bottom-2">
            <ShieldAlert size={14} className="text-rose-500" />
            <span className="text-[9px] text-rose-500 font-black uppercase tracking-tight">Vulnerable to Market Drift</span>
          </div>
        )}

        {data.score >= 90 && !loading && (
          <div className="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-tight">Optimal Logic Distribution</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyGauge;