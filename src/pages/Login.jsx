import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertCircle, Loader2, LogIn, Eye, EyeOff, Terminal } from 'lucide-react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message;

  useEffect(() => {
    if (location.search.includes('expired=true')) {
        setError('Session expired. Re-authentication required.');
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/user/login', {
        email: formData.email.trim(),
        password: formData.password
      });

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        setUser(user);
        const origin = location.state?.from?.pathname || '/';
        navigate(origin, { replace: true });
      } else {
        setError('Handshake failed. Token invalid.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Access Denied. Invalid credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4 font-sans selection:bg-blue-500/30 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo Header */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/20 p-[1px]">
                <div className="w-full h-full bg-[#0B0E14] rounded-[15px] flex items-center justify-center">
                    <Terminal className="text-white" size={28} />
                </div>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Command Center</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Secure Access Protocol</p>
        </div>

        {/* Card */}
        <div className="bg-[#0B0E14] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">

            {/* Loading Bar */}
            {loading && (
                <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 w-full animate-progress"></div>
            )}

            {successMessage && !error && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                    <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                    <p className="text-emerald-400 text-xs font-bold">{successMessage}</p>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 animate-in shake duration-300">
                    <AlertCircle size={18} className="text-rose-500 shrink-0" />
                    <p className="text-rose-400 text-xs font-bold">{error}</p>
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identity</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="email"
                            required
                            value={formData.email}
                            disabled={loading}
                            className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                            placeholder="agent@sentinel.net"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Passcode</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            disabled={loading}
                            className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 pl-11 pr-11 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                            placeholder="••••••••"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <button
                            type="button"
                            className="absolute right-4 top-3.5 text-slate-600 hover:text-white transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                        {loading ? 'Authenticating...' : 'Initialize Session'}
                    </button>
                </div>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-white/5">
                <p className="text-slate-500 text-xs font-medium">
                    New Operative? <Link to="/register" className="text-white font-bold hover:underline underline-offset-4 decoration-blue-500 decoration-2">Request Clearance</Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;