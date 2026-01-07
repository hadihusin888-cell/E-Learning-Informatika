
import React, { useState } from 'react';
import { 
  Globe, LayoutDashboard, Link as LinkIcon, Image as ImageIcon, 
  Shield, UserCog, Key, User as UserIcon, EyeOff, Eye, 
  Loader2, Save, Cloud, Palette, Monitor, Camera, 
  CheckCircle2, Info, ArrowRight, Sparkles, Database,
  TableProperties
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
  const [showDbGuide, setShowDbGuide] = useState(false);

  const handleSave = async () => {
    if (!settings.siteName || !adminName || !adminUsername) {
      alert("Nama Platform, Nama Guru, dan Username tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Save Site Settings (Visual & Identitas)
      // Objek settings dikirim langsung sesuai struktur kolom: logoUrl, heroImageUrl, siteName
      await db.saveAll('elearning_site_settings', {
        logoUrl: settings.logoUrl,
        heroImageUrl: settings.heroImageUrl,
        siteName: settings.siteName
      });
      
      // 2. Save Admin Account Details
      const admins = await db.get('elearning_admins_list');
      const adminList = Array.isArray(admins) ? admins : [];
      
      const updatedUser = { 
        ...user, 
        name: adminName, 
        username: adminUsername, 
        password: adminPassword || user.password,
        password_admin: adminPassword || user.password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUsername}`
      };
      
      const updatedList = adminList.map((a: any) => a.id === user.id ? updatedUser : a);
      if (!adminList.find((a: any) => a.id === user.id)) {
        updatedList.push(updatedUser);
      }
      
      await db.saveAll('elearning_admins_list', updatedList);
      
      if (onUpdateUser) onUpdateUser(updatedUser);
      
      alert('Konfigurasi Berhasil Disimpan ke Database Cloud!');
    } catch (err) {
      console.error(err);
      alert('Gagal sinkronisasi data. Pastikan Apps Script aktif.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 text-black pb-32 px-4">
      {/* Header & Save Action */}
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
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setShowDbGuide(!showDbGuide)}
            className="px-6 py-5 bg-white border border-slate-200 text-slate-600 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            <Database size={18} /> {showDbGuide ? 'Tutup Panduan' : 'Struktur Database'}
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="group px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
            {isSaving ? 'Menyimpan...' : 'Simpan Semua'}
          </button>
        </div>
      </div>

      {/* Database Column Guide Section */}
      {showDbGuide && (
        <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-[3rem] animate-in zoom-in-95 duration-300">
           <div className="flex items-center gap-3 mb-6">
              <TableProperties className="text-amber-600" />
              <h4 className="text-lg font-black text-amber-900 uppercase tracking-tight">Panduan Kolom Google Sheets</h4>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">1. Sheet: elearning_site_settings</p>
                 <div className="bg-white p-4 rounded-2xl border border-amber-200 overflow-x-auto">
                    <table className="w-full text-[10px] font-mono">
                       <thead>
                          <tr className="border-b border-slate-100">
                             <th className="p-2 text-emerald-600">logoUrl</th>
                             <th className="p-2 text-emerald-600">heroImageUrl</th>
                             <th className="p-2 text-emerald-600">siteName</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr>
                             <td className="p-2 text-slate-400 italic">https://...</td>
                             <td className="p-2 text-slate-400 italic">https://...</td>
                             <td className="p-2 text-slate-400 italic">Informatika SMP...</td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
              </div>
              <div className="space-y-4">
                 <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">2. Sheet: elearning_admins_list</p>
                 <p className="text-[10px] text-amber-700 leading-relaxed">Pastikan baris pertama berisi kolom: <b>id, username, name, password_admin, role, avatar</b>. Sistem akan mengupdate baris berdasarkan ID login Anda.</p>
              </div>
           </div>
        </div>
      )}

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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-10">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden h-fit">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
