import { motion } from "framer-motion";
import { Check, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const exchanges = [
  {
    id: "binance",
    name: "Binance",
    logo: "🟡",
    connected: true,
    lastSync: "2 min ago",
  },
  {
    id: "coinbase",
    name: "Coinbase",
    logo: "🔵",
    connected: true,
    lastSync: "5 min ago",
  },
  {
    id: "kraken",
    name: "Kraken",
    logo: "🟣",
    connected: false,
    lastSync: null,
  },
  {
    id: "kucoin",
    name: "KuCoin",
    logo: "🟢",
    connected: false,
    lastSync: null,
  },
];

export function ExchangeConnections() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Connected Exchanges</h3>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Exchange
        </Button>
      </div>

      <div className="grid gap-3">
        {exchanges.map((exchange, index) => (
          <motion.div
            key={exchange.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{exchange.logo}</span>
              <div>
                <p className="font-medium">{exchange.name}</p>
                {exchange.connected && (
                  <p className="text-xs text-muted-foreground">
                    Last sync: {exchange.lastSync}
                  </p>
                )}
              </div>
            </div>

            {exchange.connected ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm text-success">
                  <Check className="w-4 h-4" />
                  Connected
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm">
                Connect
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
