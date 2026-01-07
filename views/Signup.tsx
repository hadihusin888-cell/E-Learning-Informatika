
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User as UserIcon, Lock, GraduationCap, Loader2, Eye, EyeOff } from 'lucide-react';
import { User, ClassRoom } from '../types';
import { db } from '../App';

interface SignupProps {
  onBack: () => void;
  onSignup: () => void;
  logoUrl: string;
}

const Signup: React.FC<SignupProps> = ({ onBack, onSignup, logoUrl }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [classRoom, setClassRoom] = useState('');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      const c = await db.get('elearning_classes_list');
      setClasses(Array.isArray(c) ? c : []);
    };
    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanUsername = username.trim().toLowerCase();
    const cleanName = name.trim();

    const newPendingStudent: User = {
      id: `pending_${Math.random().toString(36).substr(2, 9)}`,
      name: cleanName,
      username: cleanUsername,
      password: password, // Password biarkan case-sensitive
      classId: classRoom,
      role: 'STUDENT',
      status: 'PENDING',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`
    };

    try {
      const existingPending = await db.get('elearning_pending_students');
      const existingActive = await db.get('elearning_students_list');
      
      const pList = Array.isArray(existingPending) ? existingPending : [];
      const aList = Array.isArray(existingActive) ? existingActive : [];

      const isTaken = [...pList, ...aList].some((u: User) => 
        u?.username?.toLowerCase() === cleanUsername
      );

      if (isTaken) {
        alert("Username sudah digunakan. Silakan pilih username lain.");
        setLoading(false);
        return;
      }

      await db.saveAll('elearning_pending_students', [...pList, newPendingStudent]);
      
      alert("Pendaftaran berhasil! Tunggu konfirmasi Admin/Guru untuk dapat login.");
      onSignup();
    } catch (err) {
      alert("Gagal menghubungi server. Periksa koneksi internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-xl bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        {loading && <div className="absolute inset-0 bg-white/70 z-20 flex flex-col items-center justify-center text-black"><Loader2 className="animate-spin text-emerald-600 mb-2" size={40} /><p className="font-bold text-slate-600">Mengirim Data...</p></div>}
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 mb-8"><ArrowLeft size={18} /> Kembali</button>
        
        <div className="text-center mb-10 text-black">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner p-2 border border-slate-50">
            <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-2">Daftar Akun Siswa</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-black">
          {step === 1 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div><label className="block text-sm font-semibold mb-2 text-slate-700">Nama Lengkap</label><input value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-black font-bold" placeholder="Nama Anda" required /></div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Kelas</label>
                <select 
                  value={classRoom} 
                  onChange={e => setClassRoom(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-black font-bold appearance-none" 
                  required
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                {classes.length === 0 && <p className="text-[10px] text-red-400 mt-2 font-bold uppercase tracking-widest">Maaf, daftar kelas belum tersedia. Hubungi Guru.</p>}
              </div>
              <button type="button" onClick={() => setStep(2)} disabled={!name || !classRoom} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-100">Selanjutnya</button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div><label className="block text-sm font-semibold mb-2 text-slate-700">Username</label><input value={username} onChange={e => setUsername(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-black font-bold" placeholder="Username" required /></div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full p-4 pr-12 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-black font-bold" 
                    placeholder="Password" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-4"><button type="button" onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-slate-600">Kembali</button><button type="submit" disabled={loading} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100">Daftar Akun</button></div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signup;
