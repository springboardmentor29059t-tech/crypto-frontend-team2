import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchPriceHistory } from "@/lib/api";
import { formatRupee, formatRupeeValue } from "@/lib/currency";
import { format, parseISO } from "date-fns";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg px-4 py-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-primary">
          {formatRupee(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function PortfolioChart() {
  // Fetch price history for BTC (or aggregate portfolio value)
  const { data: priceData, isLoading } = useQuery({
    queryKey: ["priceHistory", "BTC", 30],
    queryFn: () => fetchPriceHistory("BTC", 30),
    retry: false,
    onError: () => {
      // Silently handle errors to prevent UI crashes
    },
  });

  // Transform price data for chart
  const chartData = priceData?.items?.map((snapshot: any) => ({
    date: format(parseISO(snapshot.timestamp), "MMM dd"),
    value: snapshot.priceInr || snapshot.price * 83, // Fallback to USD * conversion rate
  })) || [
    // Fallback data if no price history available
    { date: "Jan", value: 42000 * 83 },
    { date: "Feb", value: 38000 * 83 },
    { date: "Mar", value: 51000 * 83 },
    { date: "Apr", value: 48000 * 83 },
    { date: "May", value: 62000 * 83 },
    { date: "Jun", value: 58000 * 83 },
    { date: "Jul", value: 71000 * 83 },
    { date: "Aug", value: 68000 * 83 },
    { date: "Sep", value: 82000 * 83 },
    { date: "Oct", value: 76000 * 83 },
    { date: "Nov", value: 94000 * 83 },
    { date: "Dec", value: 124750 * 83 },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Portfolio Performance</h3>
          <p className="text-sm text-muted-foreground">Last 12 months</p>
        </div>
        <div className="flex gap-2">
          {["1D", "1W", "1M", "1Y", "ALL"].map((period) => (
            <button
              key={period}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                period === "1Y"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142 76% 48%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142 76% 48%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
            <XAxis
              dataKey="date"
              stroke="hsl(215 20% 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(215 20% 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(142 76% 48%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
