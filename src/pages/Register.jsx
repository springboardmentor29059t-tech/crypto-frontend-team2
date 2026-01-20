import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, CheckCircle2, Eye, EyeOff, Loader2, AlertCircle, Terminal } from 'lucide-react';
import api from '../api/axiosConfig';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [strength, setStrength] = useState({
    score: 0,
    label: '',
    color: 'bg-slate-800',
    textColor: 'text-slate-500'
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (errorMessage) setErrorMessage('');
  }, [formData]);

  const evaluateStrength = (pass) => {
    let score = 0;
    if (!pass || pass.length === 0) {
      return setStrength({ score: 0, label: '', color: 'bg-slate-800', textColor: 'text-slate-500' });
    }
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const levels = [
      { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' },
      { label: 'Fair', color: 'bg-orange-500', textColor: 'text-orange-500' },
      { label: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
      { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-500' }
    ];
    setStrength({ score, ...levels[score - 1] });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    const trimmedPassword = formData.password;
    const trimmedConfirm = formData.confirmPassword;

    if (trimmedPassword !== trimmedConfirm) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (trimmedPassword.length < 6) {
      setErrorMessage("Security protocol requires at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: trimmedPassword
      };

      const response = await api.post('/user/register', payload);

      if (response.status === 201 || response.status === 200) {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error("Enrollment Failure:", err);
      const status = err.response?.status;
      const backendMessage = err.response?.data?.message;

      if (status === 409) {
        setErrorMessage("This email is already registered in the vault.");
      } else {
        setErrorMessage(backendMessage || "Vault registration failed. Please check connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/5 blur-[120px] rounded-full"></div>
        </div>

        <div className="w-full max-w-md bg-[#0B0E14] border border-white/10 rounded-3xl p-10 shadow-2xl text-center relative z-10 backdrop-blur-xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-full mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="text-emerald-500" size={40} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Access Granted</h2>
          <p className="text-slate-400 text-xs mb-8 leading-relaxed font-medium">
            Operative <span className="text-white font-bold">{formData.email.toLowerCase()}</span> has been verified.
            Initialize session to proceed.
          </p>
          <button
            onClick={() => navigate('/login', { state: { message: 'Identity verified. You may now authorize access.' }})}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            Initialize Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4 font-sans text-white selection:bg-blue-500/30 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo Header */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/20 p-[1px]">
                <div className="w-full h-full bg-[#0B0E14] rounded-[15px] flex items-center justify-center">
                    <UserPlus className="text-white" size={28} />
                </div>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">New Operative</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Identity Registration</p>
        </div>

        {/* Card */}
        <div className="bg-[#0B0E14] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">

            {loading && <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 w-full animate-progress" />}

            {errorMessage && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold flex items-center gap-2 animate-in shake duration-300">
                <AlertCircle size={16} /> {errorMessage}
            </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                        type="text" required
                        value={formData.name}
                        disabled={loading}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                        placeholder="John Doe"
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                        type="email" required
                        value={formData.email}
                        disabled={loading}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                        placeholder="agent@sentinel.net"
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Passcode</label>
                        <span className={`text-[9px] font-bold uppercase transition-all duration-300 ${strength.score > 0 ? 'opacity-100' : 'opacity-0'} ${strength.textColor}`}>
                            {strength.label} Security
                        </span>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            disabled={loading}
                            className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 pl-11 pr-11 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                            placeholder="Create Password"
                            onChange={(e) => {
                            setFormData({...formData, password: e.target.value});
                            evaluateStrength(e.target.value);
                            }}
                        />
                        <button
                            type="button"
                            className="absolute right-4 top-3.5 text-slate-600 hover:text-white transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {/* Strength Bar */}
                    <div className="h-1 w-full bg-slate-800 rounded-full flex gap-1 overflow-hidden mt-2">
                        {[1, 2, 3, 4].map((step) => (
                        <div key={step} className={`h-full flex-1 transition-all duration-500 ${step <= strength.score ? strength.color : 'bg-[#0B0E14] border border-white/5'}`} />
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm Passcode</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        disabled={loading}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 pl-11 pr-11 text-sm text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                        placeholder="Repeat Password"
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                        {loading ? 'Registering...' : 'Complete Enrollment'}
                    </button>
                </div>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-white/5">
                <p className="text-slate-500 text-xs font-medium">
                    Already verified? <Link to="/login" className="text-white font-bold hover:underline underline-offset-4 decoration-blue-500 decoration-2">Login here</Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Register;