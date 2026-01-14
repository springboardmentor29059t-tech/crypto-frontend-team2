import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { HoldingsList } from "@/components/dashboard/HoldingsList";
import { RiskAlerts } from "@/components/dashboard/RiskAlerts";
import { ExchangeConnections } from "@/components/dashboard/ExchangeConnections";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, ArrowDownUp, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatRupee } from "@/lib/currency";

const Index = () => {
  const { user } = useAuth();

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="gradient-text">{user?.name || "Trader"}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your portfolio today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Balance"
          value={formatRupee(124750)}
          change="+12.5%"
          changeType="positive"
          icon={Wallet}
          delay={0}
        />
        <StatsCard
          title="24h Change"
          value={`+${formatRupee(4320)}`}
          change="+3.6%"
          changeType="positive"
          icon={TrendingUp}
          delay={0.1}
        />
        <StatsCard
          title="Total Trades"
          value="1,234"
          change="+45 this week"
          changeType="neutral"
          icon={ArrowDownUp}
          delay={0.2}
        />
        <StatsCard
          title="Risk Score"
          value="Medium"
          change="2 alerts"
          changeType="negative"
          icon={AlertTriangle}
          delay={0.3}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <PortfolioChart />
          <HoldingsList />
        </div>
        <div className="space-y-6">
          <RiskAlerts />
          <ExchangeConnections />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
