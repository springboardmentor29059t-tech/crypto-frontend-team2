import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const AllocationChart = ({ assets }) => {
    // If no assets provided or empty, show placeholder or empty state
    if (!assets || assets.length === 0) {
        return (
            <div className="bg-card p-6 rounded-xl border border-slate-700 h-full flex flex-col items-center justify-center text-gray-500">
                <p>No assets to display</p>
            </div>
        );
    }

    // Process data:
    // 1. Calculate Total Value
    // 2. Filter out tiny dust
    // 3. Format for Chart
    const totalValue = assets.reduce((acc, curr) => acc + curr.value, 0);

    // Sort by value desc
    const sortedAssets = [...assets].sort((a, b) => b.value - a.value);

    // Take top 5, group rest as "Other"
    let chartData = sortedAssets.slice(0, 5).map(asset => ({
        name: asset.symbol,
        value: asset.value,
        percent: (asset.value / totalValue) * 100
    }));

    if (sortedAssets.length > 5) {
        const otherValue = sortedAssets.slice(5).reduce((acc, curr) => acc + curr.value, 0);
        chartData.push({
            name: 'Other',
            value: otherValue,
            percent: (otherValue / totalValue) * 100
        });
    }

    // Improved Color Palette (Emerald/Teal/Cyan/Blue/Indigo) -> fitting the Dark/Green theme
    const COLORS = ['#10B981', '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#94A3B8'];

    return (
        <div className="bg-card p-6 rounded-xl border border-slate-700 h-full flex flex-col">
            <h3 className="text-slate-400 mb-4 font-bold">Asset Allocation</h3>
            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            formatter={(value) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 'Value']}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            {totalValue > 0 && (
                <div className="text-center mt-2 text-xs text-slate-500">
                    Total: ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
            )}
        </div>
    );
};

export default AllocationChart;
