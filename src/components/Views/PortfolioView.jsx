import React, { useState, useEffect } from 'react';
import Icon from '../UI/Icon';
import { coinLogos } from '../../utils/coinLogos'; // 1. Import Logos
import { getPortfolioData, deletePortfolioHolding } from '../../api/portfolio'; // 2. Import Portfolio APIs
import { refreshPrices } from '../../api/priceHistory'; // 3. Import Backend Refresh API

const PortfolioView = ({ onAddHolding, onEditHolding, onViewAsset }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- 1. Load Data Function ---
  const loadPortfolio = async () => {
    try {
      const data = await getPortfolioData();
      const enrichedData = data.map(item => ({
        ...item,
        name: item.assetSymbol, 
        symbol: item.assetSymbol,
        qty: Number(item.quantity),
        avgCost: Number(item.avgCost),
        currentPrice: Number(item.currentPrice),
        gradient: "from-blue-500 to-cyan-500",
        icon: item.assetSymbol.substring(0, 1)
      }));
      setPortfolio(enrichedData);
    } catch (error) {
      console.error("Error loading portfolio:", error);
    }
  };

  // Initial Load
  useEffect(() => {
    loadPortfolio();
  }, []);

  // --- 2. Handle Add Click ---
  const handleAddClick = () => {
     if (onAddHolding) onAddHolding();
     // Refresh after a short delay to show new addition
     setTimeout(() => loadPortfolio(), 500); 
  };

  // --- 3. Handle Backend Refresh (Calls Java Controller) ---
  const handleBackendRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Calls POST /api/prices/refresh
      await refreshPrices(); 
      // Reload table with updated prices from DB
      await loadPortfolio();
      alert("Prices refreshed successfully from server!");
    } catch (error) {
      console.error("Error refreshing prices:", error);
      alert("Failed to refresh prices. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // --- 4. Handle Delete ---
  const handleDelete = async (id) => {
    // Use fallback to symbol if ID is missing
    const identifier = id || portfolio.find(p => p.id === id)?.symbol;
    
    if (window.confirm(`Are you sure you want to delete this holding?`)) {
      try {
        await deletePortfolioHolding(identifier);
        loadPortfolio(); // Refresh table immediately
      } catch (error) {
        console.error("Error deleting holding:", error);
        alert("Failed to delete holding. Please try again.");
      }
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">Your Holdings</h3>
          <p className="text-gray-400">Click on any asset symbol to view detailed information</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button onClick={handleAddClick} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:from-cyan-400 hover:to-purple-400 transition-all shadow-lg text-white">
            <Icon name="plus" /><span>Add Holding</span> 
          </button> 
          
          {/* REFRESH BUTTON - Calls Java Backend */}
          <button 
            onClick={handleBackendRefresh} 
            disabled={isRefreshing}
            className={`flex items-center space-x-2 px-4 py-3 border rounded-lg font-semibold transition-all ${
              isRefreshing 
                ? "border-gray-600 bg-gray-800 text-gray-400 cursor-not-allowed" 
                : "border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
             <Icon name={isRefreshing ? "spinner" : "arrows-clockwise"} className={isRefreshing ? "animate-spin" : ""} /> 
             <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button onClick={onEditHolding} className="flex items-center space-x-2 px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg font-semibold hover:bg-gray-700 transition-all text-white">
            <Icon name="pencil-simple" /><span>Edit Holding</span> 
          </button>
        </div>
      </div>
      
      {/* Table */}
      <div className="bg-gray-900/50 neon-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                {['Asset Symbol', 'Asset Name', 'Quantity', 'Avg Cost', 'Current Price', 'Total Value', 'P&L', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {portfolio.map(asset => {
                // --- LOGIC: Official Logo vs Fallback ---
                const symbolUpper = asset.symbol?.toUpperCase(); 
                const officialLogo = coinLogos[symbolUpper];

                // --- LOGIC: Calculations ---
                const value = asset.qty * asset.currentPrice;
                const totalCost = asset.qty * asset.avgCost;
                const pl = value - totalCost;
                const plPercent = totalCost > 0 ? ((pl / totalCost) * 100).toFixed(2) : "0.00";
                const plClass = pl >= 0 ? 'text-green-400' : 'text-red-400';
                const sign = pl >= 0 ? '+' : '';

                return (
                  <tr key={asset.id || asset.symbol} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => onViewAsset(asset)} className="flex items-center space-x-2 font-bold text-lg text-cyan-400 hover:underline">
                        
                        {/* RENDER LOGIC: Check if official logo exists, else fallback */}
                        {officialLogo ? (
                           <img 
                             src={officialLogo} 
                             alt={asset.symbol} 
                             className="w-8 h-8 rounded-full object-cover" 
                           />
                        ) : (
                           <div className={`w-8 h-8 bg-gradient-to-br ${asset.gradient} rounded-full flex items-center justify-center font-bold text-white text-xs`}>
                             {asset.icon}
                           </div>
                        )}

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
                    
                    {/* DELETE BUTTON */}
                    <td className="px-6 py-4">
                      <button 
                        onClick={(e) => {
                           e.stopPropagation(); // Prevent row click
                           handleDelete(asset.id);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 rounded hover:bg-red-500/10"
                        title="Delete Holding"
                      >
                        <Icon name="trash" />
                      </button>
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