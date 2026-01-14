import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchTrades } from "@/lib/api";
import { formatRupee } from "@/lib/currency";

const Trades = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trades"],
    queryFn: fetchTrades,
  });
  const trades = data?.items || [];
  const totalBuy = trades.filter((t: any) => t.type === "buy").reduce((acc: number, t: any) => acc + t.total, 0);
  const totalSell = trades.filter((t: any) => t.type === "sell").reduce((acc: number, t: any) => acc + t.total, 0);

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">Trade History</h1>
        <p className="text-muted-foreground mt-1">
          View and analyze all your trading activity across connected exchanges.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/10">
            <ArrowDownLeft className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono">{formatRupee(totalBuy)}</p>
            <p className="text-sm text-muted-foreground">Total Bought</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-destructive/10">
            <ArrowUpRight className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono">{formatRupee(totalSell)}</p>
            <p className="text-sm text-muted-foreground">Total Sold</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <div className="w-6 h-6 flex items-center justify-center text-primary font-bold">
              {trades.length}
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold">{trades.length}</p>
            <p className="text-sm text-muted-foreground">Total Trades</p>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Search trades..." className="pl-12" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button variant="outline">Export</Button>
        </div>
      </motion.div>

      {/* Trades Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          {isLoading && (
            <div className="p-6 text-center text-muted-foreground">Loading trades...</div>
          )}
          {isError && (
            <div className="p-6 text-center text-destructive">Failed to load trades.</div>
          )}
          {!isLoading && !isError && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Asset</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Exchange</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Tx</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade: any, index: number) => (
                  <motion.tr
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium",
                          trade.type === "buy"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {trade.type === "buy" ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        {trade.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: `${trade.color}20`, color: trade.color }}
                        >
                          {trade.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium">{trade.symbol}</p>
                          <p className="text-xs text-muted-foreground">{trade.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono">{trade.amount}</td>
                    <td className="p-4 text-right font-mono">{formatRupee(trade.price)}</td>
                    <td className="p-4 text-right font-mono font-semibold">
                      {formatRupee(trade.total)}
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{trade.exchange}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{trade.date}</span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Trades;
