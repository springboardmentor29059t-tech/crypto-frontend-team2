import { useState, useEffect } from 'react';
import api from '../utils/api';

const Risk = () => {
    const [contractAddress, setContractAddress] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recentAlerts, setRecentAlerts] = useState([]);

    useEffect(() => {
        fetchRecentAlerts();
    }, []);

    const fetchRecentAlerts = async () => {
        try {
            // Mock alerts for now, replace with API call later
            // const res = await api.get('/risk/alerts');
            // setRecentAlerts(res.data);
            setRecentAlerts([
                { id: 1, type: 'HIGH', message: 'Phishing Attempt Detected: Fake USDC Token', date: '2025-01-05' },
                { id: 2, type: 'MEDIUM', message: 'Suspicious Contract Interaction on wallet 0x8a...3f', date: '2025-01-04' },
                { id: 3, type: 'LOW', message: 'New unknown token airdropped to your wallet', date: '2025-01-02' },
            ]);
        } catch (err) {
            console.error("Failed to fetch alerts", err);
        }
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setAnalysisResult(null);

        try {
            const res = await api.get(`/risk/analyze?address=${contractAddress}`);
            setAnalysisResult(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to analyze contract. Please check the address.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Risk Analysis</h1>
                <p className="text-slate-400">Check contract reputation and view security alerts.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contract Scanner */}
                <div className="glass-card p-6 rounded-2xl">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Contract Scanner
                    </h2>
                    <form onSubmit={handleAnalyze} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300 block mb-2">Contract Address</label>
                            <input
                                type="text"
                                value={contractAddress}
                                onChange={(e) => setContractAddress(e.target.value)}
                                className="input-primary w-full"
                                placeholder="e.g. 0x123..."
                                required
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setContractAddress('0x71C7656EC7ab88b098defB751B7401B5f6d8976F')}
                                    className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded hover:bg-green-500/20 transition-colors"
                                >
                                    Try Safe
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setContractAddress('0x000000000000000000000000000000000000dead')}
                                    className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded hover:bg-red-500/20 transition-colors"
                                >
                                    Try High Risk
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setContractAddress('0x1234567890abcdef1234567890abcdef12345bad')}
                                    className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded hover:bg-yellow-500/20 transition-colors"
                                >
                                    Try Warning
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {loading ? 'Scanning...' : 'Analyze Contract'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {analysisResult && (
                        <div className="mt-6 space-y-4 animate-fade-in">
                            <div className={`p-4 rounded-xl border ${analysisResult.riskLevel === 'HIGH' ? 'bg-red-500/10 border-red-500/30' :
                                analysisResult.riskLevel === 'MEDIUM' ? 'bg-yellow-500/10 border-yellow-500/30' :
                                    'bg-green-500/10 border-green-500/30'
                                }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-slate-400 text-sm">Risk Score</span>
                                    <span className={`text-2xl font-bold ${analysisResult.riskLevel === 'HIGH' ? 'text-red-500' :
                                        analysisResult.riskLevel === 'MEDIUM' ? 'text-yellow-500' :
                                            'text-green-500'
                                        }`}>{analysisResult.riskScore}/100</span>
                                </div>
                                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${analysisResult.riskLevel === 'HIGH' ? 'bg-red-500' :
                                            analysisResult.riskLevel === 'MEDIUM' ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`}
                                        style={{ width: `${analysisResult.riskScore}%` }}
                                    />
                                </div>
                                <p className={`mt-3 font-semibold ${analysisResult.riskLevel === 'HIGH' ? 'text-red-400' :
                                    analysisResult.riskLevel === 'MEDIUM' ? 'text-yellow-400' :
                                        'text-green-400'
                                    }`}>
                                    Verdict: {analysisResult.verdict}
                                </p>
                            </div>

                            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                <h3 className="font-semibold text-white mb-2">Analysis Details</h3>
                                <ul className="space-y-2 text-sm text-slate-300">
                                    {analysisResult.details && analysisResult.details.map((detail, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-secondary mt-1">•</span>
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Alerts */}
                <div className="glass-card p-6 rounded-2xl">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Security Alerts
                    </h2>
                    <div className="space-y-4">
                        {recentAlerts.map(alert => (
                            <div key={alert.id} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${alert.type === 'HIGH' ? 'bg-red-500/20 text-red-500' :
                                        alert.type === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' :
                                            'bg-blue-500/20 text-blue-500'
                                        }`}>
                                        {alert.type}
                                    </span>
                                    <span className="text-xs text-slate-500">{alert.date}</span>
                                </div>
                                <p className="text-slate-300 text-sm">{alert.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Risk;
