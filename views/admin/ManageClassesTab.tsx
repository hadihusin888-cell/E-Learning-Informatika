
import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, School, Users, Save, 
  User as UserIcon, X, Info, LayoutGrid, 
  Settings2, ChevronRight, AlertCircle, 
  Sparkles, GraduationCap, Zap, Bookmark
} from 'lucide-react';
import { db } from '../../App.tsx';
import { ClassRoom, User } from '../../types.ts';

interface ManageClassesTabProps {
  triggerConfirm: any;
  classes: ClassRoom[];
  setClasses: (c: ClassRoom[]) => void;
}

const ManageClassesTab: React.FC<ManageClassesTabProps> = ({ triggerConfirm, classes, setClasses }) => {
  const [showModal, setShowModal] = useState(false);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [form, setForm] = useState<Partial<ClassRoom>>({ name: '', homeroomTeacher: '' });

  useEffect(() => {
    const fetchCounts = async () => {
      const students = await db.get('elearning_students_list');
      const studentList = Array.isArray(students) ? students : [];
      const counts: Record<string, number> = {};
      studentList.forEach((s: User) => { 
        if (s.classId) counts[s.classId] = (counts[s.classId] || 0) + 1; 
      });
      setStudentCounts(counts);
    };
    fetchCounts();
  }, [classes]);

  const handleSave = async () => {
    if (!form.name || !form.homeroomTeacher) { 
      alert("Mohon lengkapi semua data (Nama Kelas & Wali Kelas)."); 
      return; 
    }

    const isNew = !form.id;
    const classData = { 
      ...form, 
      id: form.id || `cls_${Date.now()}` 
    } as ClassRoom;
    
    const updatedList = isNew 
      ? [...classes, classData] 
      : classes.map(c => c.id === form.id ? classData : c);
    
    await db.saveAll('elearning_classes_list', updatedList);
    setClasses(updatedList);
    setShowModal(false);
    setForm({ name: '', homeroomTeacher: '' });
  };

  const handleDelete = (id: string, name: string) => {
    triggerConfirm(
      `Hapus Kelas ${name}?`, 
      "Data kelas akan dihapus permanen. Siswa yang terdaftar di kelas ini mungkin perlu dipindahkan secara manual.", 
      async () => {
        const updated = classes.filter(c => c.id !== id);
        await db.saveAll('elearning_classes_list', updated);
        setClasses(updated);
      }
    );
  };

  return (
    <div className="space-y-6 text-black animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Manajemen Kelas</h3>
            <p className="text-slate-500 font-medium text-xs mt-0.5">Kelola struktur organisasi dan wali kelas.</p>
          </div>
        </div>
        <button 
          onClick={() => { 
            setForm({ name: '', homeroomTeacher: '' }); 
            setShowModal(true); 
          }} 
          className="group px-6 py-3.5 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-amber-100 hover:bg-amber-600 active:scale-95 transition-all"
        >
          <Plus size={18} /> 
          Buat Kelas Baru
        </button>
      </div>

      {/* Grid Kelas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {classes.map(c => (
          <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center relative group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-10">
              <button onClick={() => { setForm(c); setShowModal(true); }} className="p-2.5 bg-white text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-lg border border-slate-100"><Edit size={14}/></button>
              <button onClick={() => handleDelete(c.id, c.name)} className="p-2.5 bg-white text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-lg border border-slate-100"><Trash2 size={14}/></button>
            </div>
            
            <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-100 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner group-hover:rotate-6 transition-transform duration-500">
              <School size={36} />
            </div>
            
            <h4 className="text-2xl font-black text-slate-800 mb-1 leading-tight tracking-tight">Kelas {c.name}</h4>
            <div className="flex items-center justify-center gap-1.5 mb-6 text-slate-400">
               <UserIcon size={12} />
               <p className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[120px]">
                 {c.homeroomTeacher || 'Belum Diatur'}
               </p>
            </div>

            <div className="pt-5 border-t border-slate-50 flex items-center justify-center gap-2">
              <div className="px-3 py-1 bg-slate-50 rounded-full flex items-center gap-2">
                <Users size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-600 tracking-tight">{studentCounts[c.name] || 0} Siswa</span>
              </div>
            </div>
          </div>
        ))}

        {classes.length === 0 && (
          <div className="col-span-full py-24 text-center flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[3rem] bg-white/50">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-[2rem] flex items-center justify-center mb-6">
              <School size={40} />
            </div>
            <h4 className="text-xl font-black text-slate-400 mb-2">Belum Ada Kelas</h4>
            <p className="text-slate-400 font-medium text-xs max-w-xs">Silakan tambahkan kelas pertama Anda untuk mulai mengelola siswa.</p>
          </div>
        )}
      </div>

      {/* Improved Modal - Modern Class Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_35px_80px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 md:p-10 border-b border-slate-50 flex items-center justify-between bg-white z-10 shrink-0">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-amber-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-amber-100">
                    <Zap size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 leading-none">{form.id ? 'Edit Informasi Kelas' : 'Registrasi Kelas Baru'}</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Penyusunan struktur organisasi sekolah</p>
                  </div>
               </div>
               <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90">
                  <X size={24} />
               </button>
            </div>

            {/* Modal Content - Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 scrollbar-hide">
              
              {/* Part 1: Interactive Preview */}
              <div className="flex flex-col items-center py-10 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[3rem] border border-amber-100 shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                   <Sparkles size={48} className="text-amber-600" />
                </div>
                
                <div className="w-24 h-24 bg-white text-amber-500 rounded-[2.5rem] flex items-center justify-center shadow-xl mb-6 border-4 border-white">
                  <School size={48} />
                </div>
                
                <h4 className="text-3xl font-black text-slate-800 mb-2">Kelas {form.name || '...'}</h4>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                  <GraduationCap size={16} /> Wali: {form.homeroomTeacher || 'Belum Ditentukan'}
                </p>
                
                <div className="mt-8 px-6 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white text-[9px] font-black text-slate-400 uppercase tracking-widest">
                   Pratinjau Kartu Kelas
                </div>
              </div>

              {/* Part 2: Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama / Kode Kelas</label>
                  <div className="relative group">
                    <Bookmark className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input 
                      value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value.toUpperCase().replace(/\s/g, '')})} 
                      placeholder="Contoh: 7A, 8B, atau 9-IPA"
                      className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-slate-800 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all" 
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium ml-1">Gunakan kode yang singkat dan unik.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Wali Kelas (Homeroom)</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input 
                      value={form.homeroomTeacher} 
                      onChange={e => setForm({...form, homeroomTeacher: e.target.value})} 
                      placeholder="Nama lengkap Bapak/Ibu Guru..."
                      className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-slate-800 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all" 
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium ml-1">Nama ini akan tampil di dashboard siswa.</p>
                </div>
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Pemberitahuan Sistem</h5>
                  <p className="text-[11px] text-blue-600 font-medium leading-relaxed">
                    Data kelas akan digunakan untuk pengelompokan penugasan dan filter materi. Pastikan nama kelas sesuai dengan data Dapodik sekolah untuk sinkronisasi yang lebih baik.
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-10 border-t border-slate-50 flex flex-col md:flex-row gap-4 bg-white rounded-b-[3rem] shrink-0">
              <button 
                onClick={() => setShowModal(false)} 
                className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.1em] hover:bg-slate-100 transition-all active:scale-95"
              >
                Batal
              </button>
              <button 
                onClick={handleSave} 
                className="flex-[2] py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-600 shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Save size={18} />
                {form.id ? 'Simpan Perubahan' : 'Konfirmasi & Buat Kelas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClassesTab;
