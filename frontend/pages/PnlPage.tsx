import React, { useState, useEffect } from 'react';
import { getPersonalPnlSummary, exportPersonalPnlCsv } from '../services/api';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Download, RefreshCw } from 'lucide-react';
import { usePersonalNode } from '../PersonalNodeContext';

const PnlPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { assets } = usePersonalNode();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getPersonalPnlSummary();
            setData(res);
        } catch (error) {
            console.error(`Failed to fetch P&L data`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [assets]); // Re-fetch when global assets context changes

    const handleExport = () => {
        exportPersonalPnlCsv();
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="animate-spin text-yellow-500" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in text-white pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Profit & Loss</h1>
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/20 text-green-400 border border-green-500/30">
                            Personal Node
                        </span>
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2 flex items-center gap-2">
                        “Your portfolio performance”
                    </p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-slate-700 shadow-lg shadow-black/20 hover:scale-105 active:scale-95"
                >
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Invested', value: data?.totalInvested || 0, icon: <DollarSign className="text-blue-400" /> },
                    { label: 'Current Value', value: data?.currentValue || 0, icon: <PieChart className="text-purple-400" /> },
                    { label: 'Realized P&L', value: data?.realizedPnl || 0, icon: (data?.realizedPnl >= 0 ? <TrendingUp className="text-green-400" /> : <TrendingDown className="text-red-400" />) },
                    { label: 'Unrealized P&L', value: data?.unrealizedPnl || 0, icon: (data?.unrealizedPnl >= 0 ? <TrendingUp className="text-green-400" /> : <TrendingDown className="text-red-400" />) },
                ].map((card, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2.5rem] backdrop-blur-sm group hover:border-slate-700 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{card.label}</span>
                            <div className="bg-slate-800/50 p-2 rounded-lg group-hover:scale-110 transition-transform">{card.icon}</div>
                        </div>
                        <div className={`text-2xl font-black tracking-tighter ${card.label.includes('P&L') ? (card.value >= 0 ? 'text-green-400' : 'text-red-400') : 'text-white'}`}>
                            {formatCurrency(card.value)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Asset Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
                    <h3 className="text-xl font-black uppercase tracking-tight">
                        Per-Asset Breakdown
                    </h3>
                    <button onClick={fetchData} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white">
                        <RefreshCw size={16} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800/30">
                                <th className="px-8 py-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Asset</th>
                                <th className="px-8 py-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Quantity</th>
                                <th className="px-8 py-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Avg Cost</th>
                                <th className="px-8 py-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Current Price</th>
                                <th className="px-8 py-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Realized</th>
                                <th className="px-8 py-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Unrealized</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {data?.assetBreakdown?.length > 0 ? (
                                data.assetBreakdown.map((asset: any, i: number) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6 font-black tracking-tight flex items-center gap-2">
                                            {asset.symbol}
                                        </td>
                                        <td className="px-8 py-6 font-medium text-slate-300">{asset.quantity?.toFixed(4)}</td>
                                        <td className="px-8 py-6 font-medium text-slate-300">{formatCurrency(asset.avgCost)}</td>
                                        <td className="px-8 py-6 font-medium text-slate-300">{formatCurrency(asset.currentPrice)}</td>
                                        <td className={`px-8 py-6 font-black ${asset.realizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {formatCurrency(asset.realizedPnl)}
                                        </td>
                                        <td className={`px-8 py-6 font-black ${asset.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {formatCurrency(asset.unrealizedPnl)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-slate-500 uppercase tracking-widest font-black text-xs">
                                        No transaction history found
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

export default PnlPage;
