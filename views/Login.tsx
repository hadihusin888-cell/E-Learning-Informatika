
import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User as UserIcon, Info, Loader2, Eye, EyeOff, AlertCircle, RefreshCw, Cloud, HelpCircle } from 'lucide-react';
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
  const [syncStatus, setSyncStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSyncStatus('Memverifikasi dengan Database Cloud...');

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    try {
      if (role === 'ADMIN') {
        // 1. Cek Admin
        const adminList = await db.get('elearning_admins_list');
        const adminUsers = Array.isArray(adminList) ? adminList : [];
        
        // Root fallback jika database kosong
        if (adminUsers.length === 0 && cleanUsername.toLowerCase() === 'admin' && cleanPassword === 'admin') {
           onLogin({ id: 'root', username: 'admin', name: 'Admin Root', role: 'ADMIN' });
           return;
        }

        const foundAdmin = adminUsers.find((a: any) => a?.username?.toLowerCase() === cleanUsername.toLowerCase());
        
        if (foundAdmin) {
          // ADMIN menggunakan field 'password_admin' di Google Sheets
          const dbPassword = String(foundAdmin.password_admin || foundAdmin.password || "");
          
          if (dbPassword === cleanPassword) {
            onLogin({ ...foundAdmin, role: 'ADMIN', password: dbPassword });
            return;
          } else {
            setError('Password Guru salah. Periksa kembali Caps Lock Anda.');
          }
        } else {
          setError('Username Guru tidak ditemukan di database.');
        }
      } else {
        // 2. Cek Siswa
        const students = await db.get('elearning_students_list');
        const pendingStudents = await db.get('elearning_pending_students');

        const studentList = Array.isArray(students) ? students : [];
        const pendingList = Array.isArray(pendingStudents) ? pendingStudents : [];

        const foundStudent = studentList.find((s: any) => s?.username?.toLowerCase() === cleanUsername.toLowerCase());
        const isPending = pendingList.some((s: any) => s?.username?.toLowerCase() === cleanUsername.toLowerCase());

        if (foundStudent) {
          // SISWA menggunakan field 'password' di Google Sheets
          const dbPassword = String(foundStudent.password || "");
          
          if (dbPassword === cleanPassword) {
            onLogin({ ...foundStudent, role: 'STUDENT', password: dbPassword });
            return;
          } else {
            setError('Password Siswa salah. Hubungi Guru jika Anda lupa.');
          }
        } else if (isPending) {
          setError('Akun Anda masih menunggu persetujuan (Pending) dari Guru.');
        } else {
          setError('Username tidak terdaftar. Silakan daftar terlebih dahulu.');
        }
      }
    } catch (err) {
      setError('Gagal sinkronisasi data. Pastikan Apps Script sudah di-deploy dengan benar.');
    } finally {
      setLoading(false);
      setSyncStatus('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className="hidden md:flex flex-1 bg-emerald-600 items-center justify-center p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400 rounded-full -ml-48 -mb-48 opacity-30"></div>
        <div className="relative z-10 text-white max-w-md">
          <h2 className="text-5xl font-extrabold mb-6 leading-tight">Portal {role === 'ADMIN' ? 'Guru' : 'Siswa'}</h2>
          <p className="text-xl opacity-90 font-medium">Masuk untuk memulai aktivitas belajar Informatika hari ini.</p>
          
          {/* Foto Ilustrasi yang ditambahkan */}
          <div className="mt-10 relative group">
            <div className="absolute -inset-1 bg-white/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <img 
              src="https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Informatics Learning Environment" 
              className="relative rounded-[2rem] shadow-2xl border-4 border-white/20 w-full object-cover aspect-video group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 mb-10 transition-colors font-bold"><ArrowLeft size={18} /> Kembali</button>

          <div className="mb-10">
            <h3 className="text-4xl font-black text-slate-900 mb-2">Login Akun</h3>
            <p className="text-slate-500 font-medium">Akses Database <span className="text-emerald-600 font-black uppercase tracking-widest">{role}</span></p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-[1.5rem] animate-in slide-in-from-top-2">
              <div className="flex items-start gap-4">
                <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                <div className="space-y-3">
                  <p className="text-sm font-black text-rose-600 leading-tight">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-black font-bold shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-black font-bold shadow-inner"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100 flex flex-col items-center justify-center active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <RefreshCw className="animate-spin" size={24} />
                  <span className="text-[10px] uppercase tracking-widest">{syncStatus}</span>
                </div>
              ) : 'Masuk Sekarang'}
            </button>
          </form>

          {role === 'STUDENT' && (
            <div className="mt-12 text-center">
              <p className="text-slate-500 font-medium">Belum punya akun? <button onClick={onNavigateSignup} className="font-black text-emerald-600 hover:underline">Daftar Baru</button></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
