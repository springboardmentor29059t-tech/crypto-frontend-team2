import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  ShieldCheck, ShieldAlert, Activity, RefreshCcw,
  Lock, AlertTriangle, Fingerprint, Search, PieChart,
  CheckCircle2, XCircle, ScanLine, Wallet, TrendingUp
} from 'lucide-react';

const RiskAnalysis = () => {
  const { setIsScanning } = useOutletContext();

  const [holdings, setHoldings] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [riskReports, setRiskReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [scanningAsset, setScanningAsset] = useState(null);

  // 🔄 1. FETCH PORTFOLIO & MARKET DATA
  const loadData = async () => {
    try {
      const [holdingsRes, marketRes] = await Promise.all([
        api.get('/portfolio/holdings'),
        api.get('/portfolio/market-data')
      ]);

      const rawHoldings = holdingsRes.data.holdings || [];
      setHoldings(rawHoldings);

      const normalizedMarketData = {};
      if (Array.isArray(marketRes.data)) {
          marketRes.data.forEach(coin => {
              normalizedMarketData[coin.id.toLowerCase()] = coin;
          });
      }
      setMarketData(normalizedMarketData);

      // Auto-trigger scan if we have assets
      if (rawHoldings.length > 0) {
        runFullAudit(rawHoldings);
      } else {
        setLoading(false);
      }

    } catch (err) {
      console.error("Risk Data Sync Failed", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🕵️ 2. RUN FORENSIC AUDIT (Technical Risk)
  const runFullAudit = async (assets) => {
    setIsScanning(true);
    const reports = { ...riskReports }; // Keep existing reports while scanning

    for (const asset of assets) {
      const id = (asset.assetId || asset.id || '').toLowerCase().trim();
      if (!id) continue;

      // Skip if already verified and safe (Optimization)
      if (reports[id] && reports[id].riskScore < 20) continue;

      setScanningAsset(asset.assetName || id);
      try {
        const res = await api.post('/portfolio/risk-report', { assetId: id });
        reports[id] = res.data;
        // 🚀 FASTER SCAN: Reduced delay to 100ms since backend is now cached
        await new Promise(r => setTimeout(r, 100));
      } catch (e) {
        reports[id] = { riskScore: 50, label: "UNVERIFIED", threats: ["Scan Timeout"] };
      }
      // Live update the state so cards flip one by one
      setRiskReports({ ...reports });
    }

    setScanningAsset(null);
    setIsScanning(false);
    setLoading(false);
  };

  // 📊 3. HYBRID RISK LOGIC (5-Tier Allocation)
  const metrics = useMemo(() => {
    let totalValue = 0;

    // Step A: Calculate Total Portfolio Value
    const assetValues = holdings.map(h => {
        const id = (h.assetId || '').toLowerCase().trim();
        const marketPrice = marketData[id]?.current_price;
        const costPrice = parseFloat(h.avgCost);
        const price = marketPrice || costPrice || 0;
        const qty = parseFloat(h.quantity) || 0;
        const val = price * qty;
        totalValue += val;

        return {
            ...h,
            val,
            cleanId: id, // Normalized ID for matching
            symbol: h.assetSymbol || marketData[id]?.symbol || h.assetId,
            name: h.assetName || marketData[id]?.name || h.assetId,
            rank: marketData[id]?.market_cap_rank || 'N/A'
        };
    });

    let totalRisk = 0;
    let verifiedCount = 0;

    // Step B: Calculate Risk & Apply 5-Tier Logic
    const exposureList = assetValues.map(h => {
        // 1. Technical Risk (From Backend)
        // Default to Score 50 (Neutral) if scanning
        const report = riskReports[h.cleanId] || { riskScore: 50, label: "ANALYZING" };

        let baseRisk = report.riskScore || 0;
        let finalRiskScore = baseRisk;
        let finalLabel = report.label || "ANALYZING";
        let finalStrategy = report.recommendation || "WAIT";
        let riskSource = "Technical";

        // ✅ Count as Verified if Score is Low OR explicitly marked "VERIFIED"
        if (baseRisk < 50 || finalLabel.includes("VERIFIED")) {
            verifiedCount++;
        }

        // 2. Financial Risk (5-Tier Logic)
        const concentration = totalValue > 0 ? (h.val / totalValue) * 100 : 0;

        let allocationLabel = "";
        let allocationColor = "";

        // --- 🚨 5-TIER ALLOCATION RULES 🚨 ---
        if (concentration > 60) {
            allocationLabel = "OVER ALLOCATION";
            allocationColor = "bg-rose-600";
            if (finalRiskScore < 85) {
                finalRiskScore = 90;
                finalLabel = allocationLabel;
                finalStrategy = "REDUCE URGENTLY";
                riskSource = "Financial";
            }
        } else if (concentration > 40) {
            allocationLabel = "HIGH ALLOCATION";
            allocationColor = "bg-rose-400";
            if (finalRiskScore < 60) {
                finalRiskScore = 70;
                finalLabel = allocationLabel;
                finalStrategy = "REBALANCE";
                riskSource = "Financial";
            }
        } else if (concentration > 20) {
            allocationLabel = "MODERATE ALLOCATION";
            allocationColor = "bg-amber-400";
        } else if (concentration > 5) {
            allocationLabel = "LOW ALLOCATION";
            allocationColor = "bg-emerald-400";
        } else {
            allocationLabel = "UNDER ALLOCATION";
            allocationColor = "bg-blue-400";
        }

        totalRisk += finalRiskScore;

        return {
            ...h,
            concentration,
            riskScore: finalRiskScore,
            label: finalLabel,
            status: finalStrategy,
            source: riskSource,
            allocationLabel,
            allocationColor,
            threats: report.threats || []
        };
    }).sort((a, b) => b.concentration - a.concentration);

    const avgRisk = holdings.length > 0 ? totalRisk / holdings.length : 0;
    // Security Index is 100 - Avg Risk (0 Risk = 100 Secure)
    const securityIndex = Math.max(0, 100 - avgRisk);

    return { totalValue, securityIndex, verifiedCount, exposureList };
  }, [holdings, riskReports, marketData]);

  // 🎨 STYLES
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getRiskCardStyle = (score) => {
      if (score >= 80) return 'border-rose-500/50 bg-rose-500/5 hover:bg-rose-500/10';
      if (score >= 60) return 'border-orange-500/50 bg-orange-500/5 hover:bg-orange-500/10';
      if (score >= 40) return 'border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10';
      return 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10';
  };

  if (loading && !holdings.length) return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
       <RefreshCcw className="animate-spin text-blue-500" size={40} />
       <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
          Running Financial Diagnostics...
       </p>
    </div>
  );

  return (
    <div className="space-y-8 pb-24 font-sans animate-in fade-in duration-700 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/5 pb-4">
        <div>
            <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-lg shadow-lg">
                    <ShieldCheck size={18} className="text-emerald-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Risk & Security</h1>
                    <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                        Technical Audit • Financial Exposure • Allocation Logic
                    </p>
                </div>
            </div>
        </div>
        <button
            onClick={() => runFullAudit(holdings)}
            disabled={!!scanningAsset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-white/10 hover:bg-slate-800 hover:border-emerald-500/30 transition-all rounded-lg group"
        >
            <RefreshCcw size={14} className={`text-slate-400 group-hover:text-emerald-400 ${scanningAsset ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white">
                {scanningAsset ? `Scanning ${scanningAsset}...` : 'Re-Scan'}
            </span>
        </button>
      </div>

      {/* --- DASHBOARD GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. GLOBAL SECURITY INDEX */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className={`absolute inset-0 opacity-10 blur-3xl pointer-events-none ${metrics.securityIndex >= 80 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            <div className="relative mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent"
                        strokeDasharray={351}
                        strokeDashoffset={351 - (351 * metrics.securityIndex) / 100}
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ${getScoreColor(metrics.securityIndex)}`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{metrics.securityIndex.toFixed(0)}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">/ 100</span>
                </div>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mb-1">Global Security Index</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {metrics.verifiedCount} / {holdings.length} Assets Verified
            </p>
        </div>

        {/* 2. RESOLUTION CENTER */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <Lock size={16} className="text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Resolution Center</h3>
            </div>
            <div className="flex-1 space-y-3">
                <div className={`p-4 rounded-xl border flex items-start gap-4 ${metrics.securityIndex < 60 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                    <div className={`p-2 rounded-full ${metrics.securityIndex < 60 ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                        {metrics.securityIndex < 60 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                    </div>
                    <div>
                        <h4 className={`text-sm font-bold uppercase tracking-wide ${metrics.securityIndex < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {metrics.securityIndex < 60 ? 'Financial Risk Detected' : 'System Secure'}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {metrics.securityIndex < 60
                                ? "Critical Risk: Asset allocation thresholds exceeded. Check Exposure Intelligence for Over Allocation warnings."
                                : "Portfolio integrity verified. Asset allocation and contract security are within safe parameters."}
                        </p>
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* --- EXPOSURE INTELLIGENCE --- */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 mb-6">
              <PieChart size={16} className="text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Exposure Intelligence & Risk</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.exposureList.map(asset => (
                  <div key={asset.id} className={`p-4 rounded-xl border transition-all group ${getRiskCardStyle(asset.riskScore)}`}>
                      <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-white/10">
                                <span className="font-bold text-[10px] text-white">{asset.symbol?.slice(0,3).toUpperCase()}</span>
                              </div>
                              <div className="overflow-hidden">
                                  <span className="block text-xs font-bold text-white truncate max-w-[80px]" title={asset.name}>{asset.name}</span>
                                  <span className="text-[9px] text-slate-400 font-mono">#{asset.rank}</span>
                              </div>
                          </div>
                          <div className="text-right">
                              <span className="text-sm font-black text-white block">{asset.concentration.toFixed(1)}%</span>
                              <span className="text-[8px] text-slate-500 font-bold uppercase">Allocation</span>
                          </div>
                      </div>

                      {/* Dynamic 5-Tier Progress Bar */}
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-3">
                          <div className={`h-full ${asset.allocationColor}`} style={{ width: `${Math.max(2, asset.concentration)}%` }}></div>
                      </div>

                      <div className="flex justify-between items-end border-t border-white/5 pt-2">
                          <div>
                              <p className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Classification</p>
                              <span className="text-[9px] font-bold uppercase text-slate-300">
                                  {asset.allocationLabel}
                              </span>
                          </div>

                          <div className="text-right">
                              <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded border ${
                                  asset.riskScore > 75 ? 'bg-rose-500 text-white border-rose-600 shadow-lg shadow-rose-900/20' :
                                  asset.riskScore > 60 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                  asset.riskScore > 40 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              }`}>
                                  {asset.label}
                              </span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
};

export default RiskAnalysis;