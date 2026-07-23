import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, ShieldAlert, CheckCircle, Clock, PlayCircle } from 'lucide-react';

export default function Dashboard() {
  const { users } = useApp();

  // Compute metrics in real-time
  const totalSubscribers = users.length;
  const activeCount = users.filter(u => u.status === 'active').length;
  const expiringCount = users.filter(u => u.status === 'expiring').length;
  const inactiveCount = users.filter(u => u.status === 'inactive').length;

  const activePercent = totalSubscribers ? Math.round((activeCount / totalSubscribers) * 100) : 0;
  const expiringPercent = totalSubscribers ? Math.round((expiringCount / totalSubscribers) * 100) : 0;
  const inactivePercent = totalSubscribers ? Math.round((inactiveCount / totalSubscribers) * 100) : 0;

  // Flatten and sort the access log history
  const accessHistory = users.flatMap(u => 
    (u.accessHistory || []).map(log => ({
      ...log,
      userName: u.name,
      userEmail: u.email
    }))
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const formatTimestamp = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-1">
          Panel de Control
        </h1>
        <p className="text-xs text-gray-400">
          Métricas clave e historial de reproducción en tiempo real.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Subscribers */}
        <div className="bg-brand-surface border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Suscriptores</span>
            <div className="text-2xl md:text-3xl font-black text-white">{totalSubscribers}</div>
          </div>
          <div className="p-3 bg-white/5 rounded-xl text-gray-300">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="bg-brand-surface border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-green-500">Activas</span>
            <div className="text-2xl md:text-3xl font-black text-white">{activeCount}</div>
          </div>
          <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-brand-surface border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-yellow-500">Próximos a Vencer</span>
            <div className="text-2xl md:text-3xl font-black text-white">{expiringCount}</div>
          </div>
          <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Inactive / Cancelled */}
        <div className="bg-brand-surface border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-500">Inactivas / Bajas</span>
            <div className="text-2xl md:text-3xl font-black text-white">{inactiveCount}</div>
          </div>
          <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Subscription Distribution Charts */}
      <div className="bg-brand-surface border border-white/5 p-6 rounded-2xl shadow-lg">
        <h3 className="text-xs uppercase font-bold text-white tracking-widest mb-4">
          Distribución de Estados de Suscripción
        </h3>
        
        {/* Progress Bar Distribution */}
        <div className="h-4 w-full bg-black/40 rounded-full flex overflow-hidden mb-6">
          <div style={{ width: `${activePercent}%` }} className="bg-green-500 transition-all" title={`Activas: ${activePercent}%`}></div>
          <div style={{ width: `${expiringPercent}%` }} className="bg-yellow-500 transition-all" title={`Próximos a vencer: ${expiringPercent}%`}></div>
          <div style={{ width: `${inactivePercent}%` }} className="bg-red-500 transition-all" title={`Inactivas: ${inactivePercent}%`}></div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-gray-400">Activas ({activePercent}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span className="text-gray-400">Próximos a vencer ({expiringPercent}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-gray-400">Inactivas / Canceladas ({inactivePercent}%)</span>
          </div>
        </div>
      </div>

      {/* Access History Log Table */}
      <div className="bg-brand-surface border border-white/5 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xs uppercase font-bold text-white tracking-widest">
            Historial de Acceso Reciente (VOD)
          </h3>
          <span className="text-[10px] text-gray-500 font-mono">
            {accessHistory.length} reproducciones registradas
          </span>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          {accessHistory.length === 0 ? (
            <div className="p-10 text-center text-xs text-gray-500 space-y-2">
              <PlayCircle className="w-8 h-8 mx-auto text-gray-600" />
              <p>No hay registros de reproducciones todavía.</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-black/20 text-gray-400 uppercase tracking-widest font-bold border-b border-white/5">
                  <th className="p-4">Suscriptor</th>
                  <th className="p-4">Video reproducido</th>
                  <th className="p-4">Curso / Módulo</th>
                  <th className="p-4 text-right">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {accessHistory.slice(0, 15).map((log, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{log.userName}</div>
                      <div className="text-[10px] text-gray-500">{log.userEmail}</div>
                    </td>
                    <td className="p-4 font-semibold text-gray-200">
                      {log.videoTitle}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[10px] font-medium">
                        {log.courseName}
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-400 font-mono">
                      {formatTimestamp(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
