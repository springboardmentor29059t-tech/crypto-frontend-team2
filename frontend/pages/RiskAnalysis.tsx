import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, AlertTriangle, Zap, Info, Search, RefreshCw, Skull, ShieldX, BellRing, Smartphone, Mail, Send, FileText, Globe, Layers, Activity, PieChart
} from 'lucide-react';
import { RiskAlert } from '../types';
import { mockApi, downloadRiskPdf, getGlobalRisk, getPersonalRisk } from '../services/api';
import { usePersonalNode } from '../PersonalNodeContext';

const RiskAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'personal'>('personal');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [autoAlert, setAutoAlert] = useState(false);
  const { assets } = usePersonalNode();

  const loadData = async () => {
    setLoading(true);
    try {
      let result;
      if (activeTab === 'global') {
        result = await getGlobalRisk();
      } else {
        result = await getPersonalRisk();
      }
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, assets]);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
            <ShieldCheck className="text-yellow-500" size={32} />
            Risk Analysis
          </h1>
          <p className="text-slate-400">Forensic audit of Global Markets and Personal Exposure.</p>
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'global' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            <Globe size={16} /> Global Node
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'personal' ? 'bg-yellow-500 text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            <Layers size={16} /> Personal Node
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analysis Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`p-10 rounded-[2.5rem] border transition-all ${data?.riskLevel === 'HIGH' || data?.riskLevel === 'CRITICAL' ? 'bg-red-500/5 border-red-500/20' :
            data?.riskLevel === 'MEDIUM' ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-green-500/5 border-green-500/20'
            }`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                {activeTab === 'global' ? <Activity className="text-indigo-500" /> : <PieChart className="text-yellow-500" />}
                {activeTab === 'global' ? 'Market Volatility' : 'Asset Concentration'}
              </h2>
              <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${data?.riskLevel === 'HIGH' ? 'bg-red-500 text-white' :
                data?.riskLevel === 'MEDIUM' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-black'
                }`}>
                Risk: {data?.riskLevel || 'ANALYZING...'}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="animate-spin text-slate-500" size={40} />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
                      {activeTab === 'global' ? 'Market Volatility' : 'Concentration Risk'}
                    </div>
                    <div className={`text-3xl font-black ${data?.riskLevel === 'HIGH' ? 'text-red-500' : 'text-white'}`}>
                      {Math.round(data?.riskScore || 0)}/100
                    </div>
                  </div>

                  <div className="text-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
                      {activeTab === 'global' ? 'Market Diversity' : 'Diversity Score'}
                    </div>
                    <div className="text-3xl font-black text-indigo-400">
                      {Math.round(data?.diversityScore || 0)}/100
                    </div>
                  </div>

                  <div className="text-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
                      {activeTab === 'global' ? 'Dominant Asset' : 'Top Asset'}
                    </div>
                    <div className="text-2xl font-black text-white uppercase truncate">
                      {data?.maxAllocationAsset || 'None'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">{data?.maxAllocationPct?.toFixed(1)}% Dominance</div>
                  </div>

                  <div className="text-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
                      Stablecoin Share
                    </div>
                    <div className="text-3xl font-black text-green-400">
                      {Math.round(data?.stablecoinRatio || 0)}%
                    </div>
                  </div>
                </div>

                {/* Portfolio Distribution List (Global & Personal) */}
                {data?.portfolioDistribution?.length > 0 && (
                  <div className="border-t border-slate-800 pt-8">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
                      {activeTab === 'global' ? 'Global Market Composition (Top 20)' : 'Portfolio Composition Audit'}
                    </h3>
                    <div className="space-y-4">
                      {data.portfolioDistribution.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 group">
                          <div className="w-16 text-sm font-black text-white">{item.symbol}</div>
                          <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${item.symbol === data.maxAllocationAsset ? 'bg-red-500' :
                                ['USDT', 'USDC', 'DAI', 'FDUSD'].includes(item.symbol) ? 'bg-green-500' : 'bg-indigo-500'
                                }`}
                              style={{ width: `${Math.min(item.percentage, 100)}%` }} // Cap visual at 100% just in case
                            ></div>
                          </div>
                          <div className="w-16 text-right text-xs font-bold text-slate-400">
                            {item.percentage.toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-slate-800 text-center">
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                {activeTab === 'global'
                  ? "Global risk analysis is derived from 24h market cap volatility and total volume trends."
                  : "Personal risk analysis measures portfolio diversification using the HHI index. Lower concentration scores indicate better diversification."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8">
            <h3 className="text-white font-bold mb-6 uppercase tracking-tight">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={loadData}
                disabled={loading}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-xs"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh Nodes
              </button>
              <button
                onClick={downloadRiskPdf}
                className="w-full border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-xs"
              >
                <FileText size={16} />
                Export Audit
              </button>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">Security<br />Protocol</h3>
              <p className="text-indigo-200 text-xs font-bold leading-relaxed mb-6">
                Automated surveillance active.
              </p>
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-md">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">System Operational</span>
              </div>
            </div>
            <ShieldCheck size={120} className="absolute bottom-[-40px] right-[-40px] text-white/10 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
