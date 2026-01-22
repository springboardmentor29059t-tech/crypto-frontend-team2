import React, { useState, useEffect } from 'react';
import Icon from '../UI/Icon';

// Added 'error' and 'onClearError' to props
const AuthPage = ({ onLogin, onSignup, onBack, mode = 'login', error, onClearError }) => {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    setIsLogin(mode === 'login');
  }, [mode]);

  const handleChange = (e) => {
    // Clear error when user starts typing
    if (error) onClearError();
    
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLogin) {
      onLogin(formData.email, formData.password);
    } else {
      onSignup(formData.name, formData.email, formData.password);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 crypto-grid p-4">
      <div className="w-full max-w-md bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl p-8 fade-in relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 to-purple-600"></div>
        
        <button onClick={onBack} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <Icon name="x" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full mb-4 border border-gray-700">
            <span className="text-2xl">₿</span>
          </div>
          <h2 className="text-2xl font-bold text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-gray-400 text-sm mt-2">
            {isLogin ? 'Enter your credentials to access your portfolio.' : 'Start tracking your crypto journey today.'}
          </p>
        </div>

        {/* Error Display Box */}
        {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm text-center font-medium">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-white" 
                placeholder="John Doe" 
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required 
              className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-white" 
              placeholder="you@example.com" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required 
              className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-white" 
              placeholder="••••••••" 
            />
          </div>
          
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-bold text-white shadow-lg hover:shadow-cyan-500/25 transform transition-all">
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)} 
            className="text-cyan-400 hover:text-cyan-300 font-semibold ml-1"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;