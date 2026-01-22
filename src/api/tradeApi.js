// src/api/tradeApi.js

const API_BASE_URL = 'http://localhost:8080/api';

// --- HARDCODED EXCHANGE NAMES ---
const getExchangeName = (id) => {
    const exchanges = {
        1: "Binance",
        2: "Coinbase",
        3: "Kraken",
        // You can add more here if you add them to your DB
    };
    return exchanges[id] || "Unknown Exchange";
};

const getAssetStyles = (symbol) => {
    switch (symbol) {
        case 'BTC': return { icon: '₿', gradient: 'from-orange-400 to-yellow-500' };
        case 'ETH': return { icon: 'Ξ', gradient: 'from-blue-400 to-indigo-500' };
        case 'SOL': return { icon: 'S', gradient: 'from-purple-400 to-pink-500' };
        default: return { icon: symbol[0], gradient: 'from-gray-400 to-gray-600' };
    }
};

const formatTrade = (trade) => {
    // Extract exchange ID safely (it might be nested or null)
    const exchangeId = trade.exchange?.id; 
    
    return {
        id: trade.id,
        date: new Date(trade.executedAt).toLocaleString(),
        type: trade.side,
        asset: trade.assetSymbol,
        qty: trade.quantity,
        price: trade.price,
        fee: trade.fee,
        total: (parseFloat(trade.price) * parseFloat(trade.quantity)) - (trade.fee || 0),
        exchange: getExchangeName(exchangeId), // Use hardcoded name
        ...getAssetStyles(trade.assetSymbol)
    };
};

export const getUserTrades = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/trades/${userId}`);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();
        return data.map(formatTrade);
    } catch (error) {
        console.error("Failed to fetch trades:", error);
        throw error;
    }
};

export const addTrade = async (userId, tradeData) => {
    try {
        const payload = {
            side: tradeData.type,
            assetSymbol: tradeData.asset,
            quantity: parseFloat(tradeData.quantity),
            price: parseFloat(tradeData.price),
            fee: parseFloat(tradeData.fee),
            executedAt: new Date().toISOString(),
            exchange: { id: parseInt(tradeData.exchangeId) }
        };

        const response = await fetch(`${API_BASE_URL}/trades/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to add trade');
        
        const savedTrade = await response.json();
        return formatTrade(savedTrade);
    } catch (error) {
        console.error("Failed to add trade:", error);
        throw error;
    }
};