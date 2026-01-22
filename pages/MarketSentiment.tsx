import React, { useEffect, useState } from 'react';
import { TrendingUp, Activity, BarChart2, AlertCircle } from 'lucide-react';
import { getMarketSentiment } from '../services/api';

const MarketSentiment: React.FC = () => {
    const [sentimentData, setSentimentData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getMarketSentiment();
                setSentimentData(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const getSentimentColor = (s: string) => {
        if (s === 'Bullish') return 'text-green-500';
        if (s === 'Bearish') return 'text-red-500';
        return 'text-yellow-500';
    };

    const getSentimentBg = (s: string) => {
        if (s === 'Bullish') return 'bg-green-500/10 border-green-500/20';
        if (s === 'Bearish') return 'bg-red-500/10 border-red-500/20';
        return 'bg-yellow-500/10 border-yellow-500/20';
    };

    if (loading) return <div className="text-white p-8">Loading analysis...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-fade-in">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
                    <Activity size={12} className="text-purple-400" />
                    Market Intelligence
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white px-4 mb-4">
                    Global Market Sentiment
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Real-time analysis of market trends, volatility, and volume indicators.
                </p>
            </div>

            <div className={`p-8 rounded-[2.5rem] border backdrop-blur-xl ${getSentimentBg(sentimentData?.sentiment || 'Neutral')} text-center`}>
                <div className="text-sm font-black uppercase tracking-widest opacity-60 mb-2">Current Sentiment</div>
                <div className={`text-6xl font-black ${getSentimentColor(sentimentData?.sentiment || 'Neutral')} mb-4`}>
                    {sentimentData?.sentiment || 'Neutral'}
                </div>
                <div className="flex justify-center gap-8 mt-8">
                    <div className="text-center">
                        <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Confidence</div>
                        <div className="text-xl font-bold text-white">{sentimentData?.confidence || 'Medium'}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Avg 24h Change</div>
                        <div className={`text-xl font-bold ${(sentimentData?.marketChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {sentimentData?.marketChange?.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-400" />
                        Methodology
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Our sentiment analysis aggregates price volume, volatility, and momentum indicators from the top 50 cryptocurrencies.
                        A score above +2% indicates bullish momentum, while below -2% indicates bearish trends.
                    </p>
                </div>
                <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle size={20} className="text-orange-400" />
                        Risk Disclaimer
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        This sentiment score is for informational purposes only and does not constitute financial advice.
                        Crypto markets are highly volatile. Always do your own research.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MarketSentiment;
