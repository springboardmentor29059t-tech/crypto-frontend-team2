import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw 
} from 'lucide-react';

// --- Helper: Format Market Cap (e.g., 1200000000 -> $1.2B) ---
const formatCompactNumber = (number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(number);
};

// --- Component ---
const MarketPage = ({ onTrade }) => {
  const [coins, setCoins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'cap', direction: 'desc' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. Fetch Data from CoinGecko API ---
  const fetchMarketData = async () => {
    try {
      // Note: You might need to add ?x_cg_demo_api_key=YOUR_KEY if using a pro key
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false'
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      // Map API data to our component structure
      const mappedData = data.map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price,
        change: coin.price_change_percentage_24h,
        cap: formatCompactNumber(coin.market_cap), // Format the raw number here
        image: coin.image // CoinGecko provides the direct image URL
      }));

      setCoins(mappedData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load market data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchMarketData();

    // Set interval to update every 60 seconds (CoinGecko Free Tier Limit is ~10-30 calls/min)
    const interval = setInterval(fetchMarketData, 60000);

    return () => clearInterval(interval);
  }, []);

  // --- 2. Filtering & Sorting Logic ---
  const filteredAndSortedCoins = useMemo(() => {
    let processedCoins = [...coins];

    // Filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      processedCoins = processedCoins.filter(
        coin => 
          coin.name.toLowerCase().includes(lowerTerm) || 
          coin.symbol.toLowerCase().includes(lowerTerm)
      );
    }

    // Sort
    processedCoins.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      // Handle string sorting vs number sorting
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return processedCoins;
  }, [coins, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // --- Helpers ---
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
    }).format(price);
  };

  const getChangeColor = (val) => val >= 0 ? 'text-emerald-400' : 'text-rose-400';
  const getChangeBg = (val) => val >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10';

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Market Overview</h2>
            <p className="text-slate-400 text-sm mt-1">Real-time prices (CoinGecko API)</p>
          </div>
          {isLoading && (
             <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button 
             onClick={fetchMarketData}
             className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
             title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* --- Market Table --- */}
      <div className="flex-1 overflow-hidden bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col">
        
        {/* Loading State */}
        {isLoading && coins.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-slate-500 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
              <p>Loading market data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-red-400 max-w-md">
              <p className="font-bold mb-2">Connection Error</p>
              <p className="text-sm text-slate-400 mb-4">{error}</p>
              <button onClick={fetchMarketData} className="text-cyan-400 hover:underline">Try Again</button>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/30">
                  {[
                    { key: 'name', label: 'Asset' },
                    { key: 'price', label: 'Price' },
                    { key: 'change', label: '24h Change' },
                    { key: 'cap', label: 'Market Cap' },
                    { key: 'action', label: '' },
                  ].map((col) => (
                    <th 
                      key={col.key}
                      onClick={() => col.key !== 'action' && handleSort(col.key)}
                      className={`p-4 text-xs font-semibold tracking-wider uppercase text-slate-400 
                        ${col.key !== 'action' ? 'cursor-pointer hover:text-white transition-colors' : ''}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        {col.label}
                        {sortConfig.key === col.key && (
                          <ArrowUpDown className={`w-3 h-3 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCoins.map((coin) => (
                  <tr key={coin.id} className="group border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                    
                    {/* Asset Column */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Using CoinGecko's direct image URL */}
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm border border-slate-700">
                          <img 
                            src={coin.image} 
                            alt={coin.name} 
                            className="w-6 h-6 object-contain" 
                          />
                        </div>
                        <div>
                          <div className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                            {coin.name}
                          </div>
                          <div className="text-xs text-slate-500">{coin.symbol}</div>
                        </div>
                      </div>
                    </td>

                    {/* Price Column */}
                    <td className="p-4">
                      <span className={`font-mono text-white transition-all duration-500 ${
                        coin.change > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {formatPrice(coin.price)}
                      </span>
                    </td>

                    {/* Change Column */}
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getChangeBg(coin.change)} ${getChangeColor(coin.change)}`}>
                        {coin.change >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {coin.change !== null ? Math.abs(coin.change).toFixed(2) : '0.00'}%
                      </div>
                    </td>

                    {/* Market Cap Column */}
                    <td className="p-4 text-slate-300 font-mono text-sm hidden md:table-cell">
                      {coin.cap}
                    </td>

                    {/* Action Column */}
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => onTrade(coin)} 
                        className="px-3 py-1.5 text-xs font-medium text-cyan-400 border border-cyan-500/30 rounded-md hover:bg-cyan-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Empty State (Search only) */}
        {!isLoading && !error && filteredAndSortedCoins.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No assets found matching "{searchTerm}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPage;