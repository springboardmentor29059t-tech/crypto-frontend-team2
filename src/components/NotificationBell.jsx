import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.read).length);
        } catch (err) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll every minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) { console.error(err); }
    };

    const markAllRead = async () => {
        try {
            await api.put(`/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) { console.error(err); }
    };

    return (
        <div className="px-2 relative" ref={notificationRef}>
            <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-full flex items-center justify-between bg-white/5 p-2 rounded-lg hover:bg-white/10 transition text-slate-400 hover:text-white"
            >
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="text-sm font-medium">Notifications</span>
                </div>
                {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                )}
            </button>

            {showNotifications && (
                <div className="absolute bottom-full left-0 w-80 mb-2 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]">
                    <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="text-sm font-bold text-white">Notifications</h3>
                        <button onClick={markAllRead} className="text-xs text-primary hover:text-primary/80">Mark all read</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div key={n.id}
                                    onClick={() => markAsRead(n.id)}
                                    className={`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition ${!n.read ? 'bg-white/5' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${n.type === 'ALERT' ? 'bg-red-500/20 text-red-500' :
                                            n.type === 'WARNING' ? 'bg-yellow-500/20 text-yellow-500' :
                                                'bg-blue-500/20 text-blue-500'
                                            }`}>{n.type}</span>
                                        <span className="text-[10px] text-gray-500">{new Date(n.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-gray-400'}`}>{n.message}</p>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No notifications
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
