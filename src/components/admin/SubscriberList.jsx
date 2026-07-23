import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { firebaseService } from '../../utils/firebaseService';
import { 
  Plus, Trash, Search, ToggleLeft, ToggleRight, 
  Calendar, UserPlus, X, Key, Eye, EyeOff, Mail 
} from 'lucide-react';

export default function SubscriberList() {
  const { users, addSubscriber, updateSubscriber, deleteSubscriber } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State (Register User)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('active');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  // Password Modification Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);

  const getStatusBadge = (status) => {
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

  const handleExtendSubscription = (userId, days) => {
    const user = users.find(u => u.id === userId || u.uid === userId);
    if (!user) return;
    
    const currentEnd = new Date(user.endDate);
    const baseDate = currentEnd > new Date() ? currentEnd : new Date();
    baseDate.setDate(baseDate.getDate() + days);

    const formattedDate = baseDate.toISOString().split('T')[0];
    const newStatus = baseDate > new Date() ? 'active' : 'inactive';
    
    updateSubscriber(user.id || userId, {
      endDate: formattedDate,
      status: newStatus
    });
  };

  const handleToggleStatus = (userId) => {
    const user = users.find(u => u.id === userId || u.uid === userId);
    if (!user) return;

    if (user.status === 'inactive') {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      updateSubscriber(user.id || userId, {
        status: 'active',
        endDate: d.toISOString().split('T')[0]
      });
    } else {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      updateSubscriber(user.id || userId, {
        status: 'inactive',
        endDate: d.toISOString().split('T')[0]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Por favor complete el nombre y el correo.');
      return;
    }
    
    addSubscriber({
      name,
      email,
      status,
      startDate,
      endDate
    });

    setName('');
    setEmail('');
    setStatus('active');
    setStartDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setEndDate(d.toISOString().split('T')[0]);
    setShowAddForm(false);
  };

  // Submit Password Change
  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const confirmChange = window.confirm(`¿Está seguro de cambiar la contraseña de ${selectedUserForPassword.name}? El suscriptor iniciará sesión con esta nueva clave.`);
    if (confirmChange) {
      updateSubscriber(selectedUserForPassword.id || selectedUserForPassword.uid, {
        simulatedPassword: newPassword
      });
      alert('Contraseña actualizada correctamente.');
      
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(false);
      setSelectedUserForPassword(null);
    }
  };

  // Trigger Firebase Auth Password Reset Email
  const handleSendResetEmail = async () => {
    if (!selectedUserForPassword) return;
    const confirmReset = window.confirm(`¿Enviar un correo oficial de restablecimiento de contraseña de Firebase a ${selectedUserForPassword.email}?`);
    if (confirmReset) {
      try {
        await firebaseService.sendPasswordReset(selectedUserForPassword.email);
        alert(`Correo de restablecimiento enviado con éxito a ${selectedUserForPassword.email}.`);
        setShowPasswordModal(false);
        setSelectedUserForPassword(null);
      } catch (err) {
        alert(`Error al enviar el correo: ${err.message}`);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Search and Add Trigger */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-1">
            Gestión de Suscriptores
          </h1>
          <p className="text-xs text-gray-400">
            Administra los usuarios autorizados, sus contraseñas, periodos de vigencia y accesos.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-brand-red-hover text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Registrar Suscriptor
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar suscriptor por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4 py-2 w-full bg-brand-surface border border-white/5 hover:border-white/10 focus:border-brand-red/50 text-white rounded-xl text-xs outline-none transition-all"
        />
      </div>

      {/* Add Subscriber Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <form 
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-brand-surface border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 relative"
          >
            <button 
              type="button"
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm uppercase font-bold text-white tracking-widest border-b border-white/5 pb-2">
              Registrar Nuevo Suscriptor
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@email.com"
                className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Fecha de inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Fecha de vencimiento</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Estado Inicial</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none"
              >
                <option value="active">Activa</option>
                <option value="expiring">Próxima a vencer</option>
                <option value="inactive">Inactiva</option>
              </select>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2.5 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-brand-red hover:bg-brand-red-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                Registrar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modify Password Modal */}
      {showPasswordModal && selectedUserForPassword && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <form 
            onSubmit={handlePasswordChangeSubmit}
            className="w-full max-w-md bg-brand-surface border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 relative"
          >
            <button 
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                setSelectedUserForPassword(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm uppercase font-bold text-white tracking-widest border-b border-white/5 pb-2">
              Modificar Contraseña
            </h3>
            
            <p className="text-xs text-gray-400">
              Modificando credenciales para: <span className="text-white font-bold">{selectedUserForPassword.name}</span> ({selectedUserForPassword.email})
            </p>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Nueva Contraseña</label>
              <div className="relative">
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full p-2.5 pr-10 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Confirmar Contraseña</label>
              <div className="relative">
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full p-2.5 pr-10 bg-black/30 border border-white/5 rounded-xl text-xs text-white focus:border-brand-red/50 outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-brand-cyan hover:brightness-110 text-brand-dark font-bold rounded-xl text-xs md:text-sm uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Guardar Nueva Contraseña
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[9px] text-gray-500 uppercase font-black">O bien</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <button
                type="button"
                onClick={handleSendResetEmail}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Mail className="w-3.5 h-3.5" />
                Enviar Correo de Restablecimiento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subscribers Table List */}
      <div className="bg-brand-surface border border-white/5 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          {filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-xs text-gray-500">
              No se encontraron suscriptores con los criterios de búsqueda.
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-black/20 text-gray-400 uppercase tracking-widest font-bold border-b border-white/5">
                  <th className="p-4">Suscriptor</th>
                  <th className="p-4">Periodo de Suscripción</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Extender / Prórroga</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id || user.uid} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{user.email}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{user.startDate} al {user.endDate}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${getStatusBadge(user.status)}`}>
                        {translateStatus(user.status)}
                      </span>
                    </td>
                    <td className="p-4 space-x-2">
                      <button
                        onClick={() => handleExtendSubscription(user.id || user.uid, 30)}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 hover:text-brand-cyan border border-white/5 rounded text-[10px] font-bold transition-all cursor-pointer"
                      >
                        +30 días
                      </button>
                      <button
                        onClick={() => handleExtendSubscription(user.id || user.uid, 90)}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 hover:text-brand-cyan border border-white/5 rounded text-[10px] font-bold transition-all cursor-pointer"
                      >
                        +90 días
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2.5">
                        {/* Key Icon - Change Password */}
                        <button
                          onClick={() => {
                            setSelectedUserForPassword(user);
                            setShowPasswordModal(true);
                          }}
                          className="p-1 text-gray-500 hover:text-brand-cyan transition-colors cursor-pointer"
                          title="Modificar Contraseña"
                        >
                          <Key className="w-4 h-4" />
                        </button>

                        {/* Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(user.id || user.uid)}
                          className="p-1 hover:text-brand-cyan transition-colors cursor-pointer"
                          title={user.status === 'inactive' ? 'Activar cuenta' : 'Desactivar cuenta'}
                        >
                          {user.status === 'inactive' ? (
                            <ToggleLeft className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ToggleRight className="w-5 h-5 text-brand-accent" />
                          )}
                        </button>
                        
                        {/* Delete User */}
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Está seguro de eliminar a ${user.name}?`)) {
                              deleteSubscriber(user.id || user.uid);
                            }
                          }}
                          className="p-1 text-gray-500 hover:text-brand-red transition-colors cursor-pointer"
                          title="Eliminar suscriptor"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
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
