import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import Skeleton from './Skeleton';

const PortfolioChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/portfolio/history');
                const history = res.data;

                if (history && history.length > 0) {
                    const chartData = history.map(item => ({
                        name: new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
                        value: item.totalValueUsd
                    }));
                    setData(chartData);
                } else {
                    // Fallback or Empty State
                    setData([]);
                }
            } catch (err) {
                console.error("Failed to fetch portfolio history", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <Skeleton className="h-full w-full rounded-xl" />;

    return (
        <div className="bg-card p-6 rounded-xl border border-slate-700 h-full flex flex-col">
            <h3 className="text-slate-400 mb-4 font-bold">Portfolio Value (History)</h3>
            <div className="flex-1 w-full min-h-[300px]">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₹${value / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                itemStyle={{ color: '#10B981' }}
                                formatter={(value) => [`₹${value.toLocaleString()}`, 'Portfolio Value']}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#10B981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No history data yet. Wait for next snapshot (1 min).
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioChart;
