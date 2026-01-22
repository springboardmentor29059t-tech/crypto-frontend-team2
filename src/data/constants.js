export const INITIAL_PORTFOLIO = [
  { id: 1, symbol: 'BTC', name: 'Bitcoin', icon: '₿', gradient: 'from-orange-500 to-yellow-500', qty: 2.45, avgCost: 42150.00, currentPrice: 42143.82 },
  { id: 2, symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', gradient: 'from-purple-500 to-blue-500', qty: 15.82, avgCost: 2340.00, currentPrice: 2340.12 },
  { id: 3, symbol: 'BNB', name: 'Binance Coin', icon: 'B', gradient: 'from-yellow-500 to-orange-500', qty: 120.50, avgCost: 310.00, currentPrice: 310.00 },
  { id: 4, symbol: 'SOL', name: 'Solana', icon: 'S', gradient: 'from-purple-600 to-pink-500', qty: 580.25, avgCost: 98.00, currentPrice: 98.03 },
  { id: 5, symbol: 'ADA', name: 'Cardano', icon: 'A', gradient: 'from-blue-600 to-blue-400', qty: 8250, avgCost: 0.48, currentPrice: 0.52 }
];

export const TRADES_DATA = [
  { id: 1, date: '2024-01-15 14:32', type: 'BUY', asset: 'BTC', icon: '₿', gradient: 'from-orange-500 to-yellow-500', qty: '0.52', price: 42150.00, fee: 21.92, total: 21939.92, exchange: 'Binance' },
  { id: 2, date: '2024-01-14 09:18', type: 'SELL', asset: 'ETH', icon: 'Ξ', gradient: 'from-purple-500 to-blue-500', qty: '2.15', price: 2340.00, fee: 5.03, total: 5026.03, exchange: 'Coinbase' },
  { id: 3, date: '2024-01-10 11:45', type: 'BUY', asset: 'SOL', icon: 'S', gradient: 'from-purple-600 to-pink-500', qty: '580.25', price: 98.00, fee: 56.86, total: 56921.36, exchange: 'Binance' },
  { id: 4, date: '2024-01-05 16:20', type: 'BUY', asset: 'BTC', icon: '₿', gradient: 'from-orange-500 to-yellow-500', qty: '1.00', price: 41000.00, fee: 15.00, total: 41015.00, exchange: 'Coinbase' },
];

export const RISK_DATA = [
  { 
      id: 1, level: 'HIGH', color: 'red', title: 'SCAM-TOKEN', msg: 'Potential Honeypot Detected',
      details: ['Contract ownership not renounced', 'Suspicious buy/sell tax structure (99%)']
  },
  { 
      id: 2, level: 'MEDIUM', color: 'yellow', title: 'Portfolio Concentration', msg: 'Diversification Warning',
      details: ['45% of portfolio in single asset (BTC) exceeds recommended limit.']
  },
  { 
      id: 3, level: 'LOW', color: 'green', title: 'Major Assets Verified', msg: 'BTC, ETH, BNB, SOL',
      details: ['All major holdings are established cryptocurrencies with high liquidity.']
  }
];