import React, { useState } from 'react';
import { FileText, Download, Shield, BarChart2 } from 'lucide-react';
import { downloadPortfolioCsv, downloadPortfolioPdf, downloadRiskPdf } from '../services/api';

const Reports: React.FC = () => {
    const [downloading, setDownloading] = useState('');

    const handleDownload = async (type: string, fn: () => Promise<void>) => {
        setDownloading(type);
        try {
            await fn();
        } catch (e) {
            console.error(e);
        } finally {
            setDownloading('');
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Export Reports</h1>
                <p className="text-slate-400">Download detailed breakdowns of your portfolio performance and risk analysis.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Portfolio Reports */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-blue-500/30 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                        <BarChart2 size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Portfolio Summary</h2>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                        Complete overview of your holdings, including current value, purchase price, and total profit/loss distribution.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleDownload('port_csv', downloadPortfolioCsv)}
                            disabled={!!downloading}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors border border-slate-700"
                        >
                            <FileText size={16} />
                            CSV
                        </button>
                        <button
                            onClick={() => handleDownload('port_pdf', downloadPortfolioPdf)}
                            disabled={!!downloading}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors"
                        >
                            {downloading === 'port_pdf' ? <span className="animate-spin">⌛</span> : <Download size={16} />}
                            PDF
                        </button>
                    </div>
                </div>

                {/* Risk Reports */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-red-500/30 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                        <Shield size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Risk Analysis</h2>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                        Detailed risk assessment including volatility metrics, diversification scores, and security warnings.
                    </p>
                    <button
                        onClick={() => handleDownload('risk_pdf', downloadRiskPdf)}
                        disabled={!!downloading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors border border-slate-700"
                    >
                        {downloading === 'risk_pdf' ? <span className="animate-spin">⌛</span> : <Download size={16} />}
                        Download PDF Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
