import { useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchHoldings } from "@/lib/api";
import { formatRupee } from "@/lib/currency";
import { AddAssetDialog } from "@/components/holdings/AddAssetDialog";

const Holdings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["holdings"],
    queryFn: fetchHoldings,
  });
  const holdings = data?.items || [];

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Holdings</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your crypto assets in one place.
            </p>
          </div>
          <Button variant="glow" className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Asset
          </Button>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Search assets..." className="pl-12" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </motion.div>

      {/* Holdings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          {isLoading && (
            <div className="p-6 text-center text-muted-foreground">Loading holdings...</div>
          )}
          {isError && (
            <div className="p-6 text-center text-destructive">Failed to load holdings.</div>
          )}
          {!isLoading && !isError && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Asset</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">24h</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Holdings</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Value</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">P&L</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Allocation</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding: any, index: number) => (
                  <motion.tr
                    key={holding.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
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
                    </td>
                    <td className="p-4 text-right font-mono">
                      {formatRupee(holding.price)}
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 font-medium",
                          holding.change24h >= 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {holding.change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(holding.change24h)}%
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-mono">{holding.amount}</p>
                      <p className="text-sm text-muted-foreground">{holding.symbol}</p>
                    </td>
                    <td className="p-4 text-right font-mono font-semibold">
                      {formatRupee(holding.value)}
                    </td>
                    <td className="p-4 text-right">
                      <p
                        className={cn(
                          "font-mono font-semibold",
                          holding.pnl >= 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {holding.pnl >= 0 ? "+" : "-"}{formatRupee(Math.abs(holding.pnl))}
                      </p>
                      <p
                        className={cn(
                          "text-sm",
                          holding.pnlPercent >= 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {holding.pnlPercent >= 0 ? "+" : ""}{holding.pnlPercent}%
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${holding.allocation}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono w-12">{holding.allocation}%</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      <AddAssetDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </MainLayout>
  );
};

export default Holdings;
