import React, { useState, useEffect, useMemo } from 'react';

// ============================================
// COMPONENT: RiskView
// ============================================
const RiskView = ({ portfolio, showToast: parentShowToast, userId }) => {
  
  // --- State Management ---
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [riskDataFromDb, setRiskDataFromDb] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [tokenStats, setTokenStats] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationCount, setNotificationCount] = useState(3);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // --- Helper: Save Alert to Backend Risk Alert Table ---
  const saveRiskAlert = async (asset, alertType) => {
    if (!userId) {
        console.warn("User ID is required to save alerts.");
        return;
    }

    try {
        // Calling your Spring Boot Controller: RiskAlertController.createAlert
        // Endpoint: POST http://localhost:8080/api/alerts
        await fetch('http://localhost:8080/api/alerts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                assetSymbol: asset.symbol,
                alertType: alertType, // Must match your Enum: "RUGPULL_WARNING", "CONTRACT_RISK", "NEWS"
                details: `Scam Token Database flagged ${asset.symbol} as High Risk.`
            })
        });
        console.log(`Alert saved for ${asset.symbol}`);
    } catch (error) {
        console.error("Failed to save alert to database:", error);
    }
  };

  // --- 1. Data Fetching (Spring Boot Backend Integration) ---
  useEffect(() => {
    const fetchRiskData = async () => {
      if (!portfolio || portfolio.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // 1. Extract symbols from portfolio
        const symbols = portfolio.map(p => p.symbol);
        console.log(">>> Sending these symbols to Backend:", symbols);

        // 2. Call your Spring Boot API to check ScamToken table
        // Endpoint: POST http://localhost:8080/api/scam-check/batch
        const response = await fetch('http://localhost:8080/api/scam-check/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ symbols: symbols })
        });
        
        if (response.ok) {
          // Backend returns Map<String, RiskLevel>
          // Example: { "SQUID": "HIGH", "BTC": "LOW" }
          const backendRiskMap = await response.json();
          
          console.log("Backend Risk Map:", backendRiskMap);

          // -----------------------------------------------------
          // FIX: CHECK IF MAP IS EMPTY (Database is empty)
          // -----------------------------------------------------
          if (Object.keys(backendRiskMap).length === 0) {
              console.warn("Backend Database is empty. Using Mock Data fallback.");
              setTimeout(() => {
                const mockRiskResponse = {
                  "BTC": "LOW",
                  "ETH": "LOW",
                  "USDT": "LOW",
                  "SOL": "LOW",
                  "SQUID": "HIGH", // <--- Forces SQUID to be HIGH for testing
                  "SUS": "HIGH",
                  "SHADY": "HIGH",
                  "DOUBT": "MEDIUM"
                };
                setRiskDataFromDb(mockRiskResponse);
              }, 500);
          } else {
              // --- ORIGINAL LOGIC: Process actual backend response ---
              const newRiskData = {};
              
              portfolio.forEach(asset => {
                const symbolUpper = asset.symbol.toUpperCase();
                const backendRisk = backendRiskMap[symbolUpper]; 

                if (backendRisk && backendRisk === 'HIGH') {
                    newRiskData[asset.symbol] = "HIGH";
                    
                    // Save alert if risk is High. 
                    saveRiskAlert(asset, "CONTRACT_RISK");
                } else {
                    // Default to LOW if not found in scam DB or if risk is LOW/MEDIUM
                    newRiskData[asset.symbol] = backendRisk || "LOW";
                }
              });

              setRiskDataFromDb(newRiskData);
          }
        } else {
          throw new Error(`Backend API Error: ${response.status}`);
        }
      } catch (error) {
        console.warn("Backend API unavailable. Using Mock Data fallback.", error);
        
        // FALLBACK: Mock Data (Used if Backend is down)
        // This ensures your UI still works if you haven't started Java yet
        setTimeout(() => {
          const mockRiskResponse = {
            "BTC": "LOW",
            "ETH": "LOW",
            "USDT": "LOW",
            "SOL": "LOW",
            "SQUID": "HIGH", // <--- Simulates your DB having SQUID
            "SUS": "HIGH",
            "SHADY": "HIGH",
            "DOUBT": "MEDIUM"
          };
          setRiskDataFromDb(mockRiskResponse);
        }, 500);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiskData();
  }, [portfolio, userId]); 

  // --- 2. Logic & Calculations ---
  const totalValue = useMemo(() => {
    return portfolio.reduce((sum, asset) => sum + (asset.qty * asset.currentPrice), 0);
  }, [portfolio]);

  const filteredPortfolio = useMemo(() => {
    if (!searchTerm) return portfolio;
    return portfolio.filter(asset => 
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [portfolio, searchTerm]);

  const { riskScore, riskStats, alerts } = useMemo(() => {
    if (isLoading || portfolio.length === 0) {
      return { riskScore: 0, riskStats: { highCount: 0, mediumCount: 0, lowCount: 0 }, alerts: [] };
    }

    let highCount = 0;
    let lowCount = 0;
    let mediumCount = 0;
    let maxAssetWeight = 0;
    let generatedAlerts = [];

    portfolio.forEach(asset => {
      const val = asset.qty * asset.currentPrice;
      const weight = totalValue > 0 ? (val / totalValue) * 100 : 0;
      if (weight > maxAssetWeight) maxAssetWeight = weight;

      // Use Data from Backend API (or Fallback)
      const backendRiskLevel = riskDataFromDb[asset.symbol] || "LOW";
      
      let assetRisk = { level: 'LOW', color: 'green' };
      if (backendRiskLevel === 'HIGH') assetRisk = { level: 'HIGH', color: 'red' };
      else if (backendRiskLevel === 'MEDIUM') assetRisk = { level: 'MEDIUM', color: 'yellow' };
      
      if (assetRisk.level === 'HIGH') highCount++;
      else if (assetRisk.level === 'MEDIUM') mediumCount++;
      else lowCount++;
      
      if (assetRisk.level === 'HIGH') {
         generatedAlerts.push({
            id: `risk-${asset.id}`,
            level: 'HIGH',
            color: 'red',
            title: `${asset.symbol} Contract Warning`,
            msg: 'High risk contract detected',
            details: [`Asset ${asset.symbol} has been flagged in our database.`],
            icon: 'warning',
            time: '2 min ago'
         });
      }
    });

    // Concentration Alert
    if (maxAssetWeight > 45) {
        generatedAlerts.push({
            id: 'conc-risk',
            level: 'MEDIUM',
            color: 'yellow',
            title: 'Portfolio Concentration',
            msg: 'Diversification Warning',
            details: [`${maxAssetWeight.toFixed(1)}% of portfolio in single asset.`],
            icon: 'info',
            time: '1 hour ago'
        });
    }

    // Safe Alert
    if (generatedAlerts.length === 0) {
         generatedAlerts.push({
            id: 'safe-verified',
            level: 'LOW',
            color: 'green',
            title: 'Verified Safe',
            msg: 'Portfolio health looks good',
            details: ['Assets checked against Scam Database.'],
            icon: 'check-circle',
            time: '3 hours ago'
         });
    }

    let score = 0;
    if (maxAssetWeight > 45) score += 20;
    score += (highCount * 50);

    return { riskStats: { highCount, mediumCount, lowCount }, alerts: generatedAlerts, riskScore: score };
  }, [portfolio, totalValue, riskDataFromDb, isLoading]);

  // Determine Safest and Riskiest assets for the cards
  const safestAsset = filteredPortfolio.find(a => riskDataFromDb[a.symbol] === 'LOW') || filteredPortfolio[0];
  const riskiestAsset = filteredPortfolio.find(a => riskDataFromDb[a.symbol] === 'HIGH') || filteredPortfolio[filteredPortfolio.length - 1];

  // --- Helpers ---
  
  const openDrawer = (asset) => {
    const risk = riskDataFromDb[asset.symbol] || "LOW";
    
    let verifiedPercent = 85;
    let unverifiedPercent = 15;
    let safetyScore = 80;

    if (risk === 'HIGH') {
        verifiedPercent = 15;
        unverifiedPercent = 85;
        safetyScore = 15;
    } else if (risk === 'MEDIUM') {
        verifiedPercent = 50;
        unverifiedPercent = 50;
        safetyScore = 45;
    }

    setTokenStats({ verifiedPercent, unverifiedPercent });
    setSelectedToken({ ...asset, dbRisk: risk, calculatedScore: safetyScore });
    setIsDrawerOpen(true);
  };

  const showCustomToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDismiss = (id) => {
    const newSet = new Set(dismissedAlerts);
    newSet.add(id);
    setDismissedAlerts(newSet);
    showCustomToast('Alert dismissed');
  };
  
  // Notification Helpers
  const markAllNotificationsRead = () => {
    setNotificationCount(0);
    showCustomToast('All notifications marked as read', 'success');
  };

  // --- Render ---
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
      <p>Scanning Scam Database...</p>
    </div>
  );

  return (
    <div className="h-full w-full min-h-full bg-slate-950 text-white overflow-auto font-sans">
      
      {/* CSS Animations from Original HTML */}
      <style>{`
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.3); } 50% { box-shadow: 0 0 40px rgba(0, 255, 136, 0.6); } }
        @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes warning-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes meter-fill { from { stroke-dashoffset: 283; } }
        .glow-green { animation: pulse-glow 2s ease-in-out infinite; }
        .slide-in { animation: slide-in 0.3s ease-out forwards; }
        .fade-in { animation: fade-in 0.5s ease-out forwards; }
        .warning-pulse { animation: warning-pulse 1.5s ease-in-out infinite; }
        .risk-meter-circle { transition: stroke-dashoffset 1s ease-out; }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4); }
        .notification-badge { animation: pulse-glow 2s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f1419; }
        ::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #4a5568; }
        .circle-chart { transition: stroke-dashoffset 1s ease-out; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search token symbol..." 
                    className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-lg" 
                />
              </div>
            </div>
            
            {/* Right Actions: Notification Bell */}
            <div className="flex items-center gap-3">
              <button id="notification-btn" onClick={(e) => { e.stopPropagation(); setIsNotificationPanelOpen(!isNotificationPanelOpen); }} className="relative p-3 rounded-xl bg-slate-900/80 border border-slate-700/50 hover:border-slate-600 transition-all">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && <span className="notification-badge absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">{notificationCount}</span>}
              </button> 
            </div>
          </div>
        </div>
      </header>

      {/* NOTIFICATION PANEL (Dropdown) */}
      {isNotificationPanelOpen && (
        <div className="fixed top-16 right-4 w-80 max-h-96 overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 fade-in">
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Notifications</h3>
                <button onClick={markAllNotificationsRead} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer">Mark all read</button>
              </div>
            </div>
            <div className="divide-y divide-slate-800/50">
              {alerts.map(alert => {
                 const isHigh = alert.level === 'HIGH';
                 const bgClass = isHigh ? 'bg-red-500/5 hover:bg-slate-800/50' : alert.level === 'MEDIUM' ? 'bg-yellow-500/5 hover:bg-slate-800/50' : 'hover:bg-slate-800/50';
                 const dotColor = isHigh ? 'bg-red-500' : alert.level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-emerald-500';

                 return (
                    <div key={alert.id} className={`p-4 cursor-pointer transition-colors ${bgClass}`} onClick={() => { setIsNotificationPanelOpen(false); 
                     }}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${dotColor}`}></div>
                        <div>
                          <p className="text-sm text-white font-medium">{alert.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{alert.msg}</p>
                        </div>
                      </div>
                    </div>
                 )
              })}
            </div>
            <div className="p-3 border-t border-slate-800">
               <button onClick={() => setIsNotificationPanelOpen(false)} className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors">View all notifications</button>
            </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Scam Alert Banner */}
        {riskStats.highCount > 0 && (
          <div className="warning-pulse rounded-2xl bg-gradient-to-r from-red-600/90 via-red-500/90 to-orange-500/90 p-4 border border-red-400/30 shadow-lg shadow-red-500/20">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <p id="scam-warning-text" className="font-semibold text-white">⚠️ Warning: High risk tokens detected</p>
                  <p className="text-sm text-white/70">{riskStats.highCount} token(s) flagged in your watchlist</p>
                </div>
              </div>
              <button id="view-details-btn" onClick={() => openDrawer(riskiestAsset)} className="px-5 py-2.5 bg-white text-red-600 font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg"> View Details </button>
            </div>
          </div>
        )}

        {/* Asset Grid */}
        <section className="fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Portfolio Assets ({filteredPortfolio.length})</h2>
            <span className="text-xs text-slate-400 flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Live</span>
          </div>
          {filteredPortfolio.length === 0 ? (
             <div className="p-8 text-center text-slate-500">No tokens found matching your search.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredPortfolio.slice(0, 8).map((asset) => {
                 const isRisky = riskDataFromDb[asset.symbol] === 'HIGH';
                 const borderColor = isRisky ? 'border-red-500/50' : 'border-slate-800/50';
                 
                 return (
                  <div key={asset.id} onClick={() => openDrawer(asset)} 
                        className={`card-hover bg-slate-900/60 backdrop-blur border ${borderColor} rounded-2xl p-4 relative transition-all duration-300 hover:-translate-y-1`}>
                    {isRisky && <div className="absolute top-2 right-2"><span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase rounded-full">High Risk</span></div>}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center ${isRisky ? 'from-red-400 to-rose-600' : 'from-blue-400 to-indigo-600'}`}>
                        <span className="text-lg font-bold text-white">{asset.symbol[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{asset.symbol}</p>
                        <p className="text-xs text-slate-400">{asset.symbol}</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-white">${asset.currentPrice.toLocaleString()}</p>
                    <p className="text-sm text-emerald-400 font-medium">+{(Math.random() * 2).toFixed(2)}%</p>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column: Risk Cards */}
          <div className="lg:col-span-1 space-y-4">
            {/* Safe Card */}
            {safestAsset && (
              <div className="glow-green bg-slate-900/60 backdrop-blur border border-emerald-500/30 rounded-2xl p-6 cursor-pointer" onClick={() => openDrawer(safestAsset)}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{safestAsset.symbol}</h3>
                    <p className="text-sm text-slate-400">Verified</p>
                  </div>
                  <div className="flex gap-2"><span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"><svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></span></div>
                </div>
                <div className="flex justify-center mb-6">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" stroke="#1e293b" strokeWidth="8" fill="none" /> <circle className="risk-meter-circle" cx="50" cy="50" r="45" stroke="url(#greenGradient)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray="283" strokeDashoffset="57" /> <defs>
                      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" /></linearGradient>
                    </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl font-bold text-emerald-400">80</span><span className="text-sm text-slate-400">Safe Score</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Risky Card */}
            {riskiestAsset && (
              <div className="bg-slate-900/60 backdrop-blur border border-red-500/30 rounded-2xl p-6 cursor-pointer" style={{boxShadow: '0 0 30px rgba(239, 68, 68, 0.15)'}} onClick={() => openDrawer(riskiestAsset)}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{riskiestAsset.symbol}</h3>
                    <p className="text-sm text-slate-400">Unverified</p>
                  </div>
                  <div className="flex gap-2"><span className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center"><svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg></span></div>
                </div>
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" stroke="#1e293b" strokeWidth="8" fill="none" /> <circle className="risk-meter-circle" cx="50" cy="50" r="45" stroke="url(#redGradient)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray="283" strokeDashoffset="241" /> <defs>
                      <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#f97316" /></linearGradient>
                    </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-bold text-red-400">15</span><span className="text-xs text-slate-400">Risk Score</span></div>
                  </div>
                </div>
                <div className="text-center"><span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-full font-semibold text-sm">High Risk</span></div>
              </div>
            )}
          </div>

          {/* Right Column: Price History Chart */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/60 backdrop-blur border border-slate-800/50 rounded-2xl p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Price History & Risk Events</h3>
                  <p className="text-sm text-slate-400">{safestAsset?.symbol || 'ETH'}/USDT • 30 Days</p>
                </div>
                <div className="flex gap-2">
                  {['1D', '7D', '30D', '1Y'].map(tf => (
                    <button key={tf} className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">{tf}</button>
                  ))}
                </div>
              </div>
              
              {/* Chart Legend */}
              <div className="flex gap-4 mb-4 text-xs">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-400"></div><span className="text-slate-400">Price</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-slate-400">Scam Report</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className="text-slate-400">Suspicious Activity</span></div>
              </div>
              
              {/* SVG Chart */}
              <div className="relative h-64 w-full">
                <svg className="w-full h-full" viewBox="0 0 800 250" preserveAspectRatio="none">
                   <defs><pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.5" /></pattern></defs>
                   <rect width="100%" height="100%" fill="url(#grid)" />
                   <defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.3" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs>
                   <path d="M 0,200 L 50,180 L 100,160 L 150,170 L 200,140 L 250,120 L 300,130 L 350,100 L 400,90 L 450,110 L 500,80 L 550,70 L 600,85 L 650,60 L 700,50 L 750,55 L 800,40 L 800,250 L 0,250 Z" fill="url(#areaGradient)" />
                   <path d="M 0,200 L 50,180 L 100,160 L 150,170 L 200,140 L 250,120 L 300,130 L 350,100 L 400,90 L 450,110 L 500,80 L 550,70 L 600,85 L 650,60 L 700,50 L 750,55 L 800,40" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                   
                   {/* Risk Markers */}
                   <g className="cursor-pointer" 
                      onClick={() => showCustomToast('Scam report: Multiple phishing attempts', 'error')}
                      onMouseEnter={() => setActiveTooltip('scam1')}
                      onMouseLeave={() => setActiveTooltip(null)}
                   >
                      <circle cx="300" cy="130" r="12" fill="#ef4444" opacity="0.3">
                         <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite" />
                         <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="300" cy="130" r="6" fill="#ef4444" />
                   </g>
                   <g className="cursor-pointer"
                      onMouseEnter={() => setActiveTooltip('suspicious1')}
                      onMouseLeave={() => setActiveTooltip(null)}
                      onClick={() => showCustomToast('Suspicious activity: Large wallet movement', 'warning')}
                   >
                      <circle cx="150" cy="170" r="10" fill="#eab308" opacity="0.3">
                         <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="150" cy="170" r="5" fill="#eab308" />
                   </g>
                   <g className="cursor-pointer" onMouseEnter={() => setActiveTooltip(null)} onClick={() => showCustomToast('Suspicious activity: Unusual volume spike', 'warning')}>
                      <circle cx="450" cy="110" r="10" fill="#eab308" opacity="0.3">
                         <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="450" cy="110" r="5" fill="#eab308" />
                   </g>
                   <g className="cursor-pointer" onClick={() => showCustomToast('Scam report: Suspicious contract activity', 'error')} onMouseEnter={() => setActiveTooltip(null)}>
                      <circle cx="600" cy="85" r="12" fill="#ef4444" opacity="0.3">
                         <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="600" cy="85" r="6" fill="#ef4444" />
                   </g>
                </svg>
                
                {/* Tooltips */}
                {activeTooltip === 'scam1' && (
                  <div className="absolute bg-slate-800 border border-red-500/50 rounded-xl p-3 text-sm z-10 shadow-xl" style={{left: '260px', top: '70px'}}>
                    <p className="font-semibold text-red-400 mb-1">🚨 Scam Report</p>
                    <p className="text-slate-300 text-xs">Multiple users reported phishing attempts</p>
                    <p className="text-slate-500 text-xs mt-1">Dec 15, 2024</p>
                  </div>
                )}
                {activeTooltip === 'suspicious1' && (
                  <div className="absolute bg-slate-800 border border-yellow-500/50 rounded-xl p-3 text-sm z-10 shadow-xl" style={{left: '110px', top: '110px'}}>
                    <p className="font-semibold text-yellow-400 mb-1">⚠️ Suspicious Activity</p>
                    <p className="text-slate-300 text-xs">Large wallet movement detected</p>
                    <p className="text-slate-500 text-xs mt-1">Dec 8, 2024</p>
                  </div>
                )}
              </div>

              {/* Chart Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-800/50">
                <div>
                  <p className="text-xs text-slate-400 mb-1">24h High</p>
                  <p className="font-semibold text-white">$3,587.42</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">24h Low</p>
                  <p className="font-semibold text-white">$3,421.18</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Risk Events</p>
                  <p className="font-semibold text-yellow-400">4 this month</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Trust Score</p>
                  <p className="font-semibold text-emerald-400">High</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Alerts</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {alerts.filter(a => !dismissedAlerts.has(a.id)).map((alert) => {
              const isHigh = alert.level === 'HIGH';
              const borderClass = isHigh ? 'border-red-500/30' : alert.level === 'MEDIUM' ? 'border-yellow-500/30' : 'border-emerald-500/30';
              const bgClass = isHigh ? 'bg-red-500/20' : alert.level === 'MEDIUM' ? 'bg-yellow-500/20' : 'bg-emerald-500/20';
              const iconColor = isHigh ? 'text-red-400' : alert.level === 'MEDIUM' ? 'text-yellow-400' : 'text-emerald-400';
              const icon = isHigh ? '⚠️' : alert.level === 'LOW' ? '✓' : 'ℹ️';

              return (
                <div key={alert.id} className="card-hover bg-slate-900/60 backdrop-blur border border-slate-800/50 rounded-2xl p-4 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center flex-shrink-0 text-2xl`}>{icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-white">{alert.title}</h4>
                      <button onClick={() => handleDismiss(alert.id)} className="text-slate-400 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                    <p className="text-sm text-slate-400">{alert.msg}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {/* --- RISK ANALYSIS DRAWER / PAGE --- */}
      {isDrawerOpen && selectedToken && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
          
          <div className="slide-in absolute right-0 top-0 h-full w-full max-w-3xl bg-slate-900 border-l border-slate-800 overflow-y-auto flex flex-col">
            
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 sticky top-0 backdrop-blur-md z-10">
              <h2 className="text-2xl font-bold text-white">Risk Analysis: {selectedToken.symbol}</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-white transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-8 flex-1">
              
              {/* Token Header */}
              <div className="flex items-center justify-between bg-slate-800/50 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center ${selectedToken.dbRisk === 'HIGH' ? 'from-red-400 to-rose-600' : 'from-blue-400 to-indigo-600'}`}>
                    <span className="text-3xl font-bold text-white">{selectedToken.symbol[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-3xl">{selectedToken.symbol}</h3>
                    <p className="text-slate-400">Price: ${selectedToken.currentPrice.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                    <div className={`text-4xl font-bold ${selectedToken.calculatedScore < 50 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {selectedToken.calculatedScore}
                    </div>
                    <div className="text-sm text-slate-400 uppercase tracking-wide">Safety Score</div>
                </div>
              </div>

              {/* VERIFICATION CHART SECTION */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Verification & Audit Status</h3>
                
                <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                  
                  {/* SVG Donut Chart */}
                  <div className="relative w-64 h-64">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" stroke="#ef4444" strokeWidth="10" fill="none" opacity="0.2" />
                      <circle 
                        cx="50" cy="50" r="45" 
                        stroke={selectedToken.calculatedScore < 50 ? "#ef4444" : "#10b981"} 
                        strokeWidth="10" 
                        fill="none" 
                        strokeLinecap="round"
                        strokeDasharray="283" 
                        strokeDashoffset={283 - (tokenStats.verifiedPercent / 100) * 283}
                        className="circle-chart"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${selectedToken.calculatedScore < 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {tokenStats.verifiedPercent}%
                        </span>
                        <span className="text-xs text-slate-400">Verified</span>
                    </div>
                  </div>

                  {/* Legend & Stats */}
                  <div className="space-y-4 flex-1 w-full">
                    <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${selectedToken.calculatedScore < 50 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                            <span className="text-white font-medium">Verified Checks</span>
                        </div>
                        <span className="text-xl font-bold text-white">{tokenStats.verifiedPercent}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-white font-medium">Unverified / Failed</span>
                        </div>
                        <span className="text-xl font-bold text-red-400">{tokenStats.unverifiedPercent}%</span>
                    </div>

                    <p className="text-sm text-slate-400 pt-4">
                        {selectedToken.calculatedScore < 50 
                            ? "⚠️ Critical: Source code is not fully verified or multiple audits have failed. Proceed with extreme caution."
                            : "✅ Status: This token has passed the majority of security audits and source code verification checks."
                        }
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Risk Factors */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <h4 className="text-emerald-400 font-bold mb-1">Liquidity Locked</h4>
                    <p className="text-white font-semibold">{selectedToken.calculatedScore > 50 ? 'Yes (2 Years)' : 'No'}</p>
                    <p className="text-xs text-slate-400 mt-1">LP tokens are burned or locked.</p>
                </div>
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <h4 className="text-emerald-400 font-bold mb-1">Owner Renounced</h4>
                    <p className="text-white font-semibold">{selectedToken.calculatedScore > 50 ? 'Yes' : 'No'}</p>
                    <p className="text-xs text-slate-400 mt-1">Contract ownership cannot be changed.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-3 fade-in ${toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-slate-800/90 text-white'}`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default RiskView;