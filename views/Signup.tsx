
import React, { useState } from 'react';
import { ArrowLeft, User as UserIcon, Lock, GraduationCap, Loader2 } from 'lucide-react';
import { User } from '../types';
import { db } from '../App';

interface SignupProps {
  onBack: () => void;
  onSignup: () => void;
}

const Signup: React.FC<SignupProps> = ({ onBack, onSignup }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [classRoom, setClassRoom] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newPendingStudent: User = {
      id: `pending_${Math.random().toString(36).substr(2, 9)}`,
      name,
      username,
      password,
      classId: classRoom,
      role: 'STUDENT',
      status: 'PENDING',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
    };

    try {
      const existingPending = await db.get('elearning_pending_students');
      const existingActive = await db.get('elearning_students_list');
      
      const isTaken = [...existingPending, ...existingActive].some((u: User) => u.username === username);

      if (isTaken) {
        alert("Username sudah digunakan. Silakan pilih username lain.");
        setLoading(false);
        return;
      }

      await db.set('elearning_pending_students', [...existingPending, newPendingStudent]);
      
      alert("Pendaftaran berhasil! Tunggu konfirmasi Admin.");
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
        {loading && <div className="absolute inset-0 bg-white/70 z-20 flex flex-col items-center justify-center"><Loader2 className="animate-spin text-emerald-600 mb-2" size={40} /><p className="font-bold text-slate-600">Mengirim Data...</p></div>}
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 mb-8"><ArrowLeft size={18} /> Kembali</button>
        <div className="text-center mb-10"><div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><GraduationCap size={32} /></div><h3 className="text-3xl font-bold text-slate-900 mb-2">Daftar Akun Siswa</h3></div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div><label className="block text-sm font-semibold mb-2 text-slate-700">Nama Lengkap</label><input value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-black font-bold" placeholder="Nama Anda" required /></div>
              <div><label className="block text-sm font-semibold mb-2 text-slate-700">Kelas</label><select value={classRoom} onChange={e => setClassRoom(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-black font-bold appearance-none" required><option value="">Pilih Kelas</option><option value="7A">7A</option><option value="7B">7B</option><option value="8A">8A</option><option value="8B">8B</option><option value="9A">9A</option><option value="9B">9B</option></select></div>
              <button type="button" onClick={() => setStep(2)} disabled={!name || !classRoom} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-100">Selanjutnya</button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div><label className="block text-sm font-semibold mb-2 text-slate-700">Username</label><input value={username} onChange={e => setUsername(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-black font-bold" placeholder="Username" required /></div>
              <div><label className="block text-sm font-semibold mb-2 text-slate-700">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-black font-bold" placeholder="Password" required /></div>
              <div className="flex gap-4"><button type="button" onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-slate-600">Kembali</button><button type="submit" disabled={loading} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100">Daftar Akun</button></div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signup;
