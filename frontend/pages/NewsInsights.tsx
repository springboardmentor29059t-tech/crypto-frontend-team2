import React, { useEffect, useState } from 'react';
import { Newspaper, Bell, ExternalLink, Calendar, User, Clock, Search } from 'lucide-react';
import { getLatestNews } from '../services/api';

const NewsInsights: React.FC = () => {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const data = await getLatestNews();
                if (data && data.news) {
                    setNews(data.news);

                    if (data.lastUpdated) {
                        const date = new Date(data.lastUpdated);
                        setLastUpdated(date.toLocaleTimeString());

                        // Mark as read in local storage to clear sidebar dot
                        localStorage.setItem('lastViewedNewsTimestamp', date.toISOString());
                        // Dispatch storage event to update sidebar immediately if possible, 
                        // or rely on sidebar polling/mount check
                        window.dispatchEvent(new Event('storage'));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch news", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const filteredNews = news.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-[1400px] mx-auto pb-20 space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 flex items-center gap-3">
                        <Newspaper className="text-pink-500" size={32} />
                        News Insights
                    </h1>
                    <p className="text-slate-400 font-medium">Real-time cryptocurrency market intelligence and global updates.</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Live Feed Active
                        </span>
                    </div>
                    {lastUpdated && (
                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            Last Updated: {lastUpdated}
                        </div>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-slate-900/50 p-1 rounded-2xl border border-slate-800 max-w-lg relative group focus-within:border-pink-500/50 transition-colors">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="SEARCH HEADLINES..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-white font-bold p-4 pl-12 focus:outline-none placeholder:text-slate-600 uppercase tracking-wide text-sm"
                />
            </div>

            {/* News Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-64 bg-slate-900/50 rounded-[2rem] border border-white/5 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNews.map((item) => (
                        <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden group hover:border-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/5 transition-all duration-300 flex flex-col h-full">
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                    onError={(e: any) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1621504450168-38f64731b667?auto=format&fit=crop&q=80&w=1000';
                                    }}
                                />
                                <div className="absolute top-4 left-4 bg-slate-950/90 px-3 py-1 rounded-full text-[10px] font-black text-white border border-white/10 tracking-widest uppercase">
                                    {item.source}
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-2 mb-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    <Clock size={12} />
                                    {new Date(item.publishedAt * 1000).toLocaleDateString()}
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-pink-400 transition-colors">
                                    {item.title}
                                </h3>

                                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                                    {item.summary}
                                </p>

                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-auto flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:bg-pink-500 group-hover:border-pink-500 transition-all group/btn"
                                >
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover/btn:text-white transition-colors">Read Article</span>
                                    <ExternalLink size={16} className="text-slate-400 group-hover/btn:text-white transition-colors" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800">
                    <Newspaper size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-500 font-bold">No news found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default NewsInsights;
