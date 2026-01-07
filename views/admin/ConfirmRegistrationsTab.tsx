
import React, { useState, useEffect } from 'react';
import { Loader2, Fingerprint, UserPlus, UserCheck, UserX } from 'lucide-react';
import { db } from '../../App.tsx';
import { User } from '../../types.ts';
import { notifyStudents } from '../../utils/helpers.ts';

interface ConfirmRegistrationsTabProps {
  triggerConfirm: any;
}

const ConfirmRegistrationsTab: React.FC<ConfirmRegistrationsTabProps> = ({ triggerConfirm }) => {
  const [pending, setPending] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    setLoading(true);
    const saved = await db.get('elearning_pending_students');
    setPending(Array.isArray(saved) ? saved : []);
    setLoading(false);
  };

  const handleAction = async (student: User, type: 'APPROVE' | 'REJECT') => {
    if (type === 'APPROVE') {
      const active = await db.get('elearning_students_list');
      const updatedActive = [...(Array.isArray(active) ? active : []), { ...student, status: 'ACTIVE' }];
      const updatedPending = pending.filter(s => s.username !== student.username);
      
      await db.saveAll('elearning_students_list', updatedActive);
      await db.saveAll('elearning_pending_students', updatedPending);
      setPending(updatedPending);
      
      notifyStudents([], "Selamat Datang!", "Akun Anda telah disetujui. Silakan jelajahi materi belajar Anda.", "registration", student.id);
    } else {
      triggerConfirm(
        "Tolak Pendaftaran?", 
        `Apakah Anda yakin ingin menolak pendaftaran dari ${student.name}? Siswa ini tidak akan memiliki akses ke sistem.`, 
        async () => {
          const updatedPending = pending.filter(s => s.username !== student.username);
          await db.saveAll('elearning_pending_students', updatedPending);
          setPending(updatedPending);
        }
      );
    }
  };

  if (loading) return <div className="py-20 flex flex-col items-center justify-center gap-4">
    <Loader2 className="animate-spin text-emerald-600" size={40} />
    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Memuat Antrean...</p>
  </div>;

  return (
    <div className="space-y-8 text-black animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-2xl font-black text-slate-800">Antrean Pendaftaran</h3>
          <p className="text-slate-500 font-medium text-sm mt-1">Verifikasi identitas siswa sebelum memberikan akses penuh.</p>
        </div>
        <div className="px-6 py-3 bg-orange-50 text-orange-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3">
          <Fingerprint size={18} />
          {pending.length} Menunggu Verifikasi
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pending.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden group">
            <div className="flex items-start gap-5 relative z-10">
              <div className="relative">
                <img src={s.avatar} className="w-16 h-16 rounded-2xl border-4 border-slate-50 bg-slate-50 object-cover" alt={s.name} />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-slate-800 text-lg leading-tight truncate">{s.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kelas {s.classId}</span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium mt-1 truncate">@{s.username}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8 relative z-10">
              <button onClick={() => handleAction(s, 'APPROVE')} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-95 transition-all">
                <UserCheck size={16} /> Setujui
              </button>
              <button onClick={() => handleAction(s, 'REJECT')} className="flex-1 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-rose-100 active:scale-95 transition-all">
                <UserX size={16} /> Tolak
              </button>
            </div>
          </div>
        ))}

        {pending.length === 0 && (
          <div className="col-span-full py-24 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-10">
            <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[2rem] flex items-center justify-center mb-6">
              <UserPlus size={48} />
            </div>
            <h4 className="text-xl font-black text-slate-400 mb-2">Semua Sudah Beres!</h4>
            <p className="text-slate-400 font-medium max-w-sm">Tidak ada pendaftaran baru saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmRegistrationsTab;
