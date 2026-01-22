import React, { useEffect, useState, useMemo } from 'react';
import { addToWatchlist, getTopMarkets, getMarketStatus } from '../services/api';
import { formatShortValue } from '../services/formatters';
import {
    TrendingUp,
    TrendingDown,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Download,
    Filter,
    ArrowUpDown,
    BarChart2,
    PieChart as PieIcon,
    Activity,
    Calendar,
    FileText,
    Eye
} from 'lucide-react';

const CryptoMarket: React.FC = () => {
    const [coins, setCoins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [capFilter, setCapFilter] = useState<'all' | 'large' | 'mid' | 'small'>('all');
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const perPage = 50;

    const fetchMarkets = async () => {
        try {
            if (coins.length === 0) setLoading(true);
            setRefreshing(true);
            const [data, status] = await Promise.all([
                getTopMarkets(page, perPage),
                getMarketStatus()
            ]);

            if (data && data.length > 0) {
                setCoins(data);
                setError(null);
            }
            if (status) {
                const date = new Date(status.lastUpdated);
                setLastUpdated(date.toLocaleTimeString());
            }
        } catch (err) {
            console.warn("Failed to fetch market data.");
            setError("Network connectivity intermittent. Using historical node data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMarkets();
        const interval = setInterval(fetchMarkets, 60000);
        return () => clearInterval(interval);
    }, [page]);


    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedCoins = useMemo(() => {
        let result = [...coins];

        // Search filter
        if (searchTerm) {
            result = result.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Market Cap filter
        if (capFilter !== 'all') {
            result = result.filter(c => {
                const cap = c.market_cap;
                if (capFilter === 'large') return cap > 1e11; // > 100B INR
                if (capFilter === 'mid') return cap > 1e10 && cap <= 1e11; // 10B - 100B
                if (capFilter === 'small') return cap <= 1e10;
                return true;
            });
        }

        // Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [coins, searchTerm, sortConfig, capFilter]);

    const exportToCSV = () => {
        const headers = ["Rank", "Name", "Symbol", "Price (INR)", "24h Change (%)", "Market Cap (INR)", "Volume (INR)", "ATH (INR)"];
        const rows = filteredAndSortedCoins.map(c => [
            c.market_cap_rank,
            c.name,
            c.symbol.toUpperCase(),
            c.current_price,
            c.price_change_percentage_24h,
            c.market_cap,
            c.total_volume,
            c.ath
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `crypto_market_data_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderSparkline = (data: number[]) => {
        if (!data || data.length === 0) return null;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min;
        const width = 120;
        const height = 40;

        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((d - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        const isPositive = data[data.length - 1] >= data[0];

        return (
            <svg width={width} height={height} className="overflow-visible">
                <polyline
                    fill="none"
                    stroke={isPositive ? '#10b981' : '#ef4444'}
                    strokeWidth="2.5"
                    points={points}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 backdrop-blur-md">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2 italic flex items-center gap-4">
                        <BarChart2 className="text-indigo-500" size={36} />
                        Global Market Terminal
                    </h1>
                    <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Node Syncing</span>
                        </div>
                        <span className="text-slate-700">|</span>
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                            <Calendar size={12} /> {lastUpdated ? `Last updated at ${lastUpdated}` : 'Initialing...'}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={exportToCSV} className="flex items-center gap-2 px-5 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all text-[10px] font-black uppercase tracking-widest">
                        <Download size={14} /> Export CSV
                    </button>
                    <button onClick={fetchMarkets} className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all text-[10px] font-black uppercase tracking-widest">
                        <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh Terminal
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Search className="text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="SEARCH ASSET NAME OR SYMBOL..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 text-white pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs font-black placeholder:text-slate-600 tracking-widest"
                    />
                </div>

                <div className="lg:col-span-7 flex flex-wrap items-center justify-end gap-3">
                    <div className="flex items-center bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
                        <span className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest border-r border-slate-800 h-4 flex items-center">Size Filter</span>
                        <div className="flex gap-1 ml-2">
                            {(['all', 'large', 'mid', 'small'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setCapFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${capFilter === f ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-orange-500/10 border border-orange-500/50 p-6 rounded-[2rem] text-orange-500 text-xs font-black flex items-center gap-4 uppercase tracking-[0.1em]">
                    <Activity size={20} />
                    {error}
                </div>
            )}

            {/* Table Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead className="bg-slate-950/50 border-b border-slate-800">
                            <tr>
                                <SortHeader label="Rank" icon={null} sortKey="market_cap_rank" onSort={handleSort} config={sortConfig} className="pl-10" />
                                <SortHeader label="Asset Identity" icon={null} sortKey="name" onSort={handleSort} config={sortConfig} />
                                <SortHeader label="Current Price" icon={null} sortKey="current_price" onSort={handleSort} config={sortConfig} align="right" />
                                <SortHeader label="24H Change" icon={null} sortKey="price_change_percentage_24h" onSort={handleSort} config={sortConfig} align="right" />
                                <SortHeader label="Market Cap" icon={null} sortKey="market_cap" onSort={handleSort} config={sortConfig} align="right" />
                                <SortHeader label="24H Vol" icon={null} sortKey="total_volume" onSort={handleSort} config={sortConfig} align="right" />
                                <th className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Supply / ATH</th>
                                <th className="px-6 py-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest pr-10">Last 7 Days Pulse</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading && coins.length === 0 ? (
                                Array.from({ length: 15 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={8} className="px-10 py-8 bg-slate-900/30">
                                            <div className="h-4 bg-slate-800 rounded-full w-full opacity-20"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredAndSortedCoins.map((coin) => (
                                    <tr key={coin.id} className="hover:bg-indigo-500/5 transition-all group cursor-default">
                                        <td className="px-10 py-6">
                                            <span className="text-slate-500 font-black text-xs tabular-nums tracking-tighter">#{coin.market_cap_rank}</span>
                                        </td>
                                        <td className="px-6 py-6 border-l border-white/5">
                                            <div className="flex items-center gap-5 group/item">
                                                <div className="relative">
                                                    <img src={coin.image} className="w-12 h-12 rounded-full border-2 border-slate-800 p-1 bg-slate-950" alt={coin.name} />
                                                    <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[8px] font-black text-indigo-400 uppercase">{coin.symbol}</div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-white font-black text-sm uppercase tracking-tight">{coin.name}</div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                addToWatchlist(coin.symbol).then(() => alert('Added to Watchlist!'));
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 hover:text-blue-400 transition-opacity p-1"
                                                            title="Add to Watchlist"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">Global Ranking Layer</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right tabular-nums">
                                            <div className="text-white font-black text-sm">₹{formatShortValue(coin.current_price, true)}</div>
                                            <div className="text-slate-600 text-[10px] font-bold mt-1">${formatShortValue(coin.current_price / 83, true)}</div>
                                        </td>
                                        <td className="px-6 py-6 text-right tabular-nums">
                                            <div className={`flex items-center justify-end gap-1.5 font-black text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {coin.price_change_percentage_24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                            </div>
                                            <div className="text-[9px] text-slate-700 font-black uppercase mt-1 tracking-widest group-hover:text-slate-500">Momentum Index</div>
                                        </td>
                                        <td className="px-6 py-6 text-right tabular-nums">
                                            <div className="text-slate-200 font-black text-xs tracking-tighter">₹{formatShortValue(coin.market_cap)}</div>
                                            <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                                                <div className="bg-indigo-500 h-full" style={{ width: '45%' }}></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right tabular-nums">
                                            <div className="text-slate-300 font-bold text-xs">₹{formatShortValue(coin.total_volume)}</div>
                                            <div className="text-slate-600 text-[9px] font-black uppercase mt-1 tracking-widest">Trade Liquidity</div>
                                        </td>
                                        <td className="px-6 py-6 tabular-nums">
                                            <div className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Max High: ₹{formatShortValue(coin.ath, true)}</div>
                                            <div className="text-red-500/80 text-[10px] font-black italic">-{Math.abs(coin.ath_change_percentage).toFixed(1)}% OFF PEAK</div>
                                            <div className="mt-2 text-[9px] font-bold text-slate-700 uppercase tracking-tighter block truncate max-w-[120px]">Supply: {formatShortValue(coin.circulating_supply)}</div>
                                        </td>
                                        <td className="px-6 py-6 flex justify-center items-center pr-10">
                                            {coin.sparkline_in_7d && renderSparkline(coin.sparkline_in_7d.price)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="p-10 bg-slate-950/50 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Assets Scanned</span>
                            <span className="text-white font-black text-xl">{filteredAndSortedCoins.length} Layer 1/2s</span>
                        </div>
                        <div className="w-px h-10 bg-slate-800"></div>
                        <div className="flex flex-col text-slate-500 text-[10px] font-black uppercase tracking-widest">
                            <span>Market Depth: Global Top 100</span>
                            <span>API Provider: CoinGecko Unified</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            disabled={page === 1 || loading}
                            onClick={() => setPage(p => p - 1)}
                            className="flex items-center gap-3 px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl group"
                        >
                            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Previous Level</span>
                        </button>

                        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
                            <span className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl font-black text-lg shadow-lg shadow-indigo-500/30">{page}</span>
                        </div>

                        <button
                            disabled={loading}
                            onClick={() => setPage(p => p + 1)}
                            className="flex items-center gap-3 px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl group"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Next Level</span>
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SortHeader = ({ label, sortKey, onSort, config, align = 'left', className = '' }: any) => {
    const isActive = config?.key === sortKey;
    const direction = config?.direction;

    return (
        <th
            onClick={() => onSort(sortKey)}
            className={`px-6 py-6 cursor-pointer group hover:bg-white/5 transition-colors ${className}`}
        >
            <div className={`flex items-center gap-3 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-indigo-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {label}
                </span>
                <div className={`flex flex-col transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <ArrowUpDown size={12} className={isActive ? (direction === 'asc' ? 'text-indigo-500 rotate-180' : 'text-indigo-500') : 'text-slate-700'} />
                </div>
            </div>
        </th>
    );
};

export default CryptoMarket;
