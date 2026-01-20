export const riskDatabase = {
  // Mapping CoinGecko IDs to risk levels and warnings
  'bitcoin': { level: 'low', message: 'Established Store of Value' },
  'ethereum': { level: 'low', message: 'Safe Smart Contract Platform' },
  'solana': { level: 'medium', message: 'High Network Volatility' },
  'tether': { level: 'medium', message: 'Regulatory Oversight Risk' },
  'dogecoin': { level: 'high', message: 'Speculative Meme Token' },
  // Add a fake "scam" token to test the UI
  'scam-coin-id': { level: 'high', message: 'Rugpull Warning: Unverified Contract' }
};