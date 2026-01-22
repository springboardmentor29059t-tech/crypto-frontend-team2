
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  ChevronRight, CheckCircle2,
  Lock, Globe, Cpu, BarChart3,
  ArrowRight,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import InteractiveHeroImage from '../components/InteractiveHeroImage';

const Landing: React.FC = () => {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login('mock-jwt-token', { id: 1, fullName: 'Demo User', email: email });
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="bg-[#020617] text-slate-200 min-h-screen selection:bg-yellow-500/30 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-slate-900/40 mix-blend-overlay"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(#ffffff 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }}></div>
      </div>

      {/* Navigation Ticker */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#020617]/80 backdrop-blur-md border-b border-white/5 py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-yellow-500 p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(234,179,8,0.4)]">
              <Shield size={20} className="text-black" />
            </div>
            <span className="font-black text-white tracking-tighter text-xl italic uppercase">CRYPTO TRACKER</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Link to="/scam-scanner" className="hover:text-yellow-500 transition-colors">Forensics</Link>
            <Link to="/risk-analysis" className="hover:text-yellow-500 transition-colors">Safety</Link>
            <Link to="/register" className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-white hover:bg-white/10 transition-all">Register Node</Link>

          </div>
        </div>
      </nav>

      <div className="relative z-10">
        {/* Market Ticker Section */}
        <div className="pt-24 pb-4">
          <div className="bg-white/[0.02] border-y border-white/5 backdrop-blur-sm overflow-hidden whitespace-nowrap py-3">
            <div className="flex animate-marquee gap-12 items-center">
              <TickerItem symbol="BTC" price="$68,212.45" change="+3.2%" isUp={true} />
              <TickerItem symbol="ETH" price="$3,121.10" change="-0.8%" isUp={false} />
              <TickerItem symbol="SOL" price="$142.94" change="+4.5%" isUp={true} />
              <TickerItem symbol="BNB" price="$592.11" change="+1.2%" isUp={true} />
              <TickerItem symbol="LINK" price="$19.33" change="-2.1%" isUp={false} />
              <TickerItem symbol="XRP" price="$0.58" change="+0.5%" isUp={true} />
              {/* Duplicates for loop */}
              <TickerItem symbol="BTC" price="$68,212.45" change="+3.2%" isUp={true} />
              <TickerItem symbol="ETH" price="$3,121.10" change="-0.8%" isUp={false} />
              <TickerItem symbol="SOL" price="$142.94" change="+4.5%" isUp={true} />
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-bold mb-10 hover:border-yellow-500/30 transition-all cursor-default animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
            CRYPTO PORTFOLIO TRACKER V4.0
            <ChevronRight className="w-3 h-3 text-slate-500" />
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mb-8 leading-[0.85] uppercase">
            CRYPTO PORTFOLIO<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-600">TRACKER</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed mb-8 px-4">
            The definitive command center for the digital asset sovereign.
            Automated forensics, <span className="text-white">AI-powered threat detection</span>, and multi-chain auditing.
          </p>

          <InteractiveHeroImage />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto px-4 mt-8">
            <FeatureIconCard icon={<BarChart3 />} title="Audit" subtitle="P&L Visuals" />
            <FeatureIconCard icon={<Lock />} title="Privacy" subtitle="Local Encryption" />
            <FeatureIconCard icon={<Globe />} title="Global" subtitle="100+ Exchanges" />
            <FeatureIconCard icon={<Cpu />} title="Intelligence" subtitle="AI Protection" />
          </div>
        </section>

        {/* Access Module */}
        <section className="max-w-7xl mx-auto px-6 pb-40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 flex flex-col justify-center space-y-12">
              <div className="space-y-6">
                <h2 className="text-5xl font-black text-white tracking-tight leading-none uppercase">
                  Institutional Intelligence<br />
                  <span className="text-yellow-500">For Your Wallet.</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
                  Stop guessing. Our terminal aggregates your fragmented holdings into a single, high-fidelity security posture dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <MiniBenefit icon={<CheckCircle2 className="text-yellow-500" />} text="Automated CSV bulk ingestion" />
                <MiniBenefit icon={<CheckCircle2 className="text-yellow-500" />} text="Real-time ScamDB verification" />
                <MiniBenefit icon={<CheckCircle2 className="text-yellow-500" />} text="Advanced AI Risk Audits" />
                <MiniBenefit icon={<CheckCircle2 className="text-yellow-500" />} text="Institutional-grade chart engine" />
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-indigo-500/20 rounded-[3.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative h-full bg-[#050a1a] p-10 md:p-14 rounded-[3.4rem] border border-white/5 flex flex-col shadow-2xl">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">Access Hub</h3>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Authorized Entrance Only</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/5">
                      <Fingerprint className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity Identifier</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-yellow-500/40 transition-all placeholder:text-slate-800"
                        placeholder="EMAIL@PROTOCOL.COM"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Cryptographic Key</label>
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-yellow-500/40 transition-all placeholder:text-slate-800"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-16 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-yellow-500/10 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      {loading ? 'Validating...' : 'Authenticate'}
                      {!loading && <ArrowRight size={16} />}
                    </button>
                  </form>

                  <div className="mt-10 pt-10 border-t border-white/5 text-center">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full py-4 rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all mb-6"
                    >
                      Simulate Local Environment
                    </button>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      New Identity? <Link to="/register" className="text-yellow-500 ml-1">Register Node</Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-500/10 p-1 rounded-md">
              <Shield size={16} className="text-yellow-500" />
            </div>
            <span className="font-black text-white text-xs tracking-tighter">CRYPTO TRACKER</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">© 2025 Sovereign Logic Labs. All connections encrypted.</p>
        </footer>
      </div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 35s linear infinite; }
        .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

const TickerItem = ({ symbol, price, change, isUp }: any) => (
  <div className="flex items-center gap-3 font-mono">
    <span className="text-slate-600 font-black text-xs uppercase">{symbol}</span>
    <span className="text-white font-bold text-xs">{price}</span>
    <span className={`text-[10px] font-black ${isUp ? 'text-green-500' : 'text-red-500'}`}>{change}</span>
  </div>
);

const FeatureIconCard = ({ icon, title, subtitle }: any) => (
  <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] hover:border-yellow-500/20 transition-all cursor-default">
    <div className="text-yellow-500 mb-4">{React.cloneElement(icon, { size: 28 })}</div>
    <div className="text-white font-black text-sm uppercase tracking-tight mb-1">{title}</div>
    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{subtitle}</div>
  </div>
);

const MiniBenefit = ({ icon, text }: any) => (
  <div className="flex items-center gap-3">
    <div className="bg-white/5 p-1 rounded-full">{icon}</div>
    <span className="text-slate-300 text-sm font-semibold tracking-tight">{text}</span>
  </div>
);

export default Landing;
