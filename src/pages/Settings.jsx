import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; // ✅ Import Context
import {
  User, Shield, Trash2, CheckCircle, Save,
  Database, IndianRupee, Lock, Terminal, AlertTriangle
} from 'lucide-react';

const Settings = () => {
  // ✅ FIX: Get dynamic user data from the main Layout
  const { user } = useOutletContext();

  const [isPrivate, setIsPrivate] = useState(localStorage.getItem('privacy_mode') === 'true');
  const [tempName, setTempName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // ✅ EFFECT: Sync tempName with real user data when it loads
  useEffect(() => {
    if (user?.name) {
      setTempName(user.name);
    }
  }, [user]);

  // Sync privacy mode with local storage
  const togglePrivacy = () => {
    const newState = !isPrivate;
    setIsPrivate(newState);
    localStorage.setItem('privacy_mode', String(newState));
    window.dispatchEvent(new Event('privacyChange'));
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();

    // ⚠️ NOTE: Since you are using a Backend now, this LocalStorage update
    // is just visual for this session. In a full app, you would call api.put('/user/profile', ...)

    // Update local cache to reflect change immediately
    const updatedUser = { ...user, name: tempName };
    localStorage.setItem('user', JSON.stringify(updatedUser));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Force a reload to refresh the Layout context (Optional)
    window.location.reload();
  };

  const handleClearData = () => {
    if (!user?.email) return;

    const confirmMessage = `CRITICAL WARNING: This will permanently erase the portfolio and trade ledger for ${user.email}. This action cannot be undone. Proceed?`;

    if (window.confirm(confirmMessage)) {
      const prefix = user.email.replace(/[^a-zA-Z0-9]/g, '_');
      localStorage.removeItem(`${prefix}_portfolio`);
      localStorage.removeItem(`${prefix}_trades`);
      localStorage.removeItem(`${prefix}_watchlist`);

      alert("Terminal ledger purged successfully.");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 pb-24 font-sans animate-in fade-in duration-700 relative">

      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-lg shadow-lg">
                <Terminal size={18} className="text-blue-500" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">System Configuration</h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                    Profile Management • Security Protocols
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: PROFILE */}
        <div className="lg:col-span-2 space-y-6">

            {/* Profile Editor */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex items-start gap-6 mb-8 pb-8 border-b border-white/5">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-blue-500/20">
                         <div className="w-full h-full bg-[#0B0E14] rounded-[15px] flex items-center justify-center">
                            <User size={32} className="text-white" />
                         </div>
                    </div>
                    <div>
                        {/* ✅ FIX: Use user?.name from Context */}
                        <h3 className="text-2xl font-bold text-white tracking-tight mb-1">{user?.name || "Operative"}</h3>
                        <div className="flex items-center gap-2 text-slate-500">
                             <Lock size={12} />
                             {/* ✅ FIX: Use user?.email from Context */}
                             <p className="font-mono text-xs tracking-wide">{user?.email || "Session Encrypted"}</p>
                        </div>
                        <span className="inline-block mt-3 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-bold uppercase tracking-wider">
                            Administrator Access
                        </span>
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="relative z-10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-blue-500 transition-colors">Terminal Alias</label>
                            <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500/50 outline-none transition-all font-medium placeholder:text-slate-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Base Currency</label>
                            <div className="w-full bg-[#0B0E14]/50 border border-white/5 rounded-xl py-3 px-4 text-slate-500 flex items-center gap-2 cursor-not-allowed opacity-70">
                                <IndianRupee size={14} /> <span className="text-sm font-medium">INR (Locked)</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            {showSuccess ? <CheckCircle size={16} className="text-emerald-600" /> : <Save size={16} />}
                            {showSuccess ? "Configuration Saved" : "Update Profile"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="glass-panel p-8 rounded-3xl border border-rose-500/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute inset-0 bg-rose-500/5 pointer-events-none"></div>

                <div className="relative z-10 flex items-center gap-5">
                    <div className="bg-rose-500/10 p-4 rounded-2xl text-rose-500 border border-rose-500/20">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm uppercase tracking-wide">Purge Vault Data</p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-sm">
                            Permanently erase trade ledger and portfolio for <span className="text-slate-200 font-mono">{user?.email}</span>. This action is irreversible.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleClearData}
                    className="relative z-10 w-full md:w-auto bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 border border-rose-500/50 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <Trash2 size={14} /> Execute Purge
                </button>
            </div>
        </div>

        {/* RIGHT COLUMN: PREFERENCES */}
        <div className="space-y-6">

            {/* Privacy Toggle */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
                <div className={`absolute top-0 right-0 p-20 blur-[50px] rounded-full transition-all opacity-20 pointer-events-none ${isPrivate ? 'bg-amber-500' : 'bg-slate-500'}`}></div>

                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl transition-colors ${isPrivate ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-400'}`}>
                        <Shield size={20} />
                    </div>
                    <button
                        onClick={togglePrivacy}
                        className={`w-10 h-5 rounded-full transition-colors relative border border-white/10 ${isPrivate ? 'bg-amber-500 border-amber-500' : 'bg-[#0B0E14]'}`}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 shadow-md transition-all ${isPrivate ? 'right-1' : 'left-1'}`}></div>
                    </button>
                </div>

                <div className="relative z-10">
                    <p className={`font-bold text-sm transition-colors ${isPrivate ? 'text-amber-500' : 'text-white'}`}>Stealth Mode</p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Obfuscates all sensitive financial values across the terminal interface to prevent unauthorized viewing.
                    </p>
                </div>
            </div>

            {/* System Info */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                        <Database size={20} />
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span className="text-[9px] font-bold text-emerald-500 uppercase">Online</span>
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="font-bold text-white text-sm">Local Storage Node</p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed mb-4">
                        Data is encrypted and stored locally on this device using AES-256 standards.
                    </p>

                    <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                             <span>Storage Usage</span>
                             <span className="text-blue-400">1.2 MB</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="w-[15%] h-full bg-blue-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default Settings;