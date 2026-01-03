import React, { useState, useMemo } from 'react';
import Icon from '../UI/Icon';

// 1. Simulated Database for Asset Risks (In real app, this comes from API)
const ASSET_RISK_DB = {
    'BTC': { level: 'LOW', color: 'green' },
    'ETH': { level: 'LOW', color: 'green' },
    'BNB': { level: 'LOW', color: 'green' },
    'SOL': { level: 'LOW', color: 'green' },
    'ADA': { level: 'LOW', color: 'green' },
    // Example of risky assets
    'SHIB': { level: 'HIGH', color: 'red' },
    'PEPE': { level: 'HIGH', color: 'red' },
    'DOGE': { level: 'MEDIUM', color: 'yellow' }
};

const RiskView = ({ portfolio, showToast }) => {
    const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

    // 2. Calculate Total Portfolio Value for Math
    const totalValue = useMemo(() => {
        return portfolio.reduce((sum, asset) => sum + (asset.qty * asset.currentPrice), 0);
    }, [portfolio]);

    // 3. Generate Dynamic Alerts & Stats
    const { riskScore, riskStats, alerts } = useMemo(() => {
        let highCount = 0;
        let lowCount = 0;
        let mediumCount = 0;
        let maxAssetWeight = 0;
        let generatedAlerts = [];

        portfolio.forEach(asset => {
            const val = asset.qty * asset.currentPrice;
            const weight = (val / totalValue) * 100;
            
            if (weight > maxAssetWeight) maxAssetWeight = weight;

            // Check Asset Type Risk
            const assetRisk = ASSET_RISK_DB[asset.symbol] || { level: 'MEDIUM', color: 'yellow' };
            
            if (assetRisk.level === 'HIGH') highCount++;
            else if (assetRisk.level === 'MEDIUM') mediumCount++;
            else lowCount++;
            
            // Alert: High Risk Asset Detected
            if (assetRisk.level === 'HIGH') {
                 generatedAlerts.push({
                    id: `risk-${asset.id}`,
                    level: 'HIGH',
                    color: 'red',
                    title: `${asset.symbol} Detected`,
                    msg: 'High volatility asset found in portfolio',
                    details: [`Asset ${asset.symbol} is flagged as high risk.`],
                    icon: 'warning'
                 });
            }
        });

        // Alert: Portfolio Concentration (Math Logic)
        if (maxAssetWeight > 45) {
            generatedAlerts.push({
                id: 'conc-risk',
                level: 'MEDIUM',
                color: 'yellow',
                title: 'Portfolio Concentration',
                msg: 'Diversification Warning',
                details: [`${maxAssetWeight.toFixed(1)}% of portfolio in single asset exceeds recommended limit.`],
                icon: 'info'
            });
        }

        // Alert: General Safety (If no risks found)
        if (generatedAlerts.length === 0) {
             generatedAlerts.push({
                id: 'safe-verified',
                level: 'LOW',
                color: 'green',
                title: 'Major Assets Verified',
                msg: 'Portfolio health looks good',
                details: ['All major holdings are established cryptocurrencies with high liquidity.'],
                icon: 'check-circle'
             });
        }

        // Calculate Overall Score (0-100)
        // Base score 0. +20 for Concentration. +50 per High Risk Asset.
        let score = 0;
        if (maxAssetWeight > 45) score += 20;
        score += (highCount * 50);

        return {
            riskStats: { highCount, mediumCount, lowCount },
            alerts: generatedAlerts,
            riskScore: score
        };

    }, [portfolio, totalValue]);

    // Determine Label based on score
    const getScoreLabel = (score) => {
        if (score === 0) return { text: 'Low', color: 'text-green-400' };
        if (score < 50) return { text: 'Medium', color: 'text-yellow-400' };
        return { text: 'High', color: 'text-red-400' };
    };

    const scoreData = getScoreLabel(riskScore);

    const handleDismiss = (id) => {
        const newSet = new Set(dismissedAlerts);
        newSet.add(id);
        setDismissedAlerts(newSet);
        showToast('Alert dismissed');
    };

    const activeAlerts = alerts.filter(a => !dismissedAlerts.has(a.id));

    return (
        <div className="fade-in">
            <h3 className="text-2xl font-bold text-white mb-6">Risk & Scam Analysis</h3>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-900/50 neon-border rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">Overall Risk Score</div>
                    <div className={`text-4xl font-bold mb-2 ${scoreData.color}`}>
                        {scoreData.text}
                    </div>
                    <div className="text-sm text-gray-400">
                        {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
                    </div>
                </div>
                <div className="bg-gray-900/50 neon-border rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">High Risk Assets</div>
                    <div className="text-4xl font-bold text-red-400 mb-2">{riskStats.highCount}</div>
                    <div className="text-sm text-gray-400">Requires attention</div>
                </div>
                <div className="bg-gray-900/50 neon-border rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-2">Low Risk Assets</div>
                    <div className="text-4xl font-bold text-green-400 mb-2">{riskStats.lowCount}</div>
                    <div className="text-sm text-gray-400">Verified safe</div>
                </div>
            </div>

            {/* Dynamic Alerts List */}
            <div className="space-y-4">
                {activeAlerts.length === 0 ? (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
                        <Icon name="check-circle" size={40} className="mb-4 text-green-500 mx-auto" />
                        <h3 className="text-xl font-bold text-white">All Clear</h3>
                        <p>Your portfolio currently shows no risk indicators.</p>
                    </div>
                ) : (
                    activeAlerts.map(alert => {
                        const borderColor = alert.color === 'red' ? 'border-red-500/30' : alert.color === 'yellow' ? 'border-yellow-500/30' : 'border-green-500/30';
                        const bgColor = alert.color === 'red' ? 'bg-red-500/20' : alert.color === 'yellow' ? 'bg-yellow-500/20' : 'bg-green-500/20';
                        const textColor = alert.color === 'red' ? 'text-red-400' : alert.color === 'yellow' ? 'text-yellow-400' : 'text-green-400';
                        const iconBg = alert.color === 'red' ? 'bg-red-500/20' : alert.color === 'yellow' ? 'bg-yellow-500/20' : 'bg-green-500/20';

                        return (
                            <div key={alert.id} className={`bg-gray-900/50 border-2 ${borderColor} rounded-xl p-6`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
                                            <Icon name={alert.icon} className={textColor} size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{alert.title}</h3>
                                            <p className="text-sm text-gray-400">{alert.msg}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-2 ${bgColor} ${textColor} text-sm font-bold rounded-full`}>
                                            {alert.level} RISK
                                        </span>
                                        {alert.id !== 'safe-verified' && (
                                            <button 
                                                onClick={() => handleDismiss(alert.id)}
                                                className="text-gray-500 hover:text-white transition-colors"
                                                title="Dismiss"
                                            >
                                                <Icon name="x-circle" size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {alert.details.map((detail, idx) => (
                                        <div key={idx} className="flex items-center space-x-2 text-sm">
                                            <Icon name={alert.level === 'HIGH' ? 'warning-circle' : 'check-circle'} className={textColor} size={16} />
                                            <span className={alert.level === 'HIGH' ? 'text-red-400' : 'text-white'}>{detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default RiskView;