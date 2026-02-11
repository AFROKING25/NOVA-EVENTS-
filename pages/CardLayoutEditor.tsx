import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStore, saveStore } from '../data/store';
import { Event } from '../types';

const CardLayoutEditor = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(1.414);
  
  // Positions and Sizes in percentages (0-100)
  const [nameData, setNameData] = useState({ x: 50, y: 50, w: 25, h: 8 });
  const [qrData, setQrData] = useState({ x: 50, y: 75, w: 15, h: 15 });
  
  const [activeElement, setActiveElement] = useState<'NAME' | 'QR' | null>(null);
  const [activeAction, setActiveAction] = useState<'DRAG' | 'RESIZE' | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startDragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const store = getStore();
    const found = store.events.find(e => e.id === eventId);
    if (found) {
      setEvent(found);
      if (found.cardDesign?.backgroundImage) {
        setImage(found.cardDesign.backgroundImage);
        if (found.cardDesign.namePosition) setNameData(found.cardDesign.namePosition);
        if (found.cardDesign.qrPosition) setQrData(found.cardDesign.qrPosition);
        
        const img = new Image();
        img.onload = () => setAspectRatio(img.width / img.height);
        img.src = found.cardDesign.backgroundImage;
      }
    }
  }, [eventId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setImage(dataUrl);
        const img = new Image();
        img.onload = () => setAspectRatio(img.width / img.height);
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent, element: 'NAME' | 'QR', action: 'DRAG' | 'RESIZE') => {
    e.stopPropagation();
    setActiveElement(element);
    setActiveAction(action);
    
    if (containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      
      const target = element === 'NAME' ? nameData : qrData;
      
      if (action === 'DRAG') {
        const xPercent = ((clientX - container.left) / container.width) * 100;
        const yPercent = ((clientY - container.top) / container.height) * 100;
        startDragOffset.current = {
          x: xPercent - target.x,
          y: yPercent - target.y
        };
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!activeElement || !activeAction || !containerRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const xPercent = ((clientX - container.left) / container.width) * 100;
    const yPercent = ((clientY - container.top) / container.height) * 100;

    const setter = activeElement === 'NAME' ? setNameData : setQrData;
    const current = activeElement === 'NAME' ? nameData : qrData;

    if (activeAction === 'DRAG') {
      const newX = Math.max(0, Math.min(100, xPercent - startDragOffset.current.x));
      const newY = Math.max(0, Math.min(100, yPercent - startDragOffset.current.y));
      setter({ ...current, x: newX, y: newY });
    } else if (activeAction === 'RESIZE') {
      const halfW = Math.abs(xPercent - current.x);
      const halfH = Math.abs(yPercent - current.y);
      setter({ 
        ...current, 
        w: Math.max(2, halfW * 2), 
        h: Math.max(2, halfH * 2) 
      });
    }
  };

  const stopAction = () => {
    setActiveElement(null);
    setActiveAction(null);
  };

  const handleManualChange = (element: 'NAME' | 'QR', field: 'x' | 'y' | 'w' | 'h', value: number) => {
    const setter = element === 'NAME' ? setNameData : setQrData;
    const current = element === 'NAME' ? nameData : qrData;
    setter({ ...current, [field]: value });
  };

  const handleSaveAndContinue = () => {
    if (!event) return;
    const store = getStore();
    const idx = store.events.findIndex(e => e.id === eventId);
    if (idx !== -1) {
      store.events[idx].cardDesign = {
        backgroundImage: image || undefined,
        namePosition: nameData,
        qrPosition: qrData
      };
      saveStore(store);
      navigate(`/card-preview/${eventId}`);
    }
  };

  if (!event) return (
    <div className="p-20 text-center space-y-6">
        <i className="fas fa-exclamation-triangle text-4xl text-gold-500/20"></i>
        <h1 className="text-xl font-black uppercase tracking-widest opacity-30">Event not found in system</h1>
        <button onClick={() => navigate('/create')} className="nova-gradient px-8 py-4 rounded-full text-black font-black uppercase tracking-widest text-[10px]">
            Start Over
        </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in pb-20 px-2">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/design-card/${eventId}`)} className="text-zinc-500 hover:text-white transition-colors">
              <i className="fas fa-arrow-left text-lg"></i>
            </button>
            <h1 className="text-2xl font-black italic nova-serif tracking-tight">Layout Editor</h1>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full">
            <i className="fas fa-bolt text-[10px] text-gold-500"></i>
            <span className="text-[9px] font-black uppercase tracking-widest text-gold-500">Precision Calibrator Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div 
            ref={containerRef}
            className={`relative w-full bg-[#080808] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl select-none mx-auto transition-all ${!image ? 'aspect-video' : ''}`}
            style={image ? { 
                aspectRatio: `${aspectRatio}`,
                maxHeight: '75vh'
            } : {}}
            onMouseMove={handlePointerMove}
            onMouseUp={stopAction}
            onMouseLeave={stopAction}
            onTouchMove={handlePointerMove}
            onTouchEnd={stopAction}
          >
            {image ? (
              <img 
                src={image} 
                alt="Card Preview" 
                className="w-full h-full object-contain pointer-events-none" 
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-800 p-10 text-center bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)]">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/5 animate-pulse">
                  <i className="fas fa-cloud-upload-alt text-4xl text-gold-500/40"></i>
                </div>
                <h3 className="text-xl font-black italic nova-serif text-white mb-2">Upload Invitation Base</h3>
                <p className="text-[10px] font-black text-zinc-500 tracking-[0.4em] uppercase mb-10">JPEG OR PNG • HIGH RESOLUTION RECOMMENDED</p>
                <button onClick={() => document.getElementById('template-upload')?.click()} className="nova-gradient px-12 py-5 rounded-full text-black font-black uppercase tracking-widest text-[11px] haptic-press shadow-[0_20px_40px_rgba(212,175,55,0.3)]">
                    SELECT CARD TEMPLATE
                </button>
              </div>
            )}

            {image && (
                <>
                {/* Draggable & Resizable Name Box */}
                <div 
                    className={`absolute -translate-x-1/2 -translate-y-1/2 border-2 rounded-xl transition-all shadow-2xl cursor-grab active:cursor-grabbing flex items-center justify-center ${activeElement === 'NAME' ? 'border-gold-500 bg-gold-500/30 z-20 scale-105' : 'border-white/10 bg-black/40 text-white z-10'}`}
                    style={{ 
                        left: `${nameData.x}%`, 
                        top: `${nameData.y}%`, 
                        width: `${nameData.w}%`, 
                        height: `${nameData.h}%` 
                    }}
                    onMouseDown={(e) => handlePointerDown(e, 'NAME', 'DRAG')}
                    onTouchStart={(e) => handlePointerDown(e, 'NAME', 'DRAG')}
                >
                    <div className="flex flex-col items-center justify-center text-center p-1 overflow-hidden pointer-events-none">
                        <span className="text-[7px] font-black uppercase tracking-widest text-gold-500 mb-1">GUEST NAME SLOT</span>
                    </div>
                    {/* Resize Handle */}
                    <div 
                        className="absolute bottom-0 right-0 w-8 h-8 bg-gold-500 rounded-tl-xl rounded-br-xl flex items-center justify-center cursor-nwse-resize active:scale-90 shadow-lg"
                        onMouseDown={(e) => handlePointerDown(e, 'NAME', 'RESIZE')}
                        onTouchStart={(e) => handlePointerDown(e, 'NAME', 'RESIZE')}
                    >
                        <i className="fas fa-expand-alt text-[10px] text-black"></i>
                    </div>
                </div>

                {/* Draggable & Resizable QR Slot */}
                <div 
                    className={`absolute -translate-x-1/2 -translate-y-1/2 border-2 rounded-2xl transition-all shadow-2xl cursor-grab active:cursor-grabbing flex flex-col items-center justify-center ${activeElement === 'QR' ? 'border-gold-500 bg-gold-500/30 z-20 scale-105' : 'border-white/10 bg-black/40 text-white z-10'}`}
                    style={{ 
                        left: `${qrData.x}%`, 
                        top: `${qrData.y}%`, 
                        width: `${qrData.w}%`, 
                        height: `${qrData.h}%` 
                    }}
                    onMouseDown={(e) => handlePointerDown(e, 'QR', 'DRAG')}
                    onTouchStart={(e) => handlePointerDown(e, 'QR', 'DRAG')}
                >
                    <i className="fas fa-qrcode text-2xl opacity-20 mb-1 pointer-events-none"></i>
                    <span className="text-[7px] font-black uppercase tracking-widest text-gold-500 pointer-events-none">QR SLOT</span>
                    {/* Resize Handle */}
                    <div 
                        className="absolute bottom-0 right-0 w-8 h-8 bg-gold-500 rounded-tl-xl rounded-br-2xl flex items-center justify-center cursor-nwse-resize active:scale-90 shadow-lg"
                        onMouseDown={(e) => handlePointerDown(e, 'QR', 'RESIZE')}
                        onTouchStart={(e) => handlePointerDown(e, 'QR', 'RESIZE')}
                    >
                        <i className="fas fa-expand-alt text-[10px] text-black"></i>
                    </div>
                </div>
                </>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 glass-card rounded-[2rem] flex items-start gap-4 border border-white/5 bg-zinc-900/40">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500">
                    <i className="fas fa-mouse-pointer text-sm"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-widest">DRAG ELEMENTS</h4>
                    <p className="text-[9px] text-zinc-500 mt-2 leading-relaxed uppercase tracking-wider font-bold">
                        Directly move the Name and QR slots to the exact printed area of your card.
                    </p>
                  </div>
              </div>
              <div className="p-6 glass-card rounded-[2rem] flex items-start gap-4 border border-white/5 bg-zinc-900/40">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500">
                    <i className="fas fa-expand text-sm"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-widest">SCALE SIZE</h4>
                    <p className="text-[9px] text-zinc-500 mt-2 leading-relaxed uppercase tracking-wider font-bold">
                        Use the bottom-right handle of each slot to resize them to fit your design perfectly.
                    </p>
                  </div>
              </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 space-y-8 sticky top-24 shadow-2xl bg-zinc-950/80 backdrop-blur-3xl">
            <div>
                <h3 className="text-sm font-black tracking-[0.2em] uppercase text-zinc-500">Configuration</h3>
                <div className="w-8 h-1 nova-gradient mt-3 rounded-full"></div>
            </div>
            
            <div className="space-y-4">
              <label className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em] block">Base Template</label>
              <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl py-8 hover:border-gold-500/50 transition-all cursor-pointer group bg-black/40">
                <i className="fas fa-file-image text-xl text-zinc-700 group-hover:text-gold-500 mb-2 transition-colors"></i>
                <span className="text-[8px] font-black text-zinc-600 group-hover:text-white uppercase tracking-widest transition-colors">{image ? 'Update Template' : 'Choose File'}</span>
                <input id="template-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>

            {/* Manual Fields: Name Slot */}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] text-gold-500 font-black uppercase tracking-[0.3em]">NAME SLOT (%)</label>
                <i className="fas fa-font text-xs text-zinc-800"></i>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                   <span className="text-[8px] font-black text-zinc-600 uppercase">POS X</span>
                   <input type="number" className="w-full bg-black border border-white/5 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-gold-500" value={Math.round(nameData.x)} onChange={(e) => handleManualChange('NAME', 'x', parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                   <span className="text-[8px] font-black text-zinc-600 uppercase">POS Y</span>
                   <input type="number" className="w-full bg-black border border-white/5 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-gold-500" value={Math.round(nameData.y)} onChange={(e) => handleManualChange('NAME', 'y', parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </div>

            {/* Manual Fields: QR Slot */}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] text-gold-500 font-black uppercase tracking-[0.3em]">QR SLOT (%)</label>
                <i className="fas fa-qrcode text-xs text-zinc-800"></i>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                   <span className="text-[8px] font-black text-zinc-600 uppercase">POS X</span>
                   <input type="number" className="w-full bg-black border border-white/5 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-gold-500" value={Math.round(qrData.x)} onChange={(e) => handleManualChange('QR', 'x', parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                   <span className="text-[8px] font-black text-zinc-600 uppercase">POS Y</span>
                   <input type="number" className="w-full bg-black border border-white/5 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-gold-500" value={Math.round(qrData.y)} onChange={(e) => handleManualChange('QR', 'y', parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-4">
                <button 
                    onClick={handleSaveAndContinue}
                    disabled={!image}
                    className="w-full nova-gradient text-black font-black uppercase tracking-[0.2em] py-6 rounded-[2rem] shadow-xl haptic-press text-[11px] disabled:opacity-30 disabled:grayscale transition-all"
                >
                    PROCEED TO PREVIEW
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardLayoutEditor;