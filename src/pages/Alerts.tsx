import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Shield,
  Info,
  Bell,
  Plus,
  Settings,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchAlerts } from "@/lib/api";

const alertStyles = {
  danger: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    icon: AlertTriangle,
    iconBg: "bg-destructive/20",
    iconColor: "text-destructive",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    icon: Shield,
    iconBg: "bg-warning/20",
    iconColor: "text-warning",
  },
  info: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: Info,
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
  },
};

const Alerts = () => {
  const { data, isLoading, isError } = useQuery({ queryKey: ["alerts"], queryFn: fetchAlerts });
  const alerts = data?.items || [];
  const unreadCount = alerts.filter((a: any) => !a.read).length;
  const dangerCount = alerts.filter((a: any) => a.type === "danger").length;

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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Risk Alerts</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-1 text-sm font-medium bg-destructive/20 text-destructive rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Stay informed about potential risks and important updates.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Alert Settings
            </Button>
            <Button variant="glow" className="gap-2">
              <Plus className="w-4 h-4" />
              New Alert Rule
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-destructive/10">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold">{dangerCount}</p>
            <p className="text-sm text-muted-foreground">Critical Alerts</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning/10">
            <Shield className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">2</p>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">5</p>
            <p className="text-sm text-muted-foreground">Active Rules</p>
          </div>
        </div>
      </motion.div>

      {/* Alerts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {isLoading && (
          <div className="p-6 text-center text-muted-foreground">Loading alerts...</div>
        )}
        {isError && (
          <div className="p-6 text-center text-destructive">Failed to load alerts.</div>
        )}
        {!isLoading &&
          !isError &&
          alerts.map((alert: any, index: number) => {
            const style = alertStyles[alert.type as keyof typeof alertStyles];
            const Icon = style.icon;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
                className={cn(
                  "glass rounded-2xl p-6 border transition-all hover:border-primary/20",
                  style.border,
                  !alert.read && "ring-1 ring-primary/20"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn("p-3 rounded-xl shrink-0", style.iconBg)}>
                    <Icon className={cn("w-6 h-6", style.iconColor)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{alert.title}</h3>
                          {!alert.read && (
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {alert.token && (
                          <span className="px-2 py-1 rounded-md bg-secondary font-mono">
                            {alert.token}
                          </span>
                        )}
                        <span>Source: {alert.source}</span>
                        <span>{alert.time}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {alert.action && (
                          <Button variant="outline" size="sm" className="gap-1">
                            {alert.action}
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </motion.div>
    </MainLayout>
  );
};

export default Alerts;
