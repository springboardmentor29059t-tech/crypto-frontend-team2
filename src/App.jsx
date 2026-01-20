import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Menu, X, RefreshCcw, ShieldAlert } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Trades from './pages/Trades';
import Login from './pages/Login';
import Register from './pages/Register';
import RiskAlerts from './pages/RiskAlerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Watchlist from './pages/Watchlist';
import Notifications from './pages/Notifications';
import ScamDetector from './pages/ScamDetector';
import ConnectExchange from './pages/ConnectExchange';

// --- 🛡️ AUTHENTICATED LAYOUT CONTROLLER ---
const AuthenticatedLayout = () => {
  const { user } = useAuth();

  // 1. Desktop Sidebar Collapse State
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 2. Mobile Drawer State
  const [isMobileOpen, setMobileOpen] = useState(false);

  // 3. Global Loading States
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div className="flex h-screen bg-[#0B0E14] text-slate-200 overflow-hidden font-sans relative">

      {/* 📱 MOBILE HEADER (Hidden on Desktop) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0B0E14]/90 backdrop-blur-md border-b border-white/10 z-[60] flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight text-lg">Crypto<span className="text-blue-500">X</span></span>
        </div>
        <button
          onClick={() => setMobileOpen(!isMobileOpen)}
          className="p-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700 transition-colors"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 🗄️ SIDEBAR WRAPPER */}
      <div className={`
          fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
          flex-shrink-0
      `}>
        <Sidebar
          isCollapsed={isCollapsed}
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* 🌑 MOBILE BACKDROP */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 🖥️ MAIN CONTENT AREA */}
      <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden mt-16 lg:mt-0 transition-all duration-300">

        {/* Status Indicators (Sync/Scan) */}
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end pointer-events-none">
          {isScanning && (
            <div className="bg-amber-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 animate-bounce border border-amber-400/50 backdrop-blur-md">
              <ShieldAlert size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Forensic Scan Active</span>
            </div>
          )}

          {isSyncing && (
            <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 animate-pulse border border-blue-400/50 backdrop-blur-md">
              <RefreshCcw size={14} className="animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Node Syncing</span>
            </div>
          )}
        </div>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto w-full">
            {/* Pass state to children so they can adjust layout if needed */}
            <Outlet context={{ user, isCollapsed, isSyncing, setIsSyncing, isScanning, setIsScanning }} />
          </div>
        </div>
      </main>
    </div>
  );
};

// --- 🔒 GUARD COMPONENT ---
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen bg-[#0B0E14] flex items-center justify-center">
        <RefreshCcw className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Render the Layout if authenticated
  return <AuthenticatedLayout />;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
};

// --- 🚀 MAIN APP ---
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* Protected Routes wrapped in Layout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/scam-detector" element={<ScamDetector />} />
            <Route path="/risk" element={<RiskAlerts />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/connect-exchange" element={<ConnectExchange />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;