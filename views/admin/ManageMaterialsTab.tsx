
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Loader2, Plus, Search, Filter, BookOpen, Link as LinkIcon, 
  Edit, Trash, PlayCircle, FileText, SearchX, X, Info, 
  Zap, Users, CheckCircle, School, Save, 
  Check, ChevronRight, Globe, Layers, Type, Trash2, ExternalLink
} from 'lucide-react';
import { db } from '../../App.tsx';
import { Material, ClassRoom } from '../../types.ts';
import { notifyStudents } from '../../utils/helpers.ts';

interface ManageMaterialsTabProps {
  triggerConfirm: any;
  classes: ClassRoom[];
}

const ManageMaterialsTab: React.FC<ManageMaterialsTabProps> = ({ triggerConfirm, classes }) => {
  const [items, setItems] = useState<Material[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [form, setForm] = useState<Partial<Material>>({ 
    title: '', 
    description: '', 
    type: 'link', 
    content: '', 
    targetClassIds: [] 
  });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    setLoading(true);
    const saved = await db.get('elearning_materi_list');
    setItems(Array.isArray(saved) ? saved : []);
    setLoading(false);
  };

  const filteredItems = useMemo(() => items.filter(it => {
    const matchSearch = it.title.toLowerCase().includes(search.toLowerCase()) || 
                        it.description.toLowerCase().includes(search.toLowerCase());
    const matchClass = !classFilter || it.targetClassIds.includes(classFilter);
    return matchSearch && matchClass;
  }), [items, search, classFilter]);

  const handleSave = async () => {
    if (!form.title || !form.content || form.targetClassIds?.length === 0) { 
      alert("Mohon lengkapi Judul, Konten, dan minimal satu Kelas Target"); 
      return; 
    }
    
    setIsSaving(true);
    const isNew = !form.id;
    const newItem = { 
      ...form, 
      id: form.id || `mat_${Date.now()}`, 
      createdAt: form.createdAt || new Date().toLocaleString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) 
    } as Material;

    try {
      const updated = isNew ? [newItem, ...items] : items.map(it => it.id === form.id ? newItem : it);
      await db.saveAll('elearning_materi_list', updated);
      setItems(updated);
      if (isNew) notifyStudents(newItem.targetClassIds, "Materi Baru!", newItem.title, "material");
      setShowModal(false);
    } catch (err) {
      alert("Gagal menyimpan materi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    triggerConfirm(
      `Hapus Materi?`, 
      `Apakah Anda yakin ingin menghapus materi "${title}"? Tindakan ini tidak dapat dibatalkan.`, 
      async () => {
        const updated = items.filter(it => it.id !== id);
        await db.saveAll('elearning_materi_list', updated);
        setItems(updated);
      }
    );
  };

  const toggleAllClasses = () => {
    if (form.targetClassIds?.length === classes.length) {
      setForm({ ...form, targetClassIds: [] });
    } else {
      setForm({ ...form, targetClassIds: classes.map(c => c.name) });
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'link': return <LinkIcon size={16} className="text-blue-500" />;
      case 'embed': return <PlayCircle size={16} className="text-purple-500" />;
      case 'file': return <FileText size={16} className="text-emerald-500" />;
      default: return <BookOpen size={16} />;
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;

  return (
    <div className="space-y-6 text-black animate-in fade-in duration-500 pb-20">
      {/* Search & Header Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Perpustakaan Materi</h3>
              <p className="text-slate-500 font-medium text-xs mt-0.5">Kelola modul pembelajaran digital.</p>
            </div>
          </div>
          <button 
            onClick={() => { 
              setForm({ title: '', description: '', type: 'link', content: '', targetClassIds: [] }); 
              setShowModal(true); 
            }} 
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
          >
            <Plus size={18}/> Tambah Materi
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Cari materi..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" 
            />
          </div>
          <div className="w-full md:w-48 relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <select 
              value={classFilter} 
              onChange={e => setClassFilter(e.target.value)} 
              className="w-full pl-11 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs appearance-none outline-none focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
            >
              <option value="">Semua Kelas</option>
              {classes.map(c => <option key={c.id} value={c.name}>Kelas {c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Materi */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map(it => (
          <div key={it.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col group relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
             <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                <button onClick={() => { setForm(it); setShowModal(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit size={14}/></button>
                <button onClick={() => handleDelete(it.id, it.title)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Trash2 size={14}/></button>
             </div>
             
             <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-slate-50 rounded-xl shadow-inner group-hover:bg-emerald-50 transition-colors">
                  {getTypeIcon(it.type)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{it.type}</span>
                  <span className="text-[8px] font-bold text-slate-300 uppercase">{it.createdAt.split(',')[0]}</span>
                </div>
             </div>

             <h4 className="font-black text-slate-800 text-sm leading-tight mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">{it.title}</h4>
             <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed mb-6">{it.description || 'Materi pembelajaran informatika.'}</p>
             
             <div className="mt-auto flex flex-wrap gap-1.5">
                {it.targetClassIds.map(cls => (
                  <span key={cls} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[8px] font-black uppercase border border-emerald-100">
                    {cls}
                  </span>
                ))}
             </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center border-2 border-dashed border-slate-100 rounded-[2rem]">
            <SearchX size={40} className="text-slate-100 mb-3" />
            <p className="text-slate-300 font-black uppercase text-[9px] tracking-widest">Materi tidak ditemukan.</p>
          </div>
        )}
      </div>

      {/* Improved Modal Section */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_35px_80px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-white z-10">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 leading-none">{form.id ? 'Edit Materi' : 'Publikasi Materi'}</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Bagikan modul digital ke siswa</p>
                  </div>
               </div>
               <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90">
                  <X size={24} />
               </button>
            </div>

            {/* Modal Content - Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-hide">
              
              {/* Part 1: Basic Info */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Materi Belajar</label>
                  <input 
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})} 
                    placeholder="Contoh: Pengenalan Algoritma Dasar"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Singkat / Ringkasan</label>
                  <textarea 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})} 
                    placeholder="Jelaskan apa yang akan dipelajari siswa di materi ini..."
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm h-28 resize-none outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                  />
                </div>
              </div>

              {/* Part 2: Type Selection (Grid Tombol Ikon) */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe Media Konten</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'link', label: 'Tautan Luar', icon: LinkIcon, color: 'blue' },
                    { id: 'embed', label: 'Video / Form', icon: PlayCircle, color: 'purple' },
                    { id: 'file', label: 'Modul PDF', icon: FileText, color: 'emerald' }
                  ].map(t => (
                    <button 
                      key={t.id}
                      type="button" 
                      onClick={() => setForm({...form, type: t.id as any})} 
                      className={`flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all ${
                        form.type === t.id 
                          ? `bg-${t.color}-50 border-${t.color}-500 text-${t.color}-600 shadow-sm` 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <t.icon size={22} />
                      <span className="text-[9px] font-black uppercase tracking-tight">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Part 3: Content URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL / Link Konten</label>
                  {form.content && (
                    <a href={form.content} target="_blank" rel="noreferrer" className="text-[9px] font-black text-indigo-500 uppercase flex items-center gap-1 hover:underline">
                      Cek Link <ExternalLink size={10}/>
                    </a>
                  )}
                </div>
                <div className="relative group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                      <Globe size={18} />
                   </div>
                   <input 
                    value={form.content} 
                    onChange={e => setForm({...form, content: e.target.value})} 
                    placeholder="https://docs.google.com/..." 
                    className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                  />
                </div>
              </div>

              {/* Part 4: Target Classes Grid */}
              <div className="space-y-4 p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <School size={16} className="text-slate-400" />
                    <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Target Kelas Siswa</h4>
                  </div>
                  <button 
                    type="button" 
                    onClick={toggleAllClasses} 
                    className="text-[9px] font-black text-emerald-600 bg-white px-3 py-1.5 rounded-full border border-emerald-100 hover:bg-emerald-50 transition-colors"
                  >
                    {form.targetClassIds?.length === classes.length ? 'Batal Semua' : 'Pilih Semua Kelas'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {classes.map(c => {
                    const isActive = form.targetClassIds?.includes(c.name);
                    return (
                      <button 
                        key={c.id} 
                        type="button" 
                        onClick={() => {
                          const current = form.targetClassIds || [];
                          setForm({...form, targetClassIds: isActive ? current.filter(x => x !== c.name) : [...current, c.name]});
                        }} 
                        className={`group p-3 rounded-2xl text-[10px] font-black transition-all border-2 flex items-center justify-between ${
                          isActive 
                            ? 'bg-white border-emerald-500 text-emerald-600 shadow-sm' 
                            : 'bg-white border-white text-slate-400 hover:border-slate-100'
                        }`}
                      >
                        Kelas {c.name}
                        {isActive ? <CheckCircle size={14} className="text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-200 group-hover:border-slate-300"></div>}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-slate-50 flex flex-col md:flex-row gap-4 bg-white rounded-b-[3rem]">
              <button 
                onClick={() => setShowModal(false)} 
                className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.1em] hover:bg-slate-100 transition-all active:scale-95"
              >
                Batal
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="flex-[2] py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isSaving ? 'Sedang Menyimpan...' : 'Simpan & Publikasikan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMaterialsTab;
