
import React, { useState, useEffect } from 'react';
import LandingPage from './views/LandingPage.tsx';
import AdminDashboard from './views/AdminDashboard.tsx';
import StudentDashboard from './views/StudentDashboard.tsx';
import Login from './views/Login.tsx';
import Signup from './views/Signup.tsx';
import { User, Role, SiteSettings, ClassRoom } from './types.ts';
import { Loader2 } from 'lucide-react';

export const GAS_API_URL = "https://script.google.com/macros/s/AKfycbwb1wNjHVDYFq-xSpsg_jzMFIciwAlX4ZGHU5pdyjZvO-MfviwMCwfPz_Xe6xZABqv9Yg/exec"; 

const isConfigured = !GAS_API_URL.includes("XXXXXXXXXXXX");

export const db = {
  get: async (key: string) => {
    const localData = JSON.parse(localStorage.getItem(key) || "[]");
    if (!isConfigured) return localData;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(`${GAS_API_URL}?key=${key}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("Network response not ok");
      const cloudData = await response.json();
      localStorage.setItem(key, JSON.stringify(cloudData));
      return cloudData;
    } catch (err) {
      console.warn(`Cloud Fetch Failed for ${key}, using LocalStorage.`, err);
      return localData;
    }
  },
  set: async (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
    if (!isConfigured) return;
    try {
      fetch(GAS_API_URL, {
        method: "POST",
        mode: "no-cors", 
        body: JSON.stringify({ key, value })
      }).catch(e => console.error("Async Cloud Save Failed:", e));
    } catch (err) {
      console.error("DB Set Sync Error:", err);
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
        const storedSettings = await db.get('elearning_site_settings');
        if (storedSettings && !Array.isArray(storedSettings) && typeof storedSettings === 'object') {
          setSettings(storedSettings);
        } else {
          await db.set('elearning_site_settings', settings);
        }
        
        const classes = await db.get('elearning_classes_list');
        if (!classes || classes.length === 0) {
          const defaultClasses: ClassRoom[] = [
            { id: 'c1', name: '7A', homeroomTeacher: 'Bpk. Irsyad Maulana, S.Kom' },
            { id: 'c2', name: '7B', homeroomTeacher: 'Ibu Siti Aminah, M.Pd' },
            { id: 'c3', name: '8A', homeroomTeacher: 'Bpk. Budi Setiawan, S.T' }
          ];
          await db.set('elearning_classes_list', defaultClasses);
        }

        // Cek sesi: Siswa di sessionStorage, Admin di localStorage
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
      // Siswa: Gunakan sessionStorage agar logout saat browser ditutup
      sessionStorage.setItem('e_learning_user', JSON.stringify(u));
      localStorage.removeItem('e_learning_user'); // Pastikan tidak tertinggal di persistent storage
    } else {
      // Admin: Gunakan localStorage agar tetap login
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
        <p className="text-slate-500 font-bold animate-pulse tracking-wide uppercase text-sm">SMP AL Irsyad Surakarta</p>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'landing':
        return <LandingPage onNavigateLogin={navigateToLogin} onNavigateSignup={navigateToSignup} settings={settings} />;
      case 'login':
        return <Login role={loginRole || 'STUDENT'} onBack={() => setView('landing')} onLogin={handleLogin} onNavigateSignup={navigateToSignup} />;
      case 'signup':
        return <Signup onBack={() => setView('login')} onSignup={() => { setLoginRole('STUDENT'); setView('login'); }} />;
      case 'dashboard':
        if (!user) return null;
        return user.role === 'ADMIN' 
          ? <AdminDashboard user={user} onLogout={handleLogout} settings={settings} setSettings={setSettings} onUpdateUser={handleUpdateUser} /> 
          : <StudentDashboard user={user} onLogout={handleLogout} settings={settings} onUpdateUser={handleUpdateUser} />;
      default:
        return <LandingPage onNavigateLogin={navigateToLogin} onNavigateSignup={navigateToSignup} settings={settings} />;
    }
  };

  return <div className="min-h-screen selection:bg-emerald-100 selection:text-emerald-900">{renderView()}</div>;
};

export default App;
