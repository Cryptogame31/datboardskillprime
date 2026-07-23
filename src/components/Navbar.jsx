import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, Film, User, ShieldCheck, Power, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { userRole, logout, currentUser, searchQuery, setSearchQuery, setShowPlansModal } = useApp();

  return (
    <nav className="sticky top-0 z-40 bg-brand-dark/95 border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between backdrop-blur-md">
      {/* Brand Logo */}
      <div className="flex items-center gap-2">
        <Film className="w-8 h-8 text-brand-red animate-pulse" />
        <span className="text-xl md:text-2xl font-black tracking-tighter text-white">
          SKILL<span className="text-brand-red">PRIME</span>
        </span>
      </div>

      {/* Navigation Links depending on Role */}
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
        {userRole === 'admin' ? (
          <>
            <span className="text-brand-red font-bold uppercase tracking-wider text-xs px-2 py-0.5 border border-brand-red/30 rounded bg-brand-red/10">
              Panel Administrativo
            </span>
          </>
        ) : (
          <>
            <span className="text-brand-cyan font-bold uppercase tracking-wider text-xs px-2 py-0.5 border border-brand-cyan/30 rounded bg-brand-cyan/10">
              Plataforma VOD
            </span>
          </>
        )}
      </div>

      {/* Search and User Status */}
      <div className="flex items-center gap-4">
        {userRole === 'user' && (
          <div className="relative max-w-xs md:max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 w-40 md:w-60 bg-white/5 border border-white/10 hover:border-white/20 focus:border-brand-red/50 text-white rounded-full text-xs outline-none transition-all placeholder-gray-500"
            />
          </div>
        )}

        {/* Upgrade Button */}
        {userRole === 'user' && (
          <button
            onClick={() => setShowPlansModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/20 hover:border-brand-cyan/40 text-brand-cyan rounded-xl text-[10px] md:text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            title="Ver planes de suscripción premium"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse text-brand-cyan" />
            <span className="hidden sm:inline">Planes Premium</span>
          </button>
        )}

        {/* User Badge */}
        <div className="flex items-center gap-3 border-l border-white/10 pl-4">
          {userRole === 'admin' ? (
            <div className="flex items-center gap-2 bg-brand-red/10 text-brand-red border border-brand-red/20 px-3 py-1 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Admin</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white/5 text-gray-300 border border-white/5 px-3 py-1 rounded-xl">
              <User className="w-3.5 h-3.5 text-brand-cyan" />
              <div className="text-left leading-none hidden sm:block">
                <div className="text-[10px] font-bold text-white truncate max-w-[100px]">{currentUser?.name}</div>
                <span className="text-[8px] text-gray-400 font-semibold">Suscriptor</span>
              </div>
            </div>
          )}

          {/* Logout Trigger */}
          <button 
            onClick={logout}
            className="p-1.5 hover:bg-white/5 border border-white/10 text-gray-400 hover:text-brand-red rounded-lg transition-all cursor-pointer"
            title="Cerrar Sesión"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
