import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { useAuth } from './AuthContext';

// Define the interface for the Asset
interface Asset {
    id: number;
    symbol: string;
    name: string;
    amount: number;
    avgBuyPrice: number;
    currentValue: number;
    pnl: number;
    pnlPercentage: number;
    source: string;
}

interface PersonalNodeContextType {
    assets: Asset[];
    totalValue: number;
    loading: boolean;
    refreshAssets: () => Promise<void>;
}

const PersonalNodeContext = createContext<PersonalNodeContextType | undefined>(undefined);

export const PersonalNodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [totalValue, setTotalValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const refreshAssets = useCallback(async () => {
        if (!user) {
            setAssets([]);
            setTotalValue(0);
            return;
        }

        setLoading(true);
        try {
            // Use the correct endpoint that maps to AssetController
            const response = await api.get('/api/assets');
            const data = response.data;

            // Map the response to our Asset interface
            // The backend AssetResponseDTO returns: id, symbol, name, amount, avgBuyPrice, currentValue, totalCost, profitLoss, profitLossPercentage, source
            const mappedAssets: Asset[] = data.map((item: any) => ({
                id: item.id,
                symbol: item.symbol,
                name: item.name,
                amount: item.amount,
                avgBuyPrice: item.avgBuyPrice,
                currentValue: item.currentValue,
                pnl: item.profitLoss,
                pnlPercentage: item.profitLossPercentage,
                source: item.source || 'Manual'
            }));

            setAssets(mappedAssets);

            // Calculate total value
            const total = mappedAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
            setTotalValue(total);

        } catch (error) {
            console.error("Failed to fetch personal assets:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial fetch
    useEffect(() => {
        refreshAssets();
    }, [refreshAssets]);

    return (
        <PersonalNodeContext.Provider value={{ assets, totalValue, loading, refreshAssets }}>
            {children}
        </PersonalNodeContext.Provider>
    );
};

export const usePersonalNode = () => {
    const context = useContext(PersonalNodeContext);
    if (!context) {
        throw new Error('usePersonalNode must be used within a PersonalNodeProvider');
    }
    return context;
};
