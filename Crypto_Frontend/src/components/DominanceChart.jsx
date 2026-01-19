import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#F7931A', '#627EEA', '#10B981', '#FBBF24', '#EF4444'];

const DominanceChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-slate-500">
                No data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff'
                    }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => [`${value.toFixed(1)}%`, 'Share']}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default DominanceChart;
