import React, { useEffect, useState } from 'react';
import { MarketOverview } from '../../types';
import { getMarketOverview, getMarketStatus } from '../../services/api';
import { TrendingUp, TrendingDown, Activity, Globe, DollarSign, BarChart3, RefreshCw, Info } from 'lucide-react';
import { formatShortValue, formatFullNumber } from '../../services/formatters';

export const LiveMarketSection: React.FC = () => {
    const [marketData, setMarketData] = useState<MarketOverview | null>(null);
    const [prevMarketData, setPrevMarketData] = useState<MarketOverview | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadMarketData = async () => {
        setRefreshing(true);
        try {
            const [overview, status] = await Promise.all([
                getMarketOverview(),
                getMarketStatus()
            ]);

            if (overview) {
                setPrevMarketData(marketData);
                setMarketData(overview);
            }
            if (status) {
                const date = new Date(status.lastUpdated);
                setLastUpdated(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            }
        } catch (error) {
            console.error("Failed to fetch market data", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadMarketData();
        const interval = setInterval(loadMarketData, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !marketData) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Global Market...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Informative Visual Section */}
            <div className="relative overflow-hidden bg-slate-900/40 border border-slate-800 rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 transition-all hover:bg-slate-900/60">
                <div className="md:w-1/2 space-y-4">
                    <div className="bg-indigo-500/10 w-fit p-3 rounded-2xl text-indigo-400 mb-2">
                        <Info size={24} />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Economic Pulse</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                            Crypto markets operate 24/7 across global exchanges
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                            Market capitalization reflects overall investor confidence
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                            Volatility is driven by global demand and macro events
                        </div>
                    </div>
                </div>
                <div className="md:w-1/2 relative group">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img
                        src="/assets/global_market.png"
                        alt="Global Market Map"
                        className="w-full h-auto rounded-3xl border border-slate-700/50 shadow-2xl relative z-10"
                    />
                </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Globe className="text-indigo-500" size={24} />
                        Global Market Values
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        {lastUpdated ? `Last updated at ${lastUpdated}` : 'Syncing Node...'}
                    </p>
                </div>
                <button onClick={loadMarketData} className="p-3 bg-slate-900 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-white border border-slate-800">
                    <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Market KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MarketKPI
                    label="Total Market Cap"
                    value={marketData?.totalMarketCapInr ? `₹${formatShortValue(marketData.totalMarketCapInr)}` : "₹0"}
                    subvalue={marketData?.totalMarketCap ? `$${formatShortValue(marketData.totalMarketCap)}` : "$0"}
                    change={marketData?.marketCapChangePercentage24h}
                    icon={<DollarSign size={20} />}
                />
                <MarketKPI
                    label="24h Volume"
                    value={marketData?.totalVolume24hInr ? `₹${formatShortValue(marketData.totalVolume24hInr)}` : "₹0"}
                    subvalue={marketData?.totalVolume24h ? `$${formatShortValue(marketData.totalVolume24h)}` : "$0"}
                    icon={<Activity size={20} />}
                />
                <MarketKPI
                    label="BTC Dominance"
                    value={'54.2%'}
                    subtext="Market Leader Position"
                    icon={<BarChart3 size={20} />}
                />
                <MarketKPI
                    label="Global Sentiment"
                    value={marketData?.marketCapChangePercentage24h && marketData.marketCapChangePercentage24h >= 0 ? 'Bullish' : 'Bearish'}
                    subtext={`Dynamic Volatility Check`}
                    icon={marketData?.marketCapChangePercentage24h && marketData.marketCapChangePercentage24h >= 0 ? <TrendingUp className="text-green-500" size={20} /> : <TrendingDown className="text-red-500" size={20} />}
                />
            </div>

            {/* Top Movers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Gainers */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <h3 className="text-green-500 font-black uppercase tracking-[0.2em] text-[10px] mb-8 flex items-center gap-3">
                        <TrendingUp size={16} /> Top Gainers (24h)
                    </h3>
                    <div className="space-y-3">
                        {marketData?.topGainers?.length ? marketData.topGainers.map((coin) => (
                            <div key={coin.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl hover:bg-slate-900 transition-all border border-white/5 group group-hover:border-green-500/20">
                                <div className="flex items-center gap-4">
                                    <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <div className="text-white font-black text-sm uppercase">{coin.symbol}</div>
                                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{coin.name}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-black text-sm">₹{formatShortValue(coin.currentPriceInr, true)}</div>
                                    <div className="text-green-500 text-xs font-black mt-1">
                                        {coin.priceChangePercentage24h !== undefined && coin.priceChangePercentage24h !== null
                                            ? `+${coin.priceChangePercentage24h.toFixed(2)}`
                                            : '+0.00'}%
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-600 font-bold uppercase tracking-widest text-[10px]">Awaiting Market Data...</div>
                        )}
                    </div>
                </div>

                {/* Top Losers */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <h3 className="text-red-500 font-black uppercase tracking-[0.2em] text-[10px] mb-8 flex items-center gap-3">
                        <TrendingDown size={16} /> Top Losers (24h)
                    </h3>
                    <div className="space-y-3">
                        {marketData?.topLosers?.length ? marketData.topLosers.map((coin) => (
                            <div key={coin.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl hover:bg-slate-900 transition-all border border-white/5 group group-hover:border-red-500/20">
                                <div className="flex items-center gap-4">
                                    <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <div className="text-white font-black text-sm uppercase">{coin.symbol}</div>
                                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{coin.name}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-black text-sm">₹{formatShortValue(coin.currentPriceInr, true)}</div>
                                    <div className="text-red-500 text-xs font-black mt-1">
                                        {coin.priceChangePercentage24h !== undefined && coin.priceChangePercentage24h !== null
                                            ? coin.priceChangePercentage24h.toFixed(2)
                                            : '0.00'}%
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-600 font-bold uppercase tracking-widest text-[10px]">Awaiting Market Data...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MarketKPI = ({ label, value, subvalue, change, icon, subtext }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-indigo-500/50 transition-all shadow-xl group relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
            <div className="bg-slate-950 p-4 rounded-2xl text-indigo-500 shadow-inner border border-white/5 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                {icon}
            </div>
            {change !== undefined && change !== null && (
                <div className={`px-2 py-1 rounded-lg text-xs font-black transition-all ${change >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                </div>
            )}
        </div>
        <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{label}</div>
        <div className={`text-2xl font-black text-white tracking-tighter leading-none mb-1 break-all transition-all duration-500 animate-in fade-in`}>{value}</div>
        {subvalue && <div className="text-[10px] font-bold text-slate-500 tracking-tight mt-1 transition-all duration-500 animate-in fade-in">{subvalue} USD</div>}
        {subtext && <div className="text-[10px] text-slate-600 font-bold uppercase mt-2 tracking-widest">{subtext}</div>}
    </div>
);
