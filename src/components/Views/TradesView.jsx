import React, { useState } from 'react';
import { TRADES_DATA } from '../../data/constants';

const TradesView = () => {
    const [filterType, setFilterType] = useState('all');
    const [filterAsset, setFilterAsset] = useState('all');
    const [search, setSearch] = useState('');

    const filteredTrades = TRADES_DATA.filter(t => {
        const matchesSearch = t.date.includes(search) || t.exchange.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesAsset = filterAsset === 'all' || t.asset === filterAsset;
        return matchesSearch && matchesType && matchesAsset;
    });

    return (
        <div className="fade-in">
           
            <div className="bg-gray-900/50 neon-border rounded-xl p-6 mb-6">
                <div className="flex flex-wrap gap-4">
                    <input 
                        type="text" 
                        placeholder="Search transactions..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 min-w-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" 
                    /> 
                    <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none"
                    >
                        <option value="all">All Types</option>
                        <option value="BUY">Buy</option>
                        <option value="SELL">Sell</option>
                    </select> 
                    <select 
                        value={filterAsset}
                        onChange={(e) => setFilterAsset(e.target.value)}
                        className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none"
                    >
                        <option value="all">All Assets</option>
                        <option value="BTC">BTC</option>
                        <option value="ETH">ETH</option>
                        <option value="SOL">SOL</option>
                    </select>
                </div>
            </div>
            <div className="bg-gray-900/50 neon-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-800/50">
                            <tr>
                                {['Date & Time', 'Type', 'Asset', 'Quantity', 'Price', 'Fee', 'Total', 'Exchange'].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredTrades.map(trade => (
                                <tr key={trade.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4 text-gray-300">{trade.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {trade.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-6 h-6 bg-gradient-to-br ${trade.gradient} rounded-full flex items-center justify-center text-xs font-bold text-white`}>
                                                {trade.icon}
                                            </div>
                                            <span className="text-white font-medium">{trade.asset}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white">{trade.qty} {trade.asset}</td>
                                    <td className="px-6 py-4 text-gray-300">${trade.price.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-300">${trade.fee.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-white font-semibold">${trade.total.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-400">{trade.exchange}</td>
                                </tr>
                            ))}
                            {filteredTrades.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">No trades found matching filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TradesView;