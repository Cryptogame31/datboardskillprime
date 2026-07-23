import React from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Calendar, CreditCard, ShieldAlert } from 'lucide-react';

export default function AccessBlocked({ onClose }) {
  const { currentUser, updateSubscriber } = useApp();

  const handleRenew = () => {
    if (!currentUser) return;
    
    // Add 30 days from today
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
    
    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    updateSubscriber(currentUser.id, {
      status: 'active',
      startDate: formatDate(today),
      endDate: formatDate(futureDate)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-dark/95 flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
      <div className="max-w-md w-full bg-brand-surface border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-red/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-cyan/10 rounded-full blur-3xl"></div>
        
        {/* Lock Icon */}
        <div className="inline-flex p-5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red mb-6 animate-bounce">
          <Lock className="w-12 h-12" />
        </div>
        
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
          SUSCRIPCIÓN INACTIVA
        </h2>
        
        <p className="text-sm text-gray-400 mb-6">
          Lo sentimos, <span className="text-white font-bold">{currentUser?.name}</span>. Tu suscripción a <span className="text-brand-cyan font-bold">Skill Prime</span> finalizó el {currentUser?.endDate} y se encuentra actualmente desactivada.
        </p>

        {/* Subscription details box */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-4 mb-6 text-left text-xs space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Estado de cuenta:</span>
            <span className="text-brand-red font-bold uppercase">Inactiva / Vencida</span>
          </div>
          <div className="flex justify-between items-center text-gray-400">
            <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Último periodo:</span>
            <span>{currentUser?.startDate} al {currentUser?.endDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleRenew}
            className="w-full py-3 bg-brand-red hover:bg-brand-red-hover text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-red/25 cursor-pointer text-sm uppercase tracking-wider"
          >
            Simular Renovación (+30 días)
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all cursor-pointer text-xs"
          >
            Volver al catálogo
          </button>
        </div>
        
        <div className="mt-6 flex items-center justify-center gap-1 text-[10px] text-gray-500">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Acceso cifrado y seguro para suscriptores de Skill Prime</span>
        </div>
      </div>
    </div>
  );
}
