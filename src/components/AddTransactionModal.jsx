import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
  X, Search, IndianRupee, ArrowUpRight, ArrowDownRight,
  Loader2, ShieldCheck, Wallet, Terminal, Calculator
} from 'lucide-react';

const AddTransactionModal = ({ isOpen, onClose, availableCoins, onSuccess }) => {
  const [type, setType] = useState('BUY');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSelectedCoin(null);
        setAmount('');
        setPrice('');
        setSearchTerm('');
        setType('BUY');
        setLoading(false);
      }, 300); // Delay reset for fade-out animation
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCoins = availableCoins.filter(coin =>
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCoin || !amount || !price) return;

    setLoading(true);

    try {
      const transactionData = {
        assetId: selectedCoin.id,
        assetSymbol: selectedCoin.symbol.toUpperCase(),
        assetName: selectedCoin.name,
        quantity: parseFloat(amount),
        avgCost: parseFloat(price),
        transactionType: type,
        timestamp: new Date().toISOString(),
        walletType: 'exchange'
      };

      const response = await api.post('/portfolio', transactionData);

      if (response.status === 200 || response.status === 201) {
        // Trigger notification refresh
        window.dispatchEvent(new Event('notificationUpdate'));

        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Transaction Error:", err);
      alert(err.response?.data?.message || "Failed to sync transaction with vault.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCoin = (coin) => {
    setSelectedCoin(coin);
    setPrice(coin.current_price);
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#0B0E14] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 pointer-events-auto relative">

            {loading && <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 w-full animate-progress z-50" />}

            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0B0E14]">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 rounded-lg border border-white/10">
                        <Terminal size={18} className="text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">New Order</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Manual Entry • Spot Market
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* Mode Selection (Only visible if coin selected) */}
                {selectedCoin && (
                    <div className="grid grid-cols-2 gap-3 p-1 bg-slate-900/50 rounded-xl border border-white/5">
                        <button
                            type="button"
                            onClick={() => setType('BUY')}
                            className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${
                                type === 'BUY'
                                ? 'bg-emerald-600 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                        >
                            <ArrowUpRight size={14} /> Buy
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('SELL')}
                            className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${
                                type === 'SELL'
                                ? 'bg-rose-600 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                        >
                            <ArrowDownRight size={14} /> Sell
                        </button>
                    </div>
                )}

                {/* Content Body */}
                {!selectedCoin ? (
                    // STEP 1: SELECT COIN
                    <div className="space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search asset (e.g. Bitcoin)..."
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-11 pr-4 text-white text-sm font-medium focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-1 space-y-1">
                            {filteredCoins.map(coin => (
                                <button
                                    key={coin.id}
                                    type="button"
                                    onClick={() => handleSelectCoin(coin)}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-white/5 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={coin.image} className="w-8 h-8 rounded-lg bg-slate-950 p-0.5" alt="" />
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{coin.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{coin.symbol}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-mono font-medium text-slate-400 group-hover:text-white">
                                        {formatINR(coin.current_price)}
                                    </p>
                                </button>
                            ))}
                            {filteredCoins.length === 0 && (
                                <div className="text-center py-8 text-slate-600 text-xs uppercase font-bold tracking-widest">
                                    No Assets Found
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // STEP 2: ENTER DETAILS
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">

                        {/* Selected Coin Header */}
                        <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <img src={selectedCoin.image} className="w-10 h-10 rounded-xl" alt="" />
                                <div>
                                    <p className="font-bold text-white text-sm">{selectedCoin.name}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedCoin.symbol}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedCoin(null)}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 uppercase tracking-wider transition-all"
                            >
                                Change
                            </button>
                        </div>

                        {/* Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Quantity</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="0.00"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 px-4 text-white text-sm font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Price (INR)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="any"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 px-4 text-white text-sm font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Total Estimator */}
                        <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl flex justify-between items-center">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Calculator size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Total Value</span>
                            </div>
                            <span className="text-lg font-mono font-bold text-white tracking-tight">
                                {formatINR(parseFloat(amount || 0) * parseFloat(price || 0))}
                            </span>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${
                                type === 'BUY'
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : (
                                <>
                                    <ShieldCheck size={16} />
                                    Confirm {type} Order
                                </>
                            )}
                        </button>
                    </div>
                )}
            </form>
        </div>
      </div>
    </>
  );
};

export default AddTransactionModal;