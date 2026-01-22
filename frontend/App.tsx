
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import RiskAnalysis from './pages/RiskAnalysis';
import SettingsPage from './pages/Settings';
import ProfileUpdate from './pages/ProfileUpdate';
import CsvUpload from './pages/CsvUpload';
import CryptoMarket from './pages/CryptoMarket';
import NewsInsights from './pages/NewsInsights';

import MarketSentiment from './pages/MarketSentiment';

import Reports from './pages/Reports';
import ScamScanner from './pages/ScamScanner';
import PnlPage from './pages/PnlPage';
import TaxPage from './pages/TaxPage';
import ManagedLearningHub from './pages/LearningHub';
import GuidedExploration from './pages/GuidedExploration';
import Guidelines from './pages/Guidelines';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './AuthContext';
import { AuthStatus } from './types';
import { PersonalNodeProvider } from './PersonalNodeContext';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { status } = useAuth();

  if (status === AuthStatus.LOADING || status === AuthStatus.IDLE) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (status === AuthStatus.UNAUTHENTICATED) return <Navigate to="/login" />;

  return (
    <div className="flex bg-[#020617] min-h-screen">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-grow transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'} p-4 md:p-8`}>
        {children}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PersonalNodeProvider>
          <div className="min-h-screen bg-[#020617]">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
              <Route path="/portfolio" element={<ProtectedLayout><Portfolio /></ProtectedLayout>} />

              <Route path="/market" element={<ProtectedLayout><CryptoMarket /></ProtectedLayout>} />
              <Route path="/sentiment" element={<ProtectedLayout><MarketSentiment /></ProtectedLayout>} />
              <Route path="/news" element={<ProtectedLayout><NewsInsights /></ProtectedLayout>} />

              <Route path="/scam-scanner" element={<ProtectedLayout><ScamScanner /></ProtectedLayout>} />
              <Route path="/risk-analysis" element={<ProtectedLayout><RiskAnalysis /></ProtectedLayout>} />
              <Route path="/risk-analysis" element={<ProtectedLayout><RiskAnalysis /></ProtectedLayout>} />
              <Route path="/pnl" element={<ProtectedLayout><PnlPage /></ProtectedLayout>} />
              <Route path="/tax" element={<ProtectedLayout><TaxPage /></ProtectedLayout>} />
              <Route path="/learning-hub" element={<ProtectedLayout><ManagedLearningHub /></ProtectedLayout>} />
              <Route path="/reports" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
              <Route path="/learning-hub/explore" element={<ProtectedLayout><GuidedExploration /></ProtectedLayout>} />
              <Route path="/csv-upload" element={<ProtectedLayout><CsvUpload /></ProtectedLayout>} />
              <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />
              <Route path="/guidelines" element={<ProtectedLayout><Guidelines /></ProtectedLayout>} />
              <Route path="/profile" element={<ProtectedLayout><ProfileUpdate /></ProtectedLayout>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </PersonalNodeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
