
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEvent, addGuest } from '../data/store';
import { Event, PaymentStatus, EventVisibility, Guest, EventLocation } from '../types';
import { searchLocations, MapSearchResult } from '../services/geminiService';

const EVENT_TYPES = [
  { id: 'Wedding', icon: 'fa-ring' },
  { id: 'Concert', icon: 'fa-music' },
  { id: 'Seminar', icon: 'fa-microphone' },
  { id: 'Meeting', icon: 'fa-users' },
  { id: 'Graduation', icon: 'fa-graduation-cap' },
  { id: 'Send-off', icon: 'fa-glass-cheers' },
  { id: 'Kitchen Party', icon: 'fa-utensils' },
  { id: 'Other', icon: 'fa-plus-circle' }
];

const CreateEvent = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Wedding',
    customType: '',
    date: '',
    visibility: EventVisibility.PRIVATE,
    locations: [] as EventLocation[]
  });

  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<MapSearchResult[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const searchTimeout = useRef<any>(null);

  const [guestEntries, setGuestEntries] = useState<{name: string, phone: string, pledge?: number}[]>([
    { name: '', phone: '' }
  ]);

  const [importing, setImporting] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<{ headers: string[], rows: string[][] } | null>(null);
  const [mapping, setMapping] = useState({ name: -1, phone: -1, pledge: -1 });

  // Debounced Location Search
  useEffect(() => {
    if (locationQuery.length > 3) {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      
      setIsSearchingLocation(true);
      searchTimeout.current = setTimeout(async () => {
        const results = await searchLocations(locationQuery);
        setLocationResults(results);
        setIsSearchingLocation(false);
      }, 800);
    } else {
      setLocationResults([]);
      setIsSearchingLocation(false);
    }

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [locationQuery]);

  const handleSelectLocation = (result: MapSearchResult) => {
    const newLocation: EventLocation = {
      label: result.name,
      url: result.url
    };
    setFormData({
      ...formData,
      locations: [...formData.locations, newLocation]
    });
    setLocationQuery('');
    setLocationResults([]);
  };

  const handleRemoveLocation = (index: number) => {
    setFormData({
      ...formData,
      locations: formData.locations.filter((_, i) => i !== index)
    });
  };

  const handleAddGuestRow = () => {
    setGuestEntries([...guestEntries, { name: '', phone: '' }]);
  };

  const handleUpdateGuest = (index: number, field: 'name' | 'phone', value: string) => {
    const newEntries = [...guestEntries];
    (newEntries[index] as any)[field] = value;
    setGuestEntries(newEntries);
  };

  const handleRemoveGuest = (index: number) => {
    if (guestEntries.length > 1) {
      setGuestEntries(guestEntries.filter((_, i) => i !== index));
    }
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          alert("CSV file must have at least a header and one data row.");
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim()));
        
        setCsvData({ headers, rows });
        setImporting('CSV_MAPPING');
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const executeCsvImport = () => {
    if (!csvData || mapping.name === -1 || mapping.phone === -1) {
      alert("Please map at least Name and Phone columns.");
      return;
    }

    const importedGuests = csvData.rows.map(row => ({
      name: row[mapping.name],
      phone: row[mapping.phone],
      pledge: mapping.pledge !== -1 ? parseFloat(row[mapping.pledge]) || 0 : 20000
    })).filter(g => g.name && g.phone);

    setGuestEntries([...guestEntries.filter(g => g.name || g.phone), ...importedGuests]);
    setCsvData(null);
    setImporting(null);
    setMapping({ name: -1, phone: -1, pledge: -1 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Please enter an event name");

    const userData = JSON.parse(localStorage.getItem('nova_user') || '{}');
    const finalType = formData.type === 'Other' ? formData.customType || 'Custom Event' : formData.type;
    
    const newEventData: Omit<Event, 'id'> = {
      ownerId: userData.id || 'anon',
      name: formData.name,
      type: finalType,
      date: formData.date,
      locations: formData.locations,
      visibility: formData.visibility,
      contributionOptions: [
        { id: 'opt-1', name: 'Standard', amount: 20000 },
        { id: 'opt-2', name: 'VIP', amount: 50000 }
      ]
    };

    const savedEvent = addEvent(newEventData);

    guestEntries.forEach(entry => {
      if (entry.name && entry.phone) {
        const guest: Guest = {
          id: `g-${Math.random().toString(36).substr(2, 9)}`,
          eventId: savedEvent.id,
          name: entry.name,
          phone: entry.phone,
          optionId: 'opt-1',
          pledgeAmount: entry.pledge || 20000,
          paymentStatus: PaymentStatus.NOT_STARTED
        };
        addGuest(guest);
      }
    });

    navigate(`/design-card/${savedEvent.id}`);
  };

  return (
    <div className="max-w-md mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      <header className="flex items-center gap-4 py-4">
        <button onClick={() => navigate('/')} className="text-zinc-500 hover:text-white transition-colors">
          <i className="fas fa-arrow-left text-lg"></i>
        </button>
        <h1 className="text-2xl font-black italic nova-serif">Event Setup</h1>
      </header>

      {/* CSV Mapping Interface */}
      {importing === 'CSV_MAPPING' && csvData && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="glass-card w-full max-w-sm rounded-[2.5rem] p-8 space-y-8 border-gold-500/20 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black italic nova-serif text-gold-500">Map CSV Columns</h2>
              <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Identify data fields for {csvData.rows.length} guests</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest ml-1">Guest Name Column</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold-500"
                  value={mapping.name}
                  onChange={e => setMapping({...mapping, name: parseInt(e.target.value)})}
                >
                  <option value={-1}>Select column...</option>
                  {csvData.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest ml-1">Phone Number Column</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold-500"
                  value={mapping.phone}
                  onChange={e => setMapping({...mapping, phone: parseInt(e.target.value)})}
                >
                  <option value={-1}>Select column...</option>
                  {csvData.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest ml-1">Pledge Amount (Optional)</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold-500"
                  value={mapping.pledge}
                  onChange={e => setMapping({...mapping, pledge: parseInt(e.target.value)})}
                >
                  <option value={-1}>None (Use default 20,000)</option>
                  {csvData.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button 
                onClick={executeCsvImport}
                className="w-full nova-gradient py-4 rounded-xl text-black font-black uppercase tracking-widest text-[10px] shadow-xl"
              >
                Import Guests Now
              </button>
              <button 
                onClick={() => { setImporting(null); setCsvData(null); }}
                className="w-full py-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest"
              >
                Cancel Import
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="glass-card p-8 rounded-[2.5rem] space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Event Name</label>
            <input 
              required 
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold-500 transition-all font-medium placeholder:text-zinc-700" 
              placeholder="e.g. Harusi ya Juma & Sarah" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Choose Event Type</label>
            <div className="grid grid-cols-2 gap-3">
              {EVENT_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({...formData, type: type.id})}
                  className={`p-4 rounded-2xl border transition-all haptic-press flex items-center gap-3 ${formData.type === type.id ? 'bg-gold-500/10 border-gold-500 shadow-xl shadow-gold-500/5 opacity-100' : 'bg-black/20 border-white/5 opacity-40 hover:opacity-60'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.type === type.id ? 'bg-gold-500 text-black' : 'bg-white/5 text-zinc-400'}`}>
                    <i className={`fas ${type.icon} text-[10px]`}></i>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-tight ${formData.type === type.id ? 'text-gold-500' : 'text-zinc-500'}`}>{type.id}</span>
                </button>
              ))}
            </div>

            {formData.type === 'Other' && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <input 
                  required 
                  className="w-full bg-black/40 border border-gold-500/30 rounded-2xl px-6 py-4 outline-none focus:border-gold-500 transition-all font-medium text-xs placeholder:text-zinc-700" 
                  placeholder="Enter custom event type name..." 
                  value={formData.customType} 
                  onChange={e => setFormData({...formData, customType: e.target.value})} 
                />
              </div>
            )}
          </div>

          {/* Event Visibility Added Back */}
          <div className="space-y-4">
            <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Event Visibility</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: EventVisibility.PRIVATE, label: 'Private', icon: 'fa-lock' },
                { id: EventVisibility.PUBLIC, label: 'Public', icon: 'fa-globe' },
                { id: EventVisibility.HYBRID, label: 'Hybrid', icon: 'fa-users' }
              ].map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setFormData({...formData, visibility: v.id})}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${formData.visibility === v.id ? 'bg-gold-500/10 border-gold-500 text-gold-500' : 'bg-black/20 border-white/5 text-zinc-500 opacity-60'}`}
                >
                  <i className={`fas ${v.icon} text-xs`}></i>
                  <span className="text-[8px] font-black uppercase tracking-widest">{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Event Date</label>
            <input 
              type="date" 
              required
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold-500 transition-all [color-scheme:dark]" 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})} 
            />
          </div>

          {/* Location Search Powered by Gemini/Maps */}
          <div className="space-y-4 pt-2">
            <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest ml-1">Event Venue (Search Map)</label>
            <div className="relative">
              <div className="relative group">
                <i className="fas fa-map-marked-alt absolute left-5 top-1/2 -translate-y-1/2 text-gold-500 text-xs transition-transform group-focus-within:scale-110"></i>
                <input 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-12 py-4 outline-none focus:border-gold-500 transition-all font-medium placeholder:text-zinc-700 text-sm" 
                  placeholder="Type venue or area name..." 
                  value={locationQuery} 
                  onChange={e => setLocationQuery(e.target.value)} 
                />
                {isSearchingLocation && (
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    <i className="fas fa-circle-notch fa-spin text-gold-500 text-[10px]"></i>
                  </div>
                )}
              </div>

              {locationResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-[100] mt-2 glass-card rounded-2xl border border-white/10 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2">
                  <div className="max-h-64 overflow-y-auto no-scrollbar divide-y divide-white/5">
                    {locationResults.map((result, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectLocation(result)}
                        className="w-full px-5 py-4 text-left flex items-start gap-4 hover:bg-gold-500/10 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600 group-hover:text-gold-500 flex-shrink-0 transition-colors">
                          <i className="fas fa-location-dot text-xs"></i>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-white group-hover:text-gold-500 transition-colors truncate">{result.name}</span>
                          <span className="text-[9px] text-zinc-500 truncate uppercase tracking-tighter mt-0.5">{result.address}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {formData.locations.length > 0 && (
              <div className="space-y-2 mt-4">
                {formData.locations.map((loc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl animate-in slide-in-from-left-2 group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500 text-[10px]">
                        <i className="fas fa-map-pin"></i>
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-bold truncate text-white">{loc.label}</span>
                        <span className="text-[7px] text-zinc-500 uppercase font-black tracking-widest truncate">{loc.url}</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveLocation(idx)}
                      className="w-8 h-8 flex items-center justify-center text-zinc-700 hover:text-red-500 transition-colors"
                    >
                      <i className="fas fa-times-circle"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="glass-card p-8 rounded-[2.5rem] space-y-8 relative">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black italic nova-serif">Import Guests</h2>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Rapid sync from your existing records</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button 
              type="button" 
              onClick={handleImportCSV} 
              className="group flex items-center justify-between bg-white/[0.03] border border-white/5 p-5 rounded-2xl haptic-press hover:bg-white/[0.08] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <i className="fas fa-file-csv"></i>
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-black uppercase tracking-widest">CSV Spreadsheet</div>
                  <div className="text-[8px] text-zinc-500 uppercase font-bold">Import from Excel (Map Columns)</div>
                </div>
              </div>
              <i className="fas fa-chevron-right text-[10px] text-zinc-700 group-hover:text-white"></i>
            </button>

            {/* Google Contacts Option Added Back */}
            <button 
              type="button" 
              onClick={() => alert("Google Contacts sync coming soon!")} 
              className="group flex items-center justify-between bg-white/[0.03] border border-white/5 p-5 rounded-2xl haptic-press hover:bg-white/[0.08] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <i className="fab fa-google"></i>
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-black uppercase tracking-widest">Google Contacts</div>
                  <div className="text-[8px] text-zinc-500 uppercase font-bold">Sync from Google Account</div>
                </div>
              </div>
              <i className="fas fa-chevron-right text-[10px] text-zinc-700 group-hover:text-white"></i>
            </button>

            {/* Device Contacts Option Added Back */}
            <button 
              type="button" 
              onClick={() => alert("Device Contacts sync coming soon!")} 
              className="group flex items-center justify-between bg-white/[0.03] border border-white/5 p-5 rounded-2xl haptic-press hover:bg-white/[0.08] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-black uppercase tracking-widest">Device Contacts</div>
                  <div className="text-[8px] text-zinc-500 uppercase font-bold">Import from Phonebook</div>
                </div>
              </div>
              <i className="fas fa-chevron-right text-[10px] text-zinc-700 group-hover:text-white"></i>
            </button>
          </div>

          <div className="pt-4 space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Manual Entry</span>
              <span className="text-[8px] text-zinc-700 uppercase">{guestEntries.length} Guests</span>
            </div>
            {guestEntries.map((guest, idx) => (
              <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <input className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-xs font-medium focus:border-gold-500" placeholder="Guest Name" value={guest.name} onChange={(e) => handleUpdateGuest(idx, 'name', e.target.value)} />
                <input className="w-32 bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-xs font-medium focus:border-gold-500" placeholder="Phone" value={guest.phone} onChange={(e) => handleUpdateGuest(idx, 'phone', e.target.value)} />
                <button type="button" onClick={() => handleRemoveGuest(idx)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-red-500 transition-colors"><i className="fas fa-times text-xs"></i></button>
              </div>
            ))}
          </div>

          <button type="button" onClick={handleAddGuestRow} className="w-full bg-white/[0.02] border border-dashed border-white/10 py-5 rounded-2xl flex items-center justify-center gap-3 haptic-press group">
            <i className="fas fa-plus-circle text-zinc-500 group-hover:text-gold-500 transition-colors"></i>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">Add Manually</span>
          </button>
        </section>

        <button type="submit" className="w-full nova-gradient py-6 rounded-2xl text-black font-black uppercase tracking-[0.2em] shadow-xl text-[11px] haptic-press">
          Save & Design Card
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
