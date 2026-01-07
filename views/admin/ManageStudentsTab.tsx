
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Loader2, UserPlus2, Search, SlidersHorizontal, Edit, 
  Trash2, UserCog, X, User as UserIcon, Save, SearchX, 
  School, Fingerprint, Lock, Eye, EyeOff, Info, Camera,
  CheckCircle2, AlertCircle, Hash, RefreshCw, ChevronRight, UserCircle, KeyRound
} from 'lucide-react';
import { db } from '../../App.tsx';
import { User, ClassRoom } from '../../types.ts';

interface ManageStudentsTabProps {
  triggerConfirm: any;
  classes: ClassRoom[];
}

const ManageStudentsTab: React.FC<ManageStudentsTabProps> = ({ triggerConfirm, classes }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<Partial<User>>({ 
    name: '', 
    username: '', 
    password: '', 
    classId: '',
    avatar: ''
  });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    setLoading(true);
    const s = await db.get('elearning_students_list');
    setStudents(Array.isArray(s) ? s : []);
    setLoading(false);
  };

  const filteredStudents = useMemo(() => students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                        s.username.toLowerCase().includes(search.toLowerCase());
    const matchClass = !classFilter || s.classId === classFilter;
    return matchSearch && matchClass;
  }), [students, search, classFilter]);

  const handleSave = async () => {
    if (!form.name || !form.username || !form.classId) {
      alert("Mohon lengkapi Nama, Username, dan Kelas.");
      return;
    }

    const isNew = !form.id;
    const studentData = { 
      ...form, 
      id: form.id || `std_${Date.now()}`, 
      role: 'STUDENT', 
      avatar: form.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.username || 'default'}`, 
      status: 'ACTIVE' 
    } as User;

    const updatedList = isNew 
      ? [...students, studentData] 
      : students.map(s => s.id === form.id ? studentData : s);
    
    await db.saveAll('elearning_students_list', updatedList);
    setStudents(updatedList);
    setShowModal(false);
    setForm({ name: '', username: '', password: '', classId: '', avatar: '' });
  };

  const handleQuickReset = (student: User) => {
    triggerConfirm(
      "Reset Password Siswa?", 
      `Password untuk ${student.name} akan diatur ulang menjadi '123456'.`, 
      async () => {
        const updated = students.map(s => s.id === student.id ? { ...s, password: '123456' } : s);
        await db.saveAll('elearning_students_list', updated);
        setStudents(updated);
        alert(`Password ${student.name} berhasil direset ke '123456'`);
      },
      'warning'
    );
  };

  const handleDelete = (id: string, name: string) => {
    triggerConfirm(
      `Hapus Siswa ${name}?`, 
      "Data akademik dan akses siswa ini akan dihapus secara permanen.", 
      async () => {
        const updated = students.filter(s => s.id !== id);
        await db.saveAll('elearning_students_list', updated);
        setStudents(updated);
      }
    );
  };

  const refreshAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setForm({ ...form, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}` });
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4 text-black">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">Sinkronisasi Data Siswa...</p>
    </div>
  );

  return (
    <div className="space-y-6 text-black animate-in fade-in duration-500">
      {/* Search & Action Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
              <UserCircle size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Database Siswa</h3>
              <p className="text-slate-500 font-medium text-xs mt-0.5">Total {students.length} siswa terdaftar.</p>
            </div>
          </div>
          <button 
            onClick={() => { 
              setForm({ name: '', username: '', password: '', classId: '', avatar: '' }); 
              setShowModal(true); 
            }} 
            className="group px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <UserPlus2 size={16} /> 
            Tambah Siswa
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari siswa..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300" 
            />
          </div>
          <div className="w-full md:w-48 relative group">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
            <select 
              value={classFilter} 
              onChange={e => setClassFilter(e.target.value)} 
              className="w-full pl-11 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs appearance-none outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
            >
              <option value="">Semua Kelas</option>
              {classes.map(c => <option key={c.id} value={c.name}>Kelas {c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredStudents.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
              <button onClick={() => handleQuickReset(s)} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all shadow-sm"><KeyRound size={12}/></button>
              <button onClick={() => { setForm(s); setShowModal(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit size={12}/></button>
              {/* Fix: Changed Trash to Trash2 */}
              <button onClick={() => handleDelete(s.id, s.name)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Trash2 size={12}/></button>
            </div>
            
            <div className="relative mb-4">
              <img 
                src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`} 
                className="w-20 h-20 rounded-full border-4 border-slate-50 bg-slate-50 shadow-inner group-hover:border-blue-100 transition-colors" 
                alt={s.name} 
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>

            <h4 className="font-black text-slate-800 text-sm leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">{s.name}</h4>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1 px-2 py-0.5 bg-slate-50 rounded-md">@{s.username}</p>
            
            <div className="mt-6 pt-4 border-t border-slate-50 w-full flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <School size={12} className="text-blue-500" />
                <span className="text-[10px] font-black text-slate-700">Kelas {s.classId}</span>
              </div>
              <ChevronRight size={12} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
        
        {filteredStudents.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
            <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-4">
              <SearchX size={32} />
            </div>
            <p className="text-slate-300 font-black uppercase text-[9px] tracking-widest">Siswa tidak ditemukan.</p>
          </div>
        )}
      </div>

      {/* Modal Profile - Standard size for editing */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 relative my-auto overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <UserCog size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{form.id ? 'Edit Siswa' : 'Tambah Siswa'}</h3>
                    <p className="text-slate-400 font-medium text-[10px] uppercase">Detail identitas siswa</p>
                  </div>
               </div>
               <button onClick={() => setShowModal(false)} className="p-2 bg-slate-50 text-slate-400 rounded-lg"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <img src={form.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.username || 'default'}`} className="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-slate-50" alt="Preview" />
                  <button type="button" onClick={refreshAvatar} className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full border-2 border-white"><RefreshCw size={12} /></button>
                </div>
              </div>
              <div className="space-y-4">
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nama Lengkap..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Username" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none" />
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Password" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none" />
                </div>
                <select value={form.classId} onChange={e => setForm({...form, classId: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-sm outline-none">
                  <option value="">Pilih Kelas</option>
                  {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl font-black text-xs uppercase">Batal</button>
              <button onClick={handleSave} className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase hover:bg-blue-600">Simpan Siswa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudentsTab;
