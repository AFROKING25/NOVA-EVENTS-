import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  onLogout: () => void;
  user: any;
}

const Navigation = ({ onLogout, user }: NavigationProps) => {
  const location = useLocation();
  const isGuestView = location.pathname.startsWith('/e/');

  if (isGuestView) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top Header */}
      <nav className="sticky top-0 z-50 bg-black px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 nova-gradient rounded-lg flex items-center justify-center font-black text-black shadow-lg">N</div>
            <span className="text-xl font-black tracking-tighter text-white uppercase">Nova</span>
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <Link to="/profile" className="w-8 h-8 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-[10px] font-black text-white overflow-hidden uppercase">
            {user?.name?.[0]}
          </Link>
          <button onClick={onLogout} className="text-zinc-500 hover:text-white transition-colors">
             <i className="fas fa-sign-out-alt text-lg"></i>
          </button>
        </div>
      </nav>

      {/* Bottom Navigation (Matched to screenshot) */}
      <div className="bottom-nav">
        <div className="flex justify-between items-center h-16 max-w-lg mx-auto px-6">
          <Link to="/" className={`flex flex-col items-center gap-1 transition-all ${isActive('/') ? 'nav-item-active' : 'text-zinc-600'}`}>
            <i className="fas fa-th-large text-xl"></i>
            <span className="text-[9px] font-black uppercase tracking-tighter">Dash</span>
          </Link>
          <Link to="/create" className={`flex flex-col items-center gap-1 transition-all ${isActive('/create') ? 'nav-item-active' : 'text-zinc-600'}`}>
            <i className="fas fa-plus-circle text-xl"></i>
            <span className="text-[9px] font-black uppercase tracking-tighter">Create</span>
          </Link>
          <div className="flex flex-col items-center gap-1 text-zinc-600 opacity-40">
            <i className="fas fa-chart-pie text-xl"></i>
            <span className="text-[9px] font-black uppercase tracking-tighter">Stats</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-zinc-600 opacity-40">
            <i className="fas fa-bell text-xl"></i>
            <span className="text-[9px] font-black uppercase tracking-tighter">Alerts</span>
          </div>
          <Link to="/profile" className={`flex flex-col items-center gap-1 transition-all ${isActive('/profile') ? 'nav-item-active' : 'text-zinc-600'}`}>
            <i className="fas fa-user-circle text-xl"></i>
            <span className="text-[9px] font-black uppercase tracking-tighter">Vault</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navigation;