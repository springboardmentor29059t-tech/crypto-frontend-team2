import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X, TrendingUp, TrendingDown, RefreshCcw,
  ShieldAlert, ShieldCheck,
  ArrowRightLeft, Wallet, Target, Activity,
  Server, Lock
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axiosConfig';

const CoinDetailModal = ({ coin, isOpen, onClose, onTradeTrigger }) => {
  const [history, setHistory] = useState([]);
  const [riskReport, setRiskReport] = useState(null);
  const [userHolding, setUserHolding] = useState(null);
  const [timeframe, setTimeframe] = useState('7');
  const [loading, setLoading] = useState(false);
  const [riskLoading, setRiskLoading] = useState(false);

  // 🔒 PRIVACY STATE
  const [isPrivate, setIsPrivate] = useState(() => localStorage.getItem('privacy_mode') === 'true');

  useEffect(() => {
    const handlePrivacyChange = () => setIsPrivate(localStorage.getItem('privacy_mode') === 'true');
    window.addEventListener('privacyChange', handlePrivacyChange);
    return () => window.removeEventListener('privacyChange', handlePrivacyChange);
  }, []);

  const timeframes = [
    { label: '24H', value: '1' },
    { label: '1W', value: '7' },
    { label: '1M', value: '30' },
    { label: '6M', value: '180' },
    { label: '1Y', value: '365' },
  ];

  // 🔄 RESET STATE ON OPEN
  useEffect(() => {
    if (isOpen) {
      // Don't reset history immediately to avoid flicker if re-opening same coin
      fetchUserHolding();
      fetchRiskReport();
      // Default to 7 days if not set
      if (!timeframe) setTimeframe('7');
    } else {
      setRiskReport(null);
      // Optional: clear history on close to save memory
      setHistory([]);
    }
  }, [isOpen]);

  // 🛑 ABORT CONTROLLER REF (Prevents Race Conditions)
  const abortControllerRef = useRef(null);

  // 📈 FETCH HISTORY (Optimized)
  useEffect(() => {
    if (!coin || !isOpen) return;

    // 1. Cancel previous request if still running
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }

    // 2. Create new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/portfolio/market-history/${coin.id}`, {
                params: { days: timeframe },
                signal: controller.signal // Bind signal
            });

            if (response.data) {
                // Handle both Array format (Backend Cache) and Object format
                const rawData = Array.isArray(response.data) ? response.data : (response.data.prices || []);
                const formatted = rawData.map(item => {
                     // Normalize [time, price] vs { timestamp, value }
                     if (Array.isArray(item)) return { ms: item[0], price: item[1] };
                     if (item.timestamp) return { ms: item.timestamp, price: item.value };
                     return null;
                }).filter(Boolean);

                setHistory(formatted);
            }
        } catch (err) {
            if (err.name !== 'CanceledError' && err.code !== "ERR_CANCELED") {
                console.warn("History fetch failed:", err.message);
            }
        } finally {
            // Only stop loading if this is the active request
            if (abortControllerRef.current === controller) {
                setLoading(false);
            }
        }
    };

    fetchHistory();

    return () => {
        if (abortControllerRef.current === controller) {
            controller.abort();
        }
    };
  }, [coin, isOpen, timeframe]); // Only runs when these change

  const fetchRiskReport = useCallback(async () => {
    if (!coin || !isOpen || riskReport) return; // Don't re-fetch if already have report
    setRiskLoading(true);
    try {
      const response = await api.post('/portfolio/risk-report', { assetId: coin.id });
      setRiskReport(response.data);
    } catch (err) {
      setRiskReport({
        riskScore: 50,
        label: "NEUTRAL",
        reasoning: "Audit node unreachable. Displaying safety baseline.",
        threats: ["Forensic API Mismatch"]
      });
    } finally {
      setRiskLoading(false);
    }
  }, [coin, isOpen, riskReport]);

  const fetchUserHolding = useCallback(async () => {
    if (!coin || !isOpen) return;
    try {
      const response = await api.get('/portfolio/holdings');
      const holdings = response.data.holdings || [];
      const match = holdings.find(h => h.assetId === coin.id);
      setUserHolding(match || null);
    } catch (err) {
      console.error("Position Sync Error", err);
    }
  }, [coin, isOpen]);

  if (!coin) return null;

  const formatINR = (val) => {
    if (isPrivate) return "••••••";
    const safeVal = val || 0;
    const decimals = (safeVal > 0 && safeVal < 1) ? 6 : 2;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: decimals, maximumFractionDigits: decimals
    }).format(safeVal);
  };

  const isGain = history.length > 1 && (history[history.length - 1]?.price || 0) >= (history[0]?.price || 0);

  const renderUserPosition = () => {
    if (!userHolding) return null;
    const pnlPercent = ((coin.current_price - userHolding.avgCost) / userHolding.avgCost) * 100;

    return (
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group mb-6">
        <div className="absolute top-0 right-0 p-20 bg-blue-600/5 blur-[50px] rounded-full transition-all group-hover:bg-blue-600/10"></div>
        <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-[10px] uppercase tracking-widest">
                <Wallet size={14} /> Inventory Active
            </div>
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${pnlPercent >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
            </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Quantity</p>
                <p className={`text-lg font-bold text-white tracking-tight ${isPrivate ? 'privacy-blur' : ''}`}>
                    {userHolding.quantity.toLocaleString()} <span className="text-slate-500 text-xs font-medium">{coin.symbol.toUpperCase()}</span>
                </p>
            </div>
            <div className="text-right">
                <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Avg. Purchase</p>
                <p className={`text-lg font-bold text-white tracking-tight ${isPrivate ? 'privacy-blur' : ''}`}>
                    {formatINR(userHolding.avgCost)}
                </p>
            </div>
            </div>
        </div>
      </div>
    );
  };

  const renderRiskForensics = () => {
    if (riskLoading) return (
      <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 min-h-[160px] border border-white/5">
        <RefreshCcw className="animate-spin text-blue-500" size={24} />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Parsing Smart Contracts...</p>
      </div>
    );

    if (!riskReport) return null;
    const isHighRisk = riskReport.riskScore > 60;
    const isSafe = riskReport.riskScore < 35 && riskReport.riskScore > 0;

    return (
      <div className={`glass-panel p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden ${isHighRisk ? 'border-rose-500/30' : isSafe ? 'border-emerald-500/30' : 'border-slate-800'}`}>
        <div className={`absolute top-0 right-0 p-24 blur-[60px] rounded-full opacity-20 pointer-events-none ${isHighRisk ? 'bg-rose-500' : isSafe ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Lock size={14} className={isHighRisk ? 'text-rose-400' : isSafe ? 'text-emerald-400' : 'text-amber-400'} />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Protocol</p>
                    </div>
                    <h4 className={`text-xl font-bold tracking-tight ${isHighRisk ? 'text-rose-400' : isSafe ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {riskReport.label} <span className="text-slate-500 text-sm font-medium">({riskReport.riskScore}/100 Risk)</span>
                    </h4>
                </div>
                <div className={`p-2 rounded-lg border ${isHighRisk ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-slate-800/50 border-slate-700 text-blue-400'}`}>
                    {isHighRisk ? <ShieldAlert size={18} className="animate-pulse" /> : <ShieldCheck size={18} />}
                </div>
            </div>
            <div className="bg-[#0B0E14]/50 p-3 rounded-xl border border-white/5 mb-4">
                <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed">"{riskReport.reasoning}"</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {riskReport.threats?.map((t, i) => (
                    <span key={i} className="text-[9px] font-bold text-slate-400 bg-white/5 border border-white/5 px-2 py-1 rounded uppercase tracking-wide">{t}</span>
                ))}
            </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-[#0B0E14] border-l border-white/10 z-[1001] transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#0B0E14]/80 backdrop-blur-xl absolute top-0 w-full z-20">
          <div className="flex items-center gap-4">
            <div className="relative p-0.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
               <div className="bg-[#0B0E14] rounded-[10px] p-1"><img src={coin.image} className="w-8 h-8 rounded-lg" alt="" /></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight leading-none">{coin.name}</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{coin.symbol.toUpperCase()} • LAYER 1</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"><X size={20} /></button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar mt-20 pb-32">
          {renderUserPosition()}

          <div className="glass-panel p-6 rounded-2xl border border-white/5">
             <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Live Valuation</p>
                    <h3 className={`text-3xl font-bold text-white tracking-tight ${isPrivate ? 'privacy-blur' : ''}`}>{formatINR(coin.current_price)}</h3>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${coin.price_change_percentage_24h >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {coin.price_change_percentage_24h >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </div>
             </div>
             <div className="flex bg-[#0B0E14] p-1 rounded-lg border border-white/5 mb-4 w-full">
                {timeframes.map((tf) => (
                <button key={tf.value} onClick={() => setTimeframe(tf.value)} className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${timeframe === tf.value ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{tf.label}</button>
                ))}
            </div>
            <div className="h-48 w-full relative">
                {loading && <div className="absolute inset-0 flex items-center justify-center z-20 bg-[#0B0E14]/50 backdrop-blur-sm rounded-xl"><RefreshCcw className="animate-spin text-blue-500" size={24} /></div>}
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isGain ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={isGain ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px', color: '#fff' }} itemStyle={{ color: '#fff' }} labelFormatter={() => ''} formatter={(val) => [formatINR(val), '']} />
                      <Area type="monotone" dataKey="price" stroke={isGain ? "#10b981" : "#f43f5e"} fill="url(#colorPrice)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>

          {renderRiskForensics()}

          <div className="grid grid-cols-2 gap-3">
             <DetailStat label="Market Cap" value={isPrivate ? "••••••" : `₹${(coin.market_cap / 10000000).toFixed(2)} Cr`} icon={<Activity size={12}/>} />
             <DetailStat label="All Time High" value={formatINR(coin.ath)} icon={<TrendingUp size={12}/>} />
             <DetailStat label="Global Rank" value={`#${coin.market_cap_rank}`} icon={<Target size={12}/>} highlight />
             <DetailStat label="Circulating" value={coin.circulating_supply?.toLocaleString()} icon={<Server size={12}/>} />
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="absolute bottom-0 left-0 w-full p-5 bg-[#0B0E14]/90 backdrop-blur-xl border-t border-white/5 flex gap-3 z-20">
            <button
              onClick={() => onTradeTrigger?.(coin)}
              className="flex-1 bg-white text-black py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
            >
                <ArrowRightLeft size={16} /> TRADE {coin.symbol.toUpperCase()}
            </button>
            <button className="p-3.5 bg-slate-900 rounded-xl text-slate-400 border border-white/10 hover:text-white hover:border-white/20 transition-all">
                <Target size={18} />
            </button>
        </div>
      </div>
    </>
  );
};

const DetailStat = ({ label, value, icon, highlight }) => (
  <div className={`p-4 rounded-xl border border-white/5 flex flex-col justify-between h-24 transition-all hover:border-white/10 ${highlight ? 'bg-blue-600/5' : 'bg-[#0B0E14]'}`}>
    <div className="flex justify-between items-start text-slate-500"><span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>{icon}</div>
    <p className={`text-sm font-bold tracking-tight ${highlight ? 'text-blue-400' : 'text-slate-200'}`}>{value}</p>
  </div>
);

export default CoinDetailModal;