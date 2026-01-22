import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { analyzeAssetRisk } from '../services/api';
import { api } from '../services/api';

const ScamScanner: React.FC = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        setLoading(true);
        try {
            // Using the centralized API instance (handles base URL automatically)
            const response = await api.get(`/api/scam/check`, {
                params: { token: query }
            });
            // ...

            const data = response.data;
            let signal = 'Yellow';
            if (data.riskLevel === 'CRITICAL' || data.riskLevel === 'HIGH') signal = 'Red';
            else if (data.riskLevel === 'LOW') signal = 'Green';

            setResult({
                name: data.token,
                symbol: data.token,
                status: data.riskLevel,
                scamLevel: data.scamScore + '%',
                signal: signal,
                reason: data.message,
                price: data.currentPrice,
                marketCap: data.marketCap
            });
        } catch (error) {
            console.error("Scan error", error);
            setResult({
                status: 'Error',
                scamLevel: 'N/A',
                signal: 'Yellow',
                reason: 'Failed to connect to scanner service.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 text-center space-y-6">
                <div className="mx-auto bg-red-500/10 w-20 h-20 rounded-3xl flex items-center justify-center border border-red-500/20">
                    <ShieldAlert size={40} className="text-red-500" />
                </div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Scam Scanner Node</h1>
                <p className="text-slate-400 max-w-xl mx-auto">
                    Global registry verification. Detect rugpulls, flagged contracts, and low-liquidity honeypots instantly.
                </p>

                <form onSubmit={handleScan} className="max-w-md mx-auto relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="SYMBOL OR NAME (e.g., SAFEMOON)..."
                        className="w-full bg-slate-950 border-2 border-slate-800 focus:border-red-500/50 rounded-2xl py-4 pl-6 pr-14 text-white font-bold placeholder:text-slate-600 outline-none transition-all uppercase tracking-widest text-xs"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-red-500 hover:bg-red-400 text-black rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <Search size={20} />}
                    </button>
                </form>
            </div>

            {result && (
                <div className={`border-2 rounded-[2rem] p-8 transition-all animate-in fade-in slide-in-from-bottom-4 ${result.signal === 'Red' ? 'bg-red-500/5 border-red-500/20' :
                    result.signal === 'Green' ? 'bg-green-500/5 border-green-500/20' :
                        'bg-yellow-500/5 border-yellow-500/20'
                    }`}>
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className={`p-6 rounded-3xl border ${result.signal === 'Red' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                            result.signal === 'Green' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                            }`}>
                            {result.signal === 'Red' ? <AlertTriangle size={48} /> :
                                result.signal === 'Green' ? <CheckCircle size={48} /> :
                                    <Info size={48} />}
                        </div>

                        <div className="flex-grow text-center md:text-left space-y-2">
                            <div className="flex flex-col md:flex-row items-baseline gap-4">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                                    {result.name || result.query} ({result.symbol || '???'})
                                </h3>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${result.signal === 'Red' ? 'bg-red-500 text-black' :
                                    result.signal === 'Green' ? 'bg-green-500 text-black' :
                                        'bg-yellow-500 text-black'
                                    }`}>
                                    {result.status}
                                </span>
                            </div>
                            <p className="text-slate-400 font-medium">
                                {result.reason || "Verification complete. High danger tokens are automatically flagged across global scam databases."}
                            </p>
                        </div>

                        <div className="text-center md:text-right">
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">DANGER INDEX</div>
                            <div className={`text-5xl font-black italic ${result.signal === 'Red' ? 'text-red-500' :
                                result.signal === 'Green' ? 'text-green-500' :
                                    'text-yellow-500'
                                }`}>
                                {result.scamLevel}
                            </div>
                        </div>
                    </div>

                    {result.price && (
                        <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Real Price</div>
                                <div className="text-white font-black">${result.price.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Market Cap</div>
                                <div className="text-white font-black">${(result.marketCap / 1e6).toFixed(2)}M</div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ScamScanner;
