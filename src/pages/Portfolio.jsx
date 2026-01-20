import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axiosConfig';
import { getTopCoins, getPortfolioHistory } from '../api/coingecko';
import PortfolioChart from '../components/PortfolioChart';
import {
  TrendingUp, TrendingDown, Wallet, RefreshCcw, Database,
  Activity, ShieldCheck, ShieldAlert, PieChart, Terminal
} from 'lucide-react';

const Portfolio = () => {
  // 1. Remove isPrivate from context, we handle it locally
  const { setIsSyncing, setIsScanning } = useOutletContext();

  const [holdings, setHoldings] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [riskReports, setRiskReports] = useState({});
  const [chartHistory, setChartHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [activeRange, setActiveRange] = useState('7');
  const [chartMode, setChartMode] = useState('TOTAL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [marketStatus, setMarketStatus] = useState('ONLINE');

  // 🔒 2. Local Privacy State (Read from Storage)
  const [isPrivate, setIsPrivate] = useState(() => {
      return localStorage.getItem('privacy_mode') === 'true';
  });

  const auditedInSession = useRef(new Set());

  // 🎧 3. Privacy Event Listener
  useEffect(() => {
    const handlePrivacyChange = () => {
        const mode = localStorage.getItem('privacy_mode') === 'true';
        setIsPrivate(mode);
    };

    window.addEventListener('privacyChange', handlePrivacyChange);
    window.addEventListener('storage', handlePrivacyChange);

    return () => {
      window.removeEventListener('privacyChange', handlePrivacyChange);
      window.removeEventListener('storage', handlePrivacyChange);
    };
  }, []);

  // 🛡️ FORENSIC AUDIT ENGINE (Optimized to Stop Spam)
  const auditAssets = useCallback(async (assets) => {
    if (!Array.isArray(assets) || assets.length === 0) return;

    // 1. Filter out assets we have ALREADY audited in this session
    // This prevents sending 6 requests every 30 seconds
    const uniqueAssetIds = [...new Set(assets.map(a => a.assetId))];
    const neededAudits = uniqueAssetIds.filter(id => id && !auditedInSession.current.has(id));

    // If everything is already audited, STOP here.
    if (neededAudits.length === 0) return;

    if (setIsScanning) setIsScanning(true);
    const newReports = {};

    for (const assetId of neededAudits) {
      try {
        const response = await api.post('/portfolio/risk-report', { assetId });
        newReports[assetId] = response.data;

        // Mark as done so we don't ask again next refresh
        auditedInSession.current.add(assetId);

        // Small delay for UI smoothness
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        console.warn(`Audit skipped for ${assetId}`);
      }
    }
    setRiskReports(prev => ({ ...prev, ...newReports }));
    if (setIsScanning) setTimeout(() => setIsScanning(false), 1000);
  }, [setIsScanning]);

  // 🔄 MASTER DATA SYNC
  const loadData = useCallback(async (isSilent = false) => {
    if (setIsSyncing && !isSilent) setIsSyncing(true); // Only show global spinner on manual load
    if (!isSilent) setIsRefreshing(true);

    try {
      // t=${Date.now()} prevents browser caching
      const [portfolioRes, prices] = await Promise.all([
        api.get(`/portfolio/holdings?t=${Date.now()}`),
        getTopCoins().catch(() => null)
      ]);

      const rawData = portfolioRes.data;
      const myPortfolio = rawData.holdings || (Array.isArray(rawData) ? rawData : []);

      setHoldings(myPortfolio);

      if (prices && prices.length > 0) {
        setMarketStatus('ONLINE');

        const priceMap = prices.reduce((acc, coin) => {
          acc[coin.id.toLowerCase()] = {
            price: coin.current_price,
            image: coin.image,
            name: coin.name,
            symbol: coin.symbol,
            change24h: coin.price_change_percentage_24h
          };
          return acc;
        }, {});

        setMarketData(priceMap);

        if (myPortfolio.length > 0) {
            // Only show chart loader on first load, not on background refresh
            if (chartHistory.length === 0) setLoadingChart(true);

            let cleanPortfolio = myPortfolio.map(item => ({
                ...item,
                assetId: item.assetId ? item.assetId.toLowerCase().trim() : '',
                quantity: parseFloat(item.quantity) || 0
            }));

            cleanPortfolio.sort((a, b) => {
                const priceA = priceMap[a.assetId]?.price || 0;
                const priceB = priceMap[b.assetId]?.price || 0;
                return (priceB * b.quantity) - (priceA * a.quantity);
            });

            // Prevent fetching history every 30s to save API calls
            if (chartHistory.length === 0) {
                const history = await getPortfolioHistory(cleanPortfolio, activeRange);
                if (history && history.length > 0) setChartHistory(history);
            }
            setLoadingChart(false);
        }
      } else {
        setMarketStatus('OFFLINE');
      }

      // Pass to audit engine (it will self-check if it needs to run)
      if (myPortfolio.length > 0) auditAssets(myPortfolio);

    } catch (err) {
      console.error("Sync Error", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      if (setIsSyncing) setTimeout(() => setIsSyncing(false), 800);
    }
  }, [setIsSyncing, auditAssets, activeRange, chartHistory.length]);

  // 🔄 LIVE UPDATE ENGINE
  useEffect(() => {
    loadData();

    // ✅ INTERVAL: 30 Seconds
    const interval = setInterval(() => {
        // 🛑 FIX: Do NOT clear audit cache here.
        // We only want to update prices, not re-audit everything.
        loadData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  // 📊 ROBUST PnL CALCULATOR
  const stats = useMemo(() => {
    if (!Array.isArray(holdings) || holdings.length === 0) return { totalValue: 0, totalCost: 0 };

    return holdings.reduce((acc, h) => {
        const id = h.assetId ? h.assetId.toLowerCase() : '';
        const qty = parseFloat(h.quantity) || 0;
        const avgCost = parseFloat(h.avgCost) || 0;
        const livePrice = marketData[id]?.price || 0;

        if (livePrice >= 0) {
            acc.totalValue += (qty * livePrice);
            acc.totalCost += (qty * avgCost);
        }
        return acc;
    }, { totalValue: 0, totalCost: 0 });

  }, [holdings, marketData]);

  const pnlStats = useMemo(() => {
    if (stats.totalCost === 0) return { pnl: 0, percentage: 0 };
    const pnl = stats.totalValue - stats.totalCost;
    const percentage = (pnl / stats.totalCost) * 100;
    return { pnl, percentage };
  }, [stats]);

  const formatCurrency = (val) => {
    if (isPrivate) return "••••••";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
      <RefreshCcw className="animate-spin text-blue-500" size={48} strokeWidth={1} />
      <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] animate-pulse">Decrypting Ledger...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 font-sans animate-in fade-in duration-700 relative">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-lg shadow-lg">
                <Database size={18} className="text-indigo-500" />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-white tracking-tight">Vault Storage</h1>
               <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                  Encrypted Ledger • {holdings.length} Assets Found
               </p>
             </div>
          </div>
        </div>
        <button
            onClick={() => {
                // Manual Refresh: Clear cache to force re-audit
                auditedInSession.current.clear();
                loadData();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/10 rounded-lg hover:bg-slate-800 transition-all group"
        >
             <RefreshCcw size={14} className={`text-slate-400 group-hover:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-white">Refresh Node</span>
        </button>
      </div>

      {/* --- TOP METRICS GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* 1. Net Worth Card */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-20 bg-indigo-500/5 blur-[50px] rounded-full transition-all group-hover:bg-indigo-500/10"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 text-indigo-400">
                    <Wallet size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Net Worth</span>

                    {/* 🟢 LIVE PULSE INDICATOR */}
                    <span className="relative flex h-2 w-2 ml-auto">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                </div>
                <h3 className={`text-3xl font-bold text-white tracking-tight mb-1 ${isPrivate ? 'privacy-blur' : ''}`}>
                    {formatCurrency(stats.totalValue)}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                    Live Market Valuation
                </p>
            </div>
        </div>

        {/* 2. PnL Analysis Card */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
            <div className={`absolute right-0 top-0 p-20 blur-[50px] rounded-full transition-all ${pnlStats.pnl >= 0 ? 'bg-emerald-500/5 group-hover:bg-emerald-500/10' : 'bg-rose-500/5 group-hover:bg-rose-500/10'}`}></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className={`flex items-center gap-2 mb-3 ${pnlStats.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pnlStats.pnl >= 0 ? <TrendingUp size={18}/> : <TrendingDown size={18}/>}
                        <span className="text-[10px] font-bold uppercase tracking-widest">Unrealized P&L</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                        <h3 className={`text-3xl font-bold tracking-tight mb-1 ${pnlStats.pnl >= 0 ? 'text-white' : 'text-white'} ${isPrivate ? 'privacy-blur' : ''}`}>
                            {pnlStats.pnl >= 0 ? '+' : ''}{formatCurrency(pnlStats.pnl)}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pnlStats.pnl >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {pnlStats.percentage.toFixed(2)}%
                        </span>
                    </div>
                </div>

                {/* VISUAL FIX: Invested vs Current */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                    <div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Invested</p>
                        <p className={`text-[11px] font-mono font-medium text-slate-300 ${isPrivate ? 'privacy-blur' : ''}`}>
                            {formatCurrency(stats.totalCost)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Current Value</p>
                        <p className={`text-[11px] font-mono font-medium text-white ${isPrivate ? 'privacy-blur' : ''}`}>
                            {formatCurrency(stats.totalValue)}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. Asset Allocation */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-center">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-400">
                    <PieChart size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Diversity</span>
                </div>
                <span className="text-[9px] text-slate-500 font-bold uppercase">{holdings.length} Assets</span>
             </div>

             <div className="space-y-2">
                {holdings.slice(0, 3).map(h => {
                    const id = h.assetId ? h.assetId.toLowerCase() : '';
                    const val = (parseFloat(h.quantity) * (marketData[id]?.price || 0));
                    const density = stats.totalValue > 0 ? ((val / stats.totalValue) * 100) : 0;
                    return (
                        <div key={h.id} className="flex items-center gap-3">
                            <span className="text-[9px] font-bold text-slate-400 w-8">{h.assetSymbol}</span>
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${density}%` }}></div>
                            </div>
                            <span className="text-[9px] font-bold text-slate-300 w-8 text-right">{density.toFixed(0)}%</span>
                        </div>
                    )
                })}
             </div>
        </div>
      </div>

      {/* --- MAIN CHART SECTION --- */}
      <div className="glass-panel p-6 rounded-2xl relative">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2 text-slate-400">
                <Activity size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Performance History</span>
             </div>
          </div>
          <div className="h-[280px] w-full">
               <PortfolioChart historyData={chartHistory} isLoading={loadingChart} isTotalView={chartMode === 'TOTAL'} />
          </div>
      </div>

      {/* --- FORENSIC LEDGER (Table) --- */}
      <div className="glass-panel overflow-hidden rounded-2xl">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
            <Terminal size={16} className="text-slate-500" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Asset Inventory Ledger</h3>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-slate-500 text-[9px] uppercase font-bold tracking-widest">
                    <tr>
                    <th className="px-6 py-4 text-center w-16">Audit</th>
                    <th className="px-6 py-4">Asset Identification</th>
                    <th className="px-6 py-4 text-right">Holdings</th>
                    <th className="px-6 py-4 text-right">Market Price</th>
                    <th className="px-6 py-4 text-right">Value</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {holdings.map((h) => {
                        const id = h.assetId ? h.assetId.toLowerCase() : '';
                        const price = marketData[id]?.price || 0;
                        const value = price * parseFloat(h.quantity);
                        const change = marketData[id]?.change24h || 0;

                        return (
                            <tr key={h.id} className="hover:bg-white/5 transition-colors group">
                                {/* Audit Column */}
                                <td className="px-6 py-4 text-center">
                                    {riskReports[h.assetId] ? (
                                        <div className={`w-6 h-6 rounded flex items-center justify-center mx-auto border ${riskReports[h.assetId].riskScore < 40 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'}`}>
                                            {riskReports[h.assetId].riskScore < 40 ? <ShieldCheck size={12}/> : <ShieldAlert size={12}/>}
                                        </div>
                                    ) : <div className="w-1.5 h-1.5 bg-slate-700 rounded-full mx-auto animate-pulse"></div>}
                                </td>

                                {/* Asset Info */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={marketData[id]?.image} className="w-8 h-8 rounded bg-slate-950 p-0.5 border border-white/10" alt="" />
                                        <div>
                                            <p className="font-bold text-white text-xs tracking-tight">{h.assetName}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">{h.assetSymbol}</p>
                                                <span className={`text-[9px] font-bold ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Quantity */}
                                <td className={`px-6 py-4 text-right font-bold text-xs text-slate-300 ${isPrivate ? 'privacy-blur' : ''}`}>
                                    {parseFloat(h.quantity).toLocaleString()} <span className="text-[9px] text-slate-600">{h.assetSymbol}</span>
                                </td>

                                {/* Price */}
                                <td className={`px-6 py-4 text-right font-medium text-xs text-slate-400 font-mono ${isPrivate ? 'privacy-blur' : ''}`}>
                                    {formatCurrency(price)}
                                </td>

                                {/* Total Value */}
                                <td className={`px-6 py-4 text-right font-bold text-xs text-white tracking-tight ${isPrivate ? 'privacy-blur' : ''}`}>
                                    {formatCurrency(value)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {holdings.length === 0 && (
                <div className="p-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest border-t border-white/5">
                    No Assets Found in Vault
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;