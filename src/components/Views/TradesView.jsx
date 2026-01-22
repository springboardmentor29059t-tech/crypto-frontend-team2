import React, { useState, useEffect } from 'react';
import { getUserTrades, addTrade } from '../../api/tradeApi';

const TradesView = ({ selectedAsset, showToast }) => {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters
    const [filterType, setFilterType] = useState('all');
    const [filterAsset, setFilterAsset] = useState('all');
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Initialize with defaults, updated by selectedAsset later
    const [newTrade, setNewTrade] = useState({
        type: 'BUY',
        asset: 'BTC',
        quantity: '',
        price: '',
        fee: '',
        exchangeId: '1' 
    });

    const CURRENT_USER_ID = 1;

    // --- NEW: Sync Form with Selected Asset from Market Page ---
    useEffect(() => {
        if (selectedAsset) {
            setNewTrade(prev => ({
                ...prev,
                asset: selectedAsset.symbol,
                price: selectedAsset.price ? selectedAsset.price.toFixed(2) : prev.price
            }));
            
            // Optional: Automatically switch filter to this asset
            setFilterAsset(selectedAsset.symbol);
        }
    }, [selectedAsset]);

    const loadTrades = async () => {
        setLoading(true);
        try {
            const data = await getUserTrades(CURRENT_USER_ID);
            setTrades(data);
            setError(null);
        } catch (err) {
            setError("Could not load trade data.");
            setTrades([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrades();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTrade(prev => ({ ...prev, [name]: value }));
    };

    const handleAddTrade = async (e) => {
        e.preventDefault();
        try {
            await addTrade(CURRENT_USER_ID, newTrade);
            setIsModalOpen(false); 
            
            // Reset form
            setNewTrade({
                type: 'BUY', 
                asset: selectedAsset ? selectedAsset.symbol : 'BTC', // Reset to selected or default
                quantity: '', 
                price: selectedAsset ? selectedAsset.price.toFixed(2) : '', 
                fee: '', 
                exchangeId: '1'
            });
            
            showToast("Trade added successfully!");
            loadTrades(); 
        } catch (err) {
            showToast("Error adding trade");
        }
    };

    const filteredTrades = trades.filter(t => {
        const matchesSearch = t.date.includes(search) || t.exchange.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesAsset = filterAsset === 'all' || t.asset === filterAsset;
        return matchesSearch && matchesType && matchesAsset;
    });

    if (loading) return <div className="p-10 text-center text-cyan-500">Loading trades...</div>;

    return (
        <div className="fade-in h-full flex flex-col">
            {/* --- Context Banner: Shows if user clicked a coin in Market --- */}
            {selectedAsset && (
                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-4 mb-6 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3">
                        <img src={selectedAsset.image} alt={selectedAsset.name} className="w-8 h-8 rounded-full" />
                        <div>
                            <h3 className="text-white font-bold">Trading: {selectedAsset.name} ({selectedAsset.symbol})</h3>
                            <p className="text-cyan-400 text-sm">Current Price: ${parseFloat(selectedAsset.price).toLocaleString()}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold py-2 px-6 rounded transition shadow-lg shadow-cyan-500/20"
                    >
                        Quick Trade
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Your Trades</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition border border-gray-600"
                >
                    + Add Trade
                </button>
            </div>

            {/* Filter Section */}
            <div className="bg-gray-900/50 neon-border rounded-xl p-6 mb-6">
                <div className="flex flex-wrap gap-4">
                    <input 
                        type="text" 
                        placeholder="Search transactions..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 min-w-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-white placeholder-gray-500" 
                    /> 
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white">
                        <option value="all">All Types</option>
                        <option value="BUY">Buy</option>
                        <option value="SELL">Sell</option>
                    </select> 
                    
                    {/* Include selected asset in filter list dynamically */}
                    <select value={filterAsset} onChange={(e) => setFilterAsset(e.target.value)} className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white">
                        <option value="all">All Assets</option>
                        {selectedAsset && (
                            <option value={selectedAsset.symbol}>{selectedAsset.symbol}</option>
                        )}
                        <option value="BTC">BTC</option>
                        <option value="ETH">ETH</option>
                        <option value="SOL">SOL</option>
                    </select>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-gray-900/50 neon-border rounded-xl overflow-hidden flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-800/50">
                            <tr>
                                {['Date & Time', 'Type', 'Asset Symbol', 'Quantity', 'Price', 'Fee', 'Total', 'Exchange'].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredTrades.map(trade => (
                                <tr key={trade.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4 text-gray-300">{trade.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{trade.type}</span>
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
                                    <td className="px-6 py-4 text-gray-300">${parseFloat(trade.price).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-300">${parseFloat(trade.fee).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-white font-semibold">${parseFloat(trade.total).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-400">{trade.exchange}</td>
                                </tr>
                            ))}
                            {filteredTrades.length === 0 && (
                                <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500">No trades found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD TRADE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md neon-border shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Add New Trade</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
                        </div>
                        
                        {/* Selected Asset Indicator in Modal */}
                        {selectedAsset && (
                            <div className="bg-gray-700/50 p-2 rounded mb-4 flex items-center gap-2">
                                <img src={selectedAsset.image} className="w-5 h-5 rounded-full" />
                                <span className="text-xs text-gray-300">Pre-filled: <strong>{selectedAsset.name}</strong></span>
                            </div>
                        )}
                        
                        <form onSubmit={handleAddTrade} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Type</label>
                                    <select name="type" value={newTrade.type} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 outline-none focus:border-cyan-500">
                                        <option value="BUY">Buy</option>
                                        <option value="SELL">Sell</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Asset</label>
                                    <select name="asset" value={newTrade.asset} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 outline-none focus:border-cyan-500">
                                        {selectedAsset && (
                                            <option value={selectedAsset.symbol}>{selectedAsset.symbol}</option>
                                        )}
                                        <option value="BTC">BTC</option>
                                        <option value="ETH">ETH</option>
                                        <option value="SOL">SOL</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Exchange</label>
                                <select name="exchangeId" value={newTrade.exchangeId} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 outline-none focus:border-cyan-500">
                                    <option value="1">Binance</option>
                                    <option value="2">Coinbase</option>
                                    <option value="3">Kraken</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Price ($)</label>
                                <input type="number" step="0.01" name="price" required value={newTrade.price} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 outline-none focus:border-cyan-500" />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Quantity</label>
                                <input type="number" step="0.00000001" name="quantity" required value={newTrade.quantity} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 outline-none focus:border-cyan-500" />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Fee ($)</label>
                                <input type="number" step="0.01" name="fee" required value={newTrade.fee} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 outline-none focus:border-cyan-500" />
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded transition">
                                    Save Trade
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradesView;