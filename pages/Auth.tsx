
import React, { useState } from 'react';
import { registerUser, loginUser } from '../data/store';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth = ({ onLogin }: AuthProps) => {
  const [mode, setMode] = useState<'CHOICE' | 'LOGIN' | 'SIGNUP'>('CHOICE');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSocialStub = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      const mockUser = { name: `${provider} User`, email: `social@${provider}.com`, provider };
      const user = registerUser(mockUser) || loginUser(mockUser.email);
      if (user) onLogin(user);
      setLoading(false);
    }, 1000);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      if (mode === 'SIGNUP') {
        const user = registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          provider: 'EMAIL'
        });
        if (user) onLogin(user);
        else setError("An account with this email already exists.");
      } else {
        const user = loginUser(formData.email, formData.password);
        if (user) onLogin(user);
        else setError("Invalid email or password.");
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-12">
        {/* Branding */}
        <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-1000">
          <div className="w-20 h-20 nova-gradient rounded-3xl flex items-center justify-center font-black text-black text-3xl mx-auto shadow-[0_20px_40px_rgba(212,175,55,0.3)] rotate-6">N</div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
              <span className="nova-text-gradient">Nova</span><br />Events
            </h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.5em] mt-4 opacity-50">Premium Experience Architecture</p>
          </div>
        </div>

        <div className="glass-card p-10 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gold-500 animate-pulse">Synchronizing...</p>
            </div>
          )}

          {mode === 'CHOICE' ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <button onClick={() => handleSocialStub('Google')} className="w-full bg-white text-black py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-all text-sm shadow-xl">
                  <i className="fab fa-google text-lg text-red-500"></i> Sign in with Google
                </button>
                <button onClick={() => handleSocialStub('Apple')} className="w-full bg-black text-white border border-white/20 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-all text-sm shadow-xl">
                  <i className="fab fa-apple text-xl"></i> Sign in with Apple
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-white/5"></div>
                <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest">or exclusive portal</span>
                <div className="h-[1px] flex-1 bg-white/5"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setMode('LOGIN')} className="bg-white/5 border border-white/10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Login</button>
                <button onClick={() => setMode('SIGNUP')} className="nova-gradient text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all">Register</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <button type="button" onClick={() => setMode('CHOICE')} className="text-gold-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 mb-4 hover:gap-3 transition-all">
                <i className="fas fa-arrow-left"></i> Back
              </button>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tight">{mode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ENTER YOUR EXCLUSIVE CREDENTIALS</p>
              </div>

              {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-xl animate-shake">{error}</div>}

              <div className="space-y-4">
                {mode === 'SIGNUP' && (
                  <input required placeholder="DISPLAY NAME" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:border-gold-500 outline-none transition-all text-sm font-bold uppercase" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                )}
                <input required type="email" placeholder="EMAIL ADDRESS" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:border-gold-500 outline-none transition-all text-sm font-medium" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input required type="password" placeholder="PASSWORD" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:border-gold-500 outline-none transition-all text-sm font-medium" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              <button type="submit" className="w-full nova-gradient text-black font-black uppercase tracking-[0.2em] py-6 rounded-2xl shadow-2xl hover:scale-[1.02] transition-all text-xs">
                {mode === 'LOGIN' ? 'AUTHORIZE ACCESS' : 'RESERVE IDENTITY'}
              </button>

              <p className="text-center text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                {mode === 'LOGIN' ? "DON'T HAVE AN ACCOUNT?" : "ALREADY A MEMBER?"} 
                <button type="button" onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="text-gold-500 ml-2">CLICK HERE</button>
              </p>
            </form>
          )}
        </div>

        <div className="text-center opacity-30">
          <p className="text-[8px] text-gray-600 uppercase tracking-widest leading-loose font-black">
            NOVA ENCRYPTION PROTOCOL ACTIVE • SECURED BY GENESIS™
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
