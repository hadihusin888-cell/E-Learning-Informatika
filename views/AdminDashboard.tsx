
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, BookOpen, ClipboardList, Users, School, Settings, 
  Plus, Edit, Trash2, CheckCircle, Clock, Link as LinkIcon, X,
  Award, ExternalLink, Calendar, Search, SearchX, Shield, Key, Layers,
  Loader2, ChevronRight, LayoutDashboard, Zap, Info, Star, MessageCircle, UserCog, 
  AlertTriangle, UserPlus, Check, Globe, Database, Cloud, Eye, User as UserIcon,
  Save, AlertCircle, Camera, Lock, RefreshCw, SortAsc, SortDesc, Filter, Trash,
  FileText, PlayCircle, Youtube, FilterX, EyeOff
} from 'lucide-react';
import Layout from '../components/Layout.tsx';
import { User, SiteSettings, ClassRoom, Submission, Task, Material } from '../types.ts';
import { db } from '../App.tsx';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onUpdateUser?: (u: User) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, settings, setSettings, onUpdateUser }) => {
  const [activeView, setActiveView] = useState('overview');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

  useEffect(() => {
    const fetchNotifs = async () => {
      const stored = await db.get(`elearning_notifs_${user.id}`);
      setNotifications(Array.isArray(stored) ? stored : []);
      
      const pending = await db.get('elearning_pending_students');
      if (Array.isArray(pending) && pending.length > 0) {
        const hasNotif = (Array.isArray(stored) ? stored : []).some(n => n.type === 'registration' && !n.read);
        if (!hasNotif) {
          const newNotif = {
            id: 'reg_' + Date.now(),
            title: 'Siswa Baru Mendaftar',
            message: `Terdapat ${pending.length} siswa baru yang menunggu konfirmasi Anda.`,
            type: 'registration',
            read: false,
            createdAt: 'Baru saja'
          };
          const updated = [newNotif, ...(Array.isArray(stored) ? stored : [])];
          setNotifications(updated);
          await db.set(`elearning_notifs_${user.id}`, updated);
        }
      }
    };

    const fetchClasses = async () => {
      const c = await db.get('elearning_classes_list');
      setClasses(Array.isArray(c) ? c : []);
    };

    fetchNotifs();
    fetchClasses();
  }, [user.id, activeView]);

  const handleMarkAsRead = async (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    await db.set(`elearning_notifs_${user.id}`, updated);
    if (notifications.find(n => n.id === id)?.type === 'registration') {
      setActiveView('confirmations');
    }
  };

  const handleMarkAllRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    await db.set(`elearning_notifs_${user.id}`, updated);
  };

  const sidebarItems = [
    { id: 'overview', label: 'Ringkasan', icon: BarChart3 },
    { id: 'confirmations', label: 'Konfirmasi Siswa', icon: UserPlus },
    { id: 'materials', label: 'Kelola Materi', icon: BookOpen },
    { id: 'tasks', label: 'Kelola Tugas', icon: ClipboardList },
    { id: 'grades', label: 'Nilai Tugas', icon: CheckCircle },
    { id: 'students', label: 'Kelola Siswa', icon: Users },
    { id: 'classes', label: 'Kelola Kelas', icon: School },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' = 'danger') => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, type });
  };

  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  const renderContent = () => {
    switch (activeView) {
      case 'overview': return <OverviewTab setActiveView={setActiveView} />;
      case 'confirmations': return <ConfirmRegistrationsTab triggerConfirm={triggerConfirm} />;
      case 'materials': return <ManageMaterialsTab triggerConfirm={triggerConfirm} classes={classes} />;
      case 'tasks': return <ManageTasksTab triggerConfirm={triggerConfirm} classes={classes} />;
      case 'grades': return <GradesTab triggerConfirm={triggerConfirm} classes={classes} />;
      case 'students': return <ManageStudentsTab triggerConfirm={triggerConfirm} classes={classes} />;
      case 'classes': return <ManageClassesTab triggerConfirm={triggerConfirm} classes={classes} setClasses={setClasses} />;
      case 'settings': return <SettingsTab settings={settings} setSettings={setSettings} user={user} onUpdateUser={onUpdateUser} />;
      default: return <OverviewTab setActiveView={setActiveView} />;
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={onLogout} 
      sidebarItems={sidebarItems} 
      activeView={activeView} 
      setActiveView={setActiveView}
      logoUrl={settings.logoUrl}
      siteName={settings.siteName}
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllRead}
    >
      {renderContent()}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 text-black">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 ${confirmModal.type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">{confirmModal.title}</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10">{confirmModal.message}</p>
            <div className="flex gap-4">
              <button onClick={closeConfirm} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all">Batal</button>
              <button onClick={() => { confirmModal.onConfirm(); closeConfirm(); }} className={`flex-1 py-4 text-white rounded-2xl font-black text-sm shadow-xl transition-all ${confirmModal.type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-100'}`}>Ya, Lanjutkan</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

/**
 * Helper Utility untuk mengirim notifikasi ke satu atau banyak siswa
 */
const notifyStudents = async (targetClassIds: string[], title: string, message: string, type: 'material' | 'task' | 'grade', singleStudentId?: string) => {
  const allStudents = await db.get('elearning_students_list');
  const studentsToNotify = Array.isArray(allStudents) ? allStudents.filter((s: User) => {
    if (singleStudentId) return s.id === singleStudentId;
    return targetClassIds.includes(s.classId || '');
  }) : [];

  for (const student of studentsToNotify) {
    const key = `elearning_notifs_${student.id}`;
    const currentNotifs = await db.get(key);
    const newNotif = {
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newNotif, ...(Array.isArray(currentNotifs) ? currentNotifs : [])].slice(0, 20); // Simpan 20 terakhir
    await db.set(key, updated);
  }
};

// --- Ringkasan (Overview) ---
const OverviewTab = ({ setActiveView }: { setActiveView: (v: string) => void }) => {
  const [stats, setStats] = useState({ students: 0, classes: 0, materials: 0, tasks: 0, pending: 0, ungraded: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [students, pending, classes, materials, tasks, submissions] = await Promise.all([
        db.get('elearning_students_list'),
        db.get('elearning_pending_students'),
        db.get('elearning_classes_list'),
        db.get('elearning_materi_list'),
        db.get('elearning_tugas_list'),
        db.get('elearning_submissions_list')
      ]);
      setStats({
        students: Array.isArray(students) ? students.length : 0,
        pending: Array.isArray(pending) ? pending.length : 0,
        classes: Array.isArray(classes) ? classes.length : 0,
        materials: Array.isArray(materials) ? materials.length : 0,
        tasks: Array.isArray(tasks) ? tasks.length : 0,
        ungraded: Array.isArray(submissions) ? submissions.filter((s: Submission) => s.grade === undefined || s.grade === null).length : 0
      });
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-black">
        {stats.pending > 0 && (
          <div className="bg-orange-500 rounded-[3rem] p-10 text-white shadow-2xl shadow-orange-100 flex flex-col justify-between group">
            <div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-[1.5rem] flex items-center justify-center mb-6 border border-white/30"><UserPlus size={32} /></div>
              <h3 className="text-3xl font-black mb-2">{stats.pending} Siswa Baru</h3>
              <p className="opacity-90 font-medium text-lg">Menunggu verifikasi Anda.</p>
            </div>
            <button onClick={() => setActiveView('confirmations')} className="mt-8 bg-white text-orange-600 px-8 py-4 rounded-2xl font-black shadow-xl w-max flex items-center gap-2">Buka Verifikasi <ChevronRight size={20} /></button>
          </div>
        )}
        <div className={`rounded-[3rem] p-10 shadow-2xl flex flex-col justify-between group ${stats.ungraded > 0 ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-800 text-white shadow-slate-200'}`}>
          <div>
            <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-[1.5rem] flex items-center justify-center mb-6 border border-white/20"><Award size={32} /></div>
            <h3 className="text-3xl font-black mb-2">{stats.ungraded} Tugas</h3>
            <p className="opacity-90 font-medium text-lg">{stats.ungraded > 0 ? 'Pekerjaan siswa yang belum dinilai.' : 'Semua tugas telah dinilai.'}</p>
          </div>
          <button onClick={() => setActiveView('grades')} className="mt-8 bg-white/10 text-white px-8 py-4 rounded-2xl font-black shadow-xl w-max flex items-center gap-2 border border-white/20">Buka Nilai <ChevronRight size={20} /></button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-black">
        {[
          { label: 'Siswa Aktif', val: stats.students, icon: Users, col: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Materi', val: stats.materials, icon: BookOpen, col: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Tugas', val: stats.tasks, icon: ClipboardList, col: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Kelas', val: stats.classes, icon: School, col: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className={`${s.bg} ${s.col} w-14 h-14 rounded-2xl flex items-center justify-center mb-4`}><s.icon size={28}/></div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
            <h4 className="text-3xl font-black text-slate-800">{s.val}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Verifikasi (Confirmations) ---
const ConfirmRegistrationsTab = ({ triggerConfirm }: { triggerConfirm: any }) => {
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
      await db.set('elearning_students_list', updatedActive);
      await db.set('elearning_pending_students', updatedPending);
      setPending(updatedPending);
    } else {
      triggerConfirm("Tolak Pendaftaran?", "Siswa ini tidak akan dapat login.", async () => {
        const updatedPending = pending.filter(s => s.username !== student.username);
        await db.set('elearning_pending_students', updatedPending);
        setPending(updatedPending);
      });
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500 text-black">
      {pending.map((s, i) => (
        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <img src={s.avatar} className="w-24 h-24 rounded-full mb-4 border-4 border-slate-50" />
          <h4 className="font-black text-slate-800 text-xl">{s.name}</h4>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Kelas {s.classId}</span>
          <div className="flex gap-4 w-full mt-8">
            <button onClick={() => handleAction(s, 'APPROVE')} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs">Terima</button>
            <button onClick={() => handleAction(s, 'REJECT')} className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-xs">Tolak</button>
          </div>
        </div>
      ))}
      {pending.length === 0 && <div className="col-span-full py-20 text-center text-slate-300 font-bold uppercase text-xs tracking-widest">Tidak ada antrian pendaftaran.</div>}
    </div>
  );
};

// --- Kelola Materi ---
const ManageMaterialsTab = ({ triggerConfirm, classes }: { triggerConfirm: any, classes: ClassRoom[] }) => {
  const [items, setItems] = useState<Material[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
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

  const filteredItems = useMemo(() => {
    return items.filter(it => {
      const matchSearch = it.title.toLowerCase().includes(search.toLowerCase()) || it.description.toLowerCase().includes(search.toLowerCase());
      const matchClass = !classFilter || it.targetClassIds.includes(classFilter);
      const matchType = !typeFilter || it.type === typeFilter;
      return matchSearch && matchClass && matchType;
    });
  }, [items, search, classFilter, typeFilter]);

  const handleSave = async () => {
    if (!form.title || !form.content) return alert("Judul dan Konten wajib diisi!");
    
    const isNew = !form.id;
    const id = form.id || `mat_${Math.random().toString(36).substr(2, 9)}`;
    const newItem: Material = { 
      id,
      title: form.title!,
      description: form.description || '',
      type: (form.type as any) || 'link',
      content: form.content!,
      targetClassIds: form.targetClassIds || [],
      createdAt: form.createdAt || new Date().toISOString()
    };
    
    const updated = form.id ? items.map(it => it.id === form.id ? newItem : it) : [newItem, ...items];
    await db.set('elearning_materi_list', updated);
    setItems(updated);
    
    if (isNew) {
      notifyStudents(newItem.targetClassIds, "Materi Baru!", `Guru telah mengunggah materi: ${newItem.title}`, "material");
    }

    setShowModal(false);
    setForm({ title: '', description: '', type: 'link', content: '', targetClassIds: [] });
  };

  const handleDelete = (id: string) => {
    triggerConfirm(`Hapus Materi?`, "Materi ini akan dihapus dari dashboard siswa.", async () => {
      const updated = items.filter(it => it.id !== id);
      await db.set('elearning_materi_list', updated);
      setItems(updated);
    });
  };

  const getIcon = (type: string, content: string) => {
    if (type === 'embed' || content.includes('youtube') || content.includes('youtu.be')) return <PlayCircle className="text-red-500" />;
    if (type === 'file') return <FileText className="text-blue-500" />;
    return <LinkIcon className="text-emerald-500" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-black">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-800">Manajemen Materi</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Publikasikan konten pembelajaran baru</p>
          </div>
          <button onClick={() => { setForm({ title: '', description: '', type: 'link', content: '', targetClassIds: [] }); setShowModal(true); }} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 shrink-0"><Plus size={18}/> Tambah Materi</button>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul atau deskripsi..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all" />
          </div>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-600 outline-none">
            <option value="">Semua Kelas</option>
            {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-600 outline-none">
            <option value="">Semua Tipe</option>
            <option value="link">Link</option>
            <option value="embed">Embed</option>
            <option value="file">File ID</option>
          </select>
          {(search || classFilter || typeFilter) && (
            <button onClick={() => {setSearch(''); setClassFilter(''); setTypeFilter('');}} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Reset Filter"><FilterX size={20}/></button>
          )}
        </div>
      </div>

      {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((it, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col relative group hover:shadow-xl transition-all">
              <div className="flex justify-between mb-4">
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                   {getIcon(it.type, it.content)}
                 </div>
                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setForm(it); setShowModal(true); }} className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(it.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash size={16}/></button>
                 </div>
              </div>
              <h4 className="font-black text-slate-800 text-xl mb-2 line-clamp-2">{it.title}</h4>
              <p className="text-sm text-slate-500 mb-6 line-clamp-2 font-medium">{it.description}</p>
              <div className="flex flex-wrap gap-2 mt-auto">
                 {it.targetClassIds.map((c: any) => <span key={c} className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase">KELAS {c}</span>)}
              </div>
              <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-300 uppercase">
                <span>{new Date(it.createdAt).toLocaleDateString()}</span>
                <span className="text-emerald-500">{it.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-6 text-black">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-black text-slate-800">{form.id ? 'Edit Materi' : 'Materi Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={20}/></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Judul Materi</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Masukkan judul materi..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Deskripsi Materi</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Penjelasan singkat materi..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium text-slate-600 h-24 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tipe Konten</label>
                  <select 
                    value={form.type} 
                    onChange={e => setForm({...form, type: e.target.value as any})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  >
                    <option value="link">Link Eksternal</option>
                    <option value="embed">Embed (Video/Iframe)</option>
                    <option value="file">File ID (Drive/Local)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">URL / ID Konten</label>
                  <input value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="https://..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all" />
                </div>
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Target Kelas</p>
                 <div className="flex flex-wrap gap-2">
                    {classes.map(c => (
                      <button key={c.id} onClick={() => {
                        const current = form.targetClassIds || [];
                        setForm({...form, targetClassIds: current.includes(c.name) ? current.filter((x: any) => x !== c.name) : [...current, c.name]});
                      }} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${form.targetClassIds?.includes(c.name) ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{c.name}</button>
                    ))}
                 </div>
              </div>
            </div>
            <div className="pt-4 flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm">Batal</button>
              <button onClick={handleSave} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 text-sm hover:bg-emerald-700 transition-all">Simpan Materi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Kelola Tugas ---
const ManageTasksTab: React.FC<{ triggerConfirm: any, classes: ClassRoom[] }> = ({ triggerConfirm, classes }) => {
  const [items, setItems] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [form, setForm] = useState<Partial<Task>>({ 
    title: '', 
    description: '', 
    content: '', 
    targetClassIds: [], 
    dueDate: '',
    isSubmissionEnabled: true,
    type: 'link'
  });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    const saved = await db.get('elearning_tugas_list');
    setItems(Array.isArray(saved) ? saved : []);
  };

  const filteredItems = useMemo(() => {
    return items.filter(it => {
      const matchSearch = it.title.toLowerCase().includes(search.toLowerCase()) || it.description.toLowerCase().includes(search.toLowerCase());
      const matchClass = !classFilter || it.targetClassIds.includes(classFilter);
      return matchSearch && matchClass;
    });
  }, [items, search, classFilter]);

  const handleSave = async () => {
    if (!form.title || !form.dueDate) return alert("Judul dan Deadline wajib diisi!");
    
    const isNew = !form.id;
    const id = form.id || `task_${Math.random().toString(36).substr(2, 9)}`;
    const newItem: Task = { 
      id,
      title: form.title!,
      description: form.description || '',
      type: (form.type as any) || 'link',
      content: form.content || '',
      targetClassIds: form.targetClassIds || [],
      dueDate: form.dueDate!,
      isSubmissionEnabled: form.isSubmissionEnabled ?? true,
      createdAt: form.createdAt || new Date().toISOString()
    };
    
    const updated = form.id ? items.map(it => it.id === form.id ? newItem : it) : [newItem, ...items];
    await db.set('elearning_tugas_list', updated);
    setItems(updated);

    if (isNew) {
      notifyStudents(newItem.targetClassIds, "Tugas Baru!", `Guru telah memberikan tugas baru: ${newItem.title}`, "task");
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    triggerConfirm(`Hapus Tugas?`, "Semua pengumpulan siswa untuk tugas ini juga akan terpengaruh.", async () => {
      const updated = items.filter(it => it.id !== id);
      await db.set('elearning_tugas_list', updated);
      setItems(updated);
    });
  };

  const isOverdue = (date: string) => new Date(date) < new Date();

  return (
    <div className="space-y-6 text-black">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-800">Manajemen Tugas</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Berikan tantangan praktik untuk siswa</p>
          </div>
          <button onClick={() => { setForm({ title: '', description: '', content: '', targetClassIds: [], dueDate: '', isSubmissionEnabled: true, type: 'link' }); setShowModal(true); }} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 shrink-0"><Plus size={18}/> Tambah Tugas</button>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul tugas..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium focus:ring-4 focus:ring-purple-500/10 transition-all" />
          </div>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-600 outline-none">
            <option value="">Semua Kelas</option>
            {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          {(search || classFilter) && (
            <button onClick={() => {setSearch(''); setClassFilter('');}} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Reset Filter"><FilterX size={20}/></button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((it, i) => (
          <div key={i} className={`bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col relative group hover:shadow-xl transition-all ${isOverdue(it.dueDate) ? 'border-red-50' : 'border-slate-100'}`}>
            <div className="flex justify-between mb-4">
               <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isOverdue(it.dueDate) ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-300'}`}>
                 {isOverdue(it.dueDate) ? 'Overdue' : 'Active'}
               </span>
               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setForm(it); setShowModal(true); }} className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(it.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash size={16}/></button>
               </div>
            </div>
            <h4 className="font-black text-slate-800 text-xl mb-2 line-clamp-2">{it.title}</h4>
            <div className={`flex items-center gap-2 mb-4 ${isOverdue(it.dueDate) ? 'text-red-500' : 'text-slate-400'}`}>
              <Clock size={14}/>
              <span className="text-[10px] font-black uppercase tracking-widest">Deadline: {new Date(it.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto">
               {it.targetClassIds.map((c: any) => <span key={c} className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase">KELAS {c}</span>)}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-6 text-black">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black text-slate-800">{form.id ? 'Edit Tugas' : 'Tugas Baru'}</h3>
            <div className="space-y-4">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Judul tugas..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-purple-500/10 transition-all" />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Instruksi pengerjaan..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium text-slate-600 h-24 focus:ring-4 focus:ring-purple-500/10 transition-all resize-none" />
              <div className="grid grid-cols-2 gap-4">
                 <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-purple-500/10 transition-all" />
                 <input value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="URL Contoh/Template..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-purple-500/10 transition-all" />
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <input type="checkbox" checked={form.isSubmissionEnabled} onChange={e => setForm({...form, isSubmissionEnabled: e.target.checked})} className="w-5 h-5 accent-purple-600" />
                <span className="text-sm font-bold text-slate-700">Aktifkan Pengumpulan Link</span>
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Target Kelas</p>
                 <div className="flex flex-wrap gap-2">
                    {classes.map(c => (
                      <button key={c.id} onClick={() => {
                        const current = form.targetClassIds || [];
                        setForm({...form, targetClassIds: current.includes(c.name) ? current.filter((x: any) => x !== c.name) : [...current, c.name]});
                      }} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${form.targetClassIds?.includes(c.name) ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{c.name}</button>
                    ))}
                 </div>
              </div>
            </div>
            <div className="pt-4 flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm">Batal</button>
              <button onClick={handleSave} className="flex-[2] py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg shadow-purple-100 text-sm hover:bg-purple-700 transition-all">Simpan Tugas</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Nilai (Grades) ---
const GradesTab: React.FC<{ triggerConfirm: any, classes: ClassRoom[] }> = ({ triggerConfirm, classes }) => {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [gradeModal, setGradeModal] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const [s, t, std] = await Promise.all([db.get('elearning_submissions_list'), db.get('elearning_tugas_list'), db.get('elearning_students_list')]);
      setSubs(Array.isArray(s) ? s : []);
      setTasks(Array.isArray(t) ? t : []);
      setStudents(Array.isArray(std) ? std : []);
    };
    fetch();
  }, []);

  const handleGrade = async () => {
    const updated = subs.map(s => s.id === gradeModal.id ? { 
      ...gradeModal, 
      grade: Number(gradeModal.grade),
      feedback: gradeModal.feedback || '' 
    } : s);
    await db.set('elearning_submissions_list', updated);
    setSubs(updated);
    
    // Kirim notifikasi ke siswa tersebut
    const task = tasks.find(t => t.id === gradeModal.taskId);
    notifyStudents([], "Tugas Telah Dinilai!", `Tugas "${task?.title}" kamu telah dinilai oleh guru.`, "grade", gradeModal.studentId);
    
    setGradeModal(null);
  };

  const handleDeleteSubmission = (id: string, studentName: string) => {
    triggerConfirm(`Hapus Pengumpulan?`, `Hapus pengumpulan tugas dari ${studentName}? Data ini akan hilang permanen.`, async () => {
      const updated = subs.filter(s => s.id !== id);
      await db.set('elearning_submissions_list', updated);
      setSubs(updated);
    }, 'danger');
  };

  const filteredSubs = useMemo(() => {
    return subs.filter(s => {
      const student = students.find(x => x.id === s.studentId);
      const task = tasks.find(x => x.id === s.taskId);
      const term = search.toLowerCase();
      
      const matchSearch = student?.name.toLowerCase().includes(term) || task?.title.toLowerCase().includes(term);
      const matchClass = !classFilter || student?.classId === classFilter;
      
      return matchSearch && matchClass;
    });
  }, [subs, students, tasks, search, classFilter]);

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500 text-black">
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800">Penilaian Tugas Siswa</h3>
          <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mt-1 inline-block">{filteredSubs.length} Pengumpulan</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-600 outline-none text-xs">
            <option value="">Semua Kelas</option>
            {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari siswa atau tugas..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium text-sm" />
          </div>
          {(search || classFilter) && (
            <button onClick={() => {setSearch(''); setClassFilter('');}} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Reset Filter"><FilterX size={18}/></button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-6">Siswa</th>
              <th className="px-8 py-6">Tugas & Pengumpulan</th>
              <th className="px-8 py-6 text-center">Nilai</th>
              <th className="px-8 py-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {filteredSubs.map((s, i) => {
              const student = students.find(x => x.id === s.studentId);
              const task = tasks.find(x => x.id === s.taskId);
              return (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <img src={student?.avatar} className="w-10 h-10 rounded-full bg-slate-100" />
                      <div>
                        <p className="font-bold text-slate-700">{student?.name || 'Siswa'}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Kelas {student?.classId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-slate-500 font-bold mb-1">{task?.title || 'Tugas'}</p>
                    <div className="flex items-center gap-2">
                       {s.content.startsWith('http') ? (
                         <a href={s.content} target="_blank" rel="noreferrer" className="text-[10px] font-black text-emerald-600 hover:underline flex items-center gap-1 uppercase">Lihat Tautan <ExternalLink size={10}/></a>
                       ) : (
                         <span className="text-[10px] font-black text-slate-300 uppercase italic">Offline Submission</span>
                       )}
                       <span className="text-[10px] text-slate-300 font-medium">• {s.submittedAt}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-2 rounded-xl font-black ${s.grade ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {s.grade || '-'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => setGradeModal({...s, grade: s.grade || '', feedback: s.feedback || ''})} className="text-indigo-600 font-black text-xs hover:underline flex items-center gap-1 transition-all"><Edit size={12}/> {s.grade ? 'Ubah' : 'Nilai'}</button>
                      <button onClick={() => handleDeleteSubmission(s.id, student?.name || 'Siswa')} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {gradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 text-black">
           <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-800">Form Penilaian</h3>
                <button onClick={() => setGradeModal(null)} className="p-2 hover:bg-slate-50 rounded-full transition-all"><X size={20}/></button>
              </div>
              <div className="space-y-6 text-black">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Informasi Pengiriman</p>
                  <p className="font-bold text-slate-800">{students.find(x => x.id === gradeModal.studentId)?.name}</p>
                  <p className="text-xs text-slate-500 font-medium mb-3">{tasks.find(x => x.id === gradeModal.taskId)?.title}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nilai Akhir (0-100)</label>
                    <input type="number" min="0" max="100" value={gradeModal.grade} onChange={e => setGradeModal({...gradeModal, grade: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-4xl text-center text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Catatan Guru (Umpan Balik)</label>
                    <textarea value={gradeModal.feedback} onChange={e => setGradeModal({...gradeModal, feedback: e.target.value})} placeholder="Tuliskan masukan atau catatan untuk siswa..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-slate-700 h-32 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none" />
                  </div>
                </div>
              </div>
              <div className="pt-8 flex gap-4">
                <button onClick={() => setGradeModal(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm">Batal</button>
                <button onClick={handleGrade} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all text-sm">Simpan Penilaian</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- Kelola Siswa (Enhanced) ---
const ManageStudentsTab = ({ triggerConfirm, classes }: { triggerConfirm: any, classes: ClassRoom[] }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<Partial<User>>({
    name: '',
    username: '',
    password: '',
    classId: '',
    status: 'ACTIVE'
  });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    setLoading(true);
    const s = await db.get('elearning_students_list');
    setStudents(Array.isArray(s) ? s : []);
    setLoading(false);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.username.toLowerCase().includes(search.toLowerCase());
      const matchClass = !classFilter || s.classId === classFilter;
      return matchSearch && matchClass;
    });
  }, [students, search, classFilter]);

  const handleSave = async () => {
    if (!form.name || !form.username || (!form.id && !form.password)) return alert("Harap isi semua kolom wajib!");
    
    const id = form.id || `std_${Math.random().toString(36).substr(2, 9)}`;
    const newStudent: User = {
      id,
      name: form.name!,
      username: form.username!,
      password: form.password || (students.find(s => s.id === form.id)?.password),
      classId: form.classId || '',
      role: 'STUDENT',
      status: (form.status as any) || 'ACTIVE',
      avatar: form.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.username}`
    };

    const updated = form.id ? students.map(s => s.id === form.id ? newStudent : s) : [newStudent, ...students];
    await db.set('elearning_students_list', updated);
    setStudents(updated);
    setShowModal(false);
    setForm({ name: '', username: '', password: '', classId: '', status: 'ACTIVE' });
    setShowPassword(false);
  };

  const handleDelete = (id: string, name: string) => {
    triggerConfirm(`Hapus Siswa ${name}?`, "Data login dan pengumpulan tugas siswa ini akan dihapus secara permanen.", async () => {
      const updated = students.filter(s => s.id !== id);
      await db.set('elearning_students_list', updated);
      setStudents(updated);
    });
  };

  return (
    <div className="space-y-6 text-black">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-800">Manajemen Siswa</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Daftar siswa aktif Informatika</p>
          </div>
          <button onClick={() => { setForm({ name: '', username: '', password: '', classId: '', status: 'ACTIVE' }); setShowModal(true); }} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 shrink-0"><Plus size={18}/> Tambah Siswa</button>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau username..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium focus:ring-4 focus:ring-blue-500/10 transition-all" />
          </div>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-600 outline-none">
            <option value="">Semua Kelas</option>
            {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          {(search || classFilter) && (
            <button onClick={() => {setSearch(''); setClassFilter('');}} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Reset Filter"><FilterX size={20}/></button>
          )}
        </div>
      </div>

      {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {filteredStudents.map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center group hover:shadow-xl transition-all relative">
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setForm(s); setShowModal(true); }} className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Edit size={14}/></button>
                <button onClick={() => handleDelete(s.id, s.name)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button>
              </div>
              <img src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`} className="w-20 h-20 rounded-full mb-3 border-4 border-slate-50" />
              <h4 className="font-bold text-slate-800 text-sm text-center leading-tight mb-1">{s.name}</h4>
              <p className="text-[10px] text-slate-400 font-medium mb-3">@{s.username}</p>
              <div className="mt-auto pt-3 border-t border-slate-50 w-full text-center">
                 <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">KELAS {s.classId}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-6 text-black">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-black text-slate-800">{form.id ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nama Lengkap</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Masukkan nama lengkap siswa..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Username</label>
                  <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Username..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Pilih Kelas</label>
                  <select value={form.classId} onChange={e => setForm({...form, classId: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all">
                    <option value="">Kelas...</option>
                    {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{form.id ? 'Password Baru (Kosongkan jika tetap)' : 'Password Awal'}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-4 flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm">Batal</button>
              <button onClick={handleSave} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 text-sm hover:bg-blue-700 transition-all">Simpan Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Kelola Kelas (Dynamic CRUD) ---
const ManageClassesTab = ({ triggerConfirm, classes, setClasses }: { triggerConfirm: any, classes: ClassRoom[], setClasses: any }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<ClassRoom>>({ name: '', homeroomTeacher: '' });

  const handleSave = async () => {
    if (!form.name) return alert("Nama kelas wajib diisi!");
    const id = form.id || `class_${Math.random().toString(36).substr(2, 9)}`;
    const newClass: ClassRoom = { id, name: form.name!, homeroomTeacher: form.homeroomTeacher || '' };
    
    const updated = form.id ? classes.map(c => c.id === form.id ? newClass : c) : [...classes, newClass];
    await db.set('elearning_classes_list', updated);
    setClasses(updated);
    setShowModal(false);
    setForm({ name: '', homeroomTeacher: '' });
  };

  const handleDelete = (id: string) => {
    triggerConfirm(`Hapus Kelas?`, "Perhatian: Siswa, Materi, dan Tugas yang merujuk ke kelas ini mungkin akan terpengaruh.", async () => {
      const updated = classes.filter(c => c.id !== id);
      await db.set('elearning_classes_list', updated);
      setClasses(updated);
    });
  };

  return (
    <div className="space-y-6 text-black">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-2xl font-black text-slate-800">Manajemen Kelas</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Kelola rombongan belajar sekolah</p>
        </div>
        <button onClick={() => { setForm({ name: '', homeroomTeacher: '' }); setShowModal(true); }} className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-amber-700 transition-all shadow-lg shadow-amber-100"><Plus size={18}/> Tambah Kelas</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
        {classes.map((c, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm text-center hover:shadow-xl transition-all group relative">
             <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setForm(c); setShowModal(true); }} className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Edit size={14}/></button>
                <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash size={14}/></button>
             </div>
             <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-600 group-hover:text-white transition-all"><School size={24}/></div>
             <h4 className="text-4xl font-black text-slate-800 mb-2">{c.name}</h4>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">{c.homeroomTeacher || 'Belum ada wali kelas'}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl space-y-6">
            <h3 className="text-2xl font-black text-slate-800">{form.id ? 'Edit Kelas' : 'Kelas Baru'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nama Kelas (Contoh: 7A)</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="7A / 8B / 9C..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-amber-500/10 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nama Wali Kelas</label>
                <input value={form.homeroomTeacher} onChange={e => setForm({...form, homeroomTeacher: e.target.value})} placeholder="Nama Guru..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-amber-500/10 transition-all" />
              </div>
            </div>
            <div className="pt-4 flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm">Batal</button>
              <button onClick={handleSave} className="flex-[2] py-4 bg-amber-600 text-white rounded-2xl font-black shadow-lg shadow-amber-100 text-sm hover:bg-amber-700 transition-all">Simpan Kelas</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Pengaturan ---
const SettingsTab: React.FC<{ settings: SiteSettings, setSettings: any, user: User, onUpdateUser: any }> = ({ settings, setSettings, user, onUpdateUser }) => {
  const [adminUsername, setAdminUsername] = useState(user.username);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = async () => {
    await db.set('elearning_site_settings', settings);
    
    const admins = await db.get('elearning_admins_list');
    const adminList = Array.isArray(admins) ? admins : [];
    
    const updatedUser = { 
      ...user, 
      username: adminUsername,
      ...(adminPassword ? { password: adminPassword } : {})
    };

    let newAdminList;
    if (adminList.length === 0) {
      newAdminList = [updatedUser];
    } else {
      newAdminList = adminList.map((a: User) => a.id === user.id ? updatedUser : a);
      if (!adminList.some((a: User) => a.id === user.id)) {
        newAdminList.push(updatedUser);
      }
    }

    await db.set('elearning_admins_list', newAdminList);
    if (onUpdateUser) onUpdateUser(updatedUser);
    
    alert('Seluruh pengaturan berhasil disimpan!');
    setAdminPassword('');
    setShowPassword(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-black animate-in fade-in duration-500">
      <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
        <div>
          <h3 className="text-2xl font-black text-slate-800">Identitas Portal</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Kustomisasi branding e-learning sekolah</p>
        </div>
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nama Situs / Sekolah</label>
            <input value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800" />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">URL Logo (PNG Transparan)</label>
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl border flex items-center justify-center shrink-0">
                <img src={settings.logoUrl} className="w-10 h-10 object-contain" alt="Preview"/>
              </div>
              <input value={settings.logoUrl} onChange={e => setSettings({...settings, logoUrl: e.target.value})} className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">URL Hero Image (Cover Beranda)</label>
            <input value={settings.heroImageUrl} onChange={e => setSettings({...settings, heroImageUrl: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all" />
          </div>
        </div>
      </div>

      <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
        <div>
          <h3 className="text-2xl font-black text-slate-800">Akun Administrator</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Kelola kredensial login admin Anda</p>
        </div>
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Username Admin Baru</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input value={adminUsername} onChange={e => setAdminUsername(e.target.value)} placeholder="Username admin..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Password Admin Baru</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type={showPassword ? 'text' : 'password'} value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Isi hanya jika ingin ganti..." className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 font-medium italic">*Kosongkan password jika tidak ingin mengubahnya.</p>
          </div>
        </div>
        
        <button onClick={handleSave} className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
          <Save size={24}/> Simpan Semua Perubahan
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
