
import React, { useState, useEffect } from 'react';
import LandingPage from './views/LandingPage.tsx';
import AdminDashboard from './views/AdminDashboard.tsx';
import StudentDashboard from './views/StudentDashboard.tsx';
import Login from './views/Login.tsx';
import Signup from './views/Signup.tsx';
import { User, Role, SiteSettings, ClassRoom } from './types.ts';
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

// GANTI URL INI DENGAN URL DEPLOY BARU ANDA
export const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyWHzmyMRZfUJdFZB0cKA-z-gXqeZOb2djiwbTpyUIky6WRJ_r_24WVBK2pZ4rFRM4Izw/exec"; 

const isConfigured = !GAS_API_URL.includes("XXXXXXXXXXXX");

export const db = {
  get: async (key: string) => {
    const localData = JSON.parse(localStorage.getItem(key) || "[]");
    if (!isConfigured) return localData;
    try {
      // Tambahkan timestamp untuk menghindari cache browser yang sering terjadi pada Apps Script
      const timestamp = new Date().getTime();
      const response = await fetch(`${GAS_API_URL}?key=${key}&_=${timestamp}`);
      if (!response.ok) throw new Error("Fetch failed");
      const cloudData = await response.json();
      localStorage.setItem(key, JSON.stringify(cloudData));
      return cloudData;
    } catch (err) {
      console.warn(`Gagal mengambil data ${key} dari cloud, menggunakan data lokal.`);
      return localData;
    }
  },
  
  saveAll: async (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
    if (!isConfigured) return;
    
    window.dispatchEvent(new CustomEvent('sync-start'));
    try {
      await fetch(GAS_API_URL, {
        method: "POST",
        body: JSON.stringify({ action: 'SAVE_ALL', key, value })
      });
      window.dispatchEvent(new CustomEvent('sync-end'));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('sync-error'));
    }
  },

  append: async (key: string, value: any) => {
    const current = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([value, ...current]));
    
    if (!isConfigured) return;
    window.dispatchEvent(new CustomEvent('sync-start'));
    try {
      await fetch(GAS_API_URL, {
        method: "POST",
        body: JSON.stringify({ action: 'APPEND_ROW', key, value })
      });
      window.dispatchEvent(new CustomEvent('sync-end'));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('sync-error'));
    }
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'dashboard'>('landing');
  const [loginRole, setLoginRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [settings, setSettings] = useState<SiteSettings>({
    logoUrl: 'https://www.alirsyad.or.id/wp-content/uploads/download/alirsyad-alislamiyyah.png',
    heroImageUrl: 'https://cdn.fpt-is.com/vi/he-thong-elearning-1.png',
    siteName: 'Informatika SMP Al Irsyad Surakarta'
  });

  useEffect(() => {
    const handleSyncStart = () => setSyncStatus('syncing');
    const handleSyncEnd = () => {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    };
    const handleSyncError = () => {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    };

    window.addEventListener('sync-start', handleSyncStart);
    window.addEventListener('sync-end', handleSyncEnd);
    window.addEventListener('sync-error', handleSyncError);

    return () => {
      window.removeEventListener('sync-start', handleSyncStart);
      window.removeEventListener('sync-end', handleSyncEnd);
      window.removeEventListener('sync-error', handleSyncError);
    };
  }, []);

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const storedSettings = await db.get('elearning_site_settings');
        if (storedSettings && !Array.isArray(storedSettings) && typeof storedSettings === 'object') {
          // Hanya update jika data dari DB memiliki properti yang diperlukan
          if (storedSettings.siteName) {
            setSettings(storedSettings);
          }
        }
        
        const classes = await db.get('elearning_classes_list');
        if (!classes || (Array.isArray(classes) && classes.length === 0)) {
          const defaultClasses: ClassRoom[] = [
            { id: 'c1', name: '7A', homeroomTeacher: 'Bpk. Irsyad Maulana, S.Kom' },
            { id: 'c2', name: '7B', homeroomTeacher: 'Ibu Siti Aminah, M.Pd' },
            { id: 'c3', name: '8A', homeroomTeacher: 'Bpk. Budi Setiawan, S.T' }
          ];
          await db.saveAll('elearning_classes_list', defaultClasses);
        }

        const sessionUser = sessionStorage.getItem('e_learning_user');
        const persistentUser = localStorage.getItem('e_learning_user');
        const storedUserRaw = sessionUser || persistentUser;

        if (storedUserRaw) {
          setUser(JSON.parse(storedUserRaw));
          setView('dashboard');
        }
      } catch (err) {
        console.error("Initialization Failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    if (u.role === 'STUDENT') {
      sessionStorage.setItem('e_learning_user', JSON.stringify(u));
      localStorage.removeItem('e_learning_user');
    } else {
      localStorage.setItem('e_learning_user', JSON.stringify(u));
      sessionStorage.removeItem('e_learning_user');
    }
    setView('dashboard');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    if (updatedUser.role === 'STUDENT') {
      sessionStorage.setItem('e_learning_user', JSON.stringify(updatedUser));
    } else {
      localStorage.setItem('e_learning_user', JSON.stringify(updatedUser));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('e_learning_user');
    sessionStorage.removeItem('e_learning_user');
    setView('landing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Memuat Sistem...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-emerald-100 selection:text-emerald-900 relative">
      {/* Global Sync Indicator */}
      <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border transition-all duration-500 transform ${
        syncStatus === 'idle' ? 'translate-y-[-100px] opacity-0' : 'translate-y-0 opacity-100'
      } ${
        syncStatus === 'syncing' ? 'bg-blue-600 border-blue-400 text-white' : 
        syncStatus === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' : 
        'bg-red-600 border-red-400 text-white'
      }`}>
        {syncStatus === 'syncing' && <RefreshCw className="animate-spin" size={16} />}
        {syncStatus === 'success' && <CheckCircle size={16} />}
        {syncStatus === 'error' && <AlertCircle size={16} />}
        <span className="text-[10px] font-black uppercase tracking-widest">
          {syncStatus === 'syncing' ? 'Menyimpan...' : 
           syncStatus === 'success' ? 'Berhasil Disimpan' : 
           'Gagal Sinkron'}
        </span>
      </div>

      {view === 'landing' && <LandingPage onNavigateLogin={(role) => { setLoginRole(role); setView('login'); }} onNavigateSignup={() => setView('signup')} settings={settings} />}
      {view === 'login' && <Login role={loginRole || 'STUDENT'} onBack={() => setView('landing')} onLogin={handleLogin} onNavigateSignup={() => setView('signup')} />}
      {view === 'signup' && <Signup onBack={() => setView('login')} onSignup={() => { setLoginRole('STUDENT'); setView('login'); }} />}
      {view === 'dashboard' && user && (
        user.role === 'ADMIN' 
          ? <AdminDashboard user={user} onLogout={handleLogout} settings={settings} setSettings={setSettings} onUpdateUser={handleUpdateUser} /> 
          : <StudentDashboard user={user} onLogout={handleLogout} settings={settings} onUpdateUser={handleUpdateUser} />
      )}
    </div>
  );
};

export default App;
