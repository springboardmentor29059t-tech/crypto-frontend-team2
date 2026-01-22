import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { register } from '../services/api';

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ firstName?: string; email?: string; password?: string }>({});

  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleBlur = (field: 'firstName' | 'email' | 'password') => {
    const newErrors = { ...fieldErrors };
    if (field === 'firstName') {
      if (!firstName) newErrors.firstName = 'Full Name is required';
      else delete newErrors.firstName;
    }
    if (field === 'email') {
      if (!email) newErrors.email = 'Email is required';
      else if (!validateEmail(email)) newErrors.email = 'Invalid email format';
      else delete newErrors.email;
    }
    if (field === 'password') {
      if (!password) newErrors.password = 'Password is required';
      else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      else delete newErrors.password;
    }
    setFieldErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: typeof fieldErrors = {};
    if (!firstName) newErrors.firstName = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password too short';

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register({ fullName: firstName, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Email might already exist.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-[#020617]">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-yellow-500 p-2 rounded-xl">
            <Shield size={24} className="text-black" />
          </div>
          <span className="font-black text-white tracking-tighter text-xl italic uppercase">CRYPTO TRACKER</span>
        </div>

        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Create Identity</h2>
        <p className="text-slate-500 mb-8 text-sm">Initialize your secure sovereign tracking node.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold animate-pulse">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500 text-sm font-bold">
            <Shield size={18} />
            Registration Successful! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
            <div className="relative">
              <UserIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.firstName ? 'text-red-500' : 'text-slate-600'}`} />
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); if (fieldErrors.firstName) setFieldErrors({ ...fieldErrors, firstName: undefined }); }}
                onBlur={() => handleBlur('firstName')}
                className={`w-full bg-slate-950 border ${fieldErrors.firstName ? 'border-red-500' : 'border-slate-800'} rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500/40 transition-all placeholder:text-slate-800`}
                placeholder="Alex Doe"
              />
            </div>
            {fieldErrors.firstName && <p className="text-red-500 text-xs mt-1 font-bold ml-1">{fieldErrors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
            <div className="relative">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.email ? 'text-red-500' : 'text-slate-600'}`} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined }); }}
                onBlur={() => handleBlur('email')}
                className={`w-full bg-slate-950 border ${fieldErrors.email ? 'border-red-500' : 'border-slate-800'} rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500/40 transition-all placeholder:text-slate-800`}
                placeholder="alex@example.com"
              />
            </div>
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1 font-bold ml-1">{fieldErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Secure Key</label>
            <div className="relative">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.password ? 'text-red-500' : 'text-slate-600'}`} />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                }}
                onBlur={() => handleBlur('password')}
                className={`w-full bg-slate-950 border ${fieldErrors.password ? 'border-red-500' : 'border-slate-800'} rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500/40 transition-all placeholder:text-slate-800`}
                placeholder="••••••••"
              />
            </div>
            {password.length > 0 && (
              <div className="flex gap-1 mt-2 h-1">
                <div className={`flex-1 rounded-full ${password.length >= 6 ? 'bg-red-500' : 'bg-slate-800'}`}></div>
                <div className={`flex-1 rounded-full ${password.length >= 8 ? 'bg-yellow-500' : 'bg-slate-800'}`}></div>
                <div className={`flex-1 rounded-full ${password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-500' : 'bg-slate-800'}`}></div>
              </div>
            )}
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1 font-bold ml-1">{fieldErrors.password}</p>}

          </div>


          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
          >
            <span>{loading ? 'INITIALIZING...' : (success ? 'AUTHORIZED' : 'AUTHORIZE ACCOUNT')}</span>
            {!loading && !success && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          Already Active?{' '}
          <Link to="/login" className="text-yellow-500 hover:text-white transition-colors">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;