import { motion } from "framer-motion";
import { AlertTriangle, Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchAlerts } from "@/lib/api";

const alertStyles = {
  danger: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    icon: AlertTriangle,
    iconColor: "text-destructive",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    icon: Shield,
    iconColor: "text-warning",
  },
  info: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: Info,
    iconColor: "text-primary",
  },
};

export function RiskAlerts() {
  const { data, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    retry: false,
    onError: () => {
      // Silently handle errors to prevent UI crashes
    },
  });

  const alerts = data?.items?.filter((a: any) => a.type === "danger" || a.type === "warning") || [];
  const displayAlerts = alerts.slice(0, 3); // Show only top 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Risk Alerts</h3>
          {displayAlerts.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-destructive/20 text-destructive rounded-full">
              {displayAlerts.length}
            </span>
          )}
        </div>
        <a href="/alerts" className="text-sm text-primary hover:underline">
          View all →
        </a>
      </div>

      {isLoading && (
        <div className="text-center text-muted-foreground py-4">Loading alerts...</div>
      )}

      {!isLoading && displayAlerts.length === 0 && (
        <div className="text-center text-muted-foreground py-4">
          No risk alerts at this time
        </div>
      )}

      <div className="space-y-3">
        {displayAlerts.map((alert: any, index: number) => {
          const style = alertStyles[alert.type as keyof typeof alertStyles];
          const Icon = style.icon;

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border transition-colors",
                style.bg,
                style.border,
                "hover:opacity-90"
              )}
            >
              <div className={cn("p-2 rounded-lg", style.bg)}>
                <Icon className={cn("w-5 h-5", style.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {alert.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                  {alert.source && (
                    <p className="text-xs text-muted-foreground">via {alert.source}</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
