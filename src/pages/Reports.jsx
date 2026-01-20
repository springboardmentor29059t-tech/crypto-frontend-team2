import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  FileText, Download, TrendingUp, History,
  ShieldCheck, Activity, Calculator, ArrowUpRight,
  RefreshCcw, BadgeAlert, Receipt
} from 'lucide-react';

const Reports = () => {
  const { setIsSyncing } = useOutletContext();

  const [stats, setStats] = useState({
    totalAssets: 0,
    totalCost: 0,
    tradeCount: 0,
    realizedProfit: 0,
    topAsset: 'None'
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [isPrivate, setIsPrivate] = useState(localStorage.getItem('privacy_mode') === 'true');

  const fetchReportData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsSyncing(true);
    setIsRefreshing(true);

    try {
      const [portfolioRes, pnlRes] = await Promise.all([
        api.get('/portfolio'),
        api.get('/portfolio/pnl-summary').catch(() => ({ data: { realizedProfit: 0, totalTrades: 0 } }))
      ]);

      const holdings = portfolioRes.data.holdings || [];
      const pnlData = pnlRes.data;

      const cost = holdings.reduce((sum, h) => sum + (parseFloat(h.quantity) * parseFloat(h.avgCost)), 0);
      const sorted = [...holdings].sort((a, b) => (b.quantity * b.avgCost) - (a.quantity * a.avgCost));

      setStats({
        totalAssets: holdings.length,
        totalCost: cost,
        tradeCount: pnlData.totalTrades || 0,
        realizedProfit: pnlData.realizedProfit || 0,
        topAsset: sorted.length > 0 ? sorted[0].assetSymbol : 'None'
      });
    } catch (err) {
      console.error("Report Sync Failed:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setTimeout(() => setIsSyncing(false), 800);
    }
  }, [setIsSyncing]);

  useEffect(() => {
    fetchReportData();
    const handlePrivacyChange = () => setIsPrivate(localStorage.getItem('privacy_mode') === 'true');
    window.addEventListener('privacyChange', handlePrivacyChange);
    return () => window.removeEventListener('privacyChange', handlePrivacyChange);
  }, [fetchReportData]);

  const formatINR = (val) => {
    if (isPrivate) return "••••••";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleExport = async () => {
    try {
      setIsSyncing(true);
      const response = await api.get('/portfolio/history/export-csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sentinel_Audit_${user?.name || 'User'}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Export Node Offline. Check connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
      <RefreshCcw className="animate-spin text-blue-500" size={48} strokeWidth={1} />
      <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] animate-pulse">Generating Fiscal Report...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-24 font-sans animate-in fade-in duration-700 relative">

      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-lg shadow-lg">
                <Receipt size={18} className="text-emerald-500" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Strategy Audit</h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                    Fiscal Analysis • Tax Ledger
                </p>
            </div>
        </div>
        <button
            onClick={() => fetchReportData()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/10 rounded-lg hover:bg-slate-800 transition-all group"
        >
             <RefreshCcw size={14} className={`text-slate-400 group-hover:text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-white">Sync P&L</span>
        </button>
      </div>

      {/* --- ANALYTICS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
            title="Net Investment"
            value={formatINR(stats.totalCost)}
            subValue="Cost Basis"
            icon={<TrendingUp size={16}/>}
            color="text-blue-500"
            bg="bg-blue-500/10"
            border="border-blue-500/20"
        />
        <StatTile
            title="Realized P&L"
            value={formatINR(stats.realizedProfit)}
            subValue="Cash Profit"
            icon={<ArrowUpRight size={16}/>}
            color={stats.realizedProfit >= 0 ? "text-emerald-500" : "text-rose-500"}
            bg={stats.realizedProfit >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10"}
            border={stats.realizedProfit >= 0 ? "border-emerald-500/20" : "border-rose-500/20"}
        />
        <StatTile
            title="Audit Entries"
            value={stats.tradeCount}
            subValue="Transactions"
            icon={<History size={16}/>}
            color="text-purple-500"
            bg="bg-purple-500/10"
            border="border-purple-500/20"
        />
        <StatTile
            title="Alpha Asset"
            value={stats.topAsset}
            subValue="Top Exposure"
            icon={<Activity size={16}/>}
            color="text-amber-500"
            bg="bg-amber-500/10"
            border="border-amber-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: SUMMARY CARD */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Calculator size={16} className="text-blue-500" /> Accounting Terminal
                </h3>
                <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Tax-Ready v4
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                 <SummaryItem label="Methodology" value="FIFO (Weighted)" />
                 <SummaryItem label="Compliance" value="Node Verified" highlight />
                 <SummaryItem label="Fiscal Year" value="2025-2026" />
            </div>
          </div>

          <div className="relative z-10 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex gap-4 items-start">
             <div className="mt-0.5 p-1 bg-blue-500/10 rounded-md text-blue-400"><BadgeAlert size={14} /></div>
             <div>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Tax Intelligence Hint</p>
                {/* ✅ FIXED: Replaced '>' with '&gt;' to fix the JSX syntax error */}
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Assets held &gt; 12 months qualify for Long-Term Capital Gains (LTCG). Use the exported CSV for filing.
                </p>
             </div>
          </div>
        </div>

        {/* RIGHT: EXPORT CARD */}
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 flex flex-col justify-between relative overflow-hidden group min-h-[320px]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <div className="bg-emerald-500/10 border border-emerald-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
                <Download className="text-emerald-500" size={24} />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight italic">EXPORT <span className="text-emerald-500">VAULT</span></h3>
            <p className="text-slate-400 text-[11px] leading-relaxed mb-8 font-medium">
              Generate a forensic trade ledger compatible with tax software and accounting standards.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
              <button
                onClick={handleExport}
                className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                <FileText size={16} /> Download CSV
              </button>
              <p className="text-[8px] text-slate-600 text-center font-bold uppercase tracking-[0.2em]">Digitally Signed by Sentinel Node</p>
          </div>

          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
        </div>

      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StatTile = ({ title, value, subValue, icon, color, bg, border }) => (
  <div className={`glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-opacity-50 transition-all flex flex-col justify-between h-32`}>
    <div className="flex justify-between items-start z-10">
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{title}</span>
      <div className={`p-2 rounded-lg ${bg} ${color} ${border} border`}>
        {icon}
      </div>
    </div>
    <div className="z-10">
        <div className={`text-xl font-bold text-white truncate tracking-tight mb-0.5 ${color.replace('text-', 'text-opacity-90 ')}`}>{value}</div>
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">{subValue}</p>
    </div>
  </div>
);

const SummaryItem = ({ label, value, highlight }) => (
    <div className="p-4 rounded-xl bg-[#0B0E14]/50 border border-white/5 flex flex-col gap-1">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        <div className={`text-xs font-bold uppercase ${highlight ? 'text-emerald-400 flex items-center gap-1' : 'text-white'}`}>
            {highlight && <ShieldCheck size={12}/>}
            {value}
        </div>
    </div>
);

export default Reports;