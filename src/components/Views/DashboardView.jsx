import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const DashboardView = ({ portfolio }) => {
  const stats = useMemo(() => {
    const totalVal = portfolio.reduce((sum, asset) => sum + (asset.qty * asset.currentPrice), 0);
    const totalCost = portfolio.reduce((sum, asset) => sum + (asset.qty * asset.avgCost), 0);
    const pl = totalVal - totalCost;
    const plPercent = totalCost > 0 ? (pl / totalCost) * 100 : 0;
    
    return { totalVal, pl, plPercent };
  }, [portfolio]);

  // Prepare data for the Pie Chart
  const pieData = useMemo(() => {
    // Ensure we don't divide by zero if portfolio is empty
    if (!portfolio || portfolio.length === 0) return [];
    
    return portfolio.map((asset) => ({
      name: asset.name || asset.symbol || 'Unknown', // Use asset name or symbol
      value: asset.qty * asset.currentPrice,
    })).filter(item => item.value > 0); // Filter out assets with 0 value
  }, [portfolio]);

  // Neon color palette for the chart segments
  const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  // Custom Tooltip style to match dark theme
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg text-sm">
          <p className="text-gray-300 font-medium">{payload[0].name}</p>
          <p className="text-white font-bold">
            ${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fade-in">
      {/* Top Stats Cards */}
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

      {/* Portfolio Allocation (Pie Chart) */}
      <div className="bg-gray-900/50 neon-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Portfolio Allocation</h3>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="none" // Removes border between slices for cleaner look
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{ color: '#9ca3af' }} // Tailwind gray-400
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;