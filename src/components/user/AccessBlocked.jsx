import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Calendar, CreditCard, ShieldAlert, Sparkles, ExternalLink, CheckCircle } from 'lucide-react';

export default function AccessBlocked({ onClose }) {
  const { currentUser, updateSubscriber, settings } = useApp();
  const [simulating, setSimulating] = useState(false);

  const handleSimulatePayment = (days) => {
    if (!currentUser) return;
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    updateSubscriber(currentUser.id || currentUser.uid, {
      status: 'active',
      startDate: formatDate(today),
      endDate: formatDate(futureDate)
    });
    alert('Simulación de pago exitosa. Tu cuenta ha sido activada.');
    if (onClose) onClose();
  };

  const handleCheckoutRedirect = (link) => {
    if (link) {
      window.open(link, '_blank');
    } else {
      alert('El administrador no ha configurado este enlace de pago todavía.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-dark/97 flex items-center justify-center p-6 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="max-w-md w-full bg-brand-surface border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden my-8 glass-panel">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-red/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-cyan/10 rounded-full blur-3xl"></div>
        
        {/* Lock Icon */}
        <div className="inline-flex p-5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red mb-4 animate-pulse">
          <Lock className="w-10 h-10" />
        </div>
        
        <h2 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight uppercase">
          PERIODO DE PRUEBA TERMINADO
        </h2>
        
        <p className="text-xs text-gray-400 mb-5">
          Hola, <span className="text-white font-bold">{currentUser?.name}</span>. Para continuar disfrutando de la formación en <span className="text-brand-cyan font-bold">Skill Prime</span>, debes activar un plan de suscripción.
        </p>

        {/* Subscription details box */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-6 text-left text-xs space-y-2">
          <div className="flex justify-between items-center text-gray-400">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Estado de cuenta:</span>
            <span className="text-brand-red font-bold uppercase">Expirada</span>
          </div>
          <div className="flex justify-between items-center text-gray-400">
            <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Periodo vencido:</span>
            <span>{currentUser?.startDate} al {currentUser?.endDate}</span>
          </div>
        </div>

        {/* PLANS SELECTION */}
        <div className="space-y-4 mb-6">
          <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-left border-b border-white/5 pb-1">
            Planes Disponibles
          </h3>

          {/* Plan Mensual */}
          <div className="p-4 bg-black/20 hover:bg-black/30 border border-white/5 hover:border-brand-red/20 rounded-2xl transition-all text-left flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-white text-xs">Plan Mensual</div>
              <p className="text-[10px] text-gray-500 mt-0.5">Acceso completo a todo el catálogo VOD.</p>
              <div className="text-sm font-black text-white mt-1.5">$4.00 <span className="text-[10px] text-gray-500 font-normal">USD / mes</span></div>
            </div>
            <button
              onClick={() => handleCheckoutRedirect(settings.paymentLinkMonthly)}
              className="px-3.5 py-2 bg-brand-red hover:bg-brand-red-hover text-white text-[10px] font-bold rounded-xl uppercase flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
            >
              Contratar
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Plan Anual */}
          <div className="p-4 bg-brand-cyan/5 hover:bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl transition-all text-left flex items-center justify-between gap-4 relative overflow-hidden">
            {/* Discount Badge */}
            <div className="absolute top-0 right-0 bg-brand-cyan text-brand-dark font-black text-[8px] uppercase tracking-widest px-2.5 py-0.5 rounded-bl-lg flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5 fill-current" />
              Ahorra 10%
            </div>
            
            <div>
              <div className="font-bold text-white text-xs">Plan Anual</div>
              <p className="text-[10px] text-gray-500 mt-0.5">12 meses de acceso. El mejor valor.</p>
              <div className="text-sm font-black text-white mt-1.5">
                $43.20 <span className="text-[10px] text-gray-500 font-normal">USD / año</span>
                <span className="text-[9px] text-brand-cyan font-bold block mt-0.5 line-through decoration-brand-red decoration-2">$48.00 USD</span>
              </div>
            </div>
            <button
              onClick={() => handleCheckoutRedirect(settings.paymentLinkYearly)}
              className="px-3.5 py-2 bg-brand-cyan hover:brightness-110 text-brand-dark text-[10px] font-bold rounded-xl uppercase flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
            >
              Contratar
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Demo simulated activation */}
        <div className="border-t border-white/5 pt-4">
          {simulating ? (
            <div className="space-y-2 animate-fade-in bg-white/5 p-3 rounded-xl">
              <div className="text-[9px] font-bold text-brand-cyan uppercase">Simular confirmación de pago</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSimulatePayment(30)}
                  className="flex-1 py-1.5 bg-brand-red text-white text-[9px] font-bold rounded uppercase cursor-pointer"
                >
                  Mensual (+30d)
                </button>
                <button
                  onClick={() => handleSimulatePayment(365)}
                  className="flex-1 py-1.5 bg-brand-cyan text-brand-dark text-[9px] font-bold rounded uppercase cursor-pointer"
                >
                  Anual (+365d)
                </button>
              </div>
              <button
                onClick={() => setSimulating(false)}
                className="text-[9px] text-gray-400 hover:text-white underline cursor-pointer mt-1 block w-full"
              >
                Volver
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSimulating(true)}
              className="text-[10px] text-gray-500 hover:text-white underline cursor-pointer block w-full"
            >
              ¿Simular Pago de Demostración? (Desbloquear cuenta)
            </button>
          )}
        </div>
        
        <div className="mt-5 flex items-center justify-center gap-1 text-[9px] text-gray-500">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Acceso cifrado y pasarelas verificadas en Skill Prime</span>
        </div>
      </div>
    </div>
  );
}
