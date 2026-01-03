import React, { useState } from 'react';
import Icon from '../UI/Icon';

// Helper to get styling based on exchange name
const getExchangeDetails = (name) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('binance')) {
    return {
      color: 'yellow',
      icon: 'B',
      gradient: 'from-yellow-500 to-orange-500',
      bgClass: 'bg-yellow-500/10',
      borderClass: 'border-yellow-500/20'
    };
  }
  if (lowerName.includes('coinbase')) {
    return {
      color: 'blue',
      icon: 'C',
      gradient: 'from-blue-500 to-indigo-600',
      bgClass: 'bg-blue-500/10',
      borderClass: 'border-blue-500/20'
    };
  }
  if (lowerName.includes('kraken')) {
    return {
      color: 'purple',
      icon: 'K',
      gradient: 'from-purple-500 to-pink-600',
      bgClass: 'bg-purple-500/10',
      borderClass: 'border-purple-500/20'
    };
  }
  
  // Default for generic exchanges
  return {
    color: 'gray',
    icon: 'E',
    gradient: 'from-gray-600 to-gray-500',
    bgClass: 'bg-gray-500/10',
    borderClass: 'border-gray-500/20'
  };
};

const ExchangesView = ({ showToast, onNotify }) => {
  // Initial Dummy Data
  const [exchanges, setExchanges] = useState([
    { 
      id: 1, 
      name: 'Binance', 
      accountLabel: 'Main Account', 
      lastSync: '2 mins ago',
      status: 'Active',
      keyPreview: 'A1b2...xY9z' 
    }
  ]);

  const handleConnect = (e) => {
    e.preventDefault();
    const form = e.target;
    const exchangeName = form.exchange.value;
    
    // Create new connection object
    const newExchange = {
      id: Date.now(),
      name: exchangeName,
      accountLabel: `API Key (${form.apiKey.value.substring(0, 4)}...)`,
      lastSync: 'Just now',
      status: 'Active',
      keyPreview: `${form.apiKey.value.substring(0, 4)}...${Math.random().toString(36).substring(2, 6)}`
    };

    // Update State
   
    setExchanges([...exchanges, newExchange]);
    showToast(`Successfully connected to ${exchangeName}`);
    form.reset();

    // TRIGGER NOTIFICATION
    if (onNotify) {
        onNotify('success', 'Exchange Connected', `${exchangeName} has been linked successfully.`);
    }
  };
    // UI Feedback
    

  const handleRemove = (id, name) => {
    if (window.confirm(`Are you sure you want to remove the connection to ${name}?`)) {
      setExchanges(exchanges.filter(ex => ex.id !== id));
      showToast(`Removed ${name} connection`);
    }
  };

  return (
    <div className="fade-in">
       <div className="flex items-center justify-between mb-6">
         
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Connect Form */}
        <div className="lg:col-span-1">
            <div className="bg-gray-900/50 neon-border rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Icon name="plus" className="text-cyan-400" /> Connect New Exchange
                </h4>
                <form onSubmit={handleConnect} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Exchange</label>
                        <select name="exchange" className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg outline-none text-white focus:ring-2 focus:ring-cyan-500">
                            <option value="Binance">Binance</option>
                            <option value="Coinbase Pro">Coinbase Pro</option>
                            <option value="Kraken">Kraken</option>
                            <option value="KuCoin">KuCoin</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">API Key</label>
                        <input 
                            name="apiKey" 
                            type="text" 
                            required 
                            placeholder="Enter your API Key" 
                            className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg outline-none text-white focus:ring-2 focus:ring-cyan-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">API Secret</label>
                        <input 
                            name="apiSecret" 
                            type="password" 
                            required 
                            placeholder="Enter your API Secret" 
                            className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg outline-none text-white focus:ring-2 focus:ring-cyan-500" 
                        />
                    </div>
                    
                    <div className="pt-2 space-y-2">
                        <div className="flex items-center text-xs text-green-400 gap-2">
                            <Icon name="lock-key" size={14} />
                            <span>Keys encrypted at rest</span>
                        </div>
                        <div className="flex items-center text-xs text-green-400 gap-2">
                            <Icon name="shield-check" size={14} />
                            <span>Read-only access enabled</span>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
                        Connect Securely
                    </button>
                </form>
            </div>
        </div>
        
        {/* Right: Connected List */}
        <div className="lg:col-span-2">
            <h4 className="text-lg font-bold text-white mb-4">Active Connections ({exchanges.length})</h4>
            
            {exchanges.length === 0 ? (
                <div className="border-2 border-dashed border-gray-800 rounded-xl p-8 text-center text-gray-500">
                    <Icon name="plugs" size={32} className="mb-2 mx-auto opacity-50" />
                    <p>No exchanges connected yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exchanges.map((ex) => {
                        const details = getExchangeDetails(ex.name);
                        const textColor = details.color === 'yellow' ? 'text-yellow-500' : 
                                       details.color === 'blue' ? 'text-blue-500' : 
                                       details.color === 'purple' ? 'text-purple-500' : 'text-gray-500';
                        
                        return (
                            <div key={ex.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 relative overflow-hidden group transition-all hover:border-gray-700">
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${details.gradient}`}></div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full ${details.bgClass} flex items-center justify-center ${textColor} font-bold border ${details.borderClass}`}>
                                            {details.icon}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{ex.name}</div>
                                            <div className="text-xs text-gray-400">{ex.accountLabel}</div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full border border-green-500/20">Active</span>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Last Sync</span>
                                        <span className="text-white">{ex.lastSync}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Permissions</span>
                                        <span className="text-white">Read Only</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition-colors">Manage</button>
                                    <button 
                                        onClick={() => handleRemove(ex.id, ex.name)}
                                        className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ExchangesView;