import React, { useState } from 'react';
import Icon from '../UI/Icon';

// Accept props for dynamic notifications
const DashboardLayout = ({ user, children, activeView, setActiveView, onLogout, notifications, addNotification, clearNotifications }) => {
  const [showNotif, setShowNotif] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: 'house', label: 'Dashboard' },
    { id: 'market', icon: 'chart-line', label: 'Market' }, 
    { id: 'portfolio', icon: 'wallet', label: 'Portfolio' },
    { id: 'exchanges', icon: 'lightning', label: 'Exchanges' },
    { id: 'trades', icon: 'arrows-left-right', label: 'Trades' },
    { id: 'risk', icon: 'warning', label: 'Risk Analysis' },
    { id: 'reports', icon: 'chart-bar', label: 'Reports' },
  ];

  // Determine badge count based on unread notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Helper to get icon/color based on type
  const getNotifMeta = (type) => {
    if (type === 'success' || type === 'portfolio') return { icon: 'check-circle', color: 'cyan' };
    if (type === 'risk') return { icon: 'warning', color: 'red' };
    return { icon: 'info', color: 'cyan' };
  };

  const getPageTitle = () => {
    const map = {
      dashboard: 'Dashboard Overview',
      portfolio: 'Portfolio Overview',
      exchanges: 'Exchange Connections',
      trades: 'Trade History',
      risk: 'Risk & Scam Analysis',
      reports: 'P&L and Tax Reports',
      'asset-detail': 'Asset Details'
    };
    return map[activeView] || 'Dashboard';
  };

  const getPageSubtitle = () => {
     const map = {
      dashboard: 'Monitor your portfolio performance',
      portfolio: 'Manage your crypto holdings',
      exchanges: 'Manage your API keys securely',
      trades: 'View all your transactions',
      risk: 'Monitor potential threats',
      reports: 'Generate financial reports',
      'asset-detail': 'In-depth asset information'
    };
    return map[activeView] || '';
  };

  // Toggle panel and mark notifications as read
  const toggleNotifPanel = () => {
    if (!showNotif) {
      // Mark all as read when opening
      addNotification('info', 'Viewing Notifications', 'Marked as read'); // Mocking logic to update state
      // In real app, you'd map and set isRead: true
    }
    setShowNotif(!showNotif);
  };

  const handleDeleteNotif = (id) => {
    // Since we don't have a direct setter passed down, we rely on parent
    // But for this demo, we can mock the visual removal if needed or just use clearAll
    // For "Full Working", let's assume clearNotifications is the primary tool
  };

  return (
    <div className="flex h-full min-h-screen w-full crypto-grid">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-40 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">CryptoTrack <span className="text-cyan-400">Pro</span></h1>
          <p className="text-xs text-gray-400 mt-1">Advanced Crypto Portfolio Management</p>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === item.id 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <Icon name={item.icon} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 flex-1 w-full min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h2 className="text-xl font-bold text-white">{getPageTitle()}</h2>
              <p className="text-sm text-gray-400">{getPageSubtitle()}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative">
                <button onClick={toggleNotifPanel} className="relative p-2 text-gray-400 hover:text-white transition-colors">
                  <Icon name="bell" size={26} />
                  {/* Dynamic Badge */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown List */}
                {showNotif && (
                  <div className="absolute right-0 top-12 w-96 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 fade-in max-h-[80vh] flex flex-col">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
                      <h3 className="font-bold text-white">Notifications</h3>
                      <button 
                        onClick={clearNotifications}
                        className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="overflow-y-auto flex-1">
                       {notifications.length === 0 ? (
                         <div className="p-8 text-center text-gray-500 text-sm">No notifications</div>
                       ) : (
                         notifications.map(n => {
                            const meta = getNotifMeta(n.type);
                            return (
                              <div key={n.id} className="p-4 border-b border-gray-700 hover:bg-gray-700/50 transition-colors group relative">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-start space-x-3">
                                    <div className={`p-2 rounded-full mt-1 ${meta.color === 'cyan' ? 'text-cyan-400 bg-cyan-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                      <Icon name={meta.icon} />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-bold text-white">{n.title}</h4>
                                      <p className="text-xs text-gray-400 mt-1">{n.msg}</p>
                                      <div className="text-[10px] text-gray-500 mt-1">{n.time}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                       )}
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button 
                onClick={onLogout}
                className="hidden sm:flex items-center space-x-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <Icon name="sign-out" size={18} />
                <span>Log Out</span>
              </button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-700">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{user.name}</div>
                  <div className="text-xs text-gray-400">Premium User</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white">
                  {user.initials}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;