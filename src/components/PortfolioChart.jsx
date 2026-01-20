import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { RefreshCcw, Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const PortfolioChart = ({ historyData, isLoading, lastUpdated, isTotalView = true }) => {
  const chartRef = useRef(null);

  // 🛡️ PERSISTENT DATA: Prevents flickering
  const [persistentData, setPersistentData] = useState({ labels: [], points: [] });

  /**
   * 📡 PULSE METRICS
   */
  const pulseMetrics = useMemo(() => {
    if (!lastUpdated) return { time: "SYNCING", isStale: false };
    const time = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    });
    // Stale if data hasn't refreshed in 10 minutes
    const isStale = (Date.now() - new Date(lastUpdated).getTime()) > 600000;
    return { time, isStale };
  }, [lastUpdated]);

  /**
   * 📊 DATA PROCESSING (The Fix)
   * Automatically handles both Array format [time, price] AND Object format {date, value}
   */
  useEffect(() => {
    if (Array.isArray(historyData) && historyData.length > 0) {

      // 1. UNIVERSAL ADAPTER: Normalize data to { timestamp, value }
      const normalizedNodes = historyData.map(d => {
        // If coming from Backend-Fix (Recharts format): { date: 123, value: 456 }
        if (d.date !== undefined && d.value !== undefined) {
          return { timestamp: d.date, value: d.value };
        }
        // If coming from Raw CoinGecko (Array format): [123, 456]
        if (Array.isArray(d)) {
          return { timestamp: d[0], value: d[1] };
        }
        return null;
      }).filter(n => n !== null && n.value !== null);

      if (normalizedNodes.length > 0) {
        // Sort by time to ensure line draws left-to-right
        normalizedNodes.sort((a, b) => a.timestamp - b.timestamp);

        const lastIdx = normalizedNodes.length - 1;
        const timeDiff = normalizedNodes[lastIdx].timestamp - normalizedNodes[0].timestamp;
        const isLongTerm = timeDiff > 172800000; // > 48 Hours

        setPersistentData({
          labels: normalizedNodes.map(d => {
            const date = new Date(d.timestamp);
            return isLongTerm
              ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
              : date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          }),
          points: normalizedNodes.map(d => d.value)
        });
      }
    }
  }, [historyData]);

  const isPositive = useMemo(() => {
    const pts = persistentData.points;
    if (pts.length < 2) return true;
    return pts[pts.length - 1] >= pts[0];
  }, [persistentData]);

  // --- CHART CONFIGURATION ---
  const chartData = {
    labels: persistentData.labels,
    datasets: [
      {
        fill: true,
        label: isTotalView ? 'Net Value' : 'Price',
        data: persistentData.points,
        // Theme Colors: Emerald for Profit, Rose for Loss
        borderColor: isPositive ? '#34d399' : '#f43f5e',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: isPositive ? '#10b981' : '#f43f5e',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        tension: 0.4, // Smooth curves
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          return gradient;
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeOutQuart' },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(2, 6, 23, 0.9)',
        titleColor: '#94a3b8',
        titleFont: { size: 10, weight: 'bold', family: 'sans-serif' },
        bodyColor: '#fff',
        bodyFont: { size: 14, family: 'monospace', weight: 'bold' },
        padding: 12,
        cornerRadius: 12,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => ` ₹${context.parsed.y.toLocaleString('en-IN')}`,
          title: (tooltipItems) => tooltipItems[0].label
        }
      }
    },
    scales: {
      x: { display: false },
      y: { display: false, grace: '10%' }
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative group">

      {/* 📡 STATUS OVERLAY (Visible on Hover) */}
      <div className="absolute top-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
         <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-950/50 border border-white/5 backdrop-blur-sm">
             {isLoading ? (
                <RefreshCcw size={10} className="text-blue-500 animate-spin" />
             ) : (
                <div className={`w-1.5 h-1.5 rounded-full ${pulseMetrics.isStale ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></div>
             )}
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {pulseMetrics.isStale ? 'Cached' : 'Live'}
             </span>
         </div>
      </div>

      {/* 📈 MAIN CHART AREA */}
      <div className="flex-1 w-full min-h-0 relative">
        {persistentData.points.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500/30">
             <Activity className="animate-pulse mb-2" size={40} strokeWidth={1} />
             <p className="text-[9px] font-bold uppercase tracking-[0.3em]">Awaiting Data Stream</p>
          </div>
        ) : (
          <div className={`h-full w-full transition-all duration-700 ${isLoading ? 'opacity-50 blur-[1px]' : 'opacity-100'}`}>
            <Line data={chartData} options={options} />
          </div>
        )}
      </div>

    </div>
  );
};

export default PortfolioChart;