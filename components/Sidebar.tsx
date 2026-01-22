
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ShieldAlert,
  Settings,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileUp,
  TrendingUp,
  BookOpen,
  Search,
  Newspaper,
  Eye,
  Activity,
  Bell,
  FileText,
  ChevronDown,
  BarChart3,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { getLatestNews } from '../services/api';
import React, { useState, useEffect } from 'react';

const Sidebar: React.FC<{ isCollapsed: boolean, setIsCollapsed: (v: boolean) => void }> = ({ isCollapsed, setIsCollapsed }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [hasNewNews, setHasNewNews] = useState(false);
  const [hasTriggeredAlerts, setHasTriggeredAlerts] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev =>
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

  useEffect(() => {
    const checkUpdates = async () => {
      try {
        // News check
        const newsData = await getLatestNews();
        if (newsData && newsData.lastUpdated) {
          const lastViewed = localStorage.getItem('lastViewedNewsTimestamp');
          if (!lastViewed || new Date(newsData.lastUpdated) > new Date(lastViewed)) {
            setHasNewNews(true);
          } else {
            setHasNewNews(false);
          }
        }



      } catch (e) {
        console.error("Failed to check updates");
      }
    };

    checkUpdates();
    const interval = setInterval(checkUpdates, 30000); // Check every 30s

    const handleStorage = () => {
      checkUpdates();
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const menuItems: any[] = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Portfolio', icon: <Wallet size={20} />, path: '/portfolio' },
    { name: 'P&L', icon: <BarChart3 size={20} />, path: '/pnl' },
    { name: 'Tax', icon: <FileText size={20} />, path: '/tax' },

    { name: 'Crypto Market', icon: <TrendingUp size={20} />, path: '/market' },
    { name: 'Market Sentiment', icon: <Activity size={20} />, path: '/sentiment' },
    { name: 'News Insights', icon: <Newspaper size={20} />, path: '/news', notification: hasNewNews },

    { name: 'Scam Scanner', icon: <Search size={20} />, path: '/scam-scanner' },
    { name: 'Risk Analysis', icon: <ShieldAlert size={20} />, path: '/risk-analysis' },
    { name: 'Learning Hub', icon: <BookOpen size={20} />, path: '/learning-hub' },
    { name: 'Reports', icon: <FileText size={20} />, path: '/reports' },
    { name: 'CSV Upload', icon: <FileUp size={20} />, path: '/csv-upload' },
    { name: 'Profile Update', icon: <UserCircle size={20} />, path: '/profile' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  const defaultAvatar = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
  const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088';

  const getFullImageUrl = (path?: string) => {
    if (!path) return defaultAvatar;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${BACKEND_URL}${path}`;
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#020617] border-r border-slate-800 transition-all duration-300 z-50 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Brand */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500 p-1.5 rounded-lg shrink-0">
            <Shield size={20} className="text-black" />
          </div>
          {!isCollapsed && <span className="font-bold text-white tracking-tight">CRYPTO TRACKER</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow mt-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          if (item.children) {
            const isExpanded = expandedMenus.includes(item.name);
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${isExpanded ? 'bg-slate-800/50 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }`}
                >
                  <div className="shrink-0">{item.icon}</div>
                  {!isCollapsed && (
                    <>
                      <span className="text-sm flex-grow text-left">{item.name}</span>
                      <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {isExpanded && !isCollapsed && (
                  <div className="ml-9 space-y-1">
                    {item.children.map((child: any) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `flex items-center gap-4 p-2 rounded-lg transition-all ${isActive
                            ? 'text-yellow-500 font-bold'
                            : 'text-slate-500 hover:text-slate-300'
                          }`
                        }
                      >
                        <span className="text-sm">{child.name}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (item.path === '/news') setHasNewNews(false);
              }}
              className={({ isActive }) =>
                `flex items-center gap-4 p-3 rounded-xl transition-all relative ${isActive
                  ? 'bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`
              }
            >
              <div className="shrink-0 relative">
                {item.icon}
                {item.notification && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                  </span>
                )}
              </div>
              {!isCollapsed && <span className="text-sm">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout (Bottom Section) */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/10">
        <div
          onClick={() => navigate('/profile')}
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all mb-4 group ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="relative shrink-0">
            <img
              src={getFullImageUrl(user?.profileImage)}
              className={`w-12 h-12 rounded-full border-2 border-slate-700 object-cover shadow-lg transition-all group-hover:border-yellow-500`}
              alt="Profile"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#020617] rounded-full"></div>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <div className="text-white text-sm font-bold truncate">{user?.fullName || 'User'}</div>
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest truncate">View Profile</div>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className={`w-full flex items-center gap-4 p-3 text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-slate-800 border border-slate-700 text-slate-400 p-1 rounded-full hover:text-white transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};

export default Sidebar;
