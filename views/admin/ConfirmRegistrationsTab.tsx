
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Loader2, Fingerprint, UserPlus, UserCheck, UserX, 
  Search, CheckCircle, XCircle, Trash2, ShieldAlert,
  SearchX, Info, Clock, GraduationCap, Users, Zap,
  RefreshCw, CheckCircle2, ShieldQuestion
} from 'lucide-react';
import { db } from '../../App.tsx';
import { User } from '../../types.ts';
import { notifyStudents } from '../../utils/helpers.ts';

interface ConfirmRegistrationsTabProps {
  triggerConfirm: any;
}

const ConfirmRegistrationsTab: React.FC<ConfirmRegistrationsTabProps> = ({ triggerConfirm }) => {
  const [pending, setPending] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => { 
    loadData(); 
  }, []);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const saved = await db.get('elearning_pending_students');
      // Pastikan data terbaru selalu di atas
      const sortedPending = (Array.isArray(saved) ? saved : []).reverse();
      setPending(sortedPending);
    } catch (err) {
      console.error("Gagal memuat data pendaftar:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const filteredPending = useMemo(() => {
    return pending.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.username.toLowerCase().includes(search.toLowerCase()) ||
      s.classId?.toLowerCase().includes(search.toLowerCase())
    );
  }, [pending, search]);

  const handleApprove = async (student: User) => {
    setIsProcessing(student.id);
    try {
      const active = await db.get('elearning_students_list');
      const activeList = Array.isArray(active) ? active : [];
      
      // Keamanan: Cek duplikasi username di daftar aktif
      if (activeList.some((s: any) => s.username.toLowerCase() === student.username.toLowerCase())) {
        alert(`Gagal: Username @${student.username} sudah terdaftar dan aktif.`);
        // Hapus dari pending karena datanya tidak valid (duplikat)
        const updatedPending = pending.filter(s => s.id !== student.id);
        await db.saveAll('elearning_pending_students', updatedPending);
        setPending(updatedPending);
        return;
      }

      const updatedActive = [...activeList, { ...student, status: 'ACTIVE' }];
      const updatedPending = pending.filter(s => s.id !== student.id);
      
      await db.saveAll('elearning_students_list', updatedActive);
      await db.saveAll('elearning_pending_students', updatedPending);
      
      setPending(updatedPending);
      
      // Kirim notifikasi selamat datang
      notifyStudents([], "Selamat Datang!", "Akun Anda telah disetujui. Silakan jelajahi materi belajar Anda.", "registration", student.id);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat menyetujui pendaftaran.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = (student: User) => {
    triggerConfirm(
      "Tolak Pendaftaran?", 
      `Apakah Anda yakin ingin menolak pendaftaran dari ${student.name} (Kelas ${student.classId})? Data ini akan dihapus permanen.`, 
      async () => {
        setIsProcessing(student.id);
        try {
          const updatedPending = pending.filter(s => s.id !== student.id);
          await db.saveAll('elearning_pending_students', updatedPending);
          setPending(updatedPending);
        } catch (err) {
          alert("Gagal membatalkan pendaftaran.");
        } finally {
          setIsProcessing(null);
        }
      }
    );
  };

  const handleApproveAll = () => {
    if (filteredPending.length === 0) return;
    
    triggerConfirm(
      "Konfirmasi Massal?",
      `Setujui ${filteredPending.length} pendaftar sekaligus? Tindakan ini akan memberikan akses penuh ke semua akun terpilih.`,
      async () => {
        setLoading(true);
        try {
          const active = await db.get('elearning_students_list');
          const activeList = Array.isArray(active) ? active : [];
          
          // Filter untuk menghindari duplikasi username saat approve massal
          const validNewStudents = filteredPending.filter(fp => 
            !activeList.some((al: any) => al.username.toLowerCase() === fp.username.toLowerCase())
          ).map(s => ({ ...s, status: 'ACTIVE' }));

          const updatedActive = [...activeList, ...validNewStudents];
          const remainingPending = pending.filter(p => !filteredPending.some(f => f.id === p.id));
          
          await db.saveAll('elearning_students_list', updatedActive);
          await db.saveAll('elearning_pending_students', remainingPending);
          
          setPending(remainingPending);
          
          // Notifikasi massal (opsional, bisa berat jika terlalu banyak)
          validNewStudents.forEach(s => {
            notifyStudents([], "Akun Aktif!", "Selamat, pendaftaran Anda disetujui massal oleh Admin.", "registration", s.id);
          });
          
          alert(`${validNewStudents.length} siswa berhasil diaktifkan!`);
        } catch (err) {
          alert("Gagal memproses persetujuan massal.");
        } finally {
          setLoading(false);
        }
      },
      'warning'
    );
  };

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center gap-6 text-black">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
        <Users className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" size={28} />
      </div>
      <div className="text-center">
        <p className="text-slate-900 font-black text-xs uppercase tracking-[0.3em]">Sinkronisasi Awan</p>
        <p className="text-slate-400 text-[10px] font-bold mt-2 italic">Mengambil data pendaftar terbaru...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 text-black animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32">
      
      {/* Search & Statistics Bar */}
      <section className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full -mr-32 -mt-32 blur-3xl -z-10"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-[1.8rem] flex items-center justify-center shadow-xl shadow-orange-100">
              <Fingerprint size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Konfirmasi Siswa</h3>
                <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
                  {pending.length} Menunggu
                </span>
              </div>
              <p className="text-slate-500 font-medium text-sm mt-2 max-w-md leading-relaxed">Verifikasi identitas pendaftar sebelum memberikan hak akses ke portal pembelajaran.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
             <button 
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
                title="Sering pendaftaran"
             >
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
             </button>
             <div className="flex-1 lg:w-72 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari Nama / Kelas..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm outline-none focus:border-orange-500/20 focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all shadow-inner"
                />
             </div>
             {filteredPending.length > 1 && (
               <button 
                onClick={handleApproveAll}
                className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all flex items-center gap-3 shrink-0 active:scale-95 shadow-2xl shadow-slate-200"
               >
                 <CheckCircle2 size={18} /> Setujui Semua
               </button>
             )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-50">
           <div className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-50 rounded-full border border-slate-100">
              <Clock size={14} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Antrean Terbaru</span>
           </div>
           <div className="flex items-center gap-2.5 px-5 py-2.5 bg-amber-50 rounded-full border border-amber-100">
              <ShieldAlert size={14} className="text-amber-500" />
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Butuh Verifikasi</span>
           </div>
        </div>
      </section>

      {/* Grid Kartu Pendaftar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPending.map((s, i) => (
          <div 
            key={s.id} 
            className="bg-white p-7 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col relative overflow-hidden group animate-in fade-in zoom-in duration-300"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="flex items-center gap-5 mb-8 relative z-10">
              <div className="relative shrink-0">
                <img 
                  src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`} 
                  className="w-20 h-20 rounded-[2rem] border-4 border-white shadow-xl bg-slate-100 object-cover group-hover:rotate-6 transition-transform duration-500" 
                  alt={s.name} 
                  onError={(e) => (e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${s.name}`)}
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg">
                  <Clock size={10} className="text-white animate-pulse" />
                </div>
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-slate-800 text-lg leading-tight truncate group-hover:text-orange-600 transition-colors">{s.name}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <div className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[8px] font-black uppercase tracking-tighter">
                    {s.classId || 'N/A'}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 truncate">@{s.username}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8 relative z-10">
               <div className="p-4 bg-slate-50/80 rounded-[1.5rem] border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Role Akses</span>
                     <span className="text-[9px] font-black text-slate-600 uppercase">SISWA</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Keamanan</span>
                     <div className="flex items-center gap-1.5">
                        <ShieldQuestion size={12} className="text-amber-500" />
                        <span className="text-[9px] font-black text-amber-600 uppercase">Unverified</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex gap-3 mt-auto relative z-10">
              <button 
                onClick={() => handleApprove(s)} 
                disabled={isProcessing === s.id}
                className="flex-1 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-xl shadow-slate-100 active:scale-95 transition-all disabled:opacity-50"
              >
                {isProcessing === s.id ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={18} />} 
                Setujui
              </button>
              <button 
                onClick={() => handleReject(s)} 
                disabled={isProcessing === s.id}
                className="px-5 py-4 bg-white text-rose-500 rounded-[1.5rem] border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 active:scale-95 transition-all disabled:opacity-50"
                title="Tolak Pendaftaran"
              >
                <UserX size={20} />
              </button>
            </div>
          </div>
        ))}

        {/* State Kosong */}
        {filteredPending.length === 0 && (
          <div className="col-span-full py-24 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-10 animate-in fade-in duration-700">
            <div className="w-28 h-28 bg-slate-50 text-slate-200 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
              {search ? <SearchX size={56} className="opacity-50" /> : <UserPlus size={56} className="opacity-50" />}
            </div>
            <h4 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
              {search ? 'Tidak Ditemukan' : 'Antrean Bersih!'}
            </h4>
            <p className="text-slate-400 font-medium text-sm max-w-sm leading-relaxed">
              {search 
                ? `Tidak ada pendaftar yang cocok dengan kata kunci "${search}". Periksa kembali ejaan Anda.` 
                : 'Saat ini tidak ada siswa baru yang menunggu verifikasi. Dashboard Anda sudah up-to-date!'}
            </p>
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className="mt-8 px-8 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        )}
      </div>

      {/* Panel Info Tambahan */}
      <section className="bg-indigo-600 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
         <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mt-32"></div>
         <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/20">
            <Info size={36} className="text-emerald-400" />
         </div>
         <div className="flex-1 space-y-2">
            <h5 className="text-xl font-black uppercase tracking-tight">Butuh Bantuan Verifikasi?</h5>
            <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-80">
              Jika Anda ragu dengan identitas pendaftar, Anda dapat menanyakan langsung di kelas atau mengecek data NIS (Nomor Induk Siswa) di buku induk sekolah sebelum memberikan persetujuan akses.
            </p>
         </div>
         <div className="shrink-0">
            <div className="px-6 py-3 bg-white/10 rounded-2xl border border-white/20 text-[10px] font-black uppercase tracking-widest">
               v2.0 Security Module
            </div>
         </div>
      </section>
    </div>
  );
};

export default ConfirmRegistrationsTab;
