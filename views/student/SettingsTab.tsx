
import React, { useState, useRef } from 'react';
import { 
  Camera, UserCog, Lock, Eye, EyeOff, 
  Info, Save, Loader2, User as UserIcon,
  ShieldCheck, BadgeCheck, LayoutGrid, Trash2,
  RefreshCw
} from 'lucide-react';
import { db } from '../../App';
import { User } from '../../types';

interface SettingsTabProps {
  user: User;
  onUpdateUser?: (u: User) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ user, onUpdateUser }) => {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(user.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Upload & Convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // Max 1MB
        alert("Ukuran foto terlalu besar! Maksimal 1MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAvatar = () => {
    setPreviewAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`);
  };

  const handleUpdate = async () => {
    if (!username) return alert("Username tidak boleh kosong!");
    
    setIsSaving(true);
    try {
      const students = await db.get('elearning_students_list');
      const updatedUser = { 
        ...user, 
        username, 
        avatar: previewAvatar,
        ...(password ? { password } : {}) 
      };
      
      const updatedList = students.map((s: any) => s.id === user.id ? updatedUser : s);
      await db.saveAll('elearning_students_list', updatedList);
      
      if (onUpdateUser) onUpdateUser(updatedUser);
      alert("Profil dan Foto Berhasil Diperbarui!");
    } catch (err) {
      alert("Gagal menyimpan profil. Periksa koneksi internet.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 text-black pb-32">
      
      {/* 1. Profile Header & Photo Upload */}
      <section className="bg-white rounded-[3.5rem] p-10 md:p-14 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50 rounded-full -ml-24 -mb-24 opacity-50"></div>

        <div className="relative z-10 space-y-6">
          <div className="relative group mx-auto w-max">
            <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500 to-indigo-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <img 
              src={previewAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
              className="w-40 h-40 rounded-full border-8 border-white shadow-2xl bg-white object-cover relative" 
              alt="Avatar"
            />
            
            {/* Action Buttons on Avatar */}
            <div className="absolute bottom-2 right-2 flex gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg border-4 border-white hover:scale-110 active:scale-95 transition-all"
                title="Ganti Foto"
              >
                <Camera size={20}/>
              </button>
              <button 
                onClick={resetAvatar}
                className="p-3 bg-white text-rose-500 rounded-2xl shadow-lg border-4 border-white hover:bg-rose-50 hover:scale-110 active:scale-95 transition-all"
                title="Hapus/Reset ke Default"
              >
                <RefreshCw size={20}/>
              </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-indigo-100">
                <BadgeCheck size={14} /> Siswa Terverifikasi
              </span>
              <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-900">
                Kelas {user.classId}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 2. Account Security Section (Editable) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm h-full">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <UserCog size={24}/>
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-800">Keamanan & Akses</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Kredensial Login Anda</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Username Login</label>
                <div className="relative group">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    value={username} 
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} 
                    className="w-full p-5 pl-14 bg-slate-50 border border-slate-200 rounded-[1.8rem] font-black text-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 outline-none transition-all shadow-inner" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ganti Password</label>
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Opsional</span>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="Isi hanya jika ingin mengubah"
                    className="w-full p-5 pl-14 pr-14 bg-slate-50 border border-slate-200 rounded-[1.8rem] font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-600 font-bold leading-relaxed">
                  Gunakan password yang kuat dan mudah diingat. Jika Anda lupa kredensial, hubungi Guru Informatika Anda untuk bantuan reset akun.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Identity Overview (Read Only) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={24} className="text-emerald-400" />
              </div>
              <h4 className="text-xl font-black">Informasi Akademik</h4>
            </div>

            <div className="space-y-6">
              <div className="pb-6 border-b border-white/10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nama Lengkap</p>
                <p className="text-lg font-bold">{user.name}</p>
              </div>
              <div className="pb-6 border-b border-white/10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ID Siswa / NIS</p>
                <p className="text-lg font-bold">#{user.id.replace('std_', '')}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Keanggotaan</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-lg font-bold">Aktif & Terdaftar</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LayoutGrid size={20} className="text-slate-400" />
                <p className="text-xs font-bold text-slate-300">Kelas Aktif</p>
              </div>
              <p className="text-xl font-black text-emerald-400">{user.classId}</p>
            </div>
          </div>

          {/* 4. Save Button Action */}
          <button 
            onClick={handleUpdate} 
            disabled={isSaving}
            className="w-full py-6 bg-emerald-600 text-white rounded-[2.5rem] font-black text-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-emerald-100 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={28} className="animate-spin" /> : <Save size={28} />}
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default SettingsTab;
