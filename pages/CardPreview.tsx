
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStore } from '../data/store';
import { Event } from '../types';

const CardPreview = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const store = getStore();
    const found = store.events.find(e => e.id === eventId);
    if (found) setEvent(found);
  }, [eventId]);

  if (!event || !event.cardDesign) return <div className="p-20 text-center uppercase tracking-widest font-black opacity-20">Event/Design Not Found</div>;

  const { cardDesign } = event;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black nova-text-gradient uppercase tracking-widest">Final Preview</h1>
        <p className="text-gray-500 text-[10px] uppercase tracking-[0.5em] font-black">STEP 3: REVIEW YOUR CARD LAYOUT</p>
      </div>

      <div className="relative group mx-auto max-w-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] rounded-[3rem] overflow-hidden border border-white/10">
        <div 
          className="relative w-full bg-[#111] overflow-hidden select-none"
          style={{ 
            aspectRatio: '1.414', 
            backgroundImage: `url(${cardDesign.backgroundImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Sample Name Render - Matches styling in editor */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-center overflow-hidden pointer-events-none"
            style={{ 
              left: `${cardDesign.namePosition.x}%`, 
              top: `${cardDesign.namePosition.y}%`, 
              width: `${cardDesign.namePosition.w}%`, 
              height: `${cardDesign.namePosition.h}%`
            }}
          >
            <span className="text-sm md:text-3xl font-serif font-bold text-gray-800 tracking-tight drop-shadow-sm whitespace-nowrap">
                Mrs. Sample Guest Name
            </span>
          </div>

          {/* Sample QR Render - High contrast for final check */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-white shadow-sm overflow-hidden pointer-events-none"
            style={{ 
              left: `${cardDesign.qrPosition.x}%`, 
              top: `${cardDesign.qrPosition.y}%`, 
              width: `${cardDesign.qrPosition.w}%`, 
              height: `${cardDesign.qrPosition.h}%`
            }}
          >
            <i className="fas fa-qrcode text-black text-4xl md:text-8xl opacity-90"></i>
          </div>
        </div>

        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 max-w-2xl mx-auto">
        <button 
            onClick={() => navigate(`/layout-editor/${eventId}`)}
            className="flex-1 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.3em] py-6 rounded-[2rem] hover:bg-white/10 transition-all text-[11px]"
        >
            <i className="fas fa-edit mr-3 text-gold-500"></i> Edit Layout
        </button>
        <button 
            onClick={() => navigate(`/setup-payments/${eventId}`)}
            className="flex-1 nova-gradient text-black font-black uppercase tracking-[0.3em] py-6 rounded-[2rem] shadow-2xl hover:scale-[1.03] transition-all text-[11px]"
        >
            Looks Good, Next Step <i className="fas fa-chevron-right ml-3"></i>
        </button>
      </div>

      <div className="text-center pt-10">
         <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.4em] mb-4">
            NOVA PREVIEW SYSTEM • ACCURATE TO REAL SIZE
         </p>
         <div className="w-full max-w-[100px] h-[1px] bg-white/5 mx-auto"></div>
      </div>
    </div>
  );
};

export default CardPreview;
