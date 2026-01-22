import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setSent(true);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-6">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-slate-400 mb-8">Enter your email to receive recovery instructions.</p>

                {sent ? (
                    <div className="text-center py-8">
                        <div className="bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Check your email</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            We've sent a password reset link to <span className="text-white font-bold">{email}</span>
                        </p>
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold text-sm">
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>

                        <div className="text-center mt-6">
                            <Link to="/login" className="text-slate-500 hover:text-white text-sm transition-colors">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
