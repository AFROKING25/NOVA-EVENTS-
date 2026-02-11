import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile, getStore } from '../data/store';
import { User, PaymentDetails } from '../types';

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const Profile = ({ user, onUpdateUser }: ProfileProps) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'MAIN' | 'ACCOUNT' | 'DISCOVERY' | 'SUBSCRIPTION' | 'SECURITY' | 'PAYMENTS'>('MAIN');
  const [isOnline, setIsOnline] = useState(true);
  const [incognito, setIncognito] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  // Default Payment Form State
  const [defaults, setDefaults] = useState<PaymentDetails>(user.defaults || {});

  const stats = {
    events: getStore().events.filter(e => e.ownerId === user.id).length,
    impact: getStore().guests.filter(g => getStore().events.find(e => e.id === g.eventId && e.ownerId === user.id)).length
  };

  const handleSaveDefaults = () => {
    const updatedUser = updateProfile(user.id, { defaults });
    if (updatedUser) {
      onUpdateUser(updatedUser);
      alert("Payment Vault updated successfully!");
      setActiveSection('MAIN');
    }
  };

  const SettingItem = ({ icon, label, sublabel, color = "text-white", onClick, trailing, danger }: any) => (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-5 hover:bg-white/[0.02] cursor-pointer transition-colors border-b border-white/[0.03] haptic-press ${danger ? 'text-red-500' : ''}`}
    >
      <div className="flex items-center gap-5">
        <div className={`w-12 h-12 rounded-2xl bg-zinc-900/80 flex items-center justify-center border border-white/5 ${danger ? 'text-red-500' : color}`}>
          <i className={`fas ${icon} text-base`}></i>
        </div>
        <div className="flex flex-col">
          <div className={`text-[14px] font-bold tracking-tight ${danger ? 'text-red-500' : 'text-white'}`}>{label}</div>
          {sublabel && <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter mt-0.5">{sublabel}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {trailing ? trailing : <i className="fas fa-chevron-right text-[10px] text-zinc-800"></i>}
      </div>
    </div>
  );

  const GroupHeader = ({ title }: { title: string }) => (
    <div className="px-6 py-5 mt-4">
      <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.25em]">{title}</h3>
    </div>
  );

  if (activeSection === 'PAYMENTS') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-black animate-in slide-in-from-right-8 duration-300 pb-32">
         <header className="sticky top-0 z-[100] bg-black/90 backdrop-blur-2xl px-6 py-7 border-b border-white/5 flex items-center gap-5">
            <button onClick={() => setActiveSection('MAIN')} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center haptic-press border border-white/5">
              <i className="fas fa-arrow-left text-xs"></i>
            </button>
            <h1 className="text-xl font-bold italic nova-serif text-gold-500">Payment Vault</h1>
         </header>
         
         <div className="p-6 space-y-8">
            <div className="space-y-4">
              <GroupHeader title="MOBILE MONEY DEFAULT" />
              <div className="glass-card p-6 rounded-3xl space-y-4">
                <input 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono"
                  placeholder="Phone Number (07XX...)"
                  value={defaults.mobile?.number || ''}
                  onChange={e => setDefaults({...defaults, mobile: { ...defaults.mobile, number: e.target.value, name: defaults.mobile?.name || '' }})}
                />
                <input 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase"
                  placeholder="Registered Name"
                  value={defaults.mobile?.name || ''}
                  onChange={e => setDefaults({...defaults, mobile: { ...defaults.mobile, name: e.target.value, number: defaults.mobile?.number || '' }})}
                />
              </div>

              <GroupHeader title="LIPA NO. (MERCHANT)" />
              <div className="glass-card p-6 rounded-3xl space-y-4">
                <input 
                  className="w-full bg-black/40 border border-gold-500/20 rounded-xl px-4 py-3 text-xs font-mono text-gold-500"
                  placeholder="Lipa Number (55XX...)"
                  value={defaults.lipa?.number || ''}
                  onChange={e => setDefaults({...defaults, lipa: { ...defaults.lipa, number: e.target.value, name: defaults.lipa?.name || '' }})}
                />
              </div>

              <button 
                onClick={handleSaveDefaults}
                className="w-full nova-gradient py-5 rounded-2xl text-black font-black uppercase tracking-widest text-[11px] shadow-xl mt-6 haptic-press"
              >
                Save Vault Details
              </button>
            </div>
         </div>
      </div>
    );
  }

  if (activeSection !== 'MAIN') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-black animate-in slide-in-from-right-8 duration-300 pb-32">
         <header className="sticky top-0 z-[100] bg-black/90 backdrop-blur-2xl px-6 py-7 border-b border-white/5 flex items-center gap-5">
            <button onClick={() => setActiveSection('MAIN')} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center haptic-press border border-white/5">
              <i className="fas fa-arrow-left text-xs"></i>
            </button>
            <h1 className="text-xl font-bold italic nova-serif">Account Center</h1>
         </header>
         
         <div className="mt-2">
            {activeSection === 'ACCOUNT' && (
              <div className="space-y-1">
                <GroupHeader title="IDENTITY & CONTACT" />
                <SettingItem icon="fa-user" label="Name" sublabel={user.name || "GOOGLE USER"} />
                <SettingItem icon="fa-at" label="Email" sublabel={user.email || "SOCIAL@GOOGLE.COM"} />
                <SettingItem icon="fa-phone" label="Phone Number" sublabel={user.phone || 'NOT SET'} />
                
                <GroupHeader title="NOVA BRANDING" />
                <SettingItem icon="fa-image" label="Profile Banner" sublabel="CUSTOM BACKGROUND ACTIVE" />
                <SettingItem icon="fa-camera" label="Avatar" sublabel="TAP TO UPDATE PHOTO" />
              </div>
            )}

            {activeSection === 'DISCOVERY' && (
              <div className="space-y-1">
                <GroupHeader title="MATCHING PREFERENCES" />
                <SettingItem icon="fa-search-location" label="Location Range" sublabel="WITHIN 100KM" />
                <SettingItem 
                  icon="fa-ghost" 
                  label="Ghost Mode" 
                  sublabel="INVISIBLE TO NEARBY PUBLIC EVENTS"
                  trailing={
                    <label className="ios-toggle">
                      <input type="checkbox" checked={incognito} onChange={() => setIncognito(!incognito)} />
                      <span className="ios-slider"></span>
                    </label>
                  }
                />
                <GroupHeader title="SYSTEM ACTIVITY" />
                <SettingItem icon="fa-history" label="Event History" sublabel="VIEW PAST CONTRIBUTIONS" />
                <SettingItem icon="fa-chart-line" label="Usage Analytics" sublabel="OPTIMIZE PERFORMANCE" />
              </div>
            )}

            {activeSection === 'SECURITY' && (
              <div className="space-y-1">
                <GroupHeader title="ACCESS PROTOCOL" />
                <SettingItem icon="fa-key" label="Password" sublabel="LAST UPDATED 3 MONTHS AGO" />
                <SettingItem icon="fa-shield-alt" label="Two-Factor" sublabel="SECURED VIA SMS" />
                
                <GroupHeader title="DATA MANAGEMENT" />
                <SettingItem icon="fa-download" label="Export Vault Data" sublabel="DOWNLOAD ACTIVITY LOG" />
                
                <GroupHeader title="DANGER ZONE" />
                <SettingItem 
                  icon="fa-trash-alt" 
                  label="Delete Account" 
                  danger 
                  sublabel="PERMANENTLY REMOVE DATA"
                  onClick={() => { if(window.confirm("Are you sure? This cannot be undone.")) alert("Account deletion requested."); }}
                />
              </div>
            )}

            {activeSection === 'SUBSCRIPTION' && (
              <div className="space-y-1">
                <GroupHeader title="TIER MANAGEMENT" />
                <SettingItem icon="fa-crown" label="Nova Premium" sublabel="CURRENT STATUS: PLATINUM" color="text-gold-500" />
                <SettingItem icon="fa-gem" label="Exclusive Perks" sublabel="VIEW ALL FEATURES" />
                <SettingItem icon="fa-receipt" label="Billing History" sublabel="MANAGE INVOICES" />
              </div>
            )}
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-32 animate-in fade-in duration-500">
      {/* Vault Header with Settings Button */}
      <div className="relative pt-12 pb-10 px-6">
        <button 
          onClick={() => setActiveSection('ACCOUNT')}
          className="absolute top-6 right-6 w-12 h-12 bg-zinc-900/60 rounded-2xl flex items-center justify-center border border-white/5 haptic-press hover:bg-white/10 transition-all z-20 shadow-lg"
        >
          <i className="fas fa-cog text-zinc-400 text-xl"></i>
        </button>

        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-full p-1.5 nova-gradient mx-auto shadow-[0_20px_50px_rgba(212,175,55,0.4)]">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-4xl font-black uppercase tracking-tighter italic border-4 border-black">
                {user.name?.[0] || 'U'}
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 border-4 border-black rounded-full shadow-lg"></div>
          </div>
          
          <div className="pt-2">
            <h2 className="text-3xl font-black italic nova-serif tracking-tight">{user.name}</h2>
            <div className="flex items-center justify-center gap-2 text-gold-500 text-[10px] font-black uppercase tracking-[0.25em] mt-3">
              <i className="fas fa-crown text-[8px]"></i> Platinum Architect
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-10">
           <div className="glass-card p-6 rounded-[2rem] text-center border-white/10 shadow-xl">
             <div className="text-2xl font-black italic">{stats.events}</div>
             <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Events Hosted</div>
           </div>
           <div className="glass-card p-6 rounded-[2rem] text-center border-white/10 shadow-xl">
             <div className="text-2xl font-black italic">{stats.impact}</div>
             <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Global Impact</div>
           </div>
        </div>
      </div>

      <div className="bg-[#080808] border border-white/5 rounded-[2.8rem] overflow-hidden mx-3 shadow-2xl">
        <GroupHeader title="FINANCIAL VAULT" />
        <SettingItem 
          icon="fa-wallet" 
          label="Default Payments" 
          sublabel="SETUP MOBILE & BANK DEFAULTS" 
          color="text-gold-500" 
          onClick={() => setActiveSection('PAYMENTS')} 
        />

        <GroupHeader title="DISCOVERY & SETTINGS" />
        <SettingItem 
          icon="fa-user-cog" 
          label="Personal Center" 
          sublabel="AVATAR, BIO, SOCIAL LINKS" 
          color="text-blue-500" 
          onClick={() => setActiveSection('ACCOUNT')} 
        />
        <SettingItem 
          icon="fa-compass" 
          label="Discovery Mode" 
          sublabel="RANGE, PRIVACY, VISIBILITY" 
          color="text-purple-500" 
          onClick={() => setActiveSection('DISCOVERY')} 
        />
        <SettingItem 
          icon="fa-fingerprint" 
          label="Security & Privacy" 
          sublabel="2FA, LOGIN HISTORY, BLOCKS" 
          color="text-green-500" 
          onClick={() => setActiveSection('SECURITY')} 
        />

        <GroupHeader title="SYSTEM CONFIGURATION" />
        <SettingItem 
          icon="fa-moon" 
          label="Online Status" 
          sublabel="VISIBLE TO INVITEES"
          trailing={
            <label className="ios-toggle">
              <input type="checkbox" checked={isOnline} onChange={() => setIsOnline(!isOnline)} />
              <span className="ios-slider"></span>
            </label>
          }
        />
        <SettingItem 
          icon="fa-vibration" 
          label="Haptic Feedback" 
          sublabel="TACTILE INTERACTIONS"
          trailing={
            <label className="ios-toggle">
              <input type="checkbox" checked={hapticFeedback} onChange={() => setHapticFeedback(!hapticFeedback)} />
              <span className="ios-slider"></span>
            </label>
          }
        />
        <SettingItem icon="fa-language" label="Language" sublabel="KISWAHILI (DEFAULT)" color="text-yellow-600" />

        <GroupHeader title="NOVA HUB" />
        <SettingItem icon="fa-question-circle" label="Help & Support" />
        <SettingItem icon="fa-file-contract" label="Terms of Service" />
        <SettingItem icon="fa-sign-out-alt" label="Log Out" danger onClick={() => navigate('/auth')} />
      </div>

      <div className="mt-16 mb-8 text-center opacity-30">
        <div className="w-12 h-1 nova-gradient mx-auto mb-6 rounded-full opacity-40"></div>
        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.6em]">
          NOVA ARCHITECTURE V3.1.0
        </p>
      </div>
    </div>
  );
};

export default Profile;