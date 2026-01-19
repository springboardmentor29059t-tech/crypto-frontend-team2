import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Tax = () => {
    const { user } = useAuth();
    const [year, setYear] = useState(new Date().getFullYear());
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTaxReport();
    }, [year]);

    const fetchTaxReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/tax/report?year=${year}`);
            setReport(response.data);
        } catch (err) {
            console.error('Error fetching tax report:', err);
            setError('Failed to load tax report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Tax Hints
                    </h1>
                    <p className="text-gray-400 mt-1">Estimate your realized gains and losses</p>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-gray-400">Tax Year:</span>
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="bg-black/40 border border-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-all"
                    >
                        {[...Array(5)].map((_, i) => {
                            const y = new Date().getFullYear() - i;
                            return <option key={y} value={y}>{y}</option>
                        })}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
                    {error}
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Realized PnL</h3>
                            <p className={`text-4xl font-bold ${report?.totalRealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatCurrency(report?.totalRealizedPnl || 0)}
                            </p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <h3 className="text-gray-400 text-sm font-medium mb-2">Taxable Events</h3>
                            <p className="text-4xl font-bold text-white">
                                {report?.events?.length || 0}
                            </p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <h3 className="text-gray-400 text-sm font-medium mb-2">Details</h3>
                            <p className="text-sm text-gray-400">
                                This report uses FIFO (First-In, First-Out) method to calculate realized gains/losses from your manual transaction history.
                            </p>
                        </div>
                    </div>

                    {/* Events Table */}
                    <div className="bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white">Taxable Events</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Asset</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Amount Sold</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Realized PnL</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {report?.events?.length > 0 ? (
                                        report.events.map((event, index) => (
                                            <tr key={index} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {formatDate(event.date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                                                    {event.symbol}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-500">
                                                        {event.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                                                    {event.amount}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${event.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {formatCurrency(event.pnl)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                                No taxable events found for this year.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Tax;
