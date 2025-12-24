
import React, { useState, useEffect } from 'react';
import LandingPage from './views/LandingPage';
import AdminDashboard from './views/AdminDashboard';
import StudentDashboard from './views/StudentDashboard';
import Login from './views/Login';
import Signup from './views/Signup';
import { User, Role, SiteSettings, ClassRoom } from './types';
import { Loader2 } from 'lucide-react';

// URL Google Apps Script sebagai backend database
export const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzuUN5UZEMH8RSYz6O8Ek-YLGQ4kyH4qmijkWjS_DBhjiOOvaENGs2nk9Znmx8qFTtaoA/exec"; 

const isConfigured = GAS_API_URL && !GAS_API_URL.includes("XXXXXXXXXXXX");

export const db = {
  get: async (key: string) => {
    const localData = JSON.parse(localStorage.getItem(key) || "[]");
    if (!isConfigured) return localData;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Timeout 8 detik
      const response = await fetch(`${GAS_API_URL}?key=${key}`, { 
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("Network response not ok");
      const cloudData = await response.json();
      
      // Update local storage jika data cloud tersedia
      if (cloudData) {
        localStorage.setItem(key, JSON.stringify(cloudData));
        return cloudData;
      }
      return localData;
    } catch (err) {
      console.warn(`[DB Get] Cloud sync failed for ${key}, using LocalStorage fallback.`);
      return localData;
    }
  },
  set: async (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
    if (!isConfigured) return;
    try {
      // Menggunakan mode cors jika memungkinkan, atau keep-alive untuk reliabilitas
      fetch(GAS_API_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      }).catch(e => console.error("[DB Set] Cloud write failed:", e));
    } catch (err) {
      console.error("[DB Set] Sync Error:", err);
    }
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'dashboard'>('landing');
  const [loginRole, setLoginRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>({
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/2942/2942789.png',
    heroImageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
    siteName: 'Informatika SMP AL Irsyad Surakarta'
  });

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        
        // Memuat Pengaturan Situs
        const storedSettings = await db.get('elearning_site_settings');
        if (storedSettings && !Array.isArray(storedSettings) && Object.keys(storedSettings).length > 0) {
          setSettings(storedSettings);
        } else {
          await db.set('elearning_site_settings', settings);
        }

        // Inisialisasi Kelas Default jika kosong
        const classes = await db.get('elearning_classes_list');
        if (!classes || classes.length === 0) {
          const defaultClasses: ClassRoom[] = [
            { id: 'c1', name: '7A', homeroomTeacher: 'Bpk. Irsyad Maulana, S.Kom' },
            { id: 'c2', name: '7B', homeroomTeacher: 'Ibu Siti Aminah, M.Pd' },
            { id: 'c3', name: '8A', homeroomTeacher: 'Bpk. Budi Setiawan, S.T' }
          ];
          await db.set('elearning_classes_list', defaultClasses);
        }

        // Cek Sesi User
        const storedUser = localStorage.getItem('e_learning_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Verifikasi ulang status user ke cloud jika perlu di sini
          setUser(parsedUser);
          setView('dashboard');
        }
      } catch (err) {
        console.error("Critical Initialization Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('e_learning_user', JSON.stringify(u));
    setView('dashboard');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('e_learning_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('e_learning_user');
    setView('landing');
  };

  const navigateToLogin = (role: Role) => {
    setLoginRole(role);
    setView('login');
  };

  const navigateToSignup = () => {
    setView('signup');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mb-4" />
          <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl animate-pulse"></div>
        </div>
        <p className="text-slate-900 font-black tracking-tight animate-pulse text-xl">SMP AL IRSYAD SURAKARTA</p>
        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-[0.2em] font-black">E-Learning Informatika</p>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'landing':
        return <LandingPage onNavigateLogin={navigateToLogin} onNavigateSignup={navigateToSignup} settings={settings} />;
      case 'login':
        return <Login 
          role={loginRole || 'STUDENT'} 
          onBack={() => setView('landing')} 
          onLogin={handleLogin} 
          onNavigateSignup={navigateToSignup}
        />;
      case 'signup':
        return <Signup onBack={() => setView('login')} onSignup={() => {
          setLoginRole('STUDENT');
          setView('login');
        }} />;
      case 'dashboard':
        if (!user) return null;
        return user.role === 'ADMIN' 
          ? <AdminDashboard user={user} onLogout={handleLogout} settings={settings} setSettings={setSettings} onUpdateUser={handleUpdateUser} /> 
          : <StudentDashboard user={user} onLogout={handleLogout} settings={settings} onUpdateUser={handleUpdateUser} />;
      default:
        return <LandingPage onNavigateLogin={navigateToLogin} onNavigateSignup={navigateToSignup} settings={settings} />;
    }
  };

  return (
    <div className="min-h-screen selection:bg-emerald-600 selection:text-white">
      {renderView()}
    </div>
  );
};

export default App;
