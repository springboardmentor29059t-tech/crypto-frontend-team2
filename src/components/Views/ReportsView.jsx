import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../UI/Icon';

const ReportsView = ({ showToast }) => {
    // --- STATE ---
    const [startDate, setStartDate] = useState('2024-01-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [taxRate, setTaxRate] = useState(20);
    
    // Data from Backend
    // portfolio will now hold PortfolioAssetDTO objects
    const [portfolio, setPortfolio] = useState([]); 
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- API CALLS ---
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Portfolio (Dashboard DTO)
            // This endpoint uses the logged-in user from SecurityContextHolder automatically
            const token = localStorage.getItem('token'); // Assuming you store JWT here
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const portRes = await fetch('http://localhost:8080/api/portfolio/dashboard', { headers });
            if (!portRes.ok) throw new Error("Failed to fetch portfolio");
            const portData = await portRes.json();
            setPortfolio(portData);

            // 2. Fetch Trades
            // NOTE: TradeController requires userId in URL. 
            // Replace '1' with actual logged-in user ID logic from your app.
            const currentUserId = 1; 
            
            // Basic date filtering logic for the fetch URL (optional based on your controller)
            const start = `${startDate}T00:00:00`;
            const end = `${endDate}T23:59:59`;

            // Note: Your backend TradeController GET maps simply to /{userId}. 
            // If you want date filtering, you'd need to update TradeController to accept @RequestParam.
            // For now, we fetch all and filter in JS or accept all data.
            const tradesRes = await fetch(`http://localhost:8080/api/trades/${currentUserId}`, { headers });
            if (!tradesRes.ok) throw new Error("Failed to fetch trades");
            const tradesData = await tradesRes.json();
            
            // Simple client-side filter for the date range if backend doesn't support it yet
            const filteredTrades = tradesData.filter(t => {
                const tradeDate = new Date(t.executedAt);
                return tradeDate >= new Date(start) && tradeDate <= new Date(end);
            });

            setTrades(filteredTrades);
            
        } catch (error) {
            console.error("Connection Error:", error);
            showToast("Failed to sync data. Ensure you are logged in.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- METRICS CALCULATION ---
    // Now simplified because Backend DTO calculates Total Value and P&L for us!
    const metrics = useMemo(() => {
        if (portfolio.length === 0) return {
            totalValue: 0, unrealizedPL: 0, realizedGain: 0, estimatedTax: 0, netProfit: 0, roi: 0
        };

        // 1. Portfolio Metrics (Summed from Backend DTO)
        // DTO fields: totalValue, profitLoss
        const totalValue = portfolio.reduce((sum, item) => sum + (item.totalValue || 0), 0);
        const totalCostBasis = portfolio.reduce((sum, item) => sum + ((item.avgCost || 0) * (item.quantity || 0)), 0);
        
        // The DTO already calculated P/L per asset
        const unrealizedPL = portfolio.reduce((sum, item) => sum + (item.profitLoss || 0), 0);

        // 2. Realized Gains (Calculated from Trade Entity)
        // Trade Entity fields: side (BUY/SELL), price, quantity, fee
        let totalRealizedGain = 0;
        trades.forEach(t => {
            if (t.side === 'SELL') {
                // Profit = (Price * Qty) - Fee
                const gross = (t.price || 0) * (t.quantity || 0);
                const profit = gross - (t.fee || 0);
                totalRealizedGain += profit;
            }
        });
        
        // Ensure positive for tax calculation (losses might offset, but keeping simple here)
        const realizedGain = totalRealizedGain > 0 ? totalRealizedGain : 0; 

        // 3. Tax & Net
        const estimatedTax = (realizedGain * taxRate) / 100;
        const netProfit = realizedGain - estimatedTax;

        return {
            totalValue,
            unrealizedPL,
            realizedGain,
            estimatedTax,
            netProfit,
            roi: totalCostBasis > 0 ? ((totalValue - totalCostBasis) / totalCostBasis) * 100 : 0
        };
    }, [portfolio, trades, taxRate]);

    // --- HANDLERS ---
    const handleFilterApply = () => {
        fetchData();
        showToast("Reports refreshed");
    };

    const downloadCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        // Headers matching Backend Entity Fields
        csvContent += "Date,Side,Asset,Quantity,Price,Total,Exchange\n";

        trades.forEach(t => {
            const dateObj = new Date(t.executedAt);
            const dateStr = dateObj.toISOString().split('T')[0];
            
            // Calculate total for CSV
            const total = (t.price || 0) * (t.quantity || 0);
            
            const row = `${dateStr},${t.side},${t.assetSymbol},${t.quantity},${t.price},${total},${t.exchange ? t.exchange.name : 'Unknown'}`;
            csvContent += row + "\n";
        });

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
                    <p className="text-gray-400 text-sm">Live data from PriceSnapshots & Portfolio Service.</p>
                </div>
                {loading && <div className="text-blue-400 animate-pulse">Syncing with Database...</div>}
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
                        <button 
                            onClick={handleFilterApply}
                            className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                        >
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
                <h3 className="text-lg font-semibold mb-4">Holdings Report ({portfolio.length} Assets)</h3>
                
                {/* We can display the Portfolio Assets here since they have rich data now */}
                <div className="overflow-x-auto mb-8">
                    <table className="w-full">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Asset</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Avg Cost</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Current Price</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Total Value</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">P&L</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {portfolio.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-800/30">
                                    <td className="px-4 py-3 text-white font-bold">{item.assetSymbol}</td>
                                    <td className="px-4 py-3 text-right text-gray-300">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right text-gray-300">{formatCurrency(item.avgCost)}</td>
                                    <td className="px-4 py-3 text-right text-cyan-400">{formatCurrency(item.currentPrice)}</td>
                                    <td className="px-4 py-3 text-right text-white font-semibold">{formatCurrency(item.totalValue)}</td>
                                    <td className={`px-4 py-3 text-right text-sm font-medium ${item.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {item.profitLoss >= 0 ? '+' : ''}{formatCurrency(item.profitLoss)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h3 className="text-lg font-semibold mb-4 mt-8">Transaction History ({trades.length} Trades)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Side</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Asset</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {trades.map((t, idx) => (
                                <tr key={idx} className="hover:bg-gray-800/30">
                                    <td className="px-4 py-3 text-gray-300">
                                        {t.executedAt ? new Date(t.executedAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold ${t.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                            {t.side}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-white">{t.assetSymbol}</td>
                                    <td className="px-4 py-3 text-right text-white font-semibold">
                                        {formatCurrency(t.price * t.quantity)}
                                    </td>
                                </tr>
                            ))}
                            {trades.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                                        No transactions found for this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;