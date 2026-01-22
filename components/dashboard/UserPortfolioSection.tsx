import React, { useEffect, useState, useCallback } from 'react';
import {
    AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import {
    Wallet, ShieldCheck, PieChart as PieIcon, RefreshCw, Layers, Zap, BarChart3, ArrowRight, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import { mockApi, fetchLivePrices, fetchHistory, getPortfolioSummary } from '../../services/api';
import { analyzeTokenRisk } from '../../services/geminiService';
import { Holding, RiskAlert, PriceHistory } from '../../types';
import { formatShortValue } from '../../services/formatters';

import { usePersonalNode } from '../../PersonalNodeContext';

export const UserPortfolioSection: React.FC = () => {
    const { assets, totalValue, loading: contextLoading, refreshAssets } = usePersonalNode();
    const [holdings, setHoldings] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<RiskAlert[]>([]);
    const [triggeredAlerts, setTriggeredAlerts] = useState<any[]>([]);
    const [history, setHistory] = useState<PriceHistory[]>([]);
    // Use context loading state
    const loading = contextLoading;

    // Derive INR value
    const totalValueUSD = totalValue;
    const totalValueINR = totalValue * 83; // Approximate rate

    useEffect(() => {
        // Map context assets to component structure
        const formatted = assets.map(asset => ({
            id: asset.id,
            coinId: asset.symbol.toLowerCase(),
            symbol: asset.symbol,
            name: asset.name,
            amount: asset.amount,
            avgBuyPrice: asset.avgBuyPrice,
            priceUSD: asset.avgBuyPrice ? (asset.currentValue / asset.amount) : 0, // Approx
            priceINR: (asset.avgBuyPrice ? (asset.currentValue / asset.amount) : 0) * 83,
            valUSD: asset.currentValue,
            valINR: asset.currentValue * 83,
            pnlPercentage: asset.pnlPercentage,
            image: `https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`,
            exchange: asset.source
        })).sort((a: any, b: any) => b.valUSD - a.valUSD);

        setHoldings(formatted);

        // Fetch history/risk for first asset if available
        const fetchExtras = async () => {
            if (formatted.length > 0) {
                const first = formatted[0];
                let coinIdForHistory = 'bitcoin';
                if (first.symbol.toLowerCase() === 'eth') coinIdForHistory = 'ethereum';
                if (first.symbol.toLowerCase() === 'sol') coinIdForHistory = 'solana';

                try {
                    const histData = await fetchHistory(coinIdForHistory, 7);
                    setHistory(histData);

                    const risks = await analyzeTokenRisk(first.name, first.symbol);
                    setAlerts(risks.slice(0, 3));
                } catch (e) {
                    console.error("Extra data load error", e);
                }
            }
        };
        fetchExtras();

    }, [assets]);

    // refresh handler
    const handleRefresh = async () => {
        await refreshAssets();
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-1 uppercase italic flex items-center gap-3">
                        <ShieldCheck className="text-yellow-500" size={28} />
                        Sovereign Terminal
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Network Sync: 100%</p>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <p className="text-yellow-500/80 text-[10px] font-black uppercase tracking-widest">Personal Node active</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <div className="text-white font-black text-xl tracking-tighter leading-none">${formatShortValue(totalValueUSD)}</div>
                        <div className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">₹{formatShortValue(totalValueINR)}</div>
                    </div>
                    <button onClick={handleRefresh} className="group p-3 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all shadow-lg hover:border-yellow-500/30">
                        <RefreshCw className={`${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} size={20} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-slate-700 transition-all group shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wallet size={80} />
                    </div>
                    <div className="flex items-center justify-between mb-8">
                        <div className="bg-slate-950 p-4 rounded-2xl text-yellow-500 border border-white/5 shadow-inner">
                            <Wallet size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-green-500/10 text-green-500">Mutual Bal</span>
                    </div>
                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Total Value</div>
                    <div className="text-3xl font-black text-white tracking-tighter mb-1">${formatShortValue(totalValueUSD)}</div>
                    <div className="text-lg font-bold text-slate-500 tracking-tight italic">₹{formatShortValue(totalValueINR)}</div>
                </div>

                <KPIItem label="Threat Level" value="Minimal" icon={<ShieldCheck size={20} />} subText="No leaks detected" />
                <KPIItem label="Node Assets" value={holdings.length.toString()} icon={<Layers size={20} />} subText="Active Ingest" />
                <KPIItem label="Local Latency" value="2ms" icon={<Zap size={20} />} subText="Fiber Optic Sync" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    {/* Main Chart */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                        <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3 mb-10 uppercase">
                            <BarChart3 className="text-yellow-500" size={20} />
                            Asset Pulse (7D)
                        </h3>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis hide dataKey="timestamp" />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', color: '#fff' }}
                                        itemStyle={{ color: '#eab308' }}
                                        labelStyle={{ display: 'none' }}
                                    />
                                    <Area type="monotone" dataKey="price" stroke="#eab308" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={4} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InsightCard
                            image="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=800"
                            title="Forex Correlation"
                            tag="Macro Audit"
                            desc="Analysis of USD/INR peg stability and its direct impact on exchange spreads."
                        />
                        <InsightCard
                            image="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800"
                            title="Security Posture"
                            tag="Infrastructure"
                            desc="Hardware key detection active. Multi-sig validation required for large exports."
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center justify-between tracking-tight uppercase italic">
                            Portfolio Weight
                            <PieIcon className="text-slate-600" size={20} />
                        </h3>
                        <div className="space-y-6">
                            {holdings.length > 0 ? holdings.slice(0, 5).map(h => (
                                <div key={h.coinId} className="flex items-center justify-between group p-3 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <img src={h.image} className="w-10 h-10 rounded-xl" alt={h.symbol} />
                                        <div>
                                            <div className="text-white font-black text-sm uppercase">{h.name}</div>
                                            <div className="text-slate-500 text-[10px] font-black tracking-widest italic">₹{formatShortValue(h.priceINR, true)}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-black text-sm">${formatShortValue(h.valUSD)}</div>
                                        <div className={`text-[10px] font-black ${h.pnlPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {h.pnlPercentage >= 0 ? '+' : ''}
                                            {h.pnlPercentage !== undefined && h.pnlPercentage !== null ? h.pnlPercentage.toFixed(1) : '0.0'}%
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-slate-500 text-xs text-center py-10 italic">No assets ingested yet.</div>
                            )}
                        </div>
                    </div>

                    {/* Price Triggered Alerts */}
                    {triggeredAlerts.length > 0 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-[2.5rem] p-8 animate-pulse shadow-lg shadow-yellow-500/10 mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="text-yellow-500" size={20} />
                                <h4 className="text-yellow-500 font-black text-xs uppercase tracking-widest">Price Alert Triggered</h4>
                            </div>
                            <div className="space-y-3">
                                {triggeredAlerts.map((alert: any) => (
                                    <div key={alert.id} className="text-white text-xs font-bold leading-relaxed border-b border-yellow-500/10 pb-2 last:border-0 last:pb-0">
                                        <span className="text-yellow-400">{alert.symbol}</span> {alert.alertType === 'PRICE_ABOVE' ? 'rose above' : 'dropped below'} ${alert.threshold}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-yellow-500/10 flex justify-between items-center">
                                <span className="text-[10px] font-black text-yellow-500/60 uppercase tracking-widest">Real-time signal</span>
                                <ArrowUpRight className="text-yellow-500" size={14} />
                            </div>
                        </div>
                    )}

                    {/* Security Alert */}
                    {alerts.length > 0 && (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-[2.5rem] p-8 animate-pulse shadow-lg shadow-red-500/5">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="text-red-500" size={20} />
                                <h4 className="text-red-500 font-black text-xs uppercase tracking-widest">Urgent Intelligence</h4>
                            </div>
                            <p className="text-white text-xs font-bold leading-relaxed">{alerts[0].description}</p>
                            <div className="mt-4 pt-4 border-t border-red-500/10 flex justify-between items-center">
                                <span className="text-[10px] font-black text-red-500/60 uppercase tracking-widest">Source: Gemini 3 Audit</span>
                                <ArrowUpRight className="text-red-500" size={14} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Components (duplicated here for now, easy to extract later)
const KPIItem = ({ label, value, icon, subText }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-slate-700 transition-all group shadow-xl">
        <div className="flex items-center justify-between mb-8">
            <div className="bg-slate-950 p-4 rounded-2xl text-yellow-500 border border-white/5 shadow-inner">
                {icon}
            </div>
        </div>
        <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{label}</div>
        <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
        {subText && <div className="text-[10px] text-slate-600 font-bold uppercase mt-2 tracking-widest">{subText}</div>}
    </div>
);

const InsightCard = ({ image, title, tag, desc }: any) => (
    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden group hover:border-white/10 transition-all">
        <div className="h-44 overflow-hidden relative">
            <img src={image} className="w-full h-full object-cover transition-transform group-hover:scale-105 opacity-80 group-hover:opacity-100" alt={title} />
            <div className="absolute top-4 left-4 bg-slate-950/90 px-3 py-1 rounded-full text-[10px] font-black text-white border border-white/10 tracking-widest uppercase">
                {tag}
            </div>
        </div>
        <div className="p-6">
            <h4 className="text-white font-black text-lg mb-2 tracking-tight uppercase">{title}</h4>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">{desc}</p>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest group-hover:text-yellow-500 transition-colors">
                Access Report <ArrowRight size={12} />
            </div>
        </div>
    </div>
);
