import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import RoleSwitcher from './components/RoleSwitcher';
import VideoPlayer from './components/VideoPlayer';
import Catalog from './components/user/Catalog';
import Login from './components/Login';
import Dashboard from './components/admin/Dashboard';
import SubscriberList from './components/admin/SubscriberList';
import ContentCMS from './components/admin/ContentCMS';
import { LayoutDashboard, Users, Film, Loader2 } from 'lucide-react';

function AppContent() {
  const { user, userRole, authLoading, loginSuccess } = useApp();
  const [adminTab, setAdminTab] = useState('dashboard'); // dashboard, subscribers, content

  // 1. Loading State Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#060709] flex flex-col items-center justify-center text-gray-400 gap-3">
        <Loader2 className="w-10 h-10 text-brand-red animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 animate-pulse">
          Cargando Skill Prime...
        </span>
      </div>
    );
  }

  // 2. Unauthenticated Gatekeeper
  if (!user) {
    return <Login onLoginSuccess={loginSuccess} />;
  }

  const renderAdminView = () => {
    switch (adminTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'subscribers':
        return <SubscriberList />;
      case 'content':
        return <ContentCMS />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#060709] flex flex-col font-sans text-gray-200">
      {/* Global Navbar */}
      <Navbar />

      {/* Main Content Area */}
      {userRole === 'admin' ? (
        /* Super Admin Workspace Layout */
        <div className="flex-grow max-w-7xl w-full mx-auto px-6 md:px-12 py-8 space-y-6">
          {/* Admin Navigation Tabs */}
          <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar gap-2">
            <button
              onClick={() => setAdminTab('dashboard')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                adminTab === 'dashboard'
                  ? 'border-brand-red text-white bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/2'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-brand-red" />
              Métricas
            </button>
            <button
              onClick={() => setAdminTab('subscribers')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                adminTab === 'subscribers'
                  ? 'border-brand-red text-white bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/2'
              }`}
            >
              <Users className="w-4 h-4 text-brand-cyan" />
              Suscriptores
            </button>
            <button
              onClick={() => setAdminTab('content')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                adminTab === 'content'
                  ? 'border-brand-red text-white bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/2'
              }`}
            >
              <Film className="w-4 h-4 text-brand-accent" />
              Contenidos VOD
            </button>
          </div>

          {/* Sub Tab View Container */}
          <div className="pt-4">
            {renderAdminView()}
          </div>
        </div>
      ) : (
        /* Normal Subscriber Catalog Layout */
        <div className="flex-grow">
          <Catalog />
        </div>
      )}

      {/* Global Custom Playback Layer */}
      <VideoPlayer />

      {/* Development / Simulation Widget */}
      <RoleSwitcher />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
