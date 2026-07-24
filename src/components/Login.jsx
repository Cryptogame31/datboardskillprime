import React, { useState } from 'react';
import { firebaseService } from '../utils/firebaseService';
import { 
  Film, Lock, Mail, AlertCircle, Shield, 
  User, Loader2, Eye, EyeOff, CheckCircle2, ArrowLeft, Smartphone 
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  // Modes: 'login', 'signup', 'forgot'
  const [mode, setMode] = useState('login');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  // Status states
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  const handleLoginSubmit = async (e) => {
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
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Credenciales inválidas. Comprueba tu correo o contraseña.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El correo electrónico no es válido.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No existe ninguna cuenta con este correo.');
      } else {
        setError(err.message || 'Error de conexión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newUser = await firebaseService.signUpUser(email, password, name);
      setSuccessMessage('¡Cuenta creada con éxito! Iniciando sesión...');
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 1500);
    } catch (err) {
      console.error('Sign-up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El correo electrónico no es válido.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil (mínimo 6 caracteres).');
      } else {
        setError(err.message || 'Ocurrió un error al registrar la cuenta.');
      }
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await firebaseService.sendPasswordReset(email);
      setSuccessMessage('Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.');
      setEmail('');
    } catch (err) {
      console.error('Reset password error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No hay ningún usuario registrado con este correo.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El correo electrónico no es válido.');
      } else {
        setError(err.message || 'Error al enviar el correo de recuperación.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (presetEmail, presetPassword) => {
    setEmail(presetEmail);
    setPassword(presetPassword);
    setMode('login');
    setError('');
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-brand-surface border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 glass-panel animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 bg-brand-red/10 border border-brand-red/20 rounded-2xl text-brand-red mb-1">
            <Film className="w-9 h-9 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none">
            SKILL<span className="text-brand-red">PRIME</span>
          </h1>
          <p className="text-[11px] text-gray-400">
            {mode === 'login' && 'Ingresa tus credenciales para acceder a la plataforma'}
            {mode === 'signup' && 'Regístrate hoy mismo y obtén un regalo de bienvenida'}
            {mode === 'forgot' && 'Recupera el acceso a tu cuenta'}
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-xl text-xs flex items-start gap-2.5 mb-5">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/25 text-green-400 p-4 rounded-xl text-xs flex items-start gap-2.5 mb-5">
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{successMessage}</p>
          </div>
        )}

        {/* 1. LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
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
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-gray-400">Contraseña</label>
                <button
                  type="button"
                  onClick={() => handleModeChange('forgot')}
                  className="text-[9px] font-bold text-brand-red hover:underline cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
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

            <div className="text-center pt-2">
              <span className="text-[10px] text-gray-500">¿No tienes una cuenta? </span>
              <button
                type="button"
                onClick={() => handleModeChange('signup')}
                className="text-[10px] font-bold text-brand-cyan hover:underline cursor-pointer"
              >
                Crear Cuenta gratis
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGNUP MODE */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Tu Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full bg-black/30 border border-white/5 focus:border-brand-red/50 text-xs text-white rounded-xl outline-none transition-all"
                  required
                />
              </div>
            </div>

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
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 py-2.5 w-full bg-black/30 border border-white/5 focus:border-brand-red/50 text-xs text-white rounded-xl outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 py-2.5 w-full bg-black/30 border border-white/5 focus:border-brand-red/50 text-xs text-white rounded-xl outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="bg-brand-cyan/5 border border-brand-cyan/15 p-3 rounded-2xl text-[10px] text-brand-cyan text-center">
              🎁 <strong>Regalo Especial:</strong> Al registrarte hoy, obtienes acceso completo 100% gratuito por tu periodo de prueba.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-cyan hover:brightness-110 disabled:brightness-75 text-brand-dark font-bold rounded-xl text-xs md:text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Registrando cuenta...
                </>
              ) : (
                'Registrarse y Obtener Regalo'
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-[10px] text-gray-500">¿Ya tienes una cuenta? </span>
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="text-[10px] font-bold text-brand-red hover:underline cursor-pointer"
              >
                Inicia sesión aquí
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Ingresa el correo electrónico asociado a tu cuenta. Te enviaremos un enlace oficial de Firebase para restablecer tu contraseña.
            </p>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-red hover:bg-brand-red-hover disabled:bg-brand-red/50 text-white font-bold rounded-xl text-xs md:text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Enviando enlace...
                </>
              ) : (
                'Recuperar Contraseña'
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        )}

        {/* Quick Fill Preset Accounts Drawer (only in login mode) */}
        {mode === 'login' && (
          <div className="mt-8 pt-6 border-t border-white/5 animate-fade-in">
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
        )}

        {/* Mobile App Download Shortcut */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <a
            href="/skill-prime.apk"
            download="skill-prime.apk"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/20 hover:border-brand-cyan/45 text-brand-cyan rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
          >
            <Smartphone className="w-4 h-4 animate-bounce text-brand-cyan" />
            Descargar App para Android (APK)
          </a>
          <p className="text-[8px] text-gray-500 mt-1.5 uppercase tracking-widest leading-relaxed">
            Lleva tus lecciones y videos en tu dispositivo móvil
          </p>
        </div>

      </div>
    </div>
  );
}
