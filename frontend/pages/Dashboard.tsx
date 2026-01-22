import React, { useState } from 'react';
import { LiveMarketSection } from '../components/dashboard/LiveMarketSection';
import { UserPortfolioSection } from '../components/dashboard/UserPortfolioSection';
import { Layers, Globe } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio'>('market');

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">

      {/* Tab Navigation (Optional, or just stack them) */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-900/50 p-2 rounded-2xl flex gap-2 border border-slate-800 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('market')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'market' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
          >
            <Globe size={16} /> Global Market
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'portfolio' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-slate-500 hover:text-white'}`}
          >
            <Layers size={16} /> Personal Node
          </button>
        </div>
      </div>

      {/* Sections with Visual Headers */}
      {activeTab === 'market' && (
        <div className="space-y-6 animate-fade-in">
          <div className="relative h-48 md:h-64 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 to-slate-900/60 z-10"></div>
            <img
              src="/assets/global_node_visual.png"
              alt="Global Market Intelligence"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 p-8 z-20">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <Globe className="text-cyan-400" /> Global Node
              </h2>
              <p className="text-cyan-100/70 font-bold uppercase tracking-widest text-xs mt-2">Live Market Intelligence Stream</p>
            </div>
          </div>
          <LiveMarketSection />
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="space-y-6 animate-fade-in">
          <div className="relative h-48 md:h-64 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-900/40 to-slate-900/60 z-10"></div>
            <img
              src="/assets/personal_node_visual.png"
              alt="Personal Portfolio Node"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 p-8 z-20">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <Layers className="text-violet-400" /> Personal Node
              </h2>
              <p className="text-violet-100/70 font-bold uppercase tracking-widest text-xs mt-2">Secure Asset Management Protocol</p>
            </div>
          </div>
          <UserPortfolioSection />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
