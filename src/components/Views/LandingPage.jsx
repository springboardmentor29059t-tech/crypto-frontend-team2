import React from 'react';
import Icon from '../UI/Icon';

const LandingPage = ({ onLogin, onSignup }) => {
  return (
    <div className="min-h-screen w-full flex flex-col crypto-grid relative">
      <nav className="w-full border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer">
            <span className="text-3xl text-cyan-400">₿</span>
            <span className="text-2xl font-bold tracking-tight text-white">CryptoTrack <span className="text-cyan-400">Pro</span></span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={onLogin} className="text-gray-300 hover:text-white font-medium text-sm px-4 py-2 transition-colors">Log In</button>
            <button onClick={onSignup} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-lg shadow-cyan-500/20 transition-all">Sign Up</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col justify-center items-center text-center px-6 pt-10 pb-20 hero-gradient">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-8 tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2 animate-pulse"></span> Live Market Data
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Track Your Crypto <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
            Portfolio Securely
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          Connect your exchanges, monitor real-time portfolio performance, and gain powerful insights with advanced analytics and cost basis tracking.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button onClick={onSignup} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-bold text-lg shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:-translate-y-1 transition-all">
            Get Started Free
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-gray-800 border border-gray-700 hover:bg-gray-700 rounded-lg font-semibold text-lg transition-colors">
            View Demo
          </button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;