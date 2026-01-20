import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  ShieldAlert, ShieldCheck, AlertTriangle,
  Terminal, RefreshCcw, Zap, Database,
  Fingerprint, Search, FileCode, Flame, Lock, Activity
} from 'lucide-react';

const ScamDetector = () => {
  const { setIsScanning } = useOutletContext();
  const [address, setAddress] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisLogs, setAnalysisLogs] = useState([]);

  // Recent Scans History
  const [recentScans, setRecentScans] = useState(
    JSON.parse(localStorage.getItem('forensic_history') || '[]')
  );

  const logsEndRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [analysisLogs]);

  const addLog = (msg, type = 'info') => {
    setAnalysisLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);
  };

  const saveToHistory = (data, searchAddr) => {
    const newHistory = [
      { id: Date.now(), address: searchAddr, label: data.label, isSafe: data.riskScore < 20 },
      ...recentScans.filter(s => s.address !== searchAddr).slice(0, 4)
    ];
    setRecentScans(newHistory);
    localStorage.setItem('forensic_history', JSON.stringify(newHistory));
  };

  // 🛡️ UPDATED VALIDATION LOGIC
  const validateInput = (input) => {
    const trimmed = input.trim();

    // 1. Allow Special Test Key
    if (trimmed === 'test-scam') return true;

    // 2. Check if it LOOKS like an address (Starts with 0x)
    if (trimmed.startsWith('0x')) {
        // If it starts with 0x, it MUST be 42 chars hex
        if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
            return "Invalid EVM Address: Must be exactly 42 characters (0x...)";
        }
        return true;
    }

    // 3. Allow Token IDs (alphanumeric, e.g., "bitcoin", "pepe-coin")
    if (/^[a-zA-Z0-9-]+$/.test(trimmed)) {
        return true;
    }

    return "Invalid Input: Enter a Contract Address (0x...) or Token ID (e.g. bitcoin)";
  };

  const handleScan = async (e, forcedAddr = null) => {
    if (e) e.preventDefault();
    const targetAddr = forcedAddr || address.trim();

    // 1. Validate Input
    const validationMsg = validateInput(targetAddr);
    if (validationMsg !== true) {
        setError(validationMsg);
        setReport(null);
        return;
    }

    setLoading(true);
    setIsScanning(true);
    setError(null);
    setAnalysisLogs([]);
    setReport(null);

    // 🕵️ CYBER LOG SEQUENCE
    addLog(`Target Acquired: ${targetAddr.length > 20 ? targetAddr.slice(0,12)+'...' : targetAddr}`, 'start');
    await new Promise(r => setTimeout(r, 600));

    // DEMO SCAM MODE (For UI Testing)
    if (targetAddr === 'test-scam') {
        addLog("⚠️ SUSPICIOUS PATTERN DETECTED...", 'warning');
        await new Promise(r => setTimeout(r, 800));
        addLog("CRITICAL: Honeypot mechanism found in _transfer()", 'error');
        await new Promise(r => setTimeout(r, 800));

        const fakeRiskReport = {
            riskScore: 99,
            label: "FAKE / SCAM",
            status: "Do Not Trade",
            threats: ["Honeypot Logic Detected", "Ownership Not Renounced", "Mint Function Unrestricted"]
        };
        setReport(fakeRiskReport);
        saveToHistory(fakeRiskReport, targetAddr);
        setLoading(false);
        setIsScanning(false);
        return;
    }

    addLog("Cross-referencing Official Registries...", 'process');
    await new Promise(r => setTimeout(r, 800));
    addLog("Scanning Contract Bytecode...", 'process');
    await new Promise(r => setTimeout(r, 800));

    try {
      // 2. REAL BACKEND CALL
      const res = await api.post(`/portfolio/risk-report`, { assetId: targetAddr });

      if (!res.data) throw new Error("No data returned.");
      const data = res.data;

      // 3. LOGGING BASED ON RESULT
      if (data.label === "GENUINE ASSET") {
          addLog("✅ MATCH FOUND: Official Registry", 'success');
      } else if (data.label.includes("FAKE") || data.label.includes("SCAM")) {
          addLog("❌ WARNING: Imposter Pattern Detected", 'error');
      } else if (data.label.includes("VERIFIED CONTRACT")) {
          addLog("✅ CONTRACT VERIFIED: Source Code Public", 'success');
      } else {
          addLog("⚠️ UNKNOWN: Contract not in registry", 'warning');
      }

      await new Promise(r => setTimeout(r, 400));
      addLog("Report Generated.", 'success');

      setReport(data);
      saveToHistory(data, targetAddr);

    } catch (err) {
      console.error(err);
      addLog("SCAN FAILED: Database Unreachable", 'error');
      setError("Unable to verify asset. Check connection.");
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  // Helper to determine color based on verdict
  const getStatusColor = (label) => {
      if (label === 'GENUINE ASSET' || label === 'VERIFIED CONTRACT') return 'text-emerald-500';
      if (label.includes('FAKE') || label.includes('SCAM')) return 'text-rose-500';
      return 'text-amber-500'; // Unverified
  };

  const getStatusBg = (label) => {
      if (label === 'GENUINE ASSET' || label === 'VERIFIED CONTRACT') return 'bg-emerald-500';
      if (label.includes('FAKE') || label.includes('SCAM')) return 'bg-rose-500';
      return 'bg-amber-500';
  };

  return (
    <div className="space-y-8 pb-24 font-sans animate-in fade-in duration-700 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-lg shadow-lg">
                <Fingerprint size={18} className="text-rose-500" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Fake Token Detector</h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                    Forensic Verification • Authenticity Check
                </p>
            </div>
        </div>

        {/* HISTORY */}
        <div className="flex gap-2 flex-wrap justify-end">
            {recentScans.map((s) => (
            <button key={s.id} onClick={() => { setAddress(s.address); handleScan(null, s.address); }} className="px-2.5 py-1 bg-slate-900 border border-white/10 rounded-md flex items-center gap-2 hover:bg-slate-800 transition-all">
                <div className={`w-1.5 h-1.5 rounded-full ${s.isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                    {s.address.length > 10 ? s.address.slice(0,6)+'...' : s.address}
                </span>
            </button>
            ))}
        </div>
      </div>

      {/* INPUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
            <div className={`glass-panel p-1 rounded-2xl border transition-colors relative overflow-hidden ${error ? 'border-rose-500/50' : 'border-white/10'}`}>
                <form onSubmit={handleScan} className="flex items-center bg-[#0B0E14] rounded-xl px-4 py-1">
                    <Search size={18} className="text-slate-500 mr-3" />
                    <input
                        type="text"
                        className="bg-transparent border-none outline-none text-white w-full py-4 font-mono text-sm placeholder:text-slate-700"
                        placeholder="Enter Token Name (e.g. bitcoin) or Address (0x...)"
                        value={address}
                        onChange={(e) => { setAddress(e.target.value); setError(null); }}
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                        {loading ? <RefreshCcw size={14} className="animate-spin" /> : <Zap size={14} />}
                        VERIFY
                    </button>
                </form>
            </div>
            <p className="text-[10px] text-slate-500 ml-2">* Try: <span className="text-emerald-400 cursor-pointer" onClick={() => {setAddress('bitcoin'); setError(null);}}>bitcoin</span> (Genuine) or <span className="text-rose-400 cursor-pointer" onClick={() => {setAddress('test-scam'); setError(null);}}>test-scam</span> (Fake)</p>
            {error && <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-xs font-bold">{error}</div>}
        </div>

        {/* LOGS */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col h-40 lg:h-auto font-mono text-[10px] bg-[#0B0E14]">
            <p className="text-slate-600 font-bold mb-2 flex items-center gap-2 uppercase tracking-widest"><Terminal size={12} /> Scan Log</p>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                {analysisLogs.length === 0 && <span className="text-slate-700 italic">... waiting for target ...</span>}
                {analysisLogs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                        <span className="text-slate-600">[{log.time}]</span>
                        <span className={log.type === 'error' ? 'text-rose-500' : log.type === 'success' ? 'text-emerald-500' : 'text-blue-400'}>➜</span>
                        <span className={log.type === 'error' ? 'text-rose-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'}>{log.msg}</span>
                    </div>
                ))}
                <div ref={logsEndRef} />
            </div>
        </div>
      </div>

      {/* RESULTS */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">

          {/* VERDICT CARD */}
          <div className="lg:col-span-1 glass-panel p-6 rounded-3xl flex flex-col items-center justify-center text-center border border-white/10 relative overflow-hidden">
            <div className={`absolute inset-0 opacity-10 blur-3xl ${getStatusBg(report.label)}`}></div>

            {/* Huge Icon */}
            <div className="mb-4">
                {(report.label === 'GENUINE ASSET' || report.label === 'VERIFIED CONTRACT')
                    ? <ShieldCheck size={64} className="text-emerald-500" />
                    : (report.label.includes('FAKE') || report.label.includes('SCAM'))
                        ? <ShieldAlert size={64} className="text-rose-500" />
                        : <AlertTriangle size={64} className="text-amber-500" />
                }
            </div>

            <h2 className={`text-2xl font-black uppercase tracking-tight mb-1 ${getStatusColor(report.label)}`}>
                {report.label}
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{report.status}</p>
          </div>

          {/* DETAILS */}
          <div className="lg:col-span-3 glass-panel p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={16} className="text-slate-500" />
                    <h3 className="text-white font-bold text-xs uppercase tracking-widest">Analysis Findings</h3>
                </div>

                {(!report.threats || report.threats.length === 0) ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                        <ShieldCheck className="text-emerald-500" size={20} />
                        <div>
                            <p className="text-emerald-400 text-xs font-bold uppercase">No Threats Detected</p>
                            <p className="text-slate-400 text-[10px]">This asset matches the official contract signature.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {report.threats.map((t, i) => (
                             <div key={i} className="flex items-center justify-between p-3 bg-slate-900 border border-white/5 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="text-rose-500 font-bold">!</span>
                                    <span className="text-slate-300 text-xs">{t}</span>
                                </div>
                                <span className="text-[9px] font-bold text-rose-500 uppercase bg-rose-500/10 px-2 py-0.5 rounded">Critical</span>
                             </div>
                        ))}
                    </div>
                )}
          </div>

        </div>
      )}
    </div>
  );
};

export default ScamDetector;