
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getStore, updateGuestStatus } from '../data/store';
import { Event, Guest, PaymentStatus, PaymentMethod } from '../types';

const ContributionPage = () => {
  const { eventId, guestId } = useParams<{ eventId: string; guestId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [view, setView] = useState<'CHOICE' | 'SUCCESS'>('CHOICE');
  const [isLipaSasa, setIsLipaSasa] = useState(true);

  useEffect(() => {
    const store = getStore();
    const e = store.events.find(ev => ev.id === eventId);
    const g = store.guests.find(gu => gu.id === guestId);
    if (e && g) {
      setEvent(e);
      setGuest(g);
      if (g.paymentStatus === PaymentStatus.PAID) setView('SUCCESS');
    }
  }, [eventId, guestId]);

  if (!event || !guest) return <div className="p-20 text-center text-xs uppercase font-black tracking-widest opacity-20">Link Invalid</div>;

  const handleAction = () => {
    if (isLipaSasa) {
      // Simulate Payment
      updateGuestStatus(guest.id, { paymentStatus: PaymentStatus.PAID });
      setView('SUCCESS');
    } else {
      updateGuestStatus(guest.id, { paymentStatus: PaymentStatus.PLEDGED });
      alert('Ahadi imepokelewa! Asante.');
    }
  };

  if (view === 'SUCCESS') {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <div className="w-20 h-20 bg-gold-500 rounded-full flex items-center justify-center mx-auto text-black text-4xl shadow-2xl">
          <i className="fas fa-check"></i>
        </div>
        <h1 className="text-2xl font-black italic nova-serif">Asante Sana!</h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Malipo Yamepokelewa</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-8 animate-in fade-in duration-500 py-6">
      <header className="flex justify-between items-center px-2">
        <h1 className="text-xl font-black italic nova-serif">Dashboard</h1>
        <i className="fas fa-share-alt text-gray-600"></i>
      </header>

      {/* Invitation Card Preview (Matches right screen in image) */}
      <div className="relative group mx-auto w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center flex flex-col items-center justify-center p-8 text-center"
          style={{ backgroundImage: `url(${event.cardDesign?.backgroundImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800'})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 space-y-4">
            <h2 className="text-gold-500 text-sm font-black uppercase tracking-[0.3em]">Invitation</h2>
            <div className="text-3xl font-black italic nova-serif text-white">{guest.name}</div>
            <p className="text-xs text-gray-300 font-medium tracking-wide">Mnakaribishwa kwny sherehe ya {event.name}</p>
          </div>
          {/* QR Component */}
          <div className="absolute bottom-6 right-6 w-12 h-12 bg-white p-1 rounded-lg">
            <i className="fas fa-qrcode text-black text-3xl"></i>
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="flex justify-between items-center px-4">
        <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Guest Contribution</div>
        <div className="text-lg font-black text-white">{guest.pledgeAmount.toLocaleString()} TZS</div>
      </div>

      {/* Toggle Row (Matches center screen toggle logic) */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between mx-2 border-white/5">
        <div className="flex gap-4 items-center">
            <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${isLipaSasa ? 'text-gold-500' : 'text-gray-600'}`}>Lipa Sasa</span>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${!isLipaSasa ? 'text-gold-500' : 'text-gray-600'}`}>Ahadi Tu</span>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" checked={!isLipaSasa} onChange={() => setIsLipaSasa(!isLipaSasa)} />
          <span className="slider"></span>
        </label>
      </div>

      {/* Action Button */}
      <div className="px-2">
        <button 
          onClick={handleAction}
          className="w-full nova-gradient py-6 rounded-2xl text-black font-black uppercase tracking-[0.2em] shadow-2xl text-xs"
        >
          {isLipaSasa ? 'Kamilisha Malipo' : 'Weka Ahadi Yako'}
        </button>
      </div>

      {/* Maps View Thumbnails (Matches right screen in image) */}
      <div className="grid grid-cols-2 gap-3 px-2">
        <div className="glass-card rounded-2xl overflow-hidden group">
          <div className="h-20 bg-zinc-900 flex items-center justify-center border-b border-white/5">
            <i className="fas fa-church text-gold-500/50 text-xl group-hover:scale-125 transition-transform"></i>
          </div>
          <div className="p-3">
            <div className="text-[9px] font-black uppercase tracking-widest">Kanisa</div>
            <div className="text-[7px] text-gray-600 font-bold uppercase mt-1">Open in Google Maps</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl overflow-hidden group">
          <div className="h-20 bg-zinc-900 flex items-center justify-center border-b border-white/5">
            <i className="fas fa-glass-cheers text-gold-500/50 text-xl group-hover:scale-125 transition-transform"></i>
          </div>
          <div className="p-3">
            <div className="text-[9px] font-black uppercase tracking-widest">Reception</div>
            <div className="text-[7px] text-gray-600 font-bold uppercase mt-1">Open in Google Maps</div>
          </div>
        </div>
      </div>

      <footer className="text-center pb-12 pt-4">
        <p className="text-[8px] text-gray-700 font-black uppercase tracking-[0.5em]">Powered by Nova Events</p>
      </footer>
    </div>
  );
};

export default ContributionPage;
