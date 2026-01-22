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
import MarketPage from './components/Views/MarketPage'; 
import Icon from './components/UI/Icon';

// API Imports
import { loginUser, registerUser } from './api/auth';
import { getPortfolioData, addPortfolioHolding, updatePortfolioHolding } from './api/portfolio';

function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [trades, setTrades] = useState([]);
  
  // --- NEW: State to track asset selected from Market Page ---
  const [selectedTradeAsset, setSelectedTradeAsset] = useState(null);
  
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null); // For Portfolio Detail view
  const [toast, setToast] = useState(null);
  
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', title: 'Welcome to CryptoTrack', msg: 'Start connecting your exchanges to track assets.', time: 'Just now', isRead: false }
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setView('dashboard');
      fetchPortfolio();
    }
  }, []);

  const fetchPortfolio = async () => {
    try {
      const data = await getPortfolioData();
      const mappedData = data.map(dto => ({
        id: dto.id,
        symbol: dto.assetSymbol,
        name: dto.assetSymbol, 
        qty: dto.quantity,
        avgCost: dto.avgCost,
        currentPrice: dto.currentPrice,
        totalValue: dto.totalValue,
        profitLoss: dto.profitLoss,
        icon: dto.assetSymbol ? dto.assetSymbol[0] : '?',
        gradient: 'from-gray-600 to-gray-500'
      }));
      setPortfolio(mappedData);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  const fetchTrades = async () => {
      // Mock function as in your original code
  };

  const addNotification = (type, title, msg) => {
    const newNotif = { id: Date.now(), type, title, msg, time: 'Just now', isRead: false };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (email, password) => {
    setAuthError(null);
    try {
      const data = await loginUser(email, password);
      const token = data.token;
      const namePart = email.split('@')[0] || "Crypto User";
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const initials = namePart.substring(0,2).toUpperCase();
      const newUserObj = { name: displayName, initials, email };

      setUser(newUserObj);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(newUserObj));
      setView('dashboard');
      await fetchPortfolio();
      addNotification('success', 'Login Successful', `Welcome back, ${displayName}!`);
    } catch (error) {
      setAuthError(error.message);
      showToast(error.message);
    }
  };

  const handleSignup = async (name, email, password) => {
    setAuthError(null);
    try {
      await registerUser(name, email, password);
      showToast('Account created! Please log in.');
      setAuthMode('login');
      setView('auth');
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
    setPortfolio([]);
    setTrades([]);
    setSelectedTradeAsset(null);
  };

  const handleAddHolding = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      assetSymbol: form.symbol.value.toUpperCase(),
      quantity: parseFloat(form.qty.value),
      avgCost: parseFloat(form.avgCost.value)
    };

    try {
      await addPortfolioHolding(payload);
      const newTrade = {
        date: new Date().toISOString().split('T')[0],
        type: 'BUY',
        asset: payload.assetSymbol,
        qty: payload.quantity,
        price: payload.avgCost,
        total: payload.quantity * payload.avgCost,
        exchange: 'Manual Entry'
      };
      setTrades(prev => [newTrade, ...prev]);
      setModalOpen(null);
      showToast(`Added ${payload.assetSymbol} successfully!`);
      addNotification('portfolio', 'Holding Added', `You added ${payload.quantity} ${payload.assetSymbol} to your portfolio.`);
      fetchPortfolio();
    } catch (error) {
      showToast("Error adding holding: " + error.message);
    }
  };

  const handleEditHolding = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return showToast("Please select an asset to edit.");
    const payload = {
      quantity: parseFloat(e.target.qty.value),
      avgCost: parseFloat(e.target.avgCost.value)
    };

    try {
      await updatePortfolioHolding(selectedAsset.id, payload);
      setModalOpen(null);
      setSelectedAsset(null); 
      showToast('Holding updated successfully!');
      fetchPortfolio();
    } catch (error) {
      showToast("Error updating holding: " + error.message);
    }
  };

  const handleAssetSelect = (e) => {
    const assetId = parseInt(e.target.value);
    const found = portfolio.find(p => p.id === assetId);
    setSelectedAsset(found || null);
  };

  // --- NEW: Handler to receive coin from MarketPage and switch to Trade View ---
  const handleTradeClick = (coin) => {
    setSelectedTradeAsset(coin);
    setView('trades');
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
      clearNotifications={() => setNotifications([])}
    >
      {view === 'dashboard' && <DashboardView portfolio={portfolio} />}
      
      {/* UPDATED: Passing onTrade handler here */}
      {view === 'market' && <MarketPage onTrade={handleTradeClick} showToast={showToast} />}
      
      {view === 'portfolio' && (
        <PortfolioView 
          portfolio={portfolio} 
          onAddHolding={() => setModalOpen('add')}
          onEditHolding={() => setModalOpen('edit')}
          onViewAsset={(asset) => { setSelectedAsset(asset); setView('asset-detail'); }}
        />
      )}
      
      {view === 'exchanges' && <ExchangesView showToast={showToast} onNotify={addNotification} />}
      
      {/* UPDATED: Passing selectedAsset here */}
      {view === 'trades' && (
        <TradesView 
            trades={trades} 
            showToast={showToast} 
            selectedAsset={selectedTradeAsset}
        />
      )}
      
      {view === 'risk' && <RiskView portfolio={portfolio} showToast={showToast} />}
      
      {view === 'reports' && (
        <ReportsView 
            portfolio={portfolio} 
            trades={trades} 
            showToast={showToast} 
        />
      )}

      {view === 'asset-detail' && (
        <AssetDetailView 
            asset={selectedAsset} 
            onBack={() => setView('portfolio')} 
        />
      )}

      {/* MODALS */}
      <Modal isOpen={modalOpen === 'add'} title="Add New Holding" onClose={() => setModalOpen(null)}>
        <form onSubmit={handleAddHolding} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
              <input name="symbol" required placeholder="BTC" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name (Optional)</label>
              <input name="name" placeholder="Bitcoin" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
              <input name="qty" type="number" step="any" required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Avg Buy Price</label>
              <input name="avgCost" type="number" step="any" required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white" />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-white hover:opacity-90">Save Holding</button>
            <button type="button" onClick={() => setModalOpen(null)} className="flex-1 py-3 bg-gray-800 border border-gray-700 rounded-lg font-bold text-white hover:bg-gray-700">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalOpen === 'edit'} title="Edit Holding" onClose={() => setModalOpen(null)}>
        <form onSubmit={handleEditHolding} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Asset</label>
            <select 
              name="assetId" 
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white"
              onChange={handleAssetSelect}
              value={selectedAsset?.id || ""}
            >
              <option value="">Select an asset...</option>
              {portfolio.map(p => <option key={p.id} value={p.id}>{p.name} ({p.symbol})</option>)}
            </select>
          </div>
          
          {selectedAsset ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                  <input 
                    name="qty" 
                    type="number" 
                    step="any" 
                    required 
                    value={selectedAsset.qty}
                    onChange={(e) => setSelectedAsset({...selectedAsset, qty: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Avg Price</label>
                  <input 
                    name="avgCost" 
                    type="number" 
                    step="any" 
                    required 
                    value={selectedAsset.avgCost}
                    onChange={(e) => setSelectedAsset({...selectedAsset, avgCost: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none text-white" 
                  />
                </div>
              </div>
              <div className="p-3 bg-gray-800/50 rounded border border-gray-700 text-sm text-gray-400">
                Updating this will change the Cost Basis of {selectedAsset.symbol}.
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-white hover:opacity-90">Update</button>
                <button type="button" onClick={() => setModalOpen(null)} className="flex-1 py-3 bg-gray-800 border border-gray-700 rounded-lg font-bold text-white hover:bg-gray-700">Cancel</button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-4">Please select an asset above to edit.</p>
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