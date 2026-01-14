import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  delay?: number;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change && (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md",
                changeType === "positive" && "bg-success/10 text-success",
                changeType === "negative" && "bg-destructive/10 text-destructive",
                changeType === "neutral" && "bg-muted text-muted-foreground"
              )}
            >
              {changeType === "positive" && "↑"}
              {changeType === "negative" && "↓"}
              {change}
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}
