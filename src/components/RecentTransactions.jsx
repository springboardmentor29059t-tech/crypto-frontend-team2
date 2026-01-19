const RecentTransactions = () => {
    // Mock Transaction Data
    const transactions = [
        { id: 1, type: 'Buy', asset: 'BTC', amount: 0.05, price: 92000, date: '2 mins ago' },
        { id: 2, type: 'Sell', asset: 'ETH', amount: 1.5, price: 3450, date: '2 hours ago' },
        { id: 3, type: 'Buy', asset: 'SOL', amount: 20, price: 145, date: '1 day ago' },
        { id: 4, type: 'Deposit', asset: 'USDT', amount: 5000, price: 1, date: '3 days ago' },
        { id: 5, type: 'Buy', asset: 'BNB', amount: 10, price: 580, date: '5 days ago' },
    ];

    return (
        <div className="bg-card p-6 rounded-xl border border-slate-700 h-full">
            <h3 className="text-slate-400 mb-4 font-bold">Recent Activity</h3>
            <div className="space-y-4">
                {transactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg hover:bg-white/10 transition">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${tx.type === 'Buy' || tx.type === 'Deposit' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                }`}>
                                {tx.type === 'Deposit' ? 'IN' : tx.type}
                            </div>
                            <div>
                                <p className="font-bold">{tx.asset}</p>
                                <p className="text-xs text-gray-400">{tx.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold">
                                {tx.type === 'Sell' ? '-' : '+'}{tx.amount} {tx.asset}
                            </p>
                            <p className="text-xs text-gray-400">
                                @ ₹{tx.price.toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 text-center">
                <button className="text-primary text-sm hover:underline">View All History</button>
            </div>
        </div>
    );
};

export default RecentTransactions;
