import React from 'react';
import Icon from '../UI/Icon';

const PortfolioView = ({ portfolio, onAddHolding, onEditHolding, onViewAsset }) => {
  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">Your Holdings</h3>
          <p className="text-gray-400">Click on any asset symbol to view detailed information</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={onAddHolding} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:from-cyan-400 hover:to-purple-400 transition-all shadow-lg">
            <Icon name="plus" /><span>Add Holding</span> 
          </button> 
          <button onClick={onEditHolding} className="flex items-center space-x-2 px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg font-semibold hover:bg-gray-700 transition-all">
            <Icon name="pencil-simple" /><span>Edit Holding</span> 
          </button>
        </div>
      </div>
      
      <div className="bg-gray-900/50 neon-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                {['Asset Symbol', 'Asset Name', 'Quantity', 'Avg Cost', 'Current Price', 'Total Value', 'P&L'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {portfolio.map(asset => {
                const value = asset.qty * asset.currentPrice;
                const pl = value - (asset.qty * asset.avgCost);
                const plPercent = ((pl / (asset.qty * asset.avgCost)) * 100).toFixed(2);
                const plClass = pl >= 0 ? 'text-green-400' : 'text-red-400';
                const sign = pl >= 0 ? '+' : '';

                return (
                  <tr key={asset.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => onViewAsset(asset)} className="flex items-center space-x-2 font-bold text-lg text-cyan-400 hover:underline">
                        <div className={`w-8 h-8 bg-gradient-to-br ${asset.gradient} rounded-full flex items-center justify-center font-bold text-white text-xs`}>
                          {asset.icon}
                        </div>
                        <span>{asset.symbol}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{asset.name}</td>
                    <td className="px-6 py-4 text-white font-semibold">{asset.qty} {asset.symbol}</td>
                    <td className="px-6 py-4 text-gray-300">${asset.avgCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 text-white">${asset.currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 text-white font-bold text-lg">${value.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                    <td className="px-6 py-4">
                      <div className={`${plClass} font-semibold`}>{sign}${pl.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                      <div className={`text-xs ${plClass}`}>{sign}{plPercent}%</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;