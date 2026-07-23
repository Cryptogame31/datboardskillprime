import React, { useState } from 'react';
import { firebaseService } from '../utils/firebaseService';
import { Film, Lock, Mail, AlertCircle, Shield, User, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const user = await firebaseService.signIn(email, password);
      onLoginSuccess(user);
    } catch (err) {
      console.error('Sign-in error:', err);
      // Friendly message overrides
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Credenciales inválidas. Comprueba tu correo o contraseña.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El correo electrónico no es válido.');
      } else {
        setError(err.message || 'Error de conexión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper
  const handleQuickFill = (presetEmail, presetPassword) => {
    setEmail(presetEmail);
    setPassword(presetPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-brand-surface border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 glass-panel animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 bg-brand-red/10 border border-brand-red/20 rounded-2xl text-brand-red mb-2">
            <Film className="w-10 h-10 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none">
            SKILL<span className="text-brand-red">PRIME</span>
          </h1>
          <p className="text-xs text-gray-400">
            Ingresa tus credenciales para acceder a la plataforma.
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-xl text-xs flex items-start gap-2.5 mb-6">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input
                type="email"
                placeholder="ejemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full bg-black/30 border border-white/5 focus:border-brand-red/50 text-xs text-white rounded-xl outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 py-2.5 w-full bg-black/30 border border-white/5 focus:border-brand-red/50 text-xs text-white rounded-xl outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-red hover:bg-brand-red-hover disabled:bg-brand-red/50 text-white font-bold rounded-xl text-xs md:text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-brand-red/25 flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Autenticando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Quick Fill Preset Accounts Drawer */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 text-center">
            Cuentas de Simulación (Click para rellenar)
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickFill('admin@skillprime.com', 'admin123456')}
              className="p-2.5 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-xl hover:bg-brand-red/20 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center"
            >
              <Shield className="w-4.5 h-4.5" />
              <span className="text-[10px] font-bold">Administrador</span>
              <span className="text-[7px] text-gray-400">admin@skillprime.com</span>
            </button>

            <button
              onClick={() => handleQuickFill('juan.perez@email.com', 'password123')}
              className="p-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl hover:bg-green-500/25 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center"
            >
              <User className="w-4.5 h-4.5" />
              <span className="text-[10px] font-bold">Usuario Activo</span>
              <span className="text-[7px] text-gray-400">juan.perez@email.com</span>
            </button>

            <button
              onClick={() => handleQuickFill('maria.lopez@email.com', 'password123')}
              className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/25 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center"
            >
              <User className="w-4.5 h-4.5" />
              <span className="text-[10px] font-bold">Usuario Por Vencer</span>
              <span className="text-[7px] text-gray-400">maria.lopez@email.com</span>
            </button>

            <button
              onClick={() => handleQuickFill('carlos.ruiz@email.com', 'password123')}
              className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/25 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center"
            >
              <User className="w-4.5 h-4.5" />
              <span className="text-[10px] font-bold">Usuario Vencido</span>
              <span className="text-[7px] text-gray-400">carlos.ruiz@email.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
