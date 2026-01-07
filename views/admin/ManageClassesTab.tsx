
import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, School, Users, Save, 
  User as UserIcon, X, Info, LayoutGrid, 
  Settings2, ChevronRight, AlertCircle
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
      "Data kelas akan dihapus permanen.", 
      async () => {
        const updated = classes.filter(c => c.id !== id);
        await db.saveAll('elearning_classes_list', updated);
        setClasses(updated);
      }
    );
  };

  return (
    <div className="space-y-6 text-black animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-inner">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Manajemen Kelas</h3>
            <p className="text-slate-500 font-medium text-xs mt-0.5">Kelola struktur organisasi kelas.</p>
          </div>
        </div>
        <button 
          onClick={() => { 
            setForm({ name: '', homeroomTeacher: '' }); 
            setShowModal(true); 
          }} 
          className="group px-6 py-3 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-amber-100 hover:bg-amber-600 active:scale-95 transition-all"
        >
          <Plus size={18} /> 
          Tambah Kelas
        </button>
      </div>

      {/* Grid Kelas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {classes.map(c => (
          <div key={c.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
              <button onClick={() => { setForm(c); setShowModal(true); }} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all"><Edit size={14}/></button>
              {/* Fix: Changed Trash to Trash2 */}
              <button onClick={() => handleDelete(c.id, c.name)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={14}/></button>
            </div>
            
            <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-inner">
              <School size={32} />
            </div>
            
            <h4 className="text-xl font-black text-slate-800 mb-1 leading-tight">Kelas {c.name}</h4>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-4 min-h-[1rem] line-clamp-1">
              {c.homeroomTeacher || 'Wali belum diatur'}
            </p>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-center gap-2">
              <span className="text-[9px] font-black text-slate-600">{studentCounts[c.name] || 0} Siswa</span>
            </div>
          </div>
        ))}

        {classes.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem]">
            <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-4">
              <School size={32} />
            </div>
            <p className="text-slate-300 font-black uppercase text-[9px] tracking-widest">Belum ada data kelas.</p>
          </div>
        )}
      </div>

      {/* Modal - standard popup */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 relative my-auto overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <Settings2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{form.id ? 'Edit Kelas' : 'Buat Kelas'}</h3>
                    <p className="text-slate-400 font-medium text-[10px] uppercase">Konfigurasi wali kelas</p>
                  </div>
               </div>
               <button onClick={() => setShowModal(false)} className="p-2 bg-slate-50 text-slate-400 rounded-lg"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-6">
              <input 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} 
                placeholder="Nama Kelas (Contoh: 7A)..." 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-sm outline-none" 
              />
              <input 
                value={form.homeroomTeacher} 
                onChange={e => setForm({...form, homeroomTeacher: e.target.value})} 
                placeholder="Nama Wali Kelas..." 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none" 
              />
            </div>

            <div className="p-8 border-t border-slate-50 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl font-black text-xs uppercase">Batal</button>
              <button onClick={handleSave} className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase hover:bg-amber-500">Simpan Kelas</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClassesTab;
