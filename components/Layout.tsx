
import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User as UserIcon, Bell, X, Check, Info, BookOpen, ClipboardList, CheckCircle, UserPlus } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: 'material' | 'task' | 'grade' | 'registration';
  createdAt: string;
}

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
  sidebarItems: { icon: any; label: string; id: string }[];
  activeView: string;
  setActiveView: (id: string) => void;
  logoUrl: string;
  siteName: string;
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  onLogout, 
  sidebarItems, 
  activeView, 
  setActiveView,
  logoUrl,
  siteName,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'material': return <BookOpen size={16} className="text-emerald-500" />;
      case 'task': return <ClipboardList size={16} className="text-purple-500" />;
      case 'grade': return <CheckCircle size={16} className="text-blue-500" />;
      case 'registration': return <UserPlus size={16} className="text-orange-500" />;
      default: return <Info size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex flex-col gap-3">
          <img src={logoUrl} alt="Logo" className="h-12 w-auto object-contain self-start rounded-lg" />
          <span className="font-bold text-slate-800 text-xs leading-tight opacity-70 uppercase tracking-widest">{siteName}</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeView === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain md:hidden" />
            <h2 className="text-lg font-semibold text-slate-800 capitalize">
              {sidebarItems.find(i => i.id === activeView)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-xl transition-all relative ${showNotifications ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h4 className="font-black text-slate-800">Notifikasi Terbaru</h4>
                    {unreadCount > 0 && (
                      <button 
                        onClick={onMarkAllAsRead}
                        className="text-[10px] font-black text-emerald-600 uppercase hover:underline"
                      >
                        Tandai Semua Dibaca
                      </button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <Bell className="mx-auto text-slate-100 mb-4" size={48} />
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Belum ada notifikasi</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => onMarkAsRead?.(notif.id)}
                          className={`p-5 flex gap-4 cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${!notif.read ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!notif.read ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                            {getIcon(notif.type)}
                          </div>
                          <div className="flex-1">
                            <p className={`text-xs ${!notif.read ? 'font-black text-slate-800' : 'font-semibold text-slate-600'}`}>{notif.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2">{notif.createdAt}</p>
                          </div>
                          {!notif.read && <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role}</p>
              </div>
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-emerald-100 bg-white"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 px-2 z-50">
        {sidebarItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
              activeView === item.id ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
          </button>
        ))}
        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-1 p-2 text-red-400"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium">Keluar</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
