import { useState, useEffect } from 'react';
import api from '../utils/api';

const AddTransactionModal = ({ isOpen, onClose, onTransactionAdded, initialData = null }) => {
    const [formData, setFormData] = useState({
        symbol: '',
        amount: '',
        price: '',
        type: 'BUY'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    symbol: initialData.asset,
                    amount: initialData.amount,
                    price: initialData.price,
                    type: initialData.type.toUpperCase(),
                    date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 16) : '' // format for datetime-local
                });
            } else {
                setFormData({
                    symbol: '',
                    amount: '',
                    price: '',
                    type: 'BUY',
                    date: ''
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Clean/Transform Data: Ensure positives
            const payload = {
                ...formData,
                amount: Math.abs(parseFloat(formData.amount)),
                price: formData.price ? Math.abs(parseFloat(formData.price)) : 0
            };

            if (initialData && initialData.id) {
                // Edit Mode
                // Strip "man-" prefix if present (it's added in Transactions.jsx for list keys)
                const id = initialData.id.toString().replace('man-', '');
                await api.put(`/manual/${id}`, { ...payload, date: formData.date ? new Date(formData.date).toISOString() : undefined });
            } else {
                // Add Mode
                await api.post('/manual', { ...payload, date: formData.date ? new Date(formData.date).toISOString() : undefined });
            }

            onTransactionAdded();
            onClose();
            // Reset is handled by useEffect on next open
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data || err.message || 'Failed to save transaction';
            setError(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-card w-full max-w-md rounded-xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <h2 className="text-xl font-bold text-white">
                        {initialData ? 'Edit Transaction' : 'Add Asset'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-dark border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            >
                                <option value="BUY">Buy</option>
                                <option value="SELL">Sell</option>
                                <option value="DEPOSIT">Deposit</option>
                                <option value="WITHDRAW">Withdraw</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Symbol</label>
                            <input
                                type="text"
                                placeholder="BTC"
                                value={formData.symbol}
                                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                                className="w-full bg-dark border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none uppercase"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Amount</label>
                        <input
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full bg-dark border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            required
                        />
                        <p className="text-xs text-slate-500 mt-1">If "Sell", we'll subtract this positive amount.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Price per Coin (USD) <span className="text-xs text-gray-500">(Optional)</span></label>
                        <input
                            type="number"
                            step="any"
                            placeholder="Current Price"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full bg-dark border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Date & Time <span className="text-xs text-gray-500">(Optional)</span></label>
                        <input
                            type="datetime-local"
                            value={formData.date || ''}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full bg-dark border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.symbol || !formData.amount}
                            className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : (initialData ? 'Update Transaction' : 'Add Transaction')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;
