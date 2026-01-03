import React from 'react';
import Icon from '../UI/Icon';

const AssetDetailView = ({ asset, onBack }) => {
  if (!asset) return null;
  return (
    <div className="fade-in">
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 mb-4 transition-colors">
          <Icon name="arrow-left" /><span>Back to Portfolio</span> 
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-20 h-20 bg-gradient-to-br ${asset.gradient} rounded-full flex items-center justify-center font-bold text-white text-3xl`}>{asset.icon}</div>
            <div>
              <h1 className="text-4xl font-bold text-white">{asset.name}</h1>
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-xl text-gray-400">{asset.symbol}</span> 
                <span className="text-gray-600">•</span> 
                <span className="text-gray-400">Rank #1</span> 
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-full">LOW RISK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
         <div className="bg-gray-900/50 neon-border rounded-xl p-6">
           <div className="text-gray-400 text-sm mb-2">Current Price</div>
           <div className="text-2xl font-bold text-white mb-1">${asset.currentPrice.toLocaleString()}</div>
           <div className="text-green-400 text-sm font-medium">↑ 2.45%</div>
         </div>
         <div className="bg-gray-900/50 neon-border rounded-xl p-6">
           <div className="text-gray-400 text-sm mb-2">Market Cap</div>
           <div className="text-2xl font-bold text-white mb-1">$825.4B</div>
           <div className="text-gray-400 text-sm">Vol: $32.5B</div>
         </div>
         <div className="bg-gray-900/50 neon-border rounded-xl p-6">
           <div className="text-gray-400 text-sm mb-2">Your Holdings</div>
           <div className="text-2xl font-bold text-white mb-1">{asset.qty} {asset.symbol}</div>
           <div className="text-gray-400 text-sm">${(asset.qty * asset.currentPrice).toLocaleString()}</div>
         </div>
      </div>
      <div className="bg-gray-900/50 neon-border rounded-xl p-6 mb-8">
         <h3 className="text-lg font-semibold mb-4">Price Chart (30D)</h3>
         <svg className="w-full" viewBox="0 0 900 300" style={{height: '300px'}}>
           <defs>
             <linearGradient id="chartGradientFill" x1="0%" y1="0%" x2="0%" y2="100%">
               <stop offset="0%" style={{stopColor:'#06b6d4', stopOpacity:0.3}} />
               <stop offset="100%" style={{stopColor:'#06b6d4', stopOpacity:0}} />
             </linearGradient>
           </defs> 
           <polygon fill="url(#chartGradientFill)" points="0,280 0,200 100,190 200,180 300,150 400,140 500,160 600,130 700,110 800,100 900,85 900,280" /> 
           <polyline className="chart-line" fill="none" stroke="#06b6d4" strokeWidth="3" points="0,200 100,190 200,180 300,150 400,140 500,160 600,130 700,110 800,100 900,85" />
         </svg>
      </div>
    </div>
  );
};

export default AssetDetailView;