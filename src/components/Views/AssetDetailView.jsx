import React, { useState } from 'react';
import Icon from '../UI/Icon';

const AssetDetailView = ({ asset, onBack }) => {
  if (!asset) return null;

  const [selectedRange, setSelectedRange] = useState('24 Hours');

  // 1. Updated Data Dictionary: Now includes 'xLabels' for Time or Date
  const chartData = {
    "24 Hours": {
      points: "70,200 160,210 250,180 340,220 430,170 520,190 610,150 700,180 790,130 880,150 930,110",
      yLabels: ["₹80,200", "₹79,800", "₹79,400", "₹79,000"],
      // Showing Time (PM/AM)
      xLabels: ["3:32 PM", "5:45 PM", "8:00 PM", "10:15 PM", "1:00 AM"]
    },
    "30 Days": {
      points: "70,240 160,220 250,230 340,180 430,200 520,150 610,170 700,120 790,140 880,90 930,110",
      yLabels: ["₹82,000", "₹81,000", "₹80,000", "₹79,000"],
      // Showing Dates (Day/Month)
      xLabels: ["Nov 01", "Nov 08", "Nov 15", "Nov 22", "Dec 01"]
    },
    "3 Months": {
      points: "70,150 160,180 250,220 340,200 430,230 520,180 610,160 700,120 790,100 880,130 930,80",
      yLabels: ["₹75,000", "₹73,000", "₹71,000", "₹69,000"],
      // Showing Dates (Month/Day)
      xLabels: ["10/01/24", "10/15/24", "11/01/24", "11/15/24", "12/01/24"]
    },
    "1 Year": {
      points: "70,280 160,270 250,250 340,220 430,200 520,230 610,180 700,160 790,120 880,100 930,60",
      yLabels: ["₹65,000", "₹55,000", "₹45,000", "₹35,000"],
      // Showing Dates (Year/Month)
      xLabels: ["01/01/24", "04/01/24", "07/01/24", "10/01/24", "01/01/25"]
    }
  };

  const currentData = chartData[selectedRange];
  
  // X-Axis Positions (Fixed horizontal coordinates for the 5 labels)
  const xPos = [70, 290, 510, 730, 930];

  return (
    <div className="fade-in">
      {/* Header Section */}
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 mb-4 transition-colors">
          <Icon name="arrow-left" /><span>Back to Portfolio</span> 
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-20 h-20 bg-gradient-to-br ${asset.gradient} rounded-full flex items-center justify-center font-bold text-white text-3xl`}>
              {asset.icon}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">{asset.name}</h1>
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-xl text-gray-400">{asset.symbol}</span> 
                <span className="text-gray-600">•</span> 
                <span className="text-gray-400">Rank #1</span> 
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-bold rounded-full">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
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

      {/* Financial Line Chart */}
      <div className="bg-gray-900/50 neon-border rounded-xl p-6 mb-8">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Price (Past {selectedRange === '1 Year' ? '1 Year' : selectedRange === '3 Months' ? '3 Months' : selectedRange}) in INR</h3>
            
            {/* Buttons */}
            <div className="flex space-x-2 text-xs">
               {Object.keys(chartData).map((range) => (
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
         
         {/* SVG Chart */}
         <svg className="w-full" viewBox="0 0 950 320" style={{height: '320px'}}>
           <defs>
             <linearGradient id="chartGradientFill" x1="0%" y1="0%" x2="0%" y2="100%">
               <stop offset="0%" style={{stopColor:'#FACC15', stopOpacity:0.3}} />
               <stop offset="100%" style={{stopColor:'#FACC15', stopOpacity:0}} />
             </linearGradient>
           </defs> 
           
           {/* --- GRID LINES --- */}
           <g stroke="#333" strokeWidth="1" strokeDasharray="4 4">
             <line x1="60" y1="50" x2="930" y2="50" />
             <line x1="60" y1="120" x2="930" y2="120" />
             <line x1="60" y1="190" x2="930" y2="190" />
             <line x1="60" y1="260" x2="930" y2="260" />
           </g>

           {/* --- DYNAMIC Y-AXIS LABELS (Price) --- */}
           <g fill="#666" fontSize="12" textAnchor="end">
             <text x="50" y="54">{currentData.yLabels[0]}</text>
             <text x="50" y="124">{currentData.yLabels[1]}</text>
             <text x="50" y="194">{currentData.yLabels[2]}</text>
             <text x="50" y="264">{currentData.yLabels[3]}</text>
           </g>

           {/* --- DYNAMIC X-AXIS LABELS (Time or Date) --- */}
           <g fill="#666" fontSize="12" textAnchor="middle">
             {currentData.xLabels.map((label, index) => (
               <text key={index} x={xPos[index]} y="290">
                 {label}
               </text>
             ))}
           </g>

           {/* --- DATA SERIES --- */}
           {/* 1. The Fill Area */}
           <polygon 
             fill="url(#chartGradientFill)" 
             points={`${currentData.points} 930,300 70,300`} 
           /> 
           
           {/* 2. The Line Segments */}
           <polyline 
             fill="none" 
             stroke="#FACC15" 
             strokeWidth="2.5" 
             strokeLinecap="round"
             strokeLinejoin="round"
             points={currentData.points} 
           />

           {/* 3. The Markers (Data Points) */}
           {currentData.points.split(' ').map((point) => {
               const [cx, cy] = point.split(',');
               return (
                 <circle 
                    key={`${cx}-${cy}`}
                    cx={cx} 
                    cy={cy} 
                    r="3.5" 
                    fill="#000" 
                    stroke="#FACC15" 
                    strokeWidth="2" 
                 />
               );
           })}
         </svg>
      </div>
    </div>
  );
};

export default AssetDetailView;