import React, { useMemo } from 'react';

const DashboardView = ({ portfolio }) => {
  const stats = useMemo(() => {
    const totalVal = portfolio.reduce((sum, asset) => sum + (asset.qty * asset.currentPrice), 0);
    const totalCost = portfolio.reduce((sum, asset) => sum + (asset.qty * asset.avgCost), 0);
    const pl = totalVal - totalCost;
    const plPercent = totalCost > 0 ? (pl / totalCost) * 100 : 0;
    
    return { totalVal, pl, plPercent };
  }, [portfolio]);

  return (
    <div className="fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/50 neon-border rounded-xl p-6 hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
          <div className="text-gray-400 text-sm mb-2">Total Portfolio Value</div>
          <div className="text-3xl font-bold text-white mb-1">
            ${stats.totalVal.toLocaleString(undefined, {maximumFractionDigits: 2})}
          </div>
          <div className={`${stats.pl >= 0 ? 'text-green-400' : 'text-red-400'} text-sm font-medium`}>
            {stats.pl >= 0 ? '+' : ''}${stats.pl.toLocaleString(undefined, {maximumFractionDigits: 2})} ({stats.plPercent.toFixed(2)}%)
          </div>
        </div>
        <div className="bg-gray-900/50 neon-border rounded-xl p-6 hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
          <div className="text-gray-400 text-sm mb-2">24h Change</div>
          <div className="text-3xl font-bold text-green-400 mb-1">+$4,231.82</div>
          <div className="text-green-400 text-sm font-medium">↑ 3.52%</div>
        </div>
        <div className="bg-gray-900/50 neon-border rounded-xl p-6 hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
          <div className="text-gray-400 text-sm mb-2">Total Assets</div>
          <div className="text-3xl font-bold text-white mb-1">{portfolio.length}</div>
          <div className="text-gray-400 text-sm">Across 3 exchanges</div>
        </div>
        <div className="bg-gray-900/50 neon-border rounded-xl p-6 hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
          <div className="text-gray-400 text-sm mb-2">Risk Score</div>
          <div className="text-3xl font-bold text-yellow-400 mb-1">Medium</div>
          <div className="text-yellow-400 text-sm font-medium">2 alerts active</div>
        </div>
      </div>

      <div className="bg-gray-900/50 neon-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Portfolio Performance (7D)</h3>
        <svg className="w-full" viewBox="0 0 800 200" style={{height: '200px'}}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:'#06b6d4', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#8b5cf6', stopOpacity:1}} />
            </linearGradient>
          </defs> 
          <polyline 
            className="chart-line" 
            fill="none" 
            stroke="url(#lineGradient)" 
            strokeWidth="3" 
            points="0,160 100,140 200,130 300,110 400,100 500,120 600,90 700,70 800,50" 
          />
        </svg>
      </div>
    </div>
  );
};

export default DashboardView;