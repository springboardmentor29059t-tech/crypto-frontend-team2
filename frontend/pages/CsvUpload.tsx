
import React, { useState } from 'react';
import { FileUp, Download, CheckCircle2, AlertCircle, RefreshCw, FileText, Info } from 'lucide-react';
import { mockApi } from '../services/api';

const CsvUpload: React.FC = () => {
  const [activeType, setActiveType] = useState<'holdings' | 'trades'>('holdings');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus(null);

    try {
      // Mock Backend Call
      const result = activeType === 'holdings'
        ? await mockApi.uploadHoldingsCsv(file)
        : await mockApi.uploadTradesCsv(file);

      setStatus({ success: true, message: `Successfully imported ${result.count} rows from ${file.name}` });
      setFile(null);
    } catch (err: any) {
      setStatus({ success: false, message: err.response?.status === 403 ? 'Session expired or unauthorized. Please log in again.' : (err.message || 'Error processing CSV file. Please check format.') });
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = () => {
    const headers = activeType === 'holdings'
      ? "asset_symbol,quantity,avg_cost,wallet_type,exchange"
      : "asset_symbol,side,quantity,price,fee,exchange,executed_at";

    const example = activeType === 'holdings'
      ? "\nBTC,0.5,42000,exchange,Binance\nETH,2,2800,wallet,Metamask"
      : "\nBTC,buy,0.1,40000,10,Binance,2024-01-12";

    const blob = new Blob([headers + example], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_${activeType}.csv`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-center gap-4 mb-2">
        <div className="bg-yellow-500 p-3 rounded-2xl shadow-lg shadow-yellow-500/20">
          <FileUp size={32} className="text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bulk Data Import</h1>
          <p className="text-slate-500">Fast-track your portfolio setup using standard CSV exports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation / Instructions */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6">
            <h3 className="text-white font-bold mb-4">Import Type</h3>
            <div className="space-y-2">
              <button
                onClick={() => { setActiveType('holdings'); setFile(null); setStatus(null); }}
                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all font-bold ${activeType === 'holdings' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <FileText size={20} />
                Current Holdings
              </button>
              <button
                onClick={() => { setActiveType('trades'); setFile(null); setStatus(null); }}
                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all font-bold ${activeType === 'trades' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <RefreshCw size={20} />
                Trade History
              </button>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6">
            <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
              <Info size={16} className="text-yellow-500" />
              Requirements
            </h3>
            <ul className="text-xs text-slate-500 space-y-3 list-disc pl-4">
              <li>File must be in <b>.csv</b> format</li>
              <li>Columns must match sample exactly</li>
              <li>Dates formatted as YYYY-MM-DD</li>
              <li>Max file size: 5MB</li>
            </ul>
            <button
              onClick={downloadSample}
              className="mt-6 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
            >
              <Download size={14} />
              Download Sample
            </button>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${file ? 'bg-green-500/20 text-green-500' : 'bg-slate-800 text-slate-600'}`}>
              <FileUp size={40} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {file ? file.name : `Upload ${activeType === 'holdings' ? 'Holdings' : 'Trades'} CSV`}
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">
              Drag and drop your file here, or click the button below to browse your computer.
            </p>

            <label className="cursor-pointer">
              <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              <div className="bg-white text-black font-black px-10 py-4 rounded-2xl shadow-xl hover:bg-slate-100 transition-all uppercase tracking-widest text-xs">
                Select CSV File
              </div>
            </label>

            {file && (
              <button
                onClick={handleUpload}
                disabled={loading}
                className="mt-6 w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition-all"
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                {loading ? 'Processing Batch...' : 'Begin Import'}
              </button>
            )}
          </div>

          {status && (
            <div className={`p-6 rounded-[2rem] border flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 ${status.success ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
              {status.success ? <CheckCircle2 className="shrink-0 mt-1" /> : <AlertCircle className="shrink-0 mt-1" />}
              <div>
                <div className="font-bold mb-1">{status.success ? 'Import Completed' : 'Import Failed'}</div>
                <p className="text-sm opacity-80">{status.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CsvUpload;
