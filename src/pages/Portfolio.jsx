import { useState, useEffect } from 'react';
import PortfolioChart from '../components/PortfolioChart';
import AllocationChart from '../components/AllocationChart';
import api from '../utils/api';
import Skeleton from '../components/Skeleton';
import RefreshButton from '../components/RefreshButton';

const Portfolio = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/portfolio/summary');
            setAssets(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalValue = assets.reduce((acc, curr) => acc + curr.value, 0);

    const handleDownloadCsv = async () => {
        try {
            const response = await api.get('/reports/csv', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'transactions.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading CSV:', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Portfolio Analytics</h1>
                        <p className="text-slate-400 text-sm">Deep dive into your performance</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDownloadCsv}
                        className="btn-primary flex items-center gap-2 px-6"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download CSV
                    </button>
                    <RefreshButton onClick={fetchData} isLoading={loading} />
                </div>
            </div>

            {/* P&L Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm uppercase tracking-wider font-medium mb-1">Total Realized PnL</p>
                    <p className={`text-3xl font-bold tracking-tight ${assets.reduce((acc, curr) => acc + (curr.realizedPnL || 0), 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {assets.reduce((acc, curr) => acc + (curr.realizedPnL || 0), 0) >= 0 ? '+' : ''}
                        ₹{assets.reduce((acc, curr) => acc + (curr.realizedPnL || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-slate-500 text-xs mt-2">Profits/Losses from sold assets</p>
                </div>
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm uppercase tracking-wider font-medium mb-1">Total Unrealized PnL</p>
                    <p className={`text-3xl font-bold tracking-tight ${assets.reduce((acc, curr) => acc + (curr.unrealizedPnL || 0), 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {assets.reduce((acc, curr) => acc + (curr.unrealizedPnL || 0), 0) >= 0 ? '+' : ''}
                        ₹{assets.reduce((acc, curr) => acc + (curr.unrealizedPnL || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-slate-500 text-xs mt-2">Paper gains on current holdings</p>
                </div>
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm uppercase tracking-wider font-medium mb-1">Net PnL</p>
                    <p className={`text-3xl font-bold tracking-tight ${assets.reduce((acc, curr) => acc + (curr.totalPnL || 0), 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {assets.reduce((acc, curr) => acc + (curr.totalPnL || 0), 0) >= 0 ? '+' : ''}
                        ₹{assets.reduce((acc, curr) => acc + (curr.totalPnL || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-slate-500 text-xs mt-2">Combined performance</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Big Chart */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-panel p-6 h-[500px] flex flex-col">
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                                    Performance Over Time
                                </h3>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-400 text-xs uppercase tracking-wider">Current Value</p>
                                <p className="text-2xl font-bold text-white">₹{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-0 bg-black/20 rounded-xl border border-white/5 p-4">
                            {loading ? <Skeleton className="h-full w-full rounded-xl bg-slate-800/50" /> : <PortfolioChart />}
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            Asset Breakdown
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {assets.sort((a, b) => b.value - a.value).slice(0, 6).map((asset) => (
                                <div key={asset.symbol} className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-primary/50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/asset/${asset.symbol}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-white">{asset.symbol}</span>
                                        <span className="text-xs text-slate-400">{((asset.value / totalValue) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
                                        <div className="bg-primary h-full rounded-full" style={{ width: `${(asset.value / totalValue) * 100}%` }}></div>
                                    </div>
                                    <p className="text-sm font-medium text-slate-300">₹{asset.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Allocation & Stats */}
                <div className="space-y-8">
                    <div className="glass-panel p-6 h-[400px] flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                            Allocation
                        </h3>
                        <div className="flex-1 w-full min-h-0">
                            {loading ? <Skeleton className="h-full w-full rounded-xl bg-slate-800/50" /> : <AllocationChart assets={assets} />}
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Key Metrics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                <span className="text-slate-400 text-sm">Best Performer</span>
                                <span className="text-emerald-400 font-bold">
                                    {assets.length > 0 ? assets.sort((a, b) => b.pnlPercent - a.pnlPercent)[0].symbol : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                <span className="text-slate-400 text-sm">Worst Performer</span>
                                <span className="text-rose-400 font-bold">
                                    {assets.length > 0 ? assets.sort((a, b) => a.pnlPercent - b.pnlPercent)[0].symbol : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                <span className="text-slate-400 text-sm">Total Assets</span>
                                <span className="text-white font-bold">{assets.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
