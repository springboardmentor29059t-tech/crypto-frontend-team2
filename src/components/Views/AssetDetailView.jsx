import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../UI/Icon';
import { coinLogos } from '../../utils/coinLogos';
import { getPriceHistory } from '../../api/priceHistory';

const AssetDetailView = ({ asset, onBack }) => {
  if (!asset) return null;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('24 Hours');

  // Fetch History
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getPriceHistory(asset.symbol);
        console.log("API Response Count:", data.length);
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        setHistory([]); 
      } finally {
        setLoading(false);
      }
    };

    if (asset.symbol) {
      fetchData();
    }
  }, [asset.symbol]);

  // --- DYNAMIC CHART CALCULATION LOGIC ---
  const chartData = useMemo(() => {
    // 1. Check for data from API
    if (!Array.isArray(history) || history.length === 0) {
      return { status: 'empty_db', message: "Database is empty. Click 'Refresh' in Portfolio to fetch prices." };
    }

    const now = new Date();
    let filteredData = [];
    
    // Time Ranges in milliseconds
    const cutoffs = {
      '24 Hours': 24 * 60 * 60 * 1000,
      '30 Days': 30 * 24 * 60 * 60 * 1000,
      '3 Months': 90 * 24 * 60 * 60 * 1000,
      '1 Year': 365 * 24 * 60 * 60 * 1000
    };

    const cutoffTime = new Date(now.getTime() - (cutoffs[selectedRange] || 0));
    
    // Filter and Clean Data
    filteredData = history.filter(d => {
      if (!d) return false;
      
      // Handle Date
      const dateField = d.capturedAt || d.captured_at || d.timestamp;
      const itemDate = new Date(dateField);
      
      if (isNaN(itemDate.getTime())) return false; 
      return itemDate >= cutoffTime;
    });

    // 2. Check if data was filtered out (e.g. Data is old, but range is 24h)
    if (filteredData.length === 0) {
      const oldestDate = new Date(history[0].capturedAt || history[0].captured_at);
      return { 
        status: 'filtered_out', 
        message: `Found ${history.length} items, but all are older than ${selectedRange}. (Oldest: ${oldestDate.toLocaleDateString()}). Try '1 Year'.`,
        total: history.length
      };
    }

    // 3. Handle Single Data Point
    if (filteredData.length === 1) {
      filteredData.push({ ...filteredData[0] });
    }

    // 4. Calculate Prices SAFELY
    const prices = filteredData.map(d => {
      let rawPrice = d.priceUsd || d.price_usd || d.price || "0";
      let cleanPrice = parseFloat(String(rawPrice).replace(/[^0-9.-]+/g, ""));
      return isNaN(cleanPrice) ? 0 : cleanPrice;
    });

    let minPrice = Math.min(...prices);
    let maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      minPrice = minPrice * 0.95;
      maxPrice = maxPrice * 1.05;
    } else {
      const padding = (maxPrice - minPrice) * 0.05;
      minPrice -= padding;
      maxPrice += padding;
    }

    const priceRange = maxPrice - minPrice;

    // --- UPDATED SVG DIMENSIONS ---
    // Increased Width: 950 -> 1200
    // Increased Height: 320 -> 400
    const widthStart = 80;   // Left margin for Y-axis (increased slightly)
    const widthEnd = 1150;   // Right boundary (increased)
    const heightTop = 60;    // Top boundary (increased)
    const heightBottom = 350;// Bottom boundary (increased)
    const drawingWidth = widthEnd - widthStart;
    const drawingHeight = heightBottom - heightTop;

    // 5. Generate Points String
    const points = filteredData.map((d, index) => {
      const x = widthStart + (index / (filteredData.length - 1)) * drawingWidth;
      
      let rawPrice = d.priceUsd || d.price_usd || d.price || "0";
      let currentPrice = parseFloat(String(rawPrice).replace(/[^0-9.-]+/g, ""));
      
      const normalizedPrice = (currentPrice - minPrice) / (priceRange === 0 ? 1 : priceRange);
      const y = heightBottom - (normalizedPrice * drawingHeight);
      
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    // 6. Generate Labels
    const yLabels = [
      `$${maxPrice.toFixed(2)}`,
      `$${(minPrice + priceRange * 0.66).toFixed(2)}`,
      `$${(minPrice + priceRange * 0.33).toFixed(2)}`,
      `$${minPrice.toFixed(2)}`,
    ];

    const xLabels = [];
    const steps = 5;
    // Recalculate X Label positions based on new width (80 to 1150)
    const xPos = [80, 347, 615, 882, 1150];

    for (let i = 0; i < steps; i++) {
      const index = Math.floor((i / (steps - 1)) * (filteredData.length - 1));
      const dataPoint = filteredData[index];
      if (dataPoint) {
        const dateField = dataPoint.capturedAt || dataPoint.captured_at;
        const date = new Date(dateField);
        let labelStr = "";
        if (selectedRange === '24 Hours') {
          labelStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
          labelStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
        xLabels.push(labelStr);
      }
    }

    return { status: 'ok', points, yLabels, xLabels, xPos };
  }, [history, selectedRange]);

  // Latest Data Logic
  const latestSnapshot = history && history.length > 0 ? history[history.length - 1] : null;
  const rawCurrentPrice = latestSnapshot ? (latestSnapshot.priceUsd || latestSnapshot.price_usd) : asset.currentPrice;
  const currentPrice = parseFloat(String(rawCurrentPrice).replace(/[^0-9.-]+/g, "")) || 0;
  
  const rawMarketCap = latestSnapshot ? (latestSnapshot.marketCap || latestSnapshot.market_cap) : null;
  const marketCap = rawMarketCap ? parseFloat(String(rawMarketCap).replace(/[^0-9.-]+/g, "")) : null;

  const symbolUpper = asset.symbol?.toUpperCase();
  const officialLogo = coinLogos[symbolUpper];

  const formatCurrency = (val) => {
    if (!val) return "$0.00";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="fade-in">
      {/* Header Section */}
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 mb-4 transition-colors">
          <Icon name="arrow-left" /><span>Back to Portfolio</span> 
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {officialLogo ? (
               <img src={officialLogo} alt={asset.symbol} className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-gray-700" />
            ) : (
               <div className={`w-20 h-20 bg-gradient-to-br ${asset.gradient} rounded-full flex items-center justify-center font-bold text-white text-3xl shadow-lg border-2 border-gray-700`}>
                 {asset.icon}
               </div>
            )}
            <div>
              <h1 className="text-4xl font-bold text-white">{asset.name}</h1>
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-xl text-gray-400">{asset.symbol}</span> 
                <span className="text-gray-600">•</span> 
                <span className="text-gray-400">Rank #1</span> 
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-full">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
         <div className="bg-gray-900/50 neon-border rounded-xl p-6">
           <div className="text-gray-400 text-sm mb-2">Current Price</div>
           <div className="text-2xl font-bold text-white mb-1">
             {loading ? "..." : formatCurrency(currentPrice)}
           </div>
           <div className="text-green-400 text-sm font-medium">↑ 2.45%</div>
         </div>
         <div className="bg-gray-900/50 neon-border rounded-xl p-6">
           <div className="text-gray-400 text-sm mb-2">Market Cap</div>
           <div className="text-2xl font-bold text-white mb-1">
             {loading ? "..." : (marketCap ? formatCurrency(marketCap) : "N/A")}
           </div>
           <div className="text-gray-400 text-sm">Vol: {loading ? "..." : "$32.5B"}</div>
         </div>
         <div className="bg-gray-900/50 neon-border rounded-xl p-6">
           <div className="text-gray-400 text-sm mb-2">Your Holdings</div>
           <div className="text-2xl font-bold text-white mb-1">{asset.qty} {asset.symbol}</div>
           <div className="text-gray-400 text-sm">{formatCurrency(asset.qty * currentPrice)}</div>
         </div>
      </div>

      {/* Dynamic Chart */}
      <div className="bg-gray-900/50 neon-border rounded-xl p-6 mb-8 min-h-[480px]"> {/* Increased min-h to accommodate taller chart */}
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Price History ({selectedRange})</h3>
            <div className="flex space-x-2 text-xs">
               {['24 Hours', '30 Days', '3 Months', '1 Year'].map((range) => (
                 <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className={`px-3 py-1 rounded transition-all ${
                      selectedRange === range 
                        ? "bg-yellow-500 text-black font-bold" 
                        : "text-gray-500 hover:text-white hover:bg-gray-800"
                    }`}
                 >
                    {range}
                 </button>
               ))}
            </div>
         </div>
         
         {/* SVG Chart or Diagnostic Message */}
         {loading ? (
            <div className="text-center text-gray-500 py-10 flex flex-col items-center justify-center h-[400px]">
               Loading Chart Data...
            </div>
         ) : chartData?.status === 'ok' ? (
            // UPDATED: viewBox="0 0 1200 400" and height="400px"
            <svg className="w-full" viewBox="0 0 1200 400" style={{height: '400px', display: 'block'}}>
              <defs>
                <linearGradient id="chartGradientFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#FACC15', stopOpacity:0.3}} />
                  <stop offset="100%" style={{stopColor:'#FACC15', stopOpacity:0}} />
                </linearGradient>
              </defs> 
              {/* UPDATED Grid Lines to match new width (80 to 1150) and height (60 to 350) */}
              <g stroke="#333" strokeWidth="1" strokeDasharray="4 4">
                <line x1="80" y1="60" x2="1150" y2="60" />
                <line x1="80" y1="132" x2="1150" y2="132" />
                <line x1="80" y1="205" x2="1150" y2="205" />
                <line x1="80" y1="277" x2="1150" y2="277" />
                <line x1="80" y1="350" x2="1150" y2="350" />
              </g>
              
              {/* Y-Axis Labels */}
              <g fill="#666" fontSize="12" textAnchor="end">
                <text x="70" y="64">{chartData.yLabels[0]}</text>
                <text x="70" y="136">{chartData.yLabels[1]}</text>
                <text x="70" y="209">{chartData.yLabels[2]}</text>
                <text x="70" y="281">{chartData.yLabels[3]}</text>
              </g>

              {/* X-Axis Labels */}
              <g fill="#666" fontSize="12" textAnchor="middle">
                {chartData.xLabels.map((label, index) => (
                  <text key={index} x={chartData.xPos[index]} y="380">{label}</text>
                ))}
              </g>

              {/* Area Fill & Line */}
              {/* UPDATED Polygon closing points to match widthEnd (1150) and heightBottom (350) */}
              <polygon fill="url(#chartGradientFill)" points={`${chartData.points} 1150,350 80,350`} /> 
              <polyline fill="none" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={chartData.points} />
              
              {/* Data Points */}
              {chartData.points.split(' ').length < 20 && chartData.points.split(' ').map((point) => {
                  const parts = point.split(',');
                  if (parts.length !== 2) return null;
                  const cx = parts[0];
                  const cy = parts[1];
                  if (isNaN(cx) || isNaN(cy)) return null;
                  return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="#000" stroke="#FACC15" strokeWidth="2" />;
              })}
            </svg>
         ) : (
            <div className="text-center py-10 flex flex-col items-center justify-center h-[400px]">
               <div className="text-red-400 font-bold mb-2 text-lg">
                  {chartData?.status === 'empty_db' ? 'Database Empty' : 'Data Filtered Out'}
               </div>
               <div className="text-gray-400 max-w-md text-center bg-gray-800 p-4 rounded border border-gray-700">
                  {chartData?.message}
               </div>
               <div className="mt-4 text-sm text-gray-500">
                  Tip: Click 'Refresh' in the Portfolio page to fetch new prices from the server.
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default AssetDetailView;