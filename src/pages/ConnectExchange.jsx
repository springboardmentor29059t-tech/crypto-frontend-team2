import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  Shield, Key, RefreshCcw, CheckCircle2, AlertTriangle,
  Trash2, Server, Globe, Lock, Link2, Zap, Activity
} from 'lucide-react';

const ConnectExchange = () => {
  const navigate = useNavigate();

  // State
  const [exchanges, setExchanges] = useState([]);
  const [connectedKeys, setConnectedKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [selectedExchangeId, setSelectedExchangeId] = useState('');
  const [formData, setFormData] = useState({ key: '', secret: '', label: '' });

  // 🔄 Initial Data Load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [exchangesRes, keysRes] = await Promise.all([
        api.get('/exchanges'),
        api.get('/exchanges/keys')
      ]);

      setExchanges(exchangesRes.data);
      setConnectedKeys(keysRes.data);

      if (exchangesRes.data.length > 0) {
        setSelectedExchangeId(exchangesRes.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load exchange data", err);
      setError("Could not load exchange registry. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Handle Connection
  const handleConnect = async (e) => {
    e.preventDefault();
    if (!selectedExchangeId) {
      setError("Please click on an Exchange Platform (e.g. Binance) to select it.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post('/exchanges/keys', {
        exchangeId: Number(selectedExchangeId),
        key: formData.key,
        secret: formData.secret,
        label: formData.label || 'My Exchange'
      });

      setSyncing(true);
      // Trigger sync (Mock or Real)
      try { await api.post('/exchanges/sync/binance'); } catch (e) { console.warn("Sync trigger failed", e); }

      setSyncing(false);
      setFormData({ key: '', secret: '', label: '' });
      fetchData();

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Connection failed. Verify API permissions.");
      setSyncing(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async (keyId) => {
    if(!window.confirm("Terminate uplink? This will stop data synchronization.")) return;
    alert("Disconnection feature coming in next update.");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
      <RefreshCcw className="animate-spin text-blue-500" size={48} strokeWidth={1} />
      <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] animate-pulse">Establishing Uplink...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-24 font-sans animate-in fade-in duration-700 relative">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-lg shadow-lg">
                <Link2 size={18} className="text-blue-500" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Exchange Hub</h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                    Connect External Portfolios • API Bridge
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Connection Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Main Card */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6 text-white">
                <Globe size={16} className="text-blue-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider">New Connection Protocol</h2>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400 mb-6 animate-pulse">
                  <AlertTriangle size={16} />
                  <p className="text-xs font-bold tracking-wide">{error}</p>
                </div>
              )}

              <form onSubmit={handleConnect} className="space-y-8">

                {/* 1. Exchange Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Select Network Node
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {exchanges.map(ex => (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => setSelectedExchangeId(ex.id)}
                          className={`relative p-4 rounded-xl border text-left transition-all group overflow-hidden ${
                            selectedExchangeId === ex.id
                            ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                            : 'bg-[#0B0E14] border-white/10 hover:border-white/20 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <Server size={18} className={selectedExchangeId === ex.id ? 'text-blue-400' : 'text-slate-600'} />
                            {selectedExchangeId === ex.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>}
                          </div>
                          <span className={`text-xs font-bold uppercase block tracking-wide ${selectedExchangeId === ex.id ? 'text-white' : 'text-slate-400'}`}>
                            {ex.name}
                          </span>
                          <span className="text-[9px] text-slate-600 font-mono mt-0.5 block">WebSocket Ready</span>
                        </button>
                    ))}
                  </div>
                </div>

                {/* 2. Credentials */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> API Credentials
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                        <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Public API Key"
                            value={formData.key}
                            onChange={(e) => setFormData({...formData, key: e.target.value})}
                            className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white font-mono focus:border-blue-500/50 focus:bg-[#0B0E14] outline-none transition-all placeholder:text-slate-700"
                            required
                        />
                    </div>
                    <div className="relative group">
                        <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="password"
                            placeholder="Private Secret"
                            value={formData.secret}
                            onChange={(e) => setFormData({...formData, secret: e.target.value})}
                            className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white font-mono focus:border-blue-500/50 focus:bg-[#0B0E14] outline-none transition-all placeholder:text-slate-700"
                            required
                        />
                    </div>
                  </div>

                  <div className="relative group">
                    <input
                        type="text"
                        placeholder="Label (e.g. Main Trading Account)"
                        value={formData.label}
                        onChange={(e) => setFormData({...formData, label: e.target.value})}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>

                {/* 3. Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || syncing}
                    className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    {syncing ? <RefreshCcw size={16} className="animate-spin" /> : <Shield size={16} />}
                    {syncing ? 'Synchronizing Ledger...' : submitting ? 'Encrypting & Connecting...' : 'Establish Secure Uplink'}
                  </button>
                  <p className="text-center text-[9px] text-slate-600 mt-4 font-bold uppercase flex items-center justify-center gap-1">
                    <Lock size={10} /> End-to-End AES-256 Encryption Active
                  </p>
                </div>

              </form>
            </div>
          </div>
        </div>

        {/* RIGHT: Active Connections */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl h-full flex flex-col">
            <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Activity size={16} className="text-emerald-500" /> Active Uplinks
            </h2>

            {connectedKeys.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 border border-dashed border-white/10 rounded-2xl bg-[#0B0E14]/50">
                <Server size={32} className="text-slate-800 mb-3" />
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">No Active Nodes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connectedKeys.map(key => (
                  <div key={key.id} className="bg-[#0B0E14]/80 border border-white/5 p-4 rounded-2xl group hover:border-blue-500/30 transition-all relative overflow-hidden">
                    {/* Status Dot */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-wider">Online</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                          {key.exchangeName ? key.exchangeName.substring(0,1).toUpperCase() : 'E'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-wide">{key.label || key.exchangeName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">ID: {key.id.toString().padStart(4, '0')}</p>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                        <button disabled className="flex-1 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-bold text-blue-400 uppercase tracking-wider flex items-center justify-center gap-1">
                          <RefreshCcw size={10} className="animate-spin" /> Auto-Sync
                        </button>
                        <button onClick={() => handleDisconnect(key.id)} className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-colors">
                           <Trash2 size={12} />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ConnectExchange;