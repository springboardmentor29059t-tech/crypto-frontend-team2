import React, { useState, useEffect, useMemo } from 'react';
import {
  Receipt, ArrowUpRight, ArrowDownRight, RefreshCcw,
  Search, Download, Database, FileText, Calendar
} from 'lucide-react';
import api from '../api/axiosConfig';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Trades = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔒 PRIVACY STATE (Read from LocalStorage & Listen for updates)
  const [isPrivate, setIsPrivate] = useState(() => {
      return localStorage.getItem('privacy_mode') === 'true';
  });

  // 🎧 EVENT LISTENERS (The Fix)
  useEffect(() => {
    const handlePrivacyChange = () => {
        const mode = localStorage.getItem('privacy_mode') === 'true';
        setIsPrivate(mode);
    };

    window.addEventListener('privacyChange', handlePrivacyChange);
    window.addEventListener('storage', handlePrivacyChange);

    return () => {
      window.removeEventListener('privacyChange', handlePrivacyChange);
      window.removeEventListener('storage', handlePrivacyChange);
    };
  }, []);

  const fetchTradeHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/portfolio/history');
      setTrades(response.data || []);
    } catch (err) {
      console.error("Failed to fetch ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  // 📄 PDF Generator
  const downloadPDF = () => {
    if (trades.length === 0) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Transaction Ledger Audit', 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Records: ${trades.length}`, 14, 35);
      doc.text(`Node Status: ONLINE`, 14, 40);

      const tableColumn = ["Date", "Asset", "Action", "Volume", "Price (INR)", "Total Value (INR)"];

      const tableRows = trades.map(t => {
        const totalVal = t.quantity * t.avgCost;
        const priceFormatted = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(t.avgCost);
        const totalFormatted = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalVal);

        return [
          new Date(t.timestamp).toLocaleDateString(),
          t.assetSymbol?.toUpperCase() || 'UNKNOWN',
          t.transactionType?.toUpperCase(),
          t.quantity,
          priceFormatted,
          totalFormatted
        ];
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 8, cellPadding: 3 },
      });

      doc.save(`CryptofolioX_Ledger_${new Date().getTime()}.pdf`);

    } catch (err) {
      console.error("PDF Generation Failed:", err);
      alert("Failed to generate PDF locally.");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchTradeHistory();
  }, []);

  const filteredTrades = useMemo(() => {
    return trades.filter(t =>
      t.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assetSymbol?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [trades, searchTerm]);

  // 🔒 Masking Helper
  const maskValue = (val, isCurrency = true) => {
    if (isPrivate) return "••••••";
    const safeVal = val || 0;
    if (!isCurrency) return safeVal.toLocaleString('en-IN');
    const decimals = (safeVal > 0 && safeVal < 1) ? 6 : 2;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: decimals, maximumFractionDigits: decimals,
    }).format(safeVal);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
      <RefreshCcw className="animate-spin text-blue-500" size={48} strokeWidth={1} />
      <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] animate-pulse">Accessing Secure Ledger...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-24 font-sans animate-in fade-in duration-700 relative">

      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-lg shadow-lg">
                <Receipt size={18} className="text-blue-500" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Transaction Ledger</h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                    Immutable Audit Log • MySQL Persistence
                </p>
            </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={14} />
                <input
                    type="text"
                    placeholder="Search ledger ID or Asset..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-xs text-white font-medium focus:border-blue-500/50 focus:bg-slate-900 outline-none transition-all placeholder:text-slate-600"
                />
            </div>
            <button
                onClick={fetchTradeHistory}
                className="p-2.5 bg-slate-900 border border-white/10 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
            >
                <RefreshCcw size={16} />
            </button>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {/* Total Ops */}
         <div className="glass-panel p-5 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Operations</p>
                <p className="text-2xl font-bold text-white tracking-tight">{trades.length}</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-xl text-blue-500 border border-white/5">
                <FileText size={20} />
            </div>
         </div>

         {/* Node Status */}
         <div className="glass-panel p-5 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Node Status</p>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-lg font-bold text-emerald-500 tracking-tight">ONLINE</p>
                </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-xl text-emerald-500 border border-white/5">
                <Database size={20} />
            </div>
         </div>

         {/* Export Button */}
         <button
           onClick={downloadPDF}
           disabled={isExporting || trades.length === 0}
           className="glass-panel p-5 rounded-2xl flex items-center justify-between group hover:bg-blue-600/10 hover:border-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
         >
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-blue-400">Security Export</p>
              <p className="text-lg font-bold text-white tracking-tight">{isExporting ? 'Generating...' : 'Download PDF'}</p>
            </div>
            <div className={`p-3 rounded-xl border border-white/5 transition-all ${isExporting ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/50 text-slate-400 group-hover:text-white group-hover:bg-blue-500'}`}>
              {isExporting ? <RefreshCcw size={20} className="animate-spin" /> : <Download size={20} />}
            </div>
         </button>
      </div>

      {/* --- TRANSACTIONS TABLE --- */}
      <div className="glass-panel overflow-hidden rounded-2xl border border-white/10">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2 bg-[#0B0E14]/50">
            <Calendar size={14} className="text-slate-500" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Recent Activity</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0B0E14] text-slate-500 text-[9px] uppercase font-bold tracking-widest border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Asset ID</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4 text-right">Volume</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">Total Value</th>
                <th className="px-6 py-4 text-center">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <Database className="mx-auto text-slate-800 mb-4" size={40} />
                    <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                      No Records Found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => {
                  const isSell = trade.transactionType === 'SELL';
                  const totalFlow = trade.quantity * trade.avgCost;

                  return (
                    <tr key={trade.id} className="hover:bg-white/5 transition-all group">
                      {/* Asset */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-[10px] text-blue-400 group-hover:border-blue-500/50 transition-colors shadow-inner">
                                {trade.assetSymbol?.slice(0,3).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-white text-xs tracking-tight">{trade.assetName}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">#{trade.assetId}</p>
                            </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                          isSell
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {isSell ? <ArrowDownRight size={10}/> : <ArrowUpRight size={10}/>}
                          {trade.transactionType}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className={`px-6 py-4 text-right font-mono text-slate-300 text-xs font-medium ${isPrivate ? 'privacy-blur' : ''}`}>
                        {isPrivate ? '••••••' : trade.quantity.toLocaleString('en-IN', { maximumFractionDigits: 6 })}
                      </td>

                      {/* Unit Price */}
                      <td className={`px-6 py-4 text-right font-mono text-slate-500 text-xs ${isPrivate ? 'privacy-blur' : ''}`}>
                        {maskValue(trade.avgCost)}
                      </td>

                      {/* Total Value */}
                      <td className={`px-6 py-4 text-right font-bold text-xs ${
                        isPrivate ? 'privacy-blur' : isSell ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {isPrivate ? '••••••' : (isSell ? '-' : '+') + maskValue(totalFlow)}
                      </td>

                      {/* Time */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400">
                                {new Date(trade.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="text-[9px] text-slate-600 font-mono">
                                {new Date(trade.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Trades;