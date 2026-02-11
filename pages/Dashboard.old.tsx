
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getStore, STORE_UPDATE_EVENT } from '../data/store';
import { AppState, PaymentStatus } from '../types';

const Dashboard = () => {
  const [store, setStore] = useState<AppState>(getStore());
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'CONTRIBUTED' | 'PLEDGED' | 'UNPAID'>('ALL');

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
    contributed: store.guests.filter(g => g.paymentStatus === PaymentStatus.PAID).length,
    pledged: store.guests.filter(g => g.paymentStatus === PaymentStatus.PLEDGED).length,
    notPaid: store.guests.filter(g => g.paymentStatus === PaymentStatus.NOT_STARTED || g.paymentStatus === PaymentStatus.PAYMENT_PENDING).length
  }), [store.guests]);

  const filteredGuests = useMemo(() => {
    let list = store.guests;

    // Filter by Status
    switch (activeTab) {
      case 'CONTRIBUTED':
        list = list.filter(g => g.paymentStatus === PaymentStatus.PAID);
        break;
      case 'PLEDGED':
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
    { id: 'CONTRIBUTED', label: 'PAID' },
    { id: 'PLEDGED', label: 'PLEDGES' },
    { id: 'UNPAID', label: 'UNPAID' }
  ] as const;

  return (
    <div className="max-w-md mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-4xl font-black italic nova-serif">Dashboard</h1>
        {isSyncing && <i className="fas fa-circle-notch fa-spin text-gold-500 text-xs"></i>}
      </header>

      {/* Search Bar */}
      <div className="relative group">
        <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 text-xs transition-colors group-focus-within:text-gold-500"></i>
        <input 
          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-12 py-4 outline-none focus:border-gold-500/50 focus:bg-white/[0.05] transition-all font-medium placeholder:text-zinc-700 text-sm" 
          placeholder="Search guests by name or phone..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
          >
            <i className="fas fa-times-circle"></i>
          </button>
        )}
      </div>

      <div className="flex gap-8 border-b border-white/5 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors relative ${activeTab === tab.id ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white animate-in slide-in-from-left-2"></div>
            )}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={() => setActiveTab('CONTRIBUTED')}
          className={`btn-contributed aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 shadow-2xl haptic-press transition-all ${activeTab === 'CONTRIBUTED' ? 'ring-2 ring-gold-500 scale-105 z-10' : 'opacity-80 hover:opacity-100'}`}
        >
          <i className="fas fa-user text-xl"></i>
          <div className="text-center">
            <div className="text-[9px] font-black uppercase tracking-tighter">Contributed</div>
            <div className="text-xl font-black">{stats.contributed}</div>
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('PLEDGED')}
          className={`btn-pledged aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 shadow-2xl haptic-press transition-all ${activeTab === 'PLEDGED' ? 'ring-2 ring-green-500 scale-105 z-10' : 'opacity-80 hover:opacity-100'}`}
        >
          <i className="fas fa-heart text-xl"></i>
          <div className="text-center">
            <div className="text-[9px] font-black uppercase tracking-tighter">Pledged</div>
            <div className="text-xl font-black">{stats.pledged}</div>
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('UNPAID')}
          className={`btn-notpaid aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 shadow-2xl haptic-press transition-all ${activeTab === 'UNPAID' ? 'ring-2 ring-white/20 scale-105 z-10' : 'opacity-80 hover:opacity-100'}`}
        >
          <i className="fas fa-phone-slash text-xl opacity-60"></i>
          <div className="text-center">
            <div className="text-[9px] font-black uppercase tracking-tighter opacity-60">Not Paid</div>
            <div className="text-xl font-black">{stats.notPaid}</div>
          </div>
        </button>
      </div>

      <div className="flex justify-between items-center pt-4">
          <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Guest Register</h3>
          <button className="text-[10px] font-black text-white uppercase tracking-tighter hover:text-gold-500 transition-colors">Bulk Actions</button>
      </div>

      <div className="pt-2">
        <button className="w-full nova-gradient py-6 rounded-2xl text-black font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(212,175,55,0.3)] text-[10px] haptic-press flex items-center justify-center gap-3">
           <i className="fas fa-paper-plane text-[10px]"></i>
           Send All Invitation Cards
        </button>
      </div>

      {/* Guest Register List */}
      <div className="space-y-3 pt-4">
        {filteredGuests.length === 0 ? (
          <div className="text-center py-20 opacity-20">
             <i className="fas fa-users text-4xl mb-4"></i>
             <p className="text-[10px] font-black uppercase tracking-widest">No matching records found</p>
          </div>
        ) : (
          filteredGuests.map(guest => (
            <div key={guest.id} className="glass-card p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300 hover:bg-white/[0.05] transition-colors cursor-pointer">
               <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-[11px] font-black uppercase text-gold-500">
                    {guest.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{guest.name}</div>
                    <div className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${
                      guest.paymentStatus === PaymentStatus.PAID ? 'text-green-500' :
                      guest.paymentStatus === PaymentStatus.PLEDGED ? 'text-gold-500' :
                      'text-zinc-500'
                    }`}>
                      {guest.paymentStatus === PaymentStatus.PAID ? 'Confirmed Paid' : 
                       guest.paymentStatus === PaymentStatus.PLEDGED ? 'Ahadi Imewekwa' : 
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
