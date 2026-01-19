import { useState, useEffect } from 'react';
import api from '../utils/api';
import AddTransactionModal from '../components/AddTransactionModal';

const Transactions = () => {
    // Mock Data - Extended
    const initialTransactions = [
        { id: 1, type: 'Buy', asset: 'BTC', amount: 0.05, price: 92000, value: 4600, date: '2024-05-20 14:30', status: 'Completed' },
        { id: 2, type: 'Sell', asset: 'ETH', amount: 1.5, price: 3450, value: 5175, date: '2024-05-19 09:15', status: 'Completed' },
        { id: 3, type: 'Buy', asset: 'SOL', amount: 20, price: 145, value: 2900, date: '2024-05-18 18:45', status: 'Completed' },
        { id: 4, type: 'Deposit', asset: 'USDT', amount: 5000, price: 1, value: 5000, date: '2024-05-15 10:00', status: 'Completed' },
        { id: 5, type: 'Buy', asset: 'BNB', amount: 10, price: 580, value: 5800, date: '2024-05-12 11:20', status: 'Completed' },
        { id: 6, type: 'Withdraw', asset: 'BTC', amount: 0.01, price: 91000, value: 910, date: '2024-05-10 16:00', status: 'Pending' },
        { id: 7, type: 'Buy', asset: 'ETH', amount: 2.0, price: 3300, value: 6600, date: '2024-05-08 13:10', status: 'Completed' },
        { id: 8, type: 'Sell', asset: 'DOGE', amount: 10000, price: 0.15, value: 1500, date: '2024-05-05 09:30', status: 'Completed' },
    ];

    const [filter, setFilter] = useState('All');
    const [transactions, setTransactions] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const fetchTrades = async () => {
        try {
            const res = await api.get('/portfolio/transactions');
            let data = res.data;

            // Optional Formatting if Backend sends uppercase
            data = data.map(tx => ({
                ...tx,
                type: tx.type.charAt(0).toUpperCase() + tx.type.slice(1).toLowerCase(), // BUY -> Buy
                date: new Date(tx.rawDate || tx.date).toLocaleString(), // Use rawDate if available, fallback to date string
            }));

            if (data.length === 0) {
                setTransactions([]);
                setAllTransactions([]);
            } else {
                setAllTransactions(data);
                setTransactions(data);
            }

        } catch (err) {
            console.error("Failed to load transactions", err);
        }
    };

    useEffect(() => {
        fetchTrades();
    }, []);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        if (newFilter === 'All') {
            setTransactions(allTransactions.length > 0 ? allTransactions : initialTransactions);
        } else {
            const source = allTransactions.length > 0 ? allTransactions : initialTransactions;
            setTransactions(source.filter(t => t.type === newFilter));
        }
    };

    const handleEdit = (tx) => {
        setSelectedTransaction(tx);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this transaction?")) return;

        try {
            const rawId = id.toString().replace('man-', '');
            await api.delete(`/manual/${rawId}`);
            fetchTrades();
        } catch (error) {
            console.error("Failed to delete transaction", error);
            alert("Failed to delete transaction. Please try again.");
        }
    };

    const handleTransactionAdded = () => {
        fetchTrades();
        setSelectedTransaction(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTransaction(null);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Transactions</h1>
                        <p className="text-slate-400 text-sm">Manage your crypto history</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Filters */}
                    <div className="glass-card p-1 rounded-lg flex items-center gap-1">
                        {['All', 'Buy', 'Sell', 'Deposit', 'Withdraw'].map((f) => (
                            <button
                                key={f}
                                onClick={() => handleFilterChange(f)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${filter === f
                                    ? 'bg-primary text-black shadow-lg shadow-primary/25'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            setSelectedTransaction(null);
                            setIsModalOpen(true);
                        }}
                        className="bg-primary hover:bg-emerald-400 text-black font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-0.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add New
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-left text-slate-400 text-sm uppercase tracking-wider">
                                <th className="py-5 pl-8 font-medium">Date</th>
                                <th className="py-5 font-medium">Type</th>
                                <th className="py-5 font-medium">Asset</th>
                                <th className="py-5 font-medium">Amount</th>
                                <th className="py-5 font-medium">Price</th>
                                <th className="py-5 font-medium">Total Value</th>
                                <th className="py-5 pr-8 font-medium">Status</th>
                                <th className="py-5 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/5 transition-colors duration-200 group">
                                    <td className="py-5 pl-8 text-sm text-slate-300 font-medium whitespace-nowrap">{tx.date}</td>
                                    <td className="py-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tx.type === 'Buy' || tx.type === 'Deposit'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                            }`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-xs font-bold">
                                                {tx.asset.substring(0, 1)}
                                            </div>
                                            <span className="font-bold text-white">{tx.asset}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 text-sm font-medium text-slate-300">{tx.amount.toLocaleString()}</td>
                                    <td className="py-5 text-sm text-slate-400">₹{tx.price.toLocaleString()}</td>
                                    <td className="py-5 font-bold text-white">₹{tx.value.toLocaleString()}</td>
                                    <td className="py-5 pr-8">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${tx.status === 'Completed' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'}`} />
                                            <span className={`text-sm ${tx.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {tx.id.toString().startsWith('man-') && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(tx)}
                                                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                                        title="Edit Transaction"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(tx.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                                        title="Delete Transaction"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {transactions.length === 0 && (
                    <div className="text-center py-20">
                        <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">No transactions found</h3>
                        <p className="text-slate-400">Try adjusting your filters or add a new transaction.</p>
                    </div>
                )}
            </div>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onTransactionAdded={handleTransactionAdded}
                initialData={selectedTransaction}
            />
        </div>
    );
};

export default Transactions;
