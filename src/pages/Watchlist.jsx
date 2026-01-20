import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getTopCoins } from '../api/coingecko';
import { getWatchlist, toggleWatchlist } from '../utils/portfolioStore';
import {
  Star, TrendingUp, TrendingDown, RefreshCcw,
  Search, Trash2, Activity, BarChart2, Plus
} from 'lucide-react';

const Watchlist = () => {
  const { setIsSyncing, isPrivate } = useOutletContext(); // ✅ Use global privacy state

  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setIsSyncing(true);
    try {
      const [marketData, savedIds] = await Promise.all([
        getTopCoins(),
        getWatchlist()
      ]);
      const watchedCoins = (marketData || []).filter(c => savedIds.includes(c.id));
      setCoins(watchedCoins);
    } catch (err) {
      console.error("Watchlist load error", err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatINR = (val) => {
    if (isPrivate) return "••••••";
    const safeVal = val || 0;
    const decimals = (safeVal > 0 && safeVal < 1) ? 6 : 2;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: decimals, maximumFractionDigits: decimals,
    }).format(safeVal);
  };

  const handleRemove = (id, e) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent navigation if wrapped in link
    toggleWatchlist(id);
    setCoins(prev => prev.filter(c => c.id !== id));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
      <RefreshCcw className="animate-spin text-amber-500" size={48} strokeWidth={1} />
      <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] animate-pulse">Scanning Targets...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-24 font-sans animate-in fade-in duration-700 relative">

      {/* Background Ambience (Amber for Watchlist) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-lg shadow-lg">
                <Star size={18} className="text-amber-500 fill-amber-500" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Market Surveillance</h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                    {coins.length} Assets Monitored • Live Feed
                </p>
            </div>
        </div>

        <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/10 rounded-lg hover:bg-slate-800 transition-all group"
        >
             <RefreshCcw size={14} className="text-slate-400 group-hover:text-amber-400 transition-colors" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-white">Refresh Scan</span>
        </button>
      </div>

      {/* --- CONTENT GRID --- */}
      {coins.length === 0 ? (
        <div className="glass-panel p-16 rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-white/5">
            <Search className="text-slate-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Watchlist Empty</h3>
          <p className="text-slate-500 text-xs max-w-sm leading-relaxed mb-6">
            Your surveillance feed is currently inactive. Add assets from the Market Dashboard to begin tracking.
          </p>
          <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-500 transition-all flex items-center gap-2">
            <Plus size={14} /> Add Assets
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {coins.map(coin => (
            <div
                key={coin.id}
                className="glass-panel p-5 rounded-2xl relative group hover:bg-slate-800/40 transition-all border border-white/5 hover:border-amber-500/30"
            >
              {/* Remove Button */}
              <button
                onClick={(e) => handleRemove(coin.id, e)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                title="Stop Tracking"
              >
                <Trash2 size={14} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <img src={coin.image} className="w-10 h-10 rounded-xl bg-slate-950 p-1 border border-white/10" alt="" />
                <div>
                  <h3 className="text-sm font-bold text-white leading-none mb-1">{coin.symbol.toUpperCase()}</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate max-w-[100px]">{coin.name}</p>
                </div>
              </div>

              {/* Price Block */}
              <div className="mb-6">
                <p className={`text-2xl font-bold text-white tracking-tight ${isPrivate ? 'privacy-blur' : ''}`}>
                    {formatINR(coin.current_price)}
                </p>
                <div className={`flex items-center gap-1.5 mt-1 text-[10px] font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {coin.price_change_percentage_24h >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                    <span className="bg-white/5 px-1.5 py-0.5 rounded">
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </span>
                </div>
              </div>

              {/* Mini Stats Footer */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5">
                <div>
                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">24h High</p>
                    <p className={`text-[10px] font-mono font-medium text-slate-300 ${isPrivate ? 'privacy-blur' : ''}`}>
                        {formatINR(coin.high_24h)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">24h Low</p>
                    <p className={`text-[10px] font-mono font-medium text-slate-300 ${isPrivate ? 'privacy-blur' : ''}`}>
                        {formatINR(coin.low_24h)}
                    </p>
                </div>
              </div>

              {/* Decorative Corner Glow */}
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-br-2xl pointer-events-none"></div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center gap-3 px-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-sm">
        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
            <Activity size={16} />
        </div>
        <div>
            <p className="text-xs font-bold text-white uppercase tracking-wide">Active Surveillance</p>
            <p className="text-[10px] text-slate-500 font-medium">
                Data nodes refresh every 30 seconds. Assets are cross-referenced with global exchanges.
            </p>
        </div>
      </div>

    </div>
  );
};

export default Watchlist;