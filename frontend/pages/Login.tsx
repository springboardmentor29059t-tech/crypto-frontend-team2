import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { login as apiLogin } from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleBlur = (field: 'email' | 'password') => {
    const newErrors = { ...fieldErrors };
    if (field === 'email') {
      if (!email) newErrors.email = 'Email is required';
      else if (!validateEmail(email)) newErrors.email = 'Invalid email format';
      else delete newErrors.email;
    }
    if (field === 'password') {
      if (!password) newErrors.password = 'Password is required';
      else delete newErrors.password;
    }
    setFieldErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Invalid email format';

    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiLogin({ email, password });
      login(response.token, response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check your network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
        <p className="text-slate-400 mb-8">Sign in to access your portfolio tracker</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold animate-pulse">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${fieldErrors.email ? 'text-red-500' : 'text-slate-500'}`} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined }); }}
                onBlur={() => handleBlur('email')}
                className={`w-full bg-slate-950 border ${fieldErrors.email ? 'border-red-500' : 'border-slate-800'} rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all`}
                placeholder="you@example.com"
              />
            </div>
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1 font-bold ml-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${fieldErrors.password ? 'text-red-500' : 'text-slate-500'}`} />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined }); }}
                onBlur={() => handleBlur('password')}
                className={`w-full bg-slate-950 border ${fieldErrors.password ? 'border-red-500' : 'border-slate-800'} rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all`}
                placeholder="••••••••"
              />
            </div>
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1 font-bold ml-1">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'VALIDATING...' : 'ACCESS TERMINAL'}</span>
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">Create one</Link>
        </p>
      </div>
    </div>
  );
};


export default Login;