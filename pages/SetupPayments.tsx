import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStore, saveStore, updateProfile } from '../data/store';
import { Event, PaymentDetails } from '../types';

const SetupPayments = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const user = JSON.parse(localStorage.getItem('nova_user') || '{}');

  const [mobile, setMobile] = useState({ number: '', name: '' });
  const [bank, setBank] = useState({ accountNo: '', bankName: '', name: '' });
  const [lipa, setLipa] = useState({ number: '', name: '' });
  
  const [showAutoFillPrompt, setShowAutoFillPrompt] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(false);

  useEffect(() => {
    const store = getStore();
    const found = store.events.find(e => e.id === eventId);
    if (found) {
      setEvent(found);
      if (found.paymentDetails && (found.paymentDetails.mobile || found.paymentDetails.lipa || found.paymentDetails.bank)) {
        if (found.paymentDetails.mobile) setMobile(found.paymentDetails.mobile);
        if (found.paymentDetails.bank) setBank(found.paymentDetails.bank);
        if (found.paymentDetails.lipa) setLipa(found.paymentDetails.lipa);
      } else if (user?.defaults && (user.defaults.mobile?.number || user.defaults.lipa?.number)) {
        // If no event specific details, and user has defaults, show prompt
        setShowAutoFillPrompt(true);
      }
    }
  }, [eventId]);

  const applyDefaults = () => {
    if (user?.defaults) {
      if (user.defaults.mobile) setMobile(user.defaults.mobile);
      if (user.defaults.bank) setBank(user.defaults.bank);
      if (user.defaults.lipa) setLipa(user.defaults.lipa);
      setShowAutoFillPrompt(false);
      
      // Visual feedback
      const el = document.getElementById('payment-forms');
      el?.classList.add('animate-pulse');
      setTimeout(() => el?.classList.remove('animate-pulse'), 1000);
    }
  };

  const handleFinish = () => {
    if (!event) return;
    const store = getStore();
    const idx = store.events.findIndex(e => e.id === eventId);
    
    const details: PaymentDetails = {
      mobile: mobile.number ? mobile : undefined,
      bank: bank.accountNo ? bank : undefined,
      lipa: lipa.number ? lipa : undefined
    };

    if (idx !== -1) {
      store.events[idx].paymentDetails = details;
      saveStore(store);

      // Save to profile if toggled
      if (saveToProfile) {
        const updatedUser = updateProfile(user.id, { defaults: details });
        if (updatedUser) {
           localStorage.setItem('nova_user', JSON.stringify(updatedUser));
        }
      }

      alert("Event Setup Complete! You can now start inviting guests.");
      navigate('/');
    }
  };

  if (!event) return <div className="p-20 text-center uppercase tracking-widest font-black opacity-20">Event Not Found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-6 duration-700 pb-24 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black nova-text-gradient uppercase tracking-widest">Payment Methods</h1>
        <p className="text-gray-500 text-[10px] uppercase tracking-[0.5em] font-black">STEP 4: SETUP HOW YOU RECEIVE CONTRIBUTIONS</p>
      </div>

      {showAutoFillPrompt && (
        <div className="bg-gold-500/10 border border-gold-500/30 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 shadow-2xl shadow-gold-500/10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gold-500 rounded-2xl flex items-center justify-center text-black shadow-[0_0_30px_rgba(212,175,55,0.4)] animate-bounce-slow">
              <i className="fas fa-magic text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white">Nova Intelligent Sync</h3>
              <p className="text-[10px] text-gold-500 font-black uppercase tracking-widest mt-1">Stored Vault credentials detected</p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={applyDefaults}
              className="flex-1 md:flex-none bg-gold-500 text-black font-black uppercase tracking-widest px-10 py-5 rounded-2xl text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Apply Vault Details
            </button>
            <button 
              onClick={() => setShowAutoFillPrompt(false)}
              className="text-zinc-500 font-black uppercase tracking-widest px-6 py-5 text-[9px] hover:text-white transition-colors"
            >
              Manual Entry
            </button>
          </div>
        </div>
      )}

      <div id="payment-forms" className="grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-500">
        {/* MOBILE PAYMENTS */}
        <section className="glass-card p-10 rounded-[3rem] border border-white/10 space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-mobile-alt text-6xl"></i>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <i className="fas fa-phone"></i>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Mobile Money</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest">PHONE NUMBER</label>
              <input 
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:border-gold-500 outline-none transition-all font-mono"
                placeholder="07XX XXX XXX"
                value={mobile.number}
                onChange={e => setMobile({...mobile, number: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest">REGISTERED NAME</label>
              <input 
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:border-gold-500 outline-none transition-all font-bold uppercase"
                placeholder="e.g. JOHN DOE"
                value={mobile.name}
                onChange={e => setMobile({...mobile, name: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* BANK TRANSFER */}
        <section className="glass-card p-10 rounded-[3rem] border border-white/10 space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-university text-6xl"></i>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <i className="fas fa-piggy-bank"></i>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Bank Transfer</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest">ACCOUNT NO</label>
                  <input 
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:border-gold-500 outline-none transition-all font-mono"
                    placeholder="0123456..."
                    value={bank.accountNo}
                    onChange={e => setBank({...bank, accountNo: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest">BANK NAME</label>
                  <input 
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:border-gold-500 outline-none transition-all"
                    placeholder="e.g. CRDB, NMB"
                    value={bank.bankName}
                    onChange={e => setBank({...bank, bankName: e.target.value})}
                  />
                </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest">ACCOUNT HOLDER NAME</label>
              <input 
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:border-gold-500 outline-none transition-all font-bold uppercase"
                placeholder="e.g. JOHN DOE"
                value={bank.name}
                onChange={e => setBank({...bank, name: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* LIPA NUMBER */}
        <section className="glass-card p-10 rounded-[3rem] border border-gold-500/20 space-y-8 relative overflow-hidden group col-span-1 md:col-span-2 shadow-[0_20px_40px_rgba(184,134,11,0.05)] bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.05)_0%,_transparent_50%)]">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <i className="fas fa-bolt text-gold-500 text-7xl"></i>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500">
                    <i className="fas fa-credit-card text-xl"></i>
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">Lipa Number</h2>
                    <p className="text-[10px] text-gold-500 font-bold uppercase tracking-widest mt-1">ENABLES "TAP TO PAY" FOR GUESTS</p>
                </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest">LIPA NO (MERCHANT/TILL)</label>
              <input 
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-8 py-6 focus:border-gold-500 outline-none transition-all font-mono text-xl text-gold-400"
                placeholder="55XX XX"
                value={lipa.number}
                onChange={e => setLipa({...lipa, number: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest">BUSINESS/DISPLAY NAME</label>
              <input 
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-8 py-6 focus:border-gold-500 outline-none transition-all font-bold text-xl uppercase"
                placeholder="e.g. JUMA EVENT"
                value={lipa.name}
                onChange={e => setLipa({...lipa, name: e.target.value})}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
          <div className="glass-card p-6 rounded-[2rem] flex items-center justify-between border-white/10 group cursor-pointer" onClick={() => setSaveToProfile(!saveToProfile)}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${saveToProfile ? 'bg-gold-500/20 border-gold-500 text-gold-500' : 'bg-white/5 border-white/10 text-zinc-600'}`}>
                <i className={`fas ${saveToProfile ? 'fa-check-circle' : 'fa-circle-notch'}`}></i>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest">Update Payment Vault</h4>
                <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-tighter mt-1">Save these details as my profile defaults for next time</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={saveToProfile} onChange={() => setSaveToProfile(!saveToProfile)} />
              <span className="slider"></span>
            </label>
          </div>

          <button 
              onClick={handleFinish}
              className="w-full nova-gradient text-black font-black uppercase tracking-[0.3em] py-8 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(184,134,11,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all text-sm haptic-press"
          >
              SAVE & FINISH EVENT SETUP
          </button>
      </div>
    </div>
  );
};

export default SetupPayments;