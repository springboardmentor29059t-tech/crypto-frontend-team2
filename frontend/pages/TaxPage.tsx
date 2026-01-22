import React, { useState, useEffect } from 'react';
import { api, getPersonalTaxSummary, exportPersonalTaxCsv } from '../services/api';
import { Download, RefreshCw, Calendar, ArrowUpRight, Briefcase, DollarSign, AlertTriangle } from 'lucide-react';
import { usePersonalNode } from '../PersonalNodeContext';

const TaxPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [financialYear, setFinancialYear] = useState('all');
    const { assets } = usePersonalNode();

    const years = ['all', '2025-26', '2024-25', '2023-24', '2022-23'];

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getPersonalTaxSummary(financialYear);
            setData(res);
        } catch (error) {
            console.error(`Failed to fetch tax data`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [financialYear, assets]);

    const handleExport = () => {
        exportPersonalTaxCsv();
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const handleReset = async () => {
        if (confirm('Are you sure you want to reset your tax history? This will clear all transaction logs but keep your current assets.')) {
            try {
                // Manually calling the new endpoint via axios instance 'api'
                await api.delete('/api/tax/personal/reset');
                // Refresh data to show clean slate (except for new syncs)
                fetchData();
            } catch (error) {
                console.error("Reset failed", error);
            }
        }
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="animate-spin text-yellow-500" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in text-white pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Taxation</h1>
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/20 text-green-400 border border-green-500/30">
                            Personal Node
                        </span>
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2 flex items-center gap-2">
                        “Your personalized tax report”
                    </p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="relative">
                        <select
                            value={financialYear}
                            onChange={(e) => setFinancialYear(e.target.value)}
                            className="appearance-none bg-slate-900 border border-slate-800 text-white pl-10 pr-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest focus:outline-none focus:border-yellow-500 transition-all cursor-pointer"
                        >
                            {years.map(y => <option key={y} value={y}>{y === 'all' ? 'All Time' : y}</option>)}
                        </select>
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    </div>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-red-500/30"
                    >
                        <RefreshCw size={16} /> Reset History
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-slate-700"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Short-Term Gains', value: data?.shortTermGains || 0, icon: <ArrowUpRight className="text-orange-400" /> },
                    { label: 'Long-Term Gains', value: data?.longTermGains || 0, icon: <Briefcase className="text-indigo-400" /> },
                    { label: 'Total Taxable Amount', value: data?.totalTaxableAmount || 0, icon: <DollarSign className="text-yellow-400" />, highlight: true },
                ].map((card, i) => (
                    <div key={i} className={`p-6 rounded-[2.5rem] border backdrop-blur-sm group transition-all ${card.highlight ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{card.label}</span>
                            <div className="bg-slate-800/50 p-2 rounded-lg group-hover:scale-110 transition-transform">{card.icon}</div>
                        </div>
                        <div className={`text-2xl font-black tracking-tighter ${card.highlight ? 'text-yellow-500' : 'text-white'}`}>
                            {formatCurrency(card.value)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tax Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
                <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-xl font-black uppercase tracking-tight">Asset-wise Tax Details</h3>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                        <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-500 text-[10px]">i</span>
                        </div>
                        <span>Taxable gains are generated only upon SELLING assets. Unsold assets are shown as 'BUY/HOLD'.</span>
                    </div>

                    <button
                        onClick={fetchData}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="Refresh Tax Data"
                    >
                        <RefreshCw size={16} className={loading && !data ? 'animate-spin' : ''} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-950/30">
                                <th className="px-8 py-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Asset</th>
                                <th className="px-8 py-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Quantity</th>
                                <th className="px-8 py-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Buy Price</th>
                                <th className="px-8 py-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Sell Price</th>
                                <th className="px-8 py-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Gain/Loss</th>
                                <th className="px-8 py-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {data?.details?.length > 0 ? (
                                data.details.map((asset: any, i: number) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-5 font-black tracking-tight">{asset.symbol}</td>
                                        <td className="px-8 py-5 font-medium text-slate-300">{asset.quantity?.toFixed(4)}</td>
                                        <td className="px-8 py-5 font-medium text-slate-300">{formatCurrency(asset.buyPrice)}</td>
                                        <td className="px-8 py-5 font-medium text-slate-300">
                                            {asset.termType === 'Buy/Hold' ? '-' : formatCurrency(asset.sellPrice)}
                                        </td>
                                        <td className={`px-8 py-5 font-black ${asset.gainLoss > 0 ? 'text-green-400' :
                                            asset.gainLoss < 0 ? 'text-red-400' : 'text-slate-500'
                                            }`}>
                                            {asset.termType === 'Buy/Hold' ? '-' : formatCurrency(asset.gainLoss)}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${asset.termType === 'Long-Term' ? 'bg-indigo-500/20 text-indigo-400' :
                                                asset.termType === 'Buy/Hold' ? 'bg-slate-500/20 text-slate-400' :
                                                    'bg-orange-500/20 text-orange-400'
                                                }`}>
                                                {asset.termType}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-slate-500 uppercase tracking-widest font-black text-xs">
                                        {`No taxable events found for ${financialYear}`}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] flex items-center gap-4 backdrop-blur-sm">
                <div className="bg-red-500/20 p-3 rounded-full">
                    <AlertTriangle className="text-red-500" size={24} />
                </div>
                <p className="text-xs font-bold text-red-100/70 leading-relaxed italic">
                    Disclaimer: Tax calculations are indicative based on available trade history. Please consult a qualified tax professional for final filings.
                </p>
            </div>
        </div>
    );
};

export default TaxPage;
