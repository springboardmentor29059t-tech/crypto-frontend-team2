import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import RefreshButton from '../components/RefreshButton';
import Skeleton from '../components/Skeleton';
import AddTransactionModal from '../components/AddTransactionModal';

const Holdings = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchHoldings = useCallback(async () => {
        setLoading(true);
        try {
            // New Endpoint: Backend does the heavy lifting (Avg Price, PnL)
            const res = await api.get('/portfolio/summary');
            setAssets(res.data);
        } catch (err) {
            console.error("Error loading holdings data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHoldings();
    }, [fetchHoldings]);

    // Calculate totals for the summary header
    const totalValue = assets.reduce((acc, curr) => acc + curr.value, 0);
    const totalPnL = assets.reduce((acc, curr) => acc + (curr.pnl || 0), 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Holdings</h1>
                        <p className="text-slate-400 text-sm">Manage your asset distribution</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 px-6"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Manual Add/Edit
                    </button>
                    <RefreshButton onClick={fetchHoldings} isLoading={loading} />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="glass-panel p-6 flex justify-between items-center relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-slate-400 text-sm uppercase tracking-wider font-medium mb-1">Total Portfolio Value</p>
                        <p className="text-3xl font-bold text-white tracking-tight">
                            {loading ? <Skeleton className="h-9 w-40 bg-slate-800 inline-block" /> : `₹${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </p>
                    </div>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>
                <div className="glass-panel p-6 flex justify-between items-center relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-slate-400 text-sm uppercase tracking-wider font-medium mb-1">Total Profit / Loss</p>
                        <p className={`text-3xl font-bold tracking-tight ${totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {loading ? <Skeleton className="h-9 w-32 bg-slate-800 inline-block" /> : (
                                <>
                                    {totalPnL >= 0 ? '+' : ''}₹{Math.abs(totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </>
                            )}
                        </p>
                    </div>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ${totalPnL >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {totalPnL >= 0 ?
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> :
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                        }
                    </div>
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10 text-slate-400 text-left uppercase text-sm font-medium tracking-wider">
                            <tr>
                                <th className="p-5 pl-8">Asset</th>
                                <th className="p-5 text-right">Balance</th>
                                <th className="p-5 text-right">Current Price</th>
                                <th className="p-5 text-right">Avg Buy Price</th>
                                <th className="p-5 text-right">Total Value</th>
                                <th className="p-5 text-right">PnL (₹)</th>
                                <th className="p-5 text-right">PnL (%)</th>
                                <th className="p-5 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="p-5 pl-8"><Skeleton className="h-5 w-24 bg-slate-800" /></td>
                                        <td className="p-5"><Skeleton className="h-5 w-20 ml-auto bg-slate-800" /></td>
                                        <td className="p-5"><Skeleton className="h-5 w-24 ml-auto bg-slate-800" /></td>
                                        <td className="p-5"><Skeleton className="h-5 w-24 ml-auto bg-slate-800" /></td>
                                        <td className="p-5"><Skeleton className="h-5 w-28 ml-auto bg-slate-800" /></td>
                                        <td className="p-5"><Skeleton className="h-5 w-20 ml-auto bg-slate-800" /></td>
                                        <td className="p-5"><Skeleton className="h-5 w-16 ml-auto bg-slate-800" /></td>
                                        <td className="p-5"><Skeleton className="h-8 w-8 mx-auto bg-slate-800 rounded-full" /></td>
                                    </tr>
                                ))
                            ) : assets.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center text-slate-500 py-12 text-lg">
                                        No assets found. Connect an exchange or add manually to get started.
                                    </td>
                                </tr>
                            ) : (
                                assets.sort((a, b) => b.value - a.value).map((asset, idx) => (
                                    <tr
                                        key={idx}
                                        className="hover:bg-white/5 transition-colors duration-200 group relative"
                                    >
                                        <td
                                            onClick={() => window.location.href = `/asset/${asset.symbol}`}
                                            className="p-5 pl-8 font-bold flex items-center gap-4 cursor-pointer"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs text-white uppercase shadow-lg shadow-indigo-500/20">
                                                {asset.symbol.substring(0, 3)}
                                            </div>
                                            <span className="text-white group-hover:text-primary transition-colors text-lg">{asset.symbol}</span>
                                        </td>
                                        <td className="p-5 text-right font-medium text-slate-300">{asset.amount.toLocaleString()}</td>
                                        <td className="p-5 text-right text-slate-400 font-medium">₹{asset.price.toLocaleString()}</td>
                                        <td className="p-5 text-right text-slate-400">
                                            {asset.avgBuyPrice > 0 ? `₹${asset.avgBuyPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '-'}
                                        </td>
                                        <td className="p-5 text-right font-bold text-white text-lg">
                                            ₹{asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className={`p-5 text-right font-bold ${asset.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {asset.pnl >= 0 ? '+' : ''}{(asset.pnl || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className={`p-5 text-right font-bold ${asset.pnlPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            <span className={`px-2 py-1 rounded text-xs ${asset.pnlPercent >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                                {asset.pnlPercent >= 0 ? '+' : ''}{(asset.pnlPercent || 0).toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `/asset/${asset.symbol}`;
                                                }}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                                                title="View Details"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTransactionAdded={fetchHoldings}
            />
        </div>
    );
};

export default Holdings;
