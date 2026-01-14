import { useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Check,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Link2,
  AlertCircle,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { connectExchange, disconnectExchange, fetchExchanges } from "@/lib/api";
import { formatRupee } from "@/lib/currency";

const Exchanges = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectingExchange, setConnectingExchange] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, { apiKey: string; apiSecret: string }>>({});
  const qc = useQueryClient();

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["exchanges"],
    queryFn: fetchExchanges,
  });
  const exchanges = data?.items || [];
  const connectedExchanges = exchanges.filter((e: any) => e.connected);
  const availableExchanges = exchanges.filter((e: any) => !e.connected);

  const connectMutation = useMutation({
    mutationFn: (body: { id: string; apiKey: string; apiSecret: string }) => connectExchange(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exchanges"] }),
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => disconnectExchange(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exchanges"] }),
  });

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">Exchanges</h1>
        <p className="text-muted-foreground mt-1">
          Connect your exchanges to automatically sync your portfolio.
        </p>
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass rounded-2xl p-6 mb-8 flex items-start gap-4"
      >
        <div className="p-3 rounded-xl bg-primary/10">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold mb-1">Your API keys are encrypted</h3>
          <p className="text-sm text-muted-foreground">
            We use industry-standard AES-256 encryption to protect your API keys at rest. We only
            request read-only permissions and never have access to trade or withdraw your funds.
          </p>
        </div>
      </motion.div>

      {/* Connected Exchanges */}
      {connectedExchanges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Connected Exchanges</h2>
          <div className="grid gap-4">
            {connectedExchanges.map((exchange: any, index: number) => (
              <motion.div
                key={exchange.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{exchange.logo}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{exchange.name}</h3>
                        <span className="flex items-center gap-1 text-sm text-success px-2 py-0.5 rounded-full bg-success/10">
                          <Check className="w-3 h-3" />
                          Connected
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Last sync: {exchange.lastSync}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Assets</p>
                      <p className="font-semibold">{exchange.assets}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Value</p>
                      <p className="font-semibold font-mono">
                        {formatRupee(exchange.value)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={disconnectMutation.isLoading}
                        onClick={() => disconnectMutation.mutate(exchange.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Available Exchanges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4">Available Exchanges</h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading && (
            <div className="col-span-full text-center text-muted-foreground p-6">
              Loading exchanges...
            </div>
          )}
          {isError && (
            <div className="col-span-full text-center text-destructive p-6">
              Failed to load exchanges.
            </div>
          )}
          {!isLoading &&
            !isError &&
            availableExchanges.map((exchange: any, index: number) => (
              <motion.div
                key={exchange.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="glass rounded-2xl p-6 hover:border-primary/30 transition-all"
              >
                {connectingExchange === exchange.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{exchange.logo}</span>
                      <h3 className="font-semibold">{exchange.name}</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">API Key</label>
                        <div className="relative">
                          <Input
                            type={showApiKey ? "text" : "password"}
                            placeholder="Enter your API key"
                            value={credentials[exchange.id]?.apiKey || ""}
                            onChange={(e) =>
                              setCredentials((prev) => ({
                                ...prev,
                                [exchange.id]: {
                                  apiKey: e.target.value,
                                  apiSecret: prev[exchange.id]?.apiSecret || "",
                                },
                              }))
                            }
                          />
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showApiKey ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium">API Secret</label>
                        <Input
                          type="password"
                          placeholder="Enter your API secret"
                          value={credentials[exchange.id]?.apiSecret || ""}
                          onChange={(e) =>
                            setCredentials((prev) => ({
                              ...prev,
                              [exchange.id]: {
                                apiKey: prev[exchange.id]?.apiKey || "",
                                apiSecret: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
                        <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          Only provide read-only API keys. Never share keys with trade or withdraw
                          permissions.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setConnectingExchange(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="glow"
                        className="flex-1 gap-2"
                        disabled={connectMutation.isLoading}
                        onClick={() =>
                          connectMutation.mutate({
                            id: exchange.id,
                            apiKey: credentials[exchange.id]?.apiKey || "",
                            apiSecret: credentials[exchange.id]?.apiSecret || "",
                          })
                        }
                      >
                        <Link2 className="w-4 h-4" />
                        {connectMutation.isLoading ? "Connecting..." : "Connect"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{exchange.logo}</span>
                      <div>
                        <h3 className="font-semibold">{exchange.name}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{exchange.description}</p>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => setConnectingExchange(exchange.id)}
                      disabled={isFetching}
                    >
                      <Plus className="w-4 h-4" />
                      Connect
                    </Button>
                  </>
                )}
              </motion.div>
            ))}
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Exchanges;
