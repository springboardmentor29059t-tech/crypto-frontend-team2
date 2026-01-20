import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellRing } from 'lucide-react';
import api from '../api/axiosConfig';

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Memoized fetch function to prevent re-renders
  const fetchUnread = useCallback(async () => {
    try {
      const res = await api.get('/portfolio/notifications/unread-count');
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      console.error("📡 Notification Hub Sync Failed");
    }
  }, []);

  useEffect(() => {
    // 1. Initial Fetch on Load
    fetchUnread();

    // 2. 🚀 LISTEN FOR INSTANT UPDATES
    // This listens for the event dispatched by AddTransactionModal
    window.addEventListener('notificationUpdate', fetchUnread);

    // 3. BACKGROUND POLLING
    // Regular check every 30 seconds for external events
    const interval = setInterval(fetchUnread, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationUpdate', fetchUnread);
    };
  }, [fetchUnread]);

  return (
    <Link
      to="/notifications"
      className="p-2.5 rounded-xl hover:bg-slate-800/50 transition-all flex items-center justify-center group relative"
    >
      {unreadCount > 0 ? (
        <div className="relative flex items-center justify-center">
          {/* Animated Bell for Active Threats/Trades */}
          <BellRing className="text-blue-400 animate-pulse" size={18} />

          {/* Glowing Ping Alert System */}
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-[8px] font-black text-white items-center justify-center border-2 border-slate-950 shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <Bell className="text-slate-500 group-hover:text-blue-400 transition-colors" size={18} />
        </div>
      )}
    </Link>
  );
};

export default NotificationBadge;