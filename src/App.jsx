import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/Layout/DashboardLayout';
import Modal from './components/Layout/Modal';
import LandingPage from './components/Views/LandingPage';
import AuthPage from './components/Views/AuthPage';
import DashboardView from './components/Views/DashboardView';
import PortfolioView from './components/Views/PortfolioView';
import ExchangesView from './components/Views/ExchangesView';
import TradesView from './components/Views/TradesView';
import RiskView from './components/Views/RiskView';
import ReportsView from './components/Views/ReportsView';
import AssetDetailView from './components/Views/AssetDetailView';
import { INITIAL_PORTFOLIO, TRADES_DATA } from './data/constants';
import Icon from './components/UI/Icon';

// Import the API functions
import { loginUser, registerUser } from './api/auth'; 

function App() {
  const [view, setView] = useState('landing'); 
  const [user, setUser] = useState(null); 
  const [portfolio, setPortfolio] = useState(INITIAL_PORTFOLIO);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(null); 
  const [selectedAsset, setSelectedAsset] = useState(null); 
  const [toast, setToast] = useState(null);
  
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', title: 'Welcome to CryptoTrack', msg: 'Start connecting your exchanges to track assets.', time: 'Just now', isRead: false }
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    }
  }, []);

  const addNotification = (type, title, msg) => {
    const newNotif = { id: Date.now(), type, title, msg, time: 'Just now', isRead: false };
    setNotifications(prev => [newNotif, ...prev]);
  };
  const clearNotifications = () => setNotifications([]);
  
  const handleLogin = async (email, password) => {
    setAuthError(null); // Clear previous errors
    try {
      // Call the API function
      const data = await loginUser(email, password);
      
      // Handle success data here
      const token = data.token;
      
      const namePart = email.split('@')[0] || "Crypto User";
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const initials = namePart.substring(0,2).toUpperCase();
      const newUserObj = { name: displayName, initials, email };

      setUser(newUserObj);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(newUserObj));

      setView('dashboard');
      addNotification('success', 'Login Successful', `Welcome back, ${displayName}!`);
      
    } catch (error) {
      // Handle error from API here
      setAuthError(error.message);
      showToast(error.message);
    }
  };

  const handleSignup = async (name, email, password) => {
    setAuthError(null);
    try {
      // Call the API function
      const data = await registerUser(name, email, password);
      
      showToast('Account created successfully! Please log in.');
      setAuthMode('login'); 
      setView('auth');     
      addNotification('info', 'Account Created', 'You can now log in with your credentials.');
    } catch (error) {
      setAuthError(error.message);
      showToast(error.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setModalOpen(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const handleAddHolding = (e) => {
    e.preventDefault();
    const form = e.target;
    const symbol = form.symbol.value.toUpperCase();
    const newAsset = {
        id: Date.now(),
        symbol: symbol,
        name: form.name.value,
        qty: parseFloat(form.qty.value),
        avgCost: parseFloat(form.avgCost.value),
        currentPrice: parseFloat(form.avgCost.value),
        icon: symbol[0],
        gradient: 'from-gray-600 to-gray-500'
    };
    setPortfolio([...portfolio, newAsset]);
    setModalOpen(null);
    showToast(`Added ${symbol} successfully!`);
    addNotification('portfolio', 'Holding Added', `You added ${newAsset.qty} ${symbol} to your portfolio.`);
  };

  const handleEditHolding = (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedPortfolio = portfolio.map(p => {
        if(p.id === parseInt(form.assetId.value)) {
            return { ...p, qty: parseFloat(form.qty.value), avgCost: parseFloat(form.avgCost.value) };
        }
        return p;
    });
    setPortfolio(updatedPortfolio);
    setModalOpen(null);
    showToast('Holding updated!');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (view === 'landing') {
    return (
        <LandingPage 
          onLogin={() => { setAuthMode('login'); setView('auth'); setAuthError(null); }} 
          onSignup={() => { setAuthMode('signup'); setView('auth'); setAuthError(null); }} 
        />
    );
  }
  
  if (view === 'auth') {
    return (
        <AuthPage 
          mode={authMode} 
          error={authError}
          onClearError={() => setAuthError(null)}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onBack={() => setView('landing')} 
        />
    );
  }
  
  if (!user) return null;

  return (
    <DashboardLayout 
      user={user} 
      activeView={view} 
      setActiveView={setView} 
      onLogout={handleLogout}
      notifications={notifications}
      addNotification={addNotification}
      clearNotifications={clearNotifications}
    >
      {view === 'dashboard' && <DashboardView portfolio={portfolio} />}
      
      {view === 'portfolio' && (
        <PortfolioView 
          portfolio={portfolio} 
          onAddHolding={() => setModalOpen('add')}
          onEditHolding={() => setModalOpen('edit')}
          onViewAsset={(asset) => { setSelectedAsset(asset); setView('asset-detail'); }}
        />
      )}
      
      {view === 'exchanges' && <ExchangesView showToast={showToast} onNotify={addNotification} />}
      {view === 'trades' && <TradesView />}
      {view === 'risk' && <RiskView portfolio={portfolio} showToast={showToast} />}
      
      {view === 'reports' && (
        <ReportsView 
            portfolio={portfolio} 
            trades={TRADES_DATA} 
            showToast={showToast} 
        />
      )}

      {view === 'asset-detail' && (
        <AssetDetailView 
            asset={selectedAsset} 
            onBack={() => setView('portfolio')} 
        />
      )}

      {/* Modals */}
      <Modal isOpen={modalOpen === 'add'} title="Add New Holding" onClose={() => setModalOpen(null)}>
        <form onSubmit={handleAddHolding} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label><input name="symbol" required placeholder="BTC" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Name</label><input name="name" required placeholder="Bitcoin" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label><input name="qty" type="number" step="any" required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Avg Price</label><input name="avgCost" type="number" step="any" required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white" /></div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-white">Save Holding</button>
            <button type="button" onClick={() => setModalOpen(null)} className="flex-1 py-3 bg-gray-800 border border-gray-700 rounded-lg font-bold text-white">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalOpen === 'edit'} title="Edit Holding" onClose={() => setModalOpen(null)}>
        <form onSubmit={handleEditHolding} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Asset</label>
            <select name="assetId" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white" onChange={(e) => setSelectedAsset(portfolio.find(p => p.id == e.target.value))}>
              <option value="">Select...</option>
              {portfolio.map(p => <option key={p.id} value={p.id}>{p.name} ({p.symbol})</option>)}
            </select>
          </div>
          {selectedAsset && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label><input name="qty" type="number" step="any" defaultValue={selectedAsset.qty} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Avg Price</label><input name="avgCost" type="number" step="any" defaultValue={selectedAsset.avgCost} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white" /></div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-white">Update</button>
                <button type="button" onClick={() => setModalOpen(null)} className="flex-1 py-3 bg-gray-800 border border-gray-700 rounded-lg font-bold text-white">Cancel</button>
              </div>
            </>
          )}
        </form>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-800 border border-cyan-500/50 text-cyan-400 px-6 py-4 rounded-lg z-50 fade-in shadow-xl flex items-center gap-3 font-bold">
          <Icon name="check-circle" /><span>{toast}</span>
        </div>
      )}
    </DashboardLayout>
  );
}

export default App;