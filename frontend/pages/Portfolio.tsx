import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import {
  Plus, Search, Filter, MoreHorizontal, ArrowUpRight, ArrowDownRight,
  Wallet, Building, X, Layers, Globe, FileText, Download
} from 'lucide-react';
import { mockApi, fetchLivePrices, downloadPortfolioCsv, downloadPortfolioPdf, getPortfolioSummary, getMarketOverview, getGlobalAssets } from '../services/api';
import { LiveMarketSection } from '../components/dashboard/LiveMarketSection';
import { formatShortValue } from '../services/formatters';
import { usePersonalNode } from '../PersonalNodeContext';

const COLORS = ['#eab308', '#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f43f5e'];

const Portfolio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'personal'>('personal');
  const [holdings, setHoldings] = useState<any[]>([]);
  const { assets: personalAssets, refreshAssets, loading: personalLoading } = usePersonalNode();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAsset, setNewAsset] = useState<any>({
    symbol: '',
    name: '',
    amount: '',
    avgBuyPrice: '',
    source: 'Binance'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      let enriched: any[] = [];
      const marketOverview = await getMarketOverview();
      const inrRate = (marketOverview?.totalMarketCapInr && marketOverview?.totalMarketCapUsd)
        ? marketOverview.totalMarketCapInr / marketOverview.totalMarketCapUsd
        : 84.0;

      if (activeTab === 'global') {
        const response = await getGlobalAssets();
        const assetsToProcess = response.assets || [];
        enriched = assetsToProcess.map((h: any) => {
          const pUSD = h.livePrice || h.current_price || 0;
          const pINR = pUSD * inrRate;
          const vUSD = h.currentValue || 0;
          const vINR = vUSD * inrRate;
          const pnlUSD = h.profitLoss || 0;
          const investment = (h.quantity || 0) * (h.avgPrice || 0);
          const pnlPct = investment > 0 ? (pnlUSD / investment) * 100 : 0;

          return {
            id: h.id || h.symbol,
            coinId: h.symbol.toLowerCase(),
            symbol: h.symbol,
            name: h.name || h.symbol,
            amount: h.quantity || 0,
            avgBuyPrice: h.avgPrice || 0,
            purchasePrice: h.avgPrice || 0,
            pUSD, pINR, vUSD, vINR, pnlUSD, pnlPct,
            source: h.source || 'Global Market',
            image: `https://assets.coincap.io/assets/icons/${h.symbol.toLowerCase()}@2x.png`,
            change24h: h.change24h,
            marketCap: h.marketCap,
            riskLevel: h.riskLevel
          };
        });
      } else {
        // Use personalAssets from context
        enriched = personalAssets.map((h: any) => {
          const pUSD = h.avgBuyPrice ? (h.currentValue / h.amount) : 0; // Derive approximate current price
          // Actually context asset has 'currentValue' and 'amount'. Backend calculates correctly.
          // Backend AssetResponseDTO: currentValue, totalCost, profitLoss.
          // Use those directly.

          const vUSD = h.currentValue || 0;
          const vINR = vUSD * inrRate;
          const pnlUSD = h.pnl || 0;
          const pnlPct = h.pnlPercentage || 0;

          return {
            id: h.id,
            coinId: h.symbol.toLowerCase(),
            symbol: h.symbol,
            name: h.name,
            amount: h.amount,
            avgBuyPrice: h.avgBuyPrice,
            purchasePrice: h.avgBuyPrice,
            pUSD: (vUSD / h.amount) || 0, // Approx live price
            pINR: ((vUSD / h.amount) * inrRate) || 0,
            vUSD, vINR, pnlUSD, pnlPct,
            source: h.source,
            image: `https://assets.coincap.io/assets/icons/${h.symbol.toLowerCase()}@2x.png`
          };
        });
      }
      setHoldings(enriched);
    } catch (err) {
      console.error("Load Data Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (activeTab === 'personal') {
      refreshAssets();
    }
  }, [activeTab, personalAssets]); // Re-run when context assets update

  const filtered = holdings.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const pieData = holdings.map(h => ({ name: h.symbol, value: h.vUSD }));

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.symbol || !newAsset.name || !newAsset.amount || !newAsset.avgBuyPrice || !newAsset.source) {
      alert('Please fill in all fields');
      return;
    }

    const amount = parseFloat(newAsset.amount);
    const price = parseFloat(newAsset.avgBuyPrice);

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        symbol: newAsset.symbol.toUpperCase(),
        name: newAsset.name,
        amount: newAsset.amount,
        avgBuyPrice: newAsset.avgBuyPrice,
        source: newAsset.source
      };

      if (newAsset.id) {
        // Update existing asset
        await import('../services/api').then(module => module.updateAsset(newAsset.id, payload));
        alert('Asset updated successfully!');
      } else {
        // Create new asset
        await import('../services/api').then(module => module.addHolding(payload));
        alert('Asset added successfully!');
      }

      // Reset form
      setNewAsset({ id: undefined, symbol: '', name: '', amount: '', avgBuyPrice: '', source: 'Binance' });
      setShowAddAssetModal(false);

      // Reload data via context sync
      await refreshAssets();

    } catch (error: any) {
      console.error("Failed to save asset", error);
      alert(error.message || "Failed to save asset");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAsset = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this asset?')) return;

    try {
      setLoading(true);
      await import('../services/api').then(module => module.deleteAsset(id));
      alert('Asset removed successfully');
      await refreshAssets();
    } catch (error: any) {
      alert(error.message || "Failed to delete asset");
    } finally {
      setLoading(false);
    }
  };

  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleExportCsv = async () => {
    if (holdings.length === 0) {
      alert("No assets to export. Add your first asset to generate a CSV report.");
      return;
    }

    setCsvLoading(true);
    try {
      await downloadPortfolioCsv();
      alert("CSV Report generated successfully!");
    } catch (error) {
      alert("Failed to generate CSV report. Please try again.");
    } finally {
      setCsvLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (holdings.length === 0) { return; }
    setPdfLoading(true);
    try {
      await downloadPortfolioPdf();
      alert("PDF Report generated successfully!");
    } catch (error) {
      alert("Failed to generate PDF report.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Asset Ledger</h1>
          <p className="text-slate-400">Multi-currency monitoring: Tracking wealth in USD and INR.</p>
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'global' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
          >
            <Globe size={16} /> Global Node
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'personal' ? 'bg-yellow-500 text-black shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
          >
            <Layers size={16} /> Personal Node
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            disabled={csvLoading || holdings.length === 0}
            className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-black px-4 py-3 rounded-xl flex items-center gap-2 border border-slate-800 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {csvLoading ? <div className="w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div> : <Download size={14} />}
            {csvLoading ? 'SAVING...' : 'CSV'}
          </button>
          <button
            onClick={handleExportPdf}
            disabled={pdfLoading || holdings.length === 0}
            className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-black px-4 py-3 rounded-xl flex items-center gap-2 border border-slate-800 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pdfLoading ? <div className="w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div> : <FileText size={14} />}
            {pdfLoading ? 'GENERATING...' : 'PDF'}
          </button>
        </div>

        {activeTab === 'personal' && (
          <button
            onClick={() => setShowAddAssetModal(true)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95">
            <Plus size={20} />
            <span className="text-xs uppercase tracking-widest">New Asset</span>
          </button>
        )}
      </div>

      {/* Modal and Content */}
      <>
        {/* Add Asset Modal */}
        {showAddAssetModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
              <button
                onClick={() => setShowAddAssetModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-white mb-6">Add New Asset</h2>

              <form onSubmit={handleAddAsset}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="asset-symbol" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Symbol</label>
                    <input
                      id="asset-symbol"
                      name="asset-symbol"
                      type="text"
                      value={newAsset.symbol}
                      onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })}
                      placeholder="e.g., BTC"
                      autoComplete="symbol"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="asset-name" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Name</label>
                    <input
                      id="asset-name"
                      name="asset-name"
                      type="text"
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                      placeholder="e.g., Bitcoin"
                      autoComplete="name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="asset-amount" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Amount</label>
                    <input
                      id="asset-amount"
                      name="asset-amount"
                      type="number"
                      value={newAsset.amount}
                      onChange={(e) => setNewAsset({ ...newAsset, amount: e.target.value })}
                      placeholder="0.00"
                      step="any"
                      autoComplete="amount"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="asset-price" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Avg Buy Price (USD)</label>
                    <input
                      id="asset-price"
                      name="asset-price"
                      type="number"
                      value={newAsset.avgBuyPrice}
                      onChange={(e) => setNewAsset({ ...newAsset, avgBuyPrice: e.target.value })}
                      placeholder="0.00"
                      step="any"
                      autoComplete="avgBuyPrice"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="asset-source" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Source / Exchange</label>
                    <select
                      id="asset-source"
                      name="asset-source"
                      value={newAsset.source}
                      onChange={(e) => setNewAsset({ ...newAsset, source: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    >
                      <option value="Binance">Binance</option>
                      <option value="Coinbase">Coinbase</option>
                      <option value="Kraken">Kraken</option>
                      <option value="Cold Storage">Cold Storage</option>
                      <option value="Crypto.com">Crypto.com</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowAddAssetModal(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Add Asset'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="FILTER NODES..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 w-full focus:outline-none focus:border-yellow-500/50 uppercase text-[10px] font-black tracking-widest"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">
                    <tr>
                      <th className="px-6 py-5">Node/Source</th>
                      <th className="px-6 py-5">{activeTab === 'global' ? 'Circulating Supply' : 'Balance'}</th>
                      <th className="px-6 py-5 text-right">Price (USD/INR)</th>
                      <th className="px-6 py-5 text-right">{activeTab === 'global' ? 'Market Cap' : 'Value (USD/INR)'}</th>
                      <th className="px-6 py-5 text-right">{activeTab === 'global' ? '24h Change' : 'Momentum'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filtered.length > 0 ? (
                      filtered.map((h) => (
                        <tr key={h.coinId} className="hover:bg-white/5 transition-colors group cursor-default">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <img
                                src={h.image}
                                className="w-10 h-10 rounded-xl"
                                alt={h.name}
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${h.symbol}&background=0f172a&color=fff`;
                                  e.currentTarget.onerror = null;
                                }}
                              />
                              <div>
                                <div className="text-white font-black text-sm uppercase">{h.name}</div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                                  {activeTab === 'global' ? (
                                    <>
                                      <span className={`px-1.5 py-0.5 rounded ${h.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-500' : h.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                        {h.riskLevel} RISK
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      {h.source === 'Cold Storage' ? <Wallet size={10} /> : <Building size={10} />}
                                      {h.source}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-slate-300 font-bold text-sm">
                              {activeTab === 'global' ? `${formatShortValue(h.amount)}` : `${h.amount.toLocaleString('en-US')} ${h.symbol}`}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="text-white font-black text-sm">${formatShortValue(h.pUSD, true)}</div>
                            <div className="text-slate-500 text-[10px] font-bold">₹{formatShortValue(h.pINR, true)}</div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            {activeTab === 'global' ? (
                              <div className="text-white font-black text-sm">${formatShortValue(h.marketCap)}</div>
                            ) : (
                              <>
                                <div className="text-white font-black text-sm">${formatShortValue(h.vUSD)}</div>
                                <div className="text-slate-400 text-[10px] font-bold">₹{formatShortValue(h.vINR)}</div>
                              </>
                            )}
                          </td>
                          <td className="px-6 py-5 text-right">
                            {activeTab === 'global' ? (
                              <div className={`flex items-center justify-end gap-1 font-black text-sm ${h.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {h.change24h >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(h.change24h).toFixed(2)}%
                              </div>
                            ) : (
                              <div className={`flex items-center justify-end gap-1 font-black text-sm ${h.pnlUSD >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {h.pnlUSD >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {h.pnlPct.toFixed(2)}%
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 text-right">
                            {activeTab === 'personal' && (
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setNewAsset({
                                      symbol: h.symbol,
                                      name: h.name,
                                      amount: h.amount.toString(),
                                      avgBuyPrice: (h.purchasePrice || h.avgBuyPrice).toString(),
                                      source: h.source || 'Binance',
                                      id: h.id
                                    } as any);
                                    setShowAddAssetModal(true);
                                  }}
                                  className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                >
                                  <MoreHorizontal size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteAsset(h.id)}
                                  className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center gap-4">
                            <div className="bg-slate-800 p-4 rounded-full">
                              <Wallet size={32} className="text-slate-400" />
                            </div>
                            <p className="font-bold text-sm">No assets found matching your criteria</p>
                            {activeTab === 'personal' && (
                              <button
                                onClick={() => setShowAddAssetModal(true)}
                                className="text-yellow-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
                              >
                                Add Your First Asset
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Allocation Sidebar */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 h-fit">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-8">Asset Weights</h3>
            <div className="h-64 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    </div>
  );
};

export default Portfolio;