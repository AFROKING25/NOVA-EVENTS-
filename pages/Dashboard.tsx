
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getStore, STORE_UPDATE_EVENT } from '../data/store';
import { AppState, PaymentStatus } from '../types';

const Dashboard = () => {
  const [store, setStore] = useState<AppState>(getStore());
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PAID' | 'PLEDGES' | 'UNPAID'>('ALL');

  const refreshData = useCallback(() => {
    setIsSyncing(true);
    const freshData = getStore();
    setStore(freshData);
    setTimeout(() => setIsSyncing(false), 500);
  }, []);

  useEffect(() => {
    const handleStoreUpdate = () => refreshData();
    window.addEventListener(STORE_UPDATE_EVENT, handleStoreUpdate);
    return () => window.removeEventListener(STORE_UPDATE_EVENT, handleStoreUpdate);
  }, [refreshData]);

  const stats = useMemo(() => ({
    total: store.guests.length,
    contributed: store.guests.filter(g => g.paymentStatus === PaymentStatus.PAID).length,
    pledged: store.guests.filter(g => g.paymentStatus === PaymentStatus.PLEDGED).length,
    notPaid: store.guests.filter(g => g.paymentStatus === PaymentStatus.NOT_STARTED || g.paymentStatus === PaymentStatus.PAYMENT_PENDING).length
  }), [store.guests]);

  const filteredGuests = useMemo(() => {
    let list = store.guests;

    // Filter by Tab/Status
    switch (activeTab) {
      case 'PAID':
        list = list.filter(g => g.paymentStatus === PaymentStatus.PAID);
        break;
      case 'PLEDGES':
        list = list.filter(g => g.paymentStatus === PaymentStatus.PLEDGED);
        break;
      case 'UNPAID':
        list = list.filter(g => g.paymentStatus === PaymentStatus.NOT_STARTED || g.paymentStatus === PaymentStatus.PAYMENT_PENDING);
        break;
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(g => 
        g.name.toLowerCase().includes(q) || 
        g.phone.includes(q)
      );
    }

    return list;
  }, [store.guests, activeTab, searchQuery]);

  const tabs = [
    { id: 'ALL', label: 'ALL GUESTS' },
    { id: 'PAID', label: 'PAID' },
    { id: 'PLEDGES', label: 'PLEDGES' },
    { id: 'UNPAID', label: 'UNPAID' }
  ] as const;

  return (
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-500 pb-24">
      {/* Header Search */}
      <div className="relative group pt-4">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 text-xs">
          <i className="fas fa-search"></i>
        </div>
        <input 
          className="w-full bg-[#111] border border-white/5 rounded-2xl pl-12 pr-12 py-4 outline-none focus:border-gold-500/50 transition-all font-medium placeholder:text-zinc-700 text-xs" 
          placeholder="Search guests by name or phone" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs Selection */}
      <div className="flex gap-6 px-2 justify-center border-b border-white/5">
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-colors relative ${activeTab === tab.id ? 'text-white' : 'text-zinc-600'}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"></div>
            )}
          </button>
        ))}
      </div>

      {/* Summary Boxes - 4 Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-1">
        <button 
          onClick={() => setActiveTab('ALL')}
          className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 shadow-xl haptic-press transition-all ${activeTab === 'ALL' ? 'ring-2 ring-white/20' : 'opacity-80'} bg-[#1a1f26] text-white`}
        >
          <i className="fas fa-users text-lg"></i>
          <div className="text-center">
            <div className="text-[8px] font-black uppercase tracking-tighter">All Guests</div>
            <div className="text-xl font-black">{stats.total}</div>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('PAID')}
          className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 shadow-xl haptic-press transition-all ${activeTab === 'PAID' ? 'ring-2 ring-white/20' : 'opacity-80'} bg-[#cca43b] text-white`}
        >
          <i className="fas fa-user-check text-lg"></i>
          <div className="text-center">
            <div className="text-[8px] font-black uppercase tracking-tighter">Contributed</div>
            <div className="text-xl font-black">{stats.contributed}</div>
          </div>
        </button>
        
        <button 
          onClick={() => setActiveTab('PLEDGES')}
          className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 shadow-xl haptic-press transition-all ${activeTab === 'PLEDGES' ? 'ring-2 ring-white/20' : 'opacity-80'} bg-[#26c485] text-white`}
        >
          <i className="fas fa-heart text-lg"></i>
          <div className="text-center">
            <div className="text-[8px] font-black uppercase tracking-tighter">Pledged</div>
            <div className="text-xl font-black">{stats.pledged}</div>
          </div>
        </button>
        
        <button 
          onClick={() => setActiveTab('UNPAID')}
          className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 shadow-xl haptic-press transition-all ${activeTab === 'UNPAID' ? 'ring-2 ring-white/20' : 'opacity-80'} bg-[#ef4444] text-white`}
        >
          <i className="fas fa-phone-slash text-lg"></i>
          <div className="text-center">
            <div className="text-[8px] font-black uppercase tracking-tighter">Not Paid</div>
            <div className="text-xl font-black">{stats.notPaid}</div>
          </div>
        </button>
      </div>

      {/* Guest Register Label */}
      <div className="flex justify-between items-center px-4 pt-4">
          <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Guest Register</h3>
          <button className="text-[10px] font-black text-white uppercase tracking-tighter hover:text-gold-500 transition-colors">Bulk Actions</button>
      </div>

      {/* Main Action Button */}
      <div className="px-4">
        <button className="w-full bg-[#cca43b] py-5 rounded-2xl text-black font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(204,164,59,0.2)] text-[10px] haptic-press flex items-center justify-center gap-3">
           <i className="fas fa-paper-plane text-[10px]"></i>
           Send All Invitation Cards
        </button>
      </div>

      {/* Guest List Render */}
      <div className="space-y-2 px-2">
        {filteredGuests.length === 0 ? (
          <div className="text-center py-16 opacity-10">
             <i className="fas fa-users text-4xl mb-4"></i>
             <p className="text-[10px] font-black uppercase tracking-widest">No matching records found</p>
          </div>
        ) : (
          filteredGuests.map(guest => (
            <div key={guest.id} className="glass-card p-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.05] transition-colors cursor-pointer border border-white/5">
               <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-[11px] font-black uppercase text-gold-500">
                      {guest.name[0]}
                    </div>
                    {/* Status Dot */}
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                      guest.paymentStatus === PaymentStatus.PAID ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{guest.name}</div>
                    <div className="text-[9px] text-zinc-500 font-medium font-mono">{guest.phone}</div>
                    <div className={`text-[8px] font-black uppercase tracking-tighter mt-1 ${
                      guest.paymentStatus === PaymentStatus.PAID ? 'text-green-500' :
                      guest.paymentStatus === PaymentStatus.PLEDGED ? 'text-gold-500' :
                      'text-red-500'
                    }`}>
                      {guest.paymentStatus === PaymentStatus.PAID ? 'Confirmed Paid' : 
                       guest.paymentStatus === PaymentStatus.PLEDGED ? 'Pledge Recorded' : 
                       'Awaiting Contribution'}
                    </div>
                  </div>
               </div>
               <div className="text-zinc-800"><i className="fas fa-chevron-right text-xs"></i></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
