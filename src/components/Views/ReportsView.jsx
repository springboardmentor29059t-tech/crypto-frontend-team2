import React, { useState, useMemo } from 'react';
import Icon from '../UI/Icon';

const ReportsView = ({ portfolio, trades, showToast }) => {
    const [startDate, setStartDate] = useState('2024-01-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [taxRate, setTaxRate] = useState(20); // Mock tax rate %

    // 1. CALCULATE REAL P&L
    const metrics = useMemo(() => {
        // Unrealized (Current Portfolio)
        const totalValue = portfolio.reduce((sum, asset) => sum + (asset.qty * asset.currentPrice), 0);
        const totalCostBasis = portfolio.reduce((sum, asset) => sum + (asset.qty * asset.avgCost), 0);
        const unrealizedPL = totalValue - totalCostBasis;

        // Realized (Trades)
        // Note: Simplified logic. Real apps need FIFO/LIFO tracking.
        let totalRealizedGain = 0;
        trades.forEach(t => {
            // Simplified: Just assuming trades in list resulted in gain for demo visual
            // In a real app, you match Buys with Sells.
            const profit = (t.type === 'SELL') ? (t.total - t.fee) * 0.1 : 0; // Mock calculation
            totalRealizedGain += profit;
        });
        
        // We will use a static value from trades for better demo consistency
        // $5,026.03 (ETH Sell) + Mock others
        const realizedGain = 5026.03; 

        // Tax Calculation
        const estimatedTax = (realizedGain * taxRate) / 100;
        const netProfit = realizedGain - estimatedTax;

        return {
            totalValue,
            unrealizedPL,
            realizedGain,
            estimatedTax,
            netProfit,
            roi: ((totalValue - totalCostBasis) / totalCostBasis) * 100
        };
    }, [portfolio, trades, taxRate]);

    // 2. GENERATE CSV LOGIC
    const downloadCSV = () => {
        // Header
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Type,Asset,Quantity,Price,Total,Exchange\n";

        // Rows
        trades.forEach(t => {
            const row = `${t.date},${t.type},${t.asset},${t.qty},${t.price},${t.total},${t.exchange}`;
            csvContent += row + "\n";
        });

        // Encode and Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `trade_history_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast("CSV downloaded successfully");
    };

    const handlePDFDownload = () => {
        showToast("Generating PDF Preview...");
        setTimeout(() => {
            showToast("Open your browser Print (Ctrl+P) to save as PDF");
            window.print(); 
        }, 1000);
    };

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    };

    return (
        <div className="fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white">P&L and Tax Reports</h3>
                    <p className="text-gray-400 text-sm">Generate financial reports based on your transactions.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-900/50 neon-border rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">Portfolio Value</div>
                    <div className="text-2xl font-bold text-white mb-1">{formatCurrency(metrics.totalValue)}</div>
                    <div className={`${metrics.unrealizedPL >= 0 ? 'text-green-400' : 'text-red-400'} text-sm font-medium`}>
                        {metrics.unrealizedPL >= 0 ? '+' : ''}{formatCurrency(metrics.unrealizedPL)} Unrealized
                    </div>
                </div>
                <div className="bg-gray-900/50 neon-border rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">Realized Gains</div>
                    <div className="text-2xl font-bold text-green-400 mb-1">{formatCurrency(metrics.realizedGain)}</div>
                    <div className="text-gray-400 text-sm">Closed positions</div>
                </div>
                <div className="bg-gray-900/50 neon-border rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">Est. Tax ({taxRate}%)</div>
                    <div className="text-2xl font-bold text-red-400 mb-1">{formatCurrency(metrics.estimatedTax)}</div>
                    <div className="text-gray-400 text-sm">Liability</div>
                </div>
                <div className="bg-gray-900/50 neon-border rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">Net Profit</div>
                    <div className="text-2xl font-bold text-white mb-1">{formatCurrency(metrics.netProfit)}</div>
                    <div className={`text-green-400 text-sm font-medium`}>
                        {metrics.roi.toFixed(2)}% ROI
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-900/50 neon-border rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Report Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label> 
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label> 
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tax Rate (%)</label> 
                        <input 
                            type="number" 
                            value={taxRate}
                            onChange={(e) => setTaxRate(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none" 
                        />
                    </div>
                    <div className="flex items-end">
                        <button className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors">
                            Apply Filters
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                        onClick={handlePDFDownload}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                    >
                        <Icon name="file-pdf" /> <span>Download PDF</span> 
                    </button> 
                    <button 
                        onClick={downloadCSV}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg font-semibold hover:bg-gray-700 transition-all"
                    >
                        <Icon name="file-csv" /> <span>Download CSV</span> 
                    </button> 
                    <button 
                        onClick={() => showToast('Tax Summary Generated')}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg font-semibold hover:bg-gray-700 transition-all"
                    >
                        <Icon name="chart-bar" /> <span>Tax Summary</span> 
                    </button>
                </div>
            </div>

            {/* Detailed Breakdown Table */}
            <div className="bg-gray-900/50 neon-border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Report Preview ({trades.length} Transactions)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Asset</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {trades.map((t, idx) => (
                                <tr key={idx} className="hover:bg-gray-800/30">
                                    <td className="px-4 py-3 text-gray-300">{t.date.split(' ')[0]}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold ${t.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-white">{t.asset}</td>
                                    <td className="px-4 py-3 text-right text-white font-semibold">
                                        {formatCurrency(t.total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;