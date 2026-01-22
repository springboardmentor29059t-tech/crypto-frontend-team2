
import React, { useState } from 'react';
import { 
  Settings, Bell, DollarSign, Shield, Save, Check, 
  Mail, Phone, Smartphone, AlertCircle, Zap, Send, 
  ExternalLink, BadgeCheck, ShieldAlert
} from 'lucide-react';
import { UserSettings } from '../types';
import { mockApi } from '../services/api';
import { generateAlertMessage } from '../services/geminiService';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    priceAlertThreshold: 5,
    riskAlertEnabled: true,
    preferredFiat: 'USD',
    notificationEmail: 'demo-alert@protocoldao.io',
    phoneNumber: '+91 98765 43210',
    emailVerified: true,
    phoneVerified: false,
    notificationToggles: {
      email: true,
      push: true,
      sms: true
    }
  });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState<'SMS' | 'EMAIL' | null>(null);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const runTestNotification = async (type: 'SMS' | 'EMAIL') => {
    setTesting(type);
    try {
      // Mock alert data for Gemini to use in content generation
      const mockAlert = {
        id: 'test-123',
        type: 'SCAM' as const,
        severity: 'CRITICAL' as const,
        tokenName: 'BITCOIN-MIMIC',
        description: 'Suspicious contract behavior detected. Assets might be at risk.',
        timestamp: new Date().toISOString()
      };

      const aiMessage = await generateAlertMessage(mockAlert, type);
      const target = type === 'SMS' ? settings.phoneNumber : settings.notificationEmail;
      
      await mockApi.dispatchNotification(type, target, aiMessage);
      
      alert(`Simulation Success: ${type} sent to ${target}\n\nContent: "${aiMessage}"`);
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8">
      {/* Header with Glassmorphism */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-10 rounded-[3rem] flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="bg-yellow-500 p-4 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <Settings size={32} className="text-black" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">System Core</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Global Communication & Security Logic</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
          <BadgeCheck className="text-green-500" size={16} />
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Gateway Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Communication Channels */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-8 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                <Smartphone className="text-indigo-400" size={24} />
                Communication Grid
              </h3>
            </div>

            <div className="space-y-8">
              {/* Email Config */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Alert Destination Email</label>
                   {settings.emailVerified && <span className="text-green-500 text-[10px] font-black flex items-center gap-1 uppercase tracking-widest">Primary Verified</span>}
                </div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
                  <input 
                    type="email"
                    value={settings.notificationEmail}
                    onChange={e => setSettings({...settings, notificationEmail: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-yellow-500/50 transition-all font-bold"
                  />
                </div>
                <button 
                  onClick={() => runTestNotification('EMAIL')}
                  disabled={!!testing}
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-[0.2em] transition-colors"
                >
                  <Send size={12} className={testing === 'EMAIL' ? 'animate-bounce' : ''} />
                  {testing === 'EMAIL' ? 'Processing SMTP...' : 'Dispatch Test Email'}
                </button>
              </div>

              {/* SMS Config */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">SMS Direct Line</label>
                   {!settings.phoneVerified && <button className="text-yellow-500 text-[10px] font-black uppercase tracking-widest hover:underline">Verify Now</button>}
                </div>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
                  <input 
                    type="tel"
                    value={settings.phoneNumber}
                    onChange={e => setSettings({...settings, phoneNumber: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-yellow-500/50 transition-all font-bold"
                  />
                </div>
                <button 
                  onClick={() => runTestNotification('SMS')}
                  disabled={!!testing}
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-[0.2em] transition-colors"
                >
                  <Smartphone size={12} className={testing === 'SMS' ? 'animate-bounce' : ''} />
                  {testing === 'SMS' ? 'Handshaking Gateway...' : 'Send Test SMS Alert'}
                </button>
              </div>
            </div>
          </section>

          {/* Infrastructure Health */}
          <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2.5rem] flex items-center gap-6">
            <div className="bg-indigo-600 p-4 rounded-2xl">
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <h4 className="text-white font-black uppercase text-sm tracking-tight">AI Notification Engine</h4>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">Alerts are composed by Gemini 3 Flash to ensure maximum clarity during volatility events.</p>
            </div>
          </div>
        </div>

        {/* Right: Preferences */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-10 shadow-xl">
             <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
              <ShieldAlert className="text-yellow-500" size={24} />
              Policy
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                <div>
                  <h4 className="text-white font-black text-xs uppercase tracking-widest">Price Alerts</h4>
                  <p className="text-slate-500 text-[10px] font-bold mt-1">Notify on {settings.priceAlertThreshold}% change</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:bg-yellow-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                <div>
                  <h4 className="text-white font-black text-xs uppercase tracking-widest">Risk Guard</h4>
                  <p className="text-slate-500 text-[10px] font-bold mt-1">SMS on high-risk contract detect</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.riskAlertEnabled} onChange={() => setSettings({...settings, riskAlertEnabled: !settings.riskAlertEnabled})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:bg-yellow-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Sovereign Fiat</label>
              <select 
                value={settings.preferredFiat}
                onChange={e => setSettings({...settings, preferredFiat: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 px-5 focus:outline-none focus:border-yellow-500/50 font-black uppercase text-xs tracking-widest"
              >
                <option value="USD">Global Dollar (USD)</option>
                <option value="INR">Indian Rupee (INR)</option>
                <option value="EUR">Euro Zone (EUR)</option>
              </select>
            </div>
          </section>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black h-20 rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl shadow-yellow-500/10 transition-all active:scale-95 group overflow-hidden"
          >
            {saving ? (
              <div className="animate-spin h-6 w-6 border-4 border-black border-t-transparent rounded-full"></div>
            ) : saved ? (
              <div className="flex items-center gap-3 animate-bounce">
                <Check size={24} />
                <span className="uppercase tracking-[0.3em] text-xs">Policy Applied</span>
              </div>
            ) : (
              <>
                <Shield size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="uppercase tracking-[0.3em] text-xs">Authorize Core Updates</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
