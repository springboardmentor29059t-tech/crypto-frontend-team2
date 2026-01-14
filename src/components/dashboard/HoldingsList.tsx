import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupee } from "@/lib/currency";
import { useEffect, useState } from "react";

// const holdings = [
//   {
//     symbol: "BTC",
//     name: "Bitcoin",
//     amount: 1.2453,
//     value: 52341.23,
//     price: 42024.56,
//     change: 3.24,
//     color: "#F7931A",
//   },
//   {
//     symbol: "ETH",
//     name: "Ethereum",
//     amount: 12.5,
//     value: 28750.0,
//     price: 2300.0,
//     change: 1.87,
//     color: "#627EEA",
//   },
//   {
//     symbol: "SOL",
//     name: "Solana",
//     amount: 145.23,
//     value: 14523.0,
//     price: 100.0,
//     change: -2.15,
//     color: "#00FFA3",
//   },
//   {
//     symbol: "BNB",
//     name: "Binance Coin",
//     amount: 24.5,
//     value: 7473.5,
//     price: 305.04,
//     change: 0.95,
//     color: "#F3BA2F",
//   },
//   {
//     symbol: "AVAX",
//     name: "Avalanche",
//     amount: 320.0,
//     value: 11200.0,
//     price: 35.0,
//     change: -1.23,
//     color: "#E84142",
//   },
// ];
const apiHoldings = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc";

export function HoldingsList() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiHoldings)
      .then((res) => res.json())
      .then((data) => {
        setHoldings(data.slice(0, 5)); // show top 5 coins
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Holdings</h3>
        <a href="/holdings" className="text-sm text-primary hover:underline">
          View all →
        </a>
      </div>

      <div className="space-y-3">
        {holdings.map((holding, index) => (
          <motion.div
            key={holding.symbol}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: `${holding.color}20`, color: holding.color }}
              >
                {holding.symbol.slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold">{holding.symbol}</p>
                <p className="text-sm text-muted-foreground">{holding.name}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold font-mono">
                {formatRupee(holding.value)}
              </p>
              <div className="flex items-center justify-end gap-1">
                <span className="text-sm text-muted-foreground font-mono">
                  {holding.amount} {holding.symbol}
                </span>
                <span
                  className={cn(
                    "flex items-center text-sm font-medium",
                    holding.change >= 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {holding.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(holding.change)}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
