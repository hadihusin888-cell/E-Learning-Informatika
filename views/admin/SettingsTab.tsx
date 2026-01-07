
import React, { useState } from 'react';
import { 
  Globe, LayoutDashboard, Link as LinkIcon, Image as ImageIcon, 
  Shield, UserCog, Key, User as UserIcon, EyeOff, Eye, 
  Loader2, Save, Cloud, Palette, Monitor, Camera, 
  CheckCircle2, Info, ArrowRight, Sparkles
} from 'lucide-react';
import { db } from '../../App.tsx';
import { SiteSettings, User } from '../../types.ts';

interface SettingsTabProps {
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
  user: User;
  onUpdateUser: (u: User) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ settings, setSettings, user, onUpdateUser }) => {
  const [adminName, setAdminName] = useState(user.name);
  const [adminUsername, setAdminUsername] = useState(user.username);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!settings.siteName || !adminName || !adminUsername) {
      alert("Nama Platform, Nama Guru, dan Username tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    try {
      // Save Site Settings
      await db.saveAll('elearning_site_settings', settings);
      
      // Save Admin Account Details
      const admins = await db.get('elearning_admins_list');
      const adminList = Array.isArray(admins) ? admins : [];
      
      const updatedUser = { 
        ...user, 
        name: adminName, 
        username: adminUsername, 
        // Menggunakan field 'password' untuk aplikasi dan 'password_admin' untuk database sheet
        password: adminPassword || user.password,
        password_admin: adminPassword || user.password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUsername}`
      };
      
      const updatedList = adminList.map((a: User) => a.id === user.id ? updatedUser : a);
      if (!adminList.find((a: User) => a.id === user.id)) {
        updatedList.push(updatedUser);
      }
      
      await db.saveAll('elearning_admins_list', updatedList);
      
      if (onUpdateUser) onUpdateUser(updatedUser);
      
      alert('Konfigurasi Sistem Berhasil Diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pengaturan. Periksa koneksi Anda.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 text-black pb-32 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={12} /> System Configuration
            </div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Pengaturan Platform</h2>
          <p className="text-slate-500 font-medium text-lg mt-2">Personalisasi identitas visual dan keamanan akun administrator.</p>
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="group px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
          {isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-10">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full -mr-16 -mt-16"></div>
            
            <div className="flex items-center gap-5 mb-10 relative z-10">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Globe size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">Visual & Identitas</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Branding Website</p>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Platform E-Learning</label>
                <div className="relative group">
                  <LayoutDashboard className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    value={settings.siteName} 
                    onChange={e => setSettings({...settings, siteName: e.target.value})} 
                    className="w-full p-5 pl-14 bg-slate-50 border border-slate-100 rounded-[1.8rem] font-black text-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 outline-none transition-all shadow-inner" 
                    placeholder="Contoh: Informatika SMP Al Irsyad"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo URL (PNG/SVG/WebP)</label>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1 w-full relative group">
                    <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input 
                      value={settings.logoUrl} 
                      onChange={e => setSettings({...settings, logoUrl: e.target.value})} 
                      className="w-full p-5 pl-14 bg-slate-50 border border-slate-100 rounded-[1.8rem] font-bold text-slate-600 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner" 
                      placeholder="https://link-gambar-logo.png"
                    />
                  </div>
                  <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] flex items-center justify-center p-3 shrink-0 group overflow-hidden shadow-inner">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" onError={(e) => (e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/2942/2942789.png')} />
                    ) : (
                      <Palette size={24} className="text-slate-200" />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Hero Image URL (Gambar Depan)</label>
                <div className="space-y-4">
                  <div className="relative group">
                    <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input 
                      value={settings.heroImageUrl} 
                      onChange={e => setSettings({...settings, heroImageUrl: e.target.value})} 
                      className="w-full p-5 pl-14 bg-slate-50 border border-slate-100 rounded-[1.8rem] font-bold text-slate-600 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner" 
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden border-2 border-slate-100 bg-slate-50 group shadow-lg">
                    {settings.heroImageUrl ? (
                      <img src={settings.heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        <Monitor size={48} className="text-slate-200" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Pratinjau Gambar Utama</p>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[9px] font-black uppercase rounded-full">Preview Mode</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-10">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16"></div>

            <div className="flex items-center gap-5 mb-10 relative z-10">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Shield size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">Keamanan Guru</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Akses Administrator</p>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="flex flex-col items-center py-4 bg-slate-50 rounded-[2.5rem] border border-slate-100 mb-2 shadow-inner">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUsername}`} 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white mb-4" 
                  alt="Admin Avatar"
                />
                <h4 className="font-black text-slate-800">{adminName || 'Nama Guru'}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: Administrator Utama</p>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap Guru</label>
                <div className="relative group">
                  <UserCog className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    value={adminName} 
                    onChange={e => setAdminName(e.target.value)} 
                    className="w-full p-5 pl-14 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 text-blue-600">ID Login (Username)</label>
                <div className="relative group">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    value={adminUsername} 
                    onChange={e => setAdminUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} 
                    className="w-full p-5 pl-14 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-blue-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ganti Password</label>
                  <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">Opsional</span>
                </div>
                <div className="relative group">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={adminPassword} 
                    onChange={e => setAdminPassword(e.target.value)} 
                    placeholder="Masukkan password baru" 
                    className="w-full p-5 pl-14 pr-14 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-slate-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-all focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic ml-1 leading-relaxed">Kosongkan jika tidak ingin mengubah password saat ini.</p>
              </div>

              <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-start gap-4 shadow-inner">
                <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-600 font-bold leading-relaxed">
                  Perubahan username atau password akan memaksa sesi login di perangkat lain untuk diperbarui pada sesi berikutnya. Aplikasi akan menyinkronkan data ke kolom 'password_admin' di database.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Cloud size={20} className="text-emerald-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Cloud Sync Active</span>
            </div>
            <p className="text-sm opacity-60 font-medium leading-relaxed">
              Semua pengaturan akan langsung disinkronkan ke database cloud dan akan diterapkan ke seluruh portal siswa secara realtime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
