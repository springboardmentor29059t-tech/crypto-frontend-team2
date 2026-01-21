import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Skeleton from '../components/Skeleton';
import RefreshButton from '../components/RefreshButton';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl shadow-xl backdrop-blur-md">
                <p className="text-slate-400 mb-2 font-medium">{payload[0].payload.time}</p>
                <p className="text-blue-400 font-bold font-mono">₹{payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

const Market = () => {
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [chartLoading, setChartLoading] = useState(false);
    const [days, setDays] = useState('7');
    const [alertPrice, setAlertPrice] = useState('');
    const [alertCondition, setAlertCondition] = useState('ABOVE');
    const [alertMessage, setAlertMessage] = useState('');

    const fetchMarket = async () => {
        setLoading(true);
        try {
            const res = await api.get('/market/top');
            setCoins(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarket();
    }, []);

    const fetchChart = useCallback(async (coinId, daysVal) => {
        setChartLoading(true);
        try {
            const res = await api.get(`/market/chart/${coinId}?days=${daysVal}`);
            const formatted = res.data.map(p => ({
                time: new Date(p[0]).toLocaleDateString(),
                price: p[1]
            }));
            setChartData(formatted);
        } catch (e) {
            console.error(e);
        } finally {
            setChartLoading(false);
        }
    }, []);

    const handleCoinClick = (coin) => {
        setSelectedCoin(coin);
        fetchChart(coin.id, days);
    };

    useEffect(() => {
        if (selectedCoin) {
            fetchChart(selectedCoin.id, days);
        }
    }, [days, selectedCoin, fetchChart]);

    const handleCloseModal = () => {
        setSelectedCoin(null);
        setChartData([]);
        setAlertPrice('');
        setAlertMessage('');
    };

    const handleCreateAlert = async () => {
        if (!alertPrice) return;
        try {
            await api.post('/alerts', {
                symbol: selectedCoin.symbol.toUpperCase(),
                targetPrice: alertPrice,
                condition: alertCondition
            });
            setAlertMessage('Alert Set Successfully!');
            setTimeout(() => setAlertMessage(''), 3000);
            setAlertPrice('');
        } catch (err) {
            console.error(err);
            setAlertMessage('Failed to set alert.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Crypto Market</h1>
                        <p className="text-slate-400 text-sm">Live prices and trends</p>
                    </div>
                </div>
                <RefreshButton onClick={fetchMarket} isLoading={loading} />
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10 text-slate-400 text-left uppercase text-sm font-medium tracking-wider">
                            <tr>
                                <th className="p-5 pl-8">#</th>
                                <th className="p-5">Coin</th>
                                <th className="p-5 text-right">Price</th>
                                <th className="p-5 text-right">24h Change</th>
                                <th className="p-5 text-right">Market Cap</th>
                                <th className="p-5 text-center">Last 7 Days</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="p-5 pl-8"><Skeleton className="h-5 w-8 rounded bg-slate-800" /></td>
                                        <td className="p-5"><div className="flex gap-3"><Skeleton className="h-8 w-8 rounded-full bg-slate-800" /><Skeleton className="h-5 w-24 rounded bg-slate-800" /></div></td>
                                        <td className="p-5"><Skeleton className="h-5 w-20 ml-auto rounded bg-slate-800" /></td>
                                        <td className="p-5"><Skeleton className="h-5 w-16 ml-auto rounded bg-slate-800" /></td>
                                        <td className="p-5"><Skeleton className="h-5 w-24 ml-auto rounded bg-slate-800" /></td>
                                        <td className="p-5"><Skeleton className="h-8 w-32 mx-auto rounded bg-slate-800" /></td>
                                    </tr>
                                ))
                            ) : coins.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center text-slate-500 py-12 text-lg">
                                        Unable to load market data. Please try again later.
                                    </td>
                                </tr>
                            ) : (
                                coins.map((coin, idx) => (
                                    <tr
                                        key={coin.id}
                                        onClick={() => handleCoinClick(coin)}
                                        className="hover:bg-white/5 transition-colors duration-200 cursor-pointer group"
                                    >
                                        <td className="p-5 pl-8 text-slate-500 font-medium">{idx + 1}</td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full shadow-lg" />
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-primary transition-colors">{coin.name}</p>
                                                    <p className="text-xs text-slate-500 uppercase font-medium tracking-wide">{coin.symbol}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right font-medium text-white">₹{coin.current_price.toLocaleString()}</td>
                                        <td className={`p-5 text-right font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            <div className="flex items-center justify-end gap-1">
                                                {coin.price_change_percentage_24h >= 0 ?
                                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12"><path d="M6 2L2 9h8L6 2z" /></svg> :
                                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12"><path d="M6 10l4-7H2l4 7z" /></svg>
                                                }
                                                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                            </div>
                                        </td>
                                        <td className="p-5 text-right text-slate-400 font-medium">
                                            {/* Auto-format Market Cap (Trillions/Billions) */}
                                            {coin.market_cap > 1e12
                                                ? `₹${(coin.market_cap / 1e12).toFixed(2)}T`
                                                : `₹${(coin.market_cap / 1e9).toFixed(2)}B`
                                            }
                                        </td>
                                        <td className="p-5 w-48">
                                            <div className="h-12 w-32 mx-auto filter group-hover:brightness-110 transition-all">
                                                {coin.sparkline && coin.sparkline.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={coin.sparkline.map((p, i) => ({ i, p }))}>
                                                            <Area
                                                                type="monotone"
                                                                dataKey="p"
                                                                stroke={coin.price_change_percentage_24h >= 0 ? '#34d399' : '#fb7185'}
                                                                strokeWidth={2}
                                                                fillOpacity={0.1}
                                                                fill={coin.price_change_percentage_24h >= 0 ? '#34d399' : '#fb7185'}
                                                                isAnimationActive={false}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-xs text-slate-600">No Data</div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed Chart Modal */}
            {selectedCoin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="glass-panel w-full max-w-5xl p-8 relative z-10 animate-in fade-in zoom-in duration-300 shadow-2xl shadow-black/50">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-5">
                                <img src={selectedCoin.image} alt={selectedCoin.name} className="w-14 h-14 p-1 bg-white/5 rounded-full" />
                                <div>
                                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                        {selectedCoin.name}
                                        <span className="text-lg text-slate-500 font-medium bg-white/5 px-2 py-1 rounded">
                                            {selectedCoin.symbol.toUpperCase()}
                                        </span>
                                    </h2>
                                    <p className="text-2xl font-bold mt-2 text-primary">₹{selectedCoin.current_price.toLocaleString()}</p>
                                </div>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-6 bg-white/5 p-1 rounded-lg w-fit">
                            <div className="flex gap-1">
                                {['1D', '7D', '30D', '1Y'].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDays(d === '1D' ? '1' : d === '7D' ? '7' : d === '30D' ? '30' : '365')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${(d === '7D' && days === '7') || (d === '1D' && days === '1') || (d === '30D' && days === '30') || (d === '1Y' && days === '365')
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'hover:bg-white/10 text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Alert Section */}
                        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Set Price Alert</h3>
                                    <p className="text-xs text-slate-400">Notify when price is...</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={alertCondition}
                                    onChange={(e) => setAlertCondition(e.target.value)}
                                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                >
                                    <option value="ABOVE">Above</option>
                                    <option value="BELOW">Below</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Target Price (₹)"
                                    value={alertPrice}
                                    onChange={(e) => setAlertPrice(e.target.value)}
                                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-32 focus:outline-none focus:border-primary"
                                />
                                <button
                                    onClick={handleCreateAlert}
                                    disabled={!alertPrice}
                                    className="bg-primary hover:bg-primary/90 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                                >
                                    Set Alert
                                </button>
                            </div>
                        </div>
                        {alertMessage && (
                            <div className={`mb-4 p-3 rounded-lg text-sm font-bold text-center ${alertMessage.includes('Failed') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {alertMessage}
                            </div>
                        )}


                        <div className="h-[450px] w-full bg-black/20 rounded-2xl p-6 border border-white/5 relative">
                            {chartLoading ? (
                                <Skeleton className="w-full h-full rounded-xl bg-slate-800/50" />
                            ) : chartData && chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="time"
                                            stroke="#64748b"
                                            tick={{ fontSize: 12, fill: '#64748b' }}
                                            tickMargin={15}
                                            minTickGap={40}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            stroke="#64748b"
                                            domain={['auto', 'auto']}
                                            tickFormatter={(val) => `₹${val.toLocaleString()}`}
                                            tick={{ fontSize: 12, fill: '#64748b' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorPrice)"
                                            activeDot={{ r: 6, fill: '#60a5fa', stroke: '#1e3a8a', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    </svg>
                                    <p>No chart data available for this timeframe</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Market;
