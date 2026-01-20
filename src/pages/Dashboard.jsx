import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axiosConfig';
import { getWatchlist, toggleWatchlist } from '../utils/portfolioStore';
import {
  ShieldCheck, RefreshCcw, Plus, Search,
  ShieldAlert, Terminal, Fingerprint, BrainCircuit, Activity,
  TrendingDown, TrendingUp, Wallet, Layers, Heart // ✅ Added Heart
} from 'lucide-react';
import AddTransactionModal from '../components/AddTransactionModal';
import CoinDetailModal from '../components/CoinDetailModal';
import WelcomeOnboarding from '../components/WelcomeOnboarding';
import NotificationBadge from '../components/NotificationBadge';

const Dashboard = () => {
  const { user, setIsSyncing, setIsScanning } = useOutletContext();

  const [coins, setCoins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [portfolio, setPortfolio] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  // 🛡️ Risk State
  const [riskReports, setRiskReports] = useState({});
  const [globalRisk, setGlobalRisk] = useState({
      riskScore: 0,
      label: 'ANALYZING',
      recommendation: 'WAITING...',
      scannedAssets: 0
  });

  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Modal States
  const [selectedCoin, setSelectedCoin] = useState(null); // For Detail Modal
  const [isModalOpen, setIsModalOpen] = useState(false);  // For Trade Modal

  const [isPrivate, setIsPrivate] = useState(localStorage.getItem('privacy_mode') === 'true');
  const [lastUpdated, setLastUpdated] = useState(null);

  const auditedAssets = useRef(new Set());

  // 🛡️ FORENSIC AUDIT ENGINE
  const auditLedger = useCallback(async (holdingsArray) => {
    if (!Array.isArray(holdingsArray) || holdingsArray.length === 0) return;
    setIsScanning(true);

    const uniqueAssetIds = [...new Set(holdingsArray.map(a => a.assetId))].slice(0, 5);
    const newReports = {};

    for (const assetId of uniqueAssetIds) {
      if (!assetId || auditedAssets.current.has(assetId)) continue;
      try {
        const response = await api.post('/portfolio/risk-report', { assetId });
        newReports[assetId] = response.data;
        auditedAssets.current.add(assetId);
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (e) {
        console.warn(`Sentinel Node: Audit failed for ${assetId}`);
      }
    }
    setRiskReports(prev => ({ ...prev, ...newReports }));
    setTimeout(() => setIsScanning(false), 1000);
  }, [setIsScanning]);

  // 🔄 MASTER SYNC
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsSyncing(true);

    try {
      const [marketRes, portfolioRes, safetyRes] = await Promise.all([
        api.get('/portfolio/market-data'),
        api.get('/portfolio/holdings'),
        api.get('/portfolio/safety-summary').catch(() => ({
            data: { riskScore: 0, label: 'OFFLINE', recommendation: 'NEUTRAL' }
        }))
      ]);

      setCoins(marketRes.data || []);
      const rawHoldings = portfolioRes.data.holdings || [];
      setPortfolio(rawHoldings);
      setGlobalRisk(safetyRes.data || {});
      setWatchlist(getWatchlist() || []);
      setLastUpdated(new Date().toLocaleTimeString());

      if (rawHoldings.length > 0) {
        auditLedger(rawHoldings);
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
      setTimeout(() => setIsSyncing(false), 800);
    }
  }, [setIsSyncing, auditLedger]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 15000);
    const handleWatchlistUpdate = () => setWatchlist(getWatchlist());
    window.addEventListener('watchlistUpdate', handleWatchlistUpdate);
    const handlePrivacyChange = () => setIsPrivate(localStorage.getItem('privacy_mode') === 'true');
    window.addEventListener('privacyChange', handlePrivacyChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('watchlistUpdate', handleWatchlistUpdate);
      window.removeEventListener('privacyChange', handlePrivacyChange);
    };
  }, [fetchData]);

  const formatINR = (val) => {
    if (isPrivate) return "••••••";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);
  };

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = useMemo(() => {
     let totalBalance = 0;
     let change24hValue = 0;
     const enrichedPortfolio = portfolio.map(item => {
        const coin = coins.find(c => c.id === item.assetId);
        if(!coin) return item;
        const value = (coin.current_price || 0) * (item.quantity || 0);
        totalBalance += value;
        const change = (coin.price_change_percentage_24h || 0) / 100;
        change24hValue += (value * change);
        return { ...item, ...coin };
     });
     return { totalBalance, change24hValue, enrichedPortfolio };
  }, [portfolio, coins]);

  const marketTrend = coins.length > 0
    ? (coins.filter(c => c.price_change_percentage_24h > 0).length > coins.length / 2 ? 'Bullish' : 'Bearish')
    : 'Neutral';

  // 🛡️ Integrity Calculation (100 - Risk)
  const integrityScore = Math.max(0, 100 - (globalRisk.riskScore || 0));

  const getPulseColor = () => {
      if (integrityScore >= 80) return 'text-emerald-500';
      if (integrityScore >= 60) return 'text-blue-400';
      return 'text-rose-500';
  };

  const renderRiskBadge = (assetId) => {
    const report = riskReports[assetId];
    if (!report) return null;
    const isRisky = report.riskScore > 50;
    return (
        <div className={`flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isRisky ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
            {isRisky ? <ShieldAlert size={10} /> : <ShieldCheck size={10} />}
            {isRisky ? 'RISK' : 'SAFE'}
        </div>
    );
  };

  // ✅ NEW HANDLER: Connects Detail Modal to Trade Modal
  const handleTradeFromDetail = (coin) => {
      setSelectedCoin(null); // Close the detail modal
      setIsModalOpen(true);  // Open the trade modal
  };

  if (isInitialLoad) return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <RefreshCcw className="animate-spin text-blue-500 mb-6" size={40} />
      <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Initializing Sentinel Node...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 font-sans animate-in fade-in duration-700 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <WelcomeOnboarding tradeCount={portfolio?.length || 0} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-4">
        <div>
            <div className="flex items-center gap-3 mb-1">
               <div className="p-2 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-lg shadow-lg">
                  <Terminal size={18} className="text-blue-500" />
               </div>
               <div>
                 <h1 className="text-2xl font-bold text-white tracking-tight">Command Center</h1>
                 <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                    Welcome back, {user?.name || 'Operative'}
                 </p>
               </div>
            </div>
        </div>
        <div className="flex items-center gap-4">
            {lastUpdated && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-[9px] text-slate-400 font-mono">LIVE: {lastUpdated}</p>
                </div>
            )}
            <div className="flex items-center gap-3">
                <NotificationBadge />
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 hover:bg-blue-500 border border-blue-500/50">
                  <Plus size={14} /> New Trade
                </button>
            </div>
        </div>
      </div>

      {/* WIDGET GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* 🛡️ SECURITY PULSE */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-white/5 flex flex-col justify-between min-h-[200px]">
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Security Pulse</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded">Build: Ledger_7.0</span>
             </div>

             <div className="my-6">
                 <h2 className={`text-3xl font-black tracking-tight leading-none ${getPulseColor()}`}>
                     {globalRisk.recommendation || "ANALYZING"}
                 </h2>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">
                     Recommended Strategy
                 </p>
             </div>

             <div>
                 <div className="flex justify-between items-end mb-2">
                     <span className="text-[10px] text-slate-400 font-bold uppercase">Portfolio Integrity</span>
                     <span className={`text-xl font-bold ${getPulseColor()}`}>{integrityScore}%</span>
                 </div>

                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                     <div
                        className={`h-full transition-all duration-1000 ${integrityScore >= 80 ? 'bg-emerald-500' : integrityScore >= 60 ? 'bg-blue-500' : 'bg-rose-500'}`}
                        style={{ width: `${integrityScore}%` }}
                     />
                 </div>

                 <div className="flex justify-between mt-3 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                     <span>{globalRisk.details?.riskyAssets > 0 ? `${globalRisk.details.riskyAssets} Risky Assets` : 'All Assets Secured'}</span>
                     <span className={integrityScore >= 60 ? 'text-emerald-500' : 'text-rose-500'}>{globalRisk.label || 'ONLINE'}</span>
                 </div>
             </div>
          </div>

          {/* METRICS */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="glass-panel px-5 py-4 rounded-xl flex items-center gap-4 h-24">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20"><Wallet className="text-indigo-400" size={20}/></div>
                  <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Net Worth</p>
                      <p className={`text-xl font-bold text-white tracking-tight ${isPrivate ? 'privacy-blur' : ''}`}>{formatINR(stats.totalBalance)}</p>
                  </div>
              </div>

              <div className="glass-panel px-5 py-4 rounded-xl flex items-center gap-4 h-24">
                  <div className={`p-2.5 rounded-xl border ${stats.change24hValue >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                      {stats.change24hValue >= 0 ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                  </div>
                  <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">24h Performance</p>
                      <p className={`text-xl font-bold ${stats.change24hValue >= 0 ? 'text-emerald-400' : 'text-rose-400'} ${isPrivate ? 'privacy-blur' : ''}`}>
                        {stats.change24hValue >= 0 ? '+' : ''}{formatINR(stats.change24hValue)}
                      </p>
                  </div>
              </div>

              <div className="glass-panel px-5 py-4 rounded-xl flex items-center gap-4 h-24">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20"><Fingerprint className="text-blue-500" size={20}/></div>
                  <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Ledger Integrity</p>
                      <p className={`text-base font-bold tracking-tight ${integrityScore === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{integrityScore}% Verified</p>
                  </div>
              </div>

              <div className="glass-panel px-5 py-4 rounded-xl flex items-center gap-4 h-24">
                  <div className={`p-2.5 rounded-xl border ${marketTrend === 'Bullish' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                      <Activity size={20}/>
                  </div>
                  <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Market Sentiment</p>
                      <p className={`text-base font-bold tracking-tight ${marketTrend === 'Bullish' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {marketTrend.toUpperCase()}
                      </p>
                  </div>
              </div>
          </div>
      </div>

      {/* MARKET LIST */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-800 rounded-md"><Layers size={16} className="text-blue-400" /></div>
                <h2 className="text-base font-bold text-white tracking-tight">Global Market Feed</h2>
            </div>
            <div className="relative w-full md:w-72 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={14} />
                <input type="text" placeholder="Search tokens..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-white text-xs font-medium focus:border-blue-500/50 outline-none" />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCoins.map(coin => {
            const isOwned = Array.isArray(portfolio) && portfolio.some(h => h.assetId === coin.id);
            const report = riskReports[coin.id];
            const safetyScore = report ? 100 - (report.riskScore || 0) : 0;
            const isFavorite = watchlist.includes(coin.id); // ✅ Check Favorite Status

            return (
              <div key={coin.id} onClick={() => setSelectedCoin(coin)} className={`glass-panel p-4 rounded-2xl hover:bg-slate-800/40 transition-all relative cursor-pointer border border-transparent hover:border-white/5 ${isOwned ? 'border-blue-500/30' : ''}`}>

                {/* 📌 START: Wishlist Toggle */}
                <button
                  onClick={(e) => {
                      e.stopPropagation();
                      setWatchlist(toggleWatchlist(coin.id));
                  }}
                  className="absolute top-3 right-3 p-1.5 z-10 transition-all active:scale-90"
                >
                  <Heart
                    size={16}
                    className={`${isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-600 hover:text-slate-400"}`}
                  />
                </button>
                {/* 📌 END: Wishlist Toggle */}

                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <img src={coin.image} className="w-8 h-8 rounded-lg" alt="" />
                    <div>
                        <p className="font-bold text-xs text-white leading-none mb-0.5">{coin.symbol.toUpperCase()}</p>
                        <p className="text-[9px] text-slate-500 font-medium truncate max-w-[80px]">{coin.name}</p>
                    </div>
                  </div>
                  {renderRiskBadge(coin.id)}
                </div>
                <div className="mb-3">
                    <p className={`text-lg font-bold text-white ${isPrivate ? 'privacy-blur' : ''}`}>{formatINR(coin.current_price)}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                    </span>
                </div>
                <div className="pt-3 border-t border-white/5">
                    {report ? (
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>{report.recommendation}</span><span>{safetyScore}% Safe</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                                <div className={`h-full ${safetyScore > 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${safetyScore}%` }} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 text-[9px] text-slate-600 font-bold uppercase tracking-widest py-0.5">
                             <BrainCircuit size={12} /> Awaiting Audit
                        </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CoinDetailModal
        coin={selectedCoin}
        isOpen={!!selectedCoin}
        onClose={() => setSelectedCoin(null)}
        onTradeTrigger={handleTradeFromDetail}
      />

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableCoins={coins}
        onSuccess={() => fetchData(true)}
      />
    </div>
  );
};

export default Dashboard;