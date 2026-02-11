
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStore, saveStore } from '../data/store';
import { Event, CustomTemplate, TemplateType } from '../types';

const ManageTemplates = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [templates, setTemplates] = useState<CustomTemplate[]>([
    { type: 'INVITATION', subject: 'Invitation to {event_name}', body: 'Hello {guest_name}, you are cordially invited to {event_name}.' },
    { type: 'REMINDER', subject: 'Friendly Reminder: {event_name}', body: 'Hi {guest_name}, just a quick reminder about your contribution for {event_name}.' },
    { type: 'THANK_YOU', subject: 'Thank You for Joining {event_name}', body: 'Dear {guest_name}, thank you so much for your support and for being part of {event_name}.' },
  ]);

  useEffect(() => {
    const store = getStore();
    const found = store.events.find(e => e.id === eventId);
    if (found) {
      setEvent(found);
      if (found.customTemplates && found.customTemplates.length > 0) {
        setTemplates(found.customTemplates);
      }
    }
  }, [eventId]);

  const handleUpdateTemplate = (type: TemplateType, field: 'subject' | 'body', value: string) => {
    setTemplates(prev => prev.map(t => t.type === type ? { ...t, [field]: value } : t));
  };

  const handleSave = () => {
    if (!event) return;
    const store = getStore();
    const idx = store.events.findIndex(e => e.id === eventId);
    if (idx !== -1) {
      store.events[idx].customTemplates = templates;
      saveStore(store);
      alert("Templates saved successfully!");
      navigate('/');
    }
  };

  if (!event) return <div className="p-20 text-center opacity-20 uppercase font-black tracking-widest">Event Not Found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black nova-text-gradient uppercase tracking-widest">Message Templates</h1>
        <p className="text-gray-500 text-[10px] uppercase tracking-[0.5em] font-black">CUSTOMIZE YOUR AUTOMATED GUEST COMMUNICATIONS</p>
      </div>

      <div className="bg-gold-500/5 border border-gold-500/20 p-6 rounded-3xl flex items-start gap-4">
         <i className="fas fa-info-circle text-gold-500 text-xl mt-1"></i>
         <div className="space-y-1">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Dynamic Placeholders</p>
            <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest">
              Use <span className="text-gold-400 font-black">{'{guest_name}'}</span> and <span className="text-gold-400 font-black">{'{event_name}'}</span> in your text to automatically insert the guest's name and event name.
            </p>
         </div>
      </div>

      <div className="space-y-10">
        {templates.map((tmpl) => (
          <section key={tmpl.type} className="glass-card p-10 rounded-[3rem] border border-white/10 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <i className={`fas ${tmpl.type === 'INVITATION' ? 'fa-paper-plane' : tmpl.type === 'REMINDER' ? 'fa-bell' : 'fa-heart'} text-6xl`}></i>
            </div>
            
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${tmpl.type === 'INVITATION' ? 'bg-blue-500/10 text-blue-500' : tmpl.type === 'REMINDER' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                    <i className={`fas ${tmpl.type === 'INVITATION' ? 'fa-envelope' : tmpl.type === 'REMINDER' ? 'fa-clock' : 'fa-smile-beam'}`}></i>
                </div>
                <h2 className="text-2xl font-black tracking-tight uppercase">{tmpl.type.replace('_', ' ')}</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Subject Line</label>
                <input 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:border-gold-500 outline-none transition-all font-bold"
                  placeholder="Enter subject line..."
                  value={tmpl.subject}
                  onChange={e => handleUpdateTemplate(tmpl.type, 'subject', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Message Body</label>
                <textarea 
                  rows={4}
                  className="w-full bg-white/5 border border-white/5 rounded-3xl px-6 py-5 focus:border-gold-500 outline-none transition-all resize-none text-sm leading-relaxed"
                  placeholder="Enter message content..."
                  value={tmpl.body}
                  onChange={e => handleUpdateTemplate(tmpl.type, 'body', e.target.value)}
                />
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="pt-10 max-w-2xl mx-auto space-y-4">
          <button 
              onClick={handleSave}
              className="w-full nova-gradient text-black font-black uppercase tracking-[0.3em] py-8 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(184,134,11,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
          >
              SAVE ALL TEMPLATES
          </button>
          <button 
              onClick={() => navigate('/')}
              className="w-full text-gray-600 font-black uppercase tracking-[0.2em] py-4 text-[9px] hover:text-white transition-colors"
          >
              CANCEL & BACK TO DASHBOARD
          </button>
      </div>
    </div>
  );
};

export default ManageTemplates;
