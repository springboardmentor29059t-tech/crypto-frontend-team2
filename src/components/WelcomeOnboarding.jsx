import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ArrowRight, Rocket, Star, Wallet, History } from 'lucide-react';
import { Link } from 'react-router-dom';

const WelcomeOnboarding = ({ tradeCount }) => {
  // Only show if the user is new (0 trades)
  const [isVisible, setIsVisible] = useState(tradeCount === 0);

  if (!isVisible || tradeCount > 0) return null;

  const steps = [
    {
      id: 1,
      label: "Monitor the Market",
      desc: "Add your first asset to the Watchlist to track live INR prices.",
      icon: <Star size={16} className="text-yellow-500" />,
      link: "/watchlist"
    },
    {
      id: 2,
      label: "Execute Transaction",
      desc: "Use 'Add Transaction' to record your first buy order in the vault.",
      icon: <Wallet size={16} className="text-blue-500" />,
      link: "/"
    },
    {
      id: 3,
      label: "Audit your Ledger",
      desc: "View your historical execution logs in the transaction terminal.",
      icon: <History size={16} className="text-purple-500" />,
      link: "/trades"
    }
  ];

  return (
    <div className="bg-slate-900/60 border border-blue-500/20 rounded-[2.5rem] p-8 mb-10 backdrop-blur-md relative overflow-hidden group">
      {/* Background Decoration */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/40">
            <Rocket className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Initialize Your Terminal</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Onboarding Protocol Active</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <Link
              key={step.id}
              to={step.link}
              className="bg-slate-950/50 border border-slate-800 p-5 rounded-3xl hover:border-blue-500/50 transition-all group/item"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  {step.icon}
                </div>
                <span className="text-[10px] font-black text-slate-700 uppercase italic">Step 0{step.id}</span>
              </div>
              <h4 className="text-white font-bold text-sm mb-1 group-hover/item:text-blue-400 transition-colors">
                {step.label}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {step.desc}
              </p>
            </Link>
          ))}
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="mt-8 text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-[0.2em] transition-colors"
        >
          Dismiss Tutorial [ESC]
        </button>
      </div>
    </div>
  );
};

export default WelcomeOnboarding;