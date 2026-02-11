import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStore } from '../data/store';
import { Event } from '../types';

const DesignCard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [format, setFormat] = useState<'PORTRAIT' | 'LANDSCAPE'>('LANDSCAPE');

  useEffect(() => {
    const store = getStore();
    const found = store.events.find(e => e.id === eventId);
    if (found) setEvent(found);
  }, [eventId]);

  const handleNext = () => {
    navigate(`/layout-editor/${eventId}`);
  };

  if (!event) return <div className="p-20 text-center opacity-20 uppercase tracking-widest font-black">Event Not Found</div>;

  return (
    <div className="max-w-md mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center gap-4 py-4">
        <button onClick={() => navigate('/')} className="text-zinc-500 hover:text-white transition-colors">
          <i className="fas fa-arrow-left text-lg"></i>
        </button>
        <h1 className="text-2xl font-black italic nova-serif">Card Design</h1>
      </header>

      <div className="space-y-6">
        <div className="text-center">
            <h2 className="text-xl font-black uppercase tracking-tight">Choose Format</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-2">Select the orientation for your printed cards</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => setFormat('PORTRAIT')}
                className={`p-6 rounded-[2rem] border transition-all haptic-press flex flex-col items-center gap-4 ${format === 'PORTRAIT' ? 'bg-gold-500/10 border-gold-500 shadow-xl shadow-gold-500/10' : 'bg-zinc-900 border-white/5 opacity-50'}`}
            >
                <div className="w-16 h-20 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center">
                    <i className="fas fa-image opacity-20"></i>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Portrait</span>
            </button>
            <button 
                onClick={() => setFormat('LANDSCAPE')}
                className={`p-6 rounded-[2rem] border transition-all haptic-press flex flex-col items-center gap-4 ${format === 'LANDSCAPE' ? 'bg-gold-500/10 border-gold-500 shadow-xl shadow-gold-500/10' : 'bg-zinc-900 border-white/5 opacity-50'}`}
            >
                <div className="w-20 h-16 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center">
                    <i className="fas fa-image opacity-20"></i>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Landscape</span>
            </button>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
                <i className="fas fa-info-circle text-gold-500 text-sm"></i>
                <h4 className="text-[11px] font-black uppercase tracking-widest">Format Advice</h4>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                Most Tanzanian weddings use Landscape cards for A5 sized envelopes. Choose portrait if you're designing for a modern vertical smartphone-first invitation.
            </p>
        </div>

        <div className="pt-6">
            <button 
                onClick={handleNext}
                className="w-full nova-gradient py-6 rounded-2xl text-black font-black uppercase tracking-[0.2em] shadow-xl text-[10px] haptic-press"
            >
                Next Step
            </button>
            <p className="text-center text-[8px] text-zinc-600 font-bold uppercase tracking-[0.4em] mt-6">
                PRECISION LAYOUT EDITOR LOADS NEXT
            </p>
        </div>
      </div>
    </div>
  );
};

export default DesignCard;