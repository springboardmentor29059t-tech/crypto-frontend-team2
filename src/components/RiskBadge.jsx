import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Activity } from 'lucide-react';

const RiskBadge = ({ level }) => {
  const styles = {
    low: {
      bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: <ShieldCheck size={12} />,
      label: "Secure",
      animation: ""
    },
    medium: {
      bg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: <ShieldAlert size={12} />,
      label: "Caution",
      animation: ""
    },
    high: {
      bg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      icon: <Activity size={12} className="animate-pulse" />,
      label: "Volatile",
      animation: "animate-pulse"
    }
  };

  const current = styles[level] || styles.medium;

  return (
    <div className={`
      inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border
      text-[9px] font-black uppercase tracking-[0.15em]
      transition-all duration-300 backdrop-blur-md
      ${current.bg} ${current.animation}
    `}>
      <span className="flex-shrink-0">
        {current.icon}
      </span>
      <span className="leading-none">
        {current.label}
      </span>
    </div>
  );
};

export default RiskBadge;