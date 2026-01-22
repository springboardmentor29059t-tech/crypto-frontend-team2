
import React, { useState, useRef, useEffect } from 'react';
import { UserCircle, Save, Check, Shield, TrendingUp, Briefcase, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../AuthContext';
import { api } from '../services/api';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088';

const ProfileUpdate: React.FC = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    preferredExchanges: [],
    walletType: 'Cold Wallet',
    riskPreference: 'Medium',
    portfolioGoal: 'Long-term',
    experienceLevel: 'Intermediate',
    profileImage: user?.profileImage
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultAvatar = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

  const getFullImageUrl = (path?: string) => {
    if (!path) return defaultAvatar;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${BACKEND_URL}${path}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/profile');
        if (res.status === 200) {
          setProfile(prev => ({
            ...prev,
            ...res.data,
            profileImage: res.data.profileImage // Ensure this is captured
          }));
        }
      } catch (err) {
        console.warn("Could not reach backend, using local session profile.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/api/profile/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // FORCE IMAGE REFRESH (CACHE FIX)
      // res.data.imageUrl is the relative path from backend e.g. /uploads/...
      const relativeUrl = res.data.imageUrl;
      const freshUrl = relativeUrl + "?v=" + Date.now();

      setProfile(prev => ({
        ...prev,
        profileImage: freshUrl,
      }));

      // Update Auth Context so other components see it
      updateUser({ profileImage: freshUrl });

    } catch (err) {
      console.error("Upload failed", err);
      setError("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setError(null);

    try {
      // Send updates to backend
      const payload = {
        fullName: profile.fullName,
        portfolioGoal: profile.portfolioGoal,
        experienceLevel: profile.experienceLevel,
        riskPreference: profile.riskPreference,
        preferredExchanges: profile.preferredExchanges // Sent as array, backend handles it
      };

      const res = await api.put('/api/profile', payload);

      if (res.status === 200) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);

        // Update Context
        updateUser({
          fullName: profile.fullName,
          // You might want to update other fields in context if context holds them,
          // but usually context only holds minimal user identity info.
        });
      }
    } catch (err) {
      console.error("Update failed", err);
      setError('Update failed. Please try again.');
    }
  };

  const exchanges = ['Binance', 'Coinbase', 'Kraken', 'KuCoin', 'ByBit', 'MetaMask'];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="animate-spin text-yellow-500" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-indigo-600 p-3 rounded-2xl">
          <UserCircle size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight uppercase italic">Profile Intelligence</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Identity Node Management</p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 pb-20">
        <section className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-8 shadow-xl relative">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={`absolute -inset-1 bg-gradient-to-r from-yellow-500 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-100 transition duration-1000 ${uploading ? 'animate-pulse opacity-100' : ''}`}></div>

            {/* 10️⃣ Image Rendering (FORCE RE-RENDER) */}
            <img
              key={profile.profileImage}
              src={getFullImageUrl(profile.profileImage)}
              className="relative w-32 h-32 rounded-full border-4 border-slate-800 object-cover shadow-2xl transition-all group-hover:brightness-50"
              alt="Avatar"
              onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
            />

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={32} />
            </div>
          </div>
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-xl font-black text-white uppercase italic">Biometric Identity</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Select any image for your network visualization.</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-xl border border-white/5 transition-all"
            >
              {uploading ? 'Uploading...' : 'Change Avatar'}
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
              <UserCircle size={16} className="text-yellow-500" />
              Identity
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email</label>
                <input type="email" readOnly value={profile.email} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-slate-600 cursor-not-allowed font-mono text-sm" />
              </div>
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={16} className="text-yellow-500" />
              Market Posture
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Primary Goal</label>
                <select
                  value={profile.portfolioGoal}
                  onChange={e => setProfile({ ...profile, portfolioGoal: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500 font-bold uppercase text-[10px] tracking-widest"
                >
                  <option value="Long-term">Long-term Stacking</option>
                  <option value="Short-term trading">Active Trading</option>
                  <option value="Tax tracking">Compliance</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Experience</label>
                <select
                  value={profile.experienceLevel}
                  onChange={e => setProfile({ ...profile, experienceLevel: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500 font-bold uppercase text-[10px] tracking-widest"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <section className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Shield size={16} className="text-yellow-500" />
                Risk & Custody
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Risk Tolerance</label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High'].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setProfile({ ...profile, riskPreference: r as any })}
                        className={`flex-grow py-3 rounded-xl font-black transition-all border text-[10px] uppercase tracking-widest ${profile.riskPreference === r
                          ? 'bg-yellow-500 border-yellow-500 text-black'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Briefcase size={16} className="text-yellow-500" />
                Exchanges
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {exchanges.map(ex => {
                  const exists = profile.preferredExchanges?.includes(ex);
                  return (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => {
                        const current = profile.preferredExchanges || [];
                        setProfile({
                          ...profile,
                          preferredExchanges: exists
                            ? current.filter(e => e !== ex)
                            : [...current, ex]
                        });
                      }}
                      className={`p-3 rounded-xl text-[9px] font-black uppercase transition-all border ${exists ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-950 border-slate-800 text-slate-700'
                        }`}
                    >
                      {ex}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end sticky bottom-8">
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-12 py-5 rounded-[2rem] flex items-center gap-3 shadow-2xl uppercase tracking-[0.3em] text-xs"
          >
            {saved ? <Check size={20} /> : <Save size={20} />}
            {saved ? 'Synchronized' : 'Authorize Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileUpdate;
