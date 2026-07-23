import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, User, RefreshCw, Layers } from 'lucide-react';

export default function RoleSwitcher() {
  const { userRole, setUserRole, users, currentUser, setCurrentUser, resetDB } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleRoleToggle = () => {
    setUserRole(userRole === 'admin' ? 'user' : 'admin');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'expiring':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'inactive':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'expiring': return 'Por vencer';
      case 'inactive': return 'Inactiva';
      default: return status;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      <button
        onClick={toggleOpen}
        className="flex items-center gap-2 px-4 py-3 bg-brand-surface border border-white/10 hover:border-brand-cyan/40 text-white rounded-full shadow-2xl transition-all cursor-pointer glass-panel"
      >
        <Layers className={`w-5 h-5 text-brand-cyan animate-pulse`} />
        <span className="text-xs font-semibold tracking-wider uppercase">
          {userRole === 'admin' ? 'Modo: Admin' : 'Modo: Usuario'}
        </span>
      </button>

      {/* Settings Card */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-brand-surface border border-white/10 rounded-2xl p-5 shadow-2xl glass-panel animate-fade-in text-sm">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
            <h3 className="font-bold text-white tracking-wide">Panel de Simulación</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Role switcher toggle */}
          <div className="mb-5">
            <span className="block text-xs text-gray-400 font-medium mb-2 uppercase">Rol de Interfaz</span>
            <button
              onClick={handleRoleToggle}
              className={`w-full py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                userRole === 'admin'
                  ? 'bg-brand-red text-white hover:bg-brand-red-hover'
                  : 'bg-brand-cyan text-brand-dark hover:brightness-110'
              }`}
            >
              {userRole === 'admin' ? (
                <>
                  <Shield className="w-4 h-4" />
                  Ir a Vista de Usuario
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  Ir a Vista de Administrador
                </>
              )}
            </button>
          </div>

          {/* User selector (only active/visible when in User view) */}
          {userRole === 'user' && (
            <div className="mb-5">
              <span className="block text-xs text-gray-400 font-medium mb-2 uppercase">
                Simular Sesión de Suscriptor
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setCurrentUser(u.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      currentUser?.id === u.id
                        ? 'bg-white/10 border-brand-cyan/50 text-white'
                        : 'bg-black/20 border-white/5 text-gray-300 hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs">{u.name}</div>
                      <div className="text-[10px] text-gray-400 truncate w-40">{u.email}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${getStatusBadgeClass(u.status)}`}>
                      {translateStatus(u.status)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reset Database Button */}
          <div className="pt-3 border-t border-white/5">
            <button
              onClick={() => {
                if (window.confirm('¿Restablecer todos los datos a su estado original? Se perderán las modificaciones.')) {
                  resetDB();
                  setIsOpen(false);
                }
              }}
              className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restablecer Base de Datos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
