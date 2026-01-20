import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Wallet, ShieldAlert, FileText, History, Settings, LogOut,
  User, Eye, EyeOff, Star, Zap, SearchCode, Link2, ChevronLeft, ChevronRight
} from 'lucide-react';

// ✅ Accepts props for collapse state now
const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Local Privacy State (Keep this local)
  const [isPrivate, setIsPrivate] = useState(
    localStorage.getItem('privacy_mode') === 'true'
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setIsPrivate(localStorage.getItem('privacy_mode') === 'true');
    };
    // Listen for the custom event we dispatch below
    window.addEventListener('privacyChange', handleStorageChange);
    return () => window.removeEventListener('privacyChange', handleStorageChange);
  }, []);

  const togglePrivacy = () => {
    const newState = !isPrivate;

    // 1. Update State & Storage
    setIsPrivate(newState);
    localStorage.setItem('privacy_mode', String(newState));

    // 2. Dispatch Custom Event (This fixes the sync issue)
    window.dispatchEvent(new Event('privacyChange'));
  };

  const handleLogout = async () => {
    if (window.confirm("Terminate secure session and lock vault?")) {
      try {
        await logout();
        navigate('/login');
      } catch (err) {
        console.error("Logout failed", err);
      }
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/' },
    { name: 'Portfolio', icon: <Wallet size={20}/>, path: '/portfolio' },
    { name: 'Exchange', icon: <Link2 size={20}/>, path: '/connect-exchange', badge: 'NEW' },
    { name: 'Watchlist', icon: <Star size={20}/>, path: '/watchlist' },
    { name: 'Scam Scanner', icon: <SearchCode size={20} />, path: '/scam-detector', isSpecial: true },
    { name: 'Transactions', icon: <History size={20}/>, path: '/trades' },
    { name: 'Risk Alerts', icon: <ShieldAlert size={20}/>, path: '/risk' },
    { name: 'Reports', icon: <FileText size={20}/>, path: '/reports' },
    { name: 'Settings', icon: <Settings size={20}/>, path: '/settings' },
  ];

  return (
    <aside
      className={`${isCollapsed ? 'w-20' : 'w-72'} h-screen sticky top-0 bg-[#0B0E14] border-r border-white/10 flex flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out font-sans text-slate-300 flex-shrink-0`}
    >

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-48 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-5 mb-2 relative z-10 flex-shrink-0`}>
        {!isCollapsed && (
            <div className="flex items-center gap-3 animate-in fade-in duration-300 overflow-hidden">
                <div className="w-9 h-9 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
                    <Zap className="text-blue-500 drop-shadow-md" size={18} fill="currentColor" />
                </div>
                <div className="whitespace-nowrap">
                    <h2 className="text-lg font-bold text-white tracking-tight">
                    Crypto<span className="text-blue-500">X</span>
                    </h2>
                    <p className="text-[9px] font-semibold text-slate-500 tracking-widest uppercase">
                    Forensic
                    </p>
                </div>
            </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar} // ✅ Uses Parent Function
          className={`p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* --- MENU --- */}
      <nav className="flex-1 flex flex-col gap-1 px-3 relative z-10 min-h-0 overflow-visible">
        {!isCollapsed && (
            <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 opacity-70 animate-in fade-in">
                Main Menu
            </p>
        )}

        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`group flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-3 rounded-xl transition-all duration-200 border relative ${
                isActive
                  ? 'bg-blue-600/10 border-blue-500/20 shadow-sm'
                  : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-colors ${
                    isActive
                    ? 'text-blue-400'
                    : item.isSpecial ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                    {item.icon}
                </span>

                {!isCollapsed && (
                    <span className={`text-sm font-medium tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300 ${
                        isActive ? 'text-white font-bold' : 'text-slate-400 group-hover:text-white'
                    }`}>
                        {item.name}
                    </span>
                )}
              </div>

              {!isCollapsed && (
                  <div className="flex items-center gap-2 animate-in fade-in">
                    {item.badge && (
                    <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">
                        {item.badge}
                    </span>
                    )}
                    {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]" />
                    )}
                  </div>
              )}

              {/* Tooltip for Collapsed Mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                    {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* --- FOOTER --- */}
      <div className="mt-auto p-3 border-t border-white/5 relative z-10 flex-shrink-0 space-y-3">
        <button
          onClick={togglePrivacy}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2.5 rounded-lg transition-all border group ${
            isPrivate ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`text-xs ${isPrivate ? 'text-amber-500' : 'text-slate-400'}`}>
                {isPrivate ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
            {!isCollapsed && (
                <span className={`text-xs font-bold uppercase tracking-wide whitespace-nowrap animate-in fade-in ${isPrivate ? 'text-amber-400' : 'text-slate-400'}`}>
                    {isPrivate ? 'Hidden Mode' : 'Visible Mode'}
                </span>
            )}
          </div>
          {!isCollapsed && (
              <div className={`w-8 h-4 rounded-full relative transition-colors ${isPrivate ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${isPrivate ? 'bg-amber-500 right-0.5' : 'bg-slate-500 left-0.5'}`}></div>
              </div>
          )}
        </button>

        <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900/50 border border-white/5 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1px] flex-shrink-0 group relative">
                <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                    <User size={16} className="text-white" />
                </div>
            </div>
            {!isCollapsed && (
                <div className="overflow-hidden flex-1 min-w-0 animate-in fade-in">
                    <p className="text-sm font-bold text-white truncate">{user?.name || 'Operative'}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate uppercase">{user?.email || 'Vault Access'}</p>
                </div>
            )}
            {!isCollapsed && (
                <button onClick={handleLogout} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors animate-in fade-in">
                <LogOut size={16} />
                </button>
            )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;