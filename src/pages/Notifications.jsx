import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
  ShieldAlert, ArrowRightLeft, Bell, CheckCircle2,
  Trash2, Clock, Terminal, Activity, Info
} from 'lucide-react';

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/portfolio/notifications');
      setNotifs(res.data || []);
    } catch (e) {
      console.error("Communication Breakdown");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async () => {
    try {
      await api.post('/portfolio/notifications/mark-read');
      fetchNotifications(); // Refresh list
    } catch (e) { console.error("Marking failed"); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  // --- HELPER: STYLE MAP ---
  const getStyleConfig = (type) => {
    switch(type) {
      case 'RISK':
        return {
          icon: <ShieldAlert size={20} />,
          border: 'border-rose-500/20',
          bg: 'bg-rose-500/5',
          iconBg: 'bg-rose-500/10 text-rose-500',
          titleColor: 'text-rose-400'
        };
      case 'TRADE':
        return {
          icon: <ArrowRightLeft size={20} />,
          border: 'border-blue-500/20',
          bg: 'bg-blue-500/5',
          iconBg: 'bg-blue-500/10 text-blue-500',
          titleColor: 'text-blue-400'
        };
      case 'SYSTEM':
        return {
          icon: <Activity size={20} />,
          border: 'border-emerald-500/20',
          bg: 'bg-emerald-500/5',
          iconBg: 'bg-emerald-500/10 text-emerald-500',
          titleColor: 'text-emerald-400'
        };
      default:
        return {
          icon: <Info size={20} />,
          border: 'border-white/10',
          bg: 'bg-[#0B0E14]',
          iconBg: 'bg-slate-800 text-slate-400',
          titleColor: 'text-white'
        };
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
                <Bell size={18} className="text-blue-500" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Notification Hub</h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                    System Events • Trade Logs • Security Alerts
                </p>
            </div>
        </div>

        <button
            onClick={markRead}
            disabled={notifs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/10 rounded-lg hover:bg-slate-800 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
             <CheckCircle2 size={14} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-white">Mark All Read</span>
        </button>
      </div>

      {/* --- FEED --- */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {notifs.length === 0 ? (
          <div className="glass-panel p-16 rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-white/5">
                <Terminal className="text-slate-600" size={24} />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No New Transmissions</p>
          </div>
        ) : (
          notifs.map((n) => {
            const style = getStyleConfig(n.type);

            return (
                <div
                key={n.id}
                className={`glass-panel p-5 rounded-2xl border flex gap-5 transition-all hover:translate-x-1 hover:shadow-lg ${style.border} ${style.bg}`}
                >
                    {/* Icon Column */}
                    <div className={`p-3 rounded-xl h-fit border border-white/5 shadow-inner ${style.iconBg}`}>
                        {style.icon}
                    </div>

                    {/* Content Column */}
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className={`text-sm font-bold tracking-tight uppercase ${style.titleColor}`}>
                                {n.title}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">
                                    {new Date(n.timestamp).toLocaleDateString()}
                                </span>
                                <span className="text-[9px] font-mono text-slate-600 border-l border-white/10 pl-2">
                                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-300 font-medium leading-relaxed opacity-90">
                            {n.message}
                        </p>
                    </div>
                </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default Notifications;