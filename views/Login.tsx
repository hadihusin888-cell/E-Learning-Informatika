
import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User as UserIcon, Info, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Role, User } from '../types';
import { db } from '../App';

interface LoginProps {
  role: Role;
  onBack: () => void;
  onLogin: (user: User) => void;
  onNavigateSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ role, onBack, onLogin, onNavigateSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'ADMIN') {
        const adminList = await db.get('elearning_admins_list');
        const adminUsers = Array.isArray(adminList) ? adminList : [];
        
        const foundAdmin = adminUsers.find((a: any) => a.username.toLowerCase() === username.toLowerCase());
        
        if (foundAdmin) {
          if (foundAdmin.password === password) {
            onLogin({ ...foundAdmin, role: 'ADMIN' });
            setLoading(false);
            return;
          } else {
            setError('Password Admin salah.');
            setLoading(false);
            return;
          }
        }

        if (username === 'admin' && password === 'admin') {
          const adminUser: User = {
            id: 'admin_1',
            username: 'admin',
            name: 'Admin Informatika',
            role: 'ADMIN',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`
          };
          onLogin(adminUser);
        } else {
          setError('Username atau Password Admin tidak terdaftar.');
        }
        setLoading(false);
        return;
      }

      const students = await db.get('elearning_students_list');
      const pendingStudents = await db.get('elearning_pending_students');

      const studentList = Array.isArray(students) ? students : [];
      const pendingList = Array.isArray(pendingStudents) ? pendingStudents : [];

      const foundStudent = studentList.find((s: any) => s.username.toLowerCase() === username.toLowerCase());
      const isPending = pendingList.some((s: any) => s.username.toLowerCase() === username.toLowerCase());

      if (foundStudent) {
        if (foundStudent.password === password) {
          onLogin({ ...foundStudent, role: 'STUDENT' });
        } else {
          setError('Password yang Anda masukkan salah.');
        }
      } else if (isPending) {
        setError('Akun Anda masih dalam status "Menunggu Konfirmasi" dari Admin/Guru.');
      } else {
        setError('Username tidak terdaftar di sistem kami.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi saat verifikasi login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex flex-1 bg-emerald-600 items-center justify-center p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400 rounded-full -ml-48 -mb-48 opacity-30"></div>
        <div className="relative z-10 text-white max-w-md text-center lg:text-left">
          <h2 className="text-5xl font-extrabold mb-6 leading-tight">
            Portal {role === 'ADMIN' ? 'Guru' : 'Siswa'} Informatika
          </h2>
          <p className="text-xl text-emerald-50 mb-10 opacity-90">
            Akses materi, kerjakan tugas, dan lihat progres belajarmu dalam satu platform modern yang tersinkronisasi.
          </p>
          <div className="p-1 bg-white/20 backdrop-blur-lg rounded-[2rem]">
            <img 
              src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop`} 
              alt="Login" 
              className="rounded-[1.8rem] shadow-2xl"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-800 mb-10 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
          </button>

          <div className="mb-10">
            <h3 className="text-3xl font-bold text-slate-900 mb-2">Masuk Akun</h3>
            <p className="text-slate-500 font-medium">Silakan masuk sebagai <span className="text-emerald-600 font-black uppercase tracking-wider">{role}</span></p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-black font-bold shadow-inner"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-black font-bold shadow-inner"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                'Masuk Sekarang'
              )}
            </button>
          </form>

          {role === 'STUDENT' ? (
            <div className="mt-10 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
               <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest mb-3">
                  <Info size={16} /> Bantuan Login
               </div>
               <p className="text-xs text-slate-500 font-medium leading-relaxed">
                 Gunakan username dan password yang telah didaftarkan. Akun Anda harus <span className="text-emerald-600 font-black italic underline">disetujui oleh Admin/Guru</span> sebelum dapat masuk ke kelas.
               </p>
               <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                  <p className="text-slate-500 text-sm font-medium">
                    Belum punya akun? <button onClick={onNavigateSignup} className="font-black text-emerald-600 hover:underline">Daftar Akun Baru</button>
                  </p>
               </div>
            </div>
          ) : (
            <div className="mt-8 p-5 bg-slate-50 rounded-2xl text-[10px] text-center text-slate-400 font-black uppercase tracking-widest border border-slate-100">
              Punya kendala login? Hubungi administrator sekolah.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
