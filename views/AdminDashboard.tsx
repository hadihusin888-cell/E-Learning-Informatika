
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, BookOpen, ClipboardList, Users, School, Settings, 
  Plus, Edit, Trash2, CheckCircle, Clock, Link as LinkIcon, X,
  Award, ExternalLink, Calendar, Search, SearchX, Shield, Key, Layers,
  Loader2, ChevronRight, LayoutDashboard, Zap, Info, Star, MessageCircle, UserCog, 
  AlertTriangle, UserPlus, Check, Globe, Database, Cloud, Eye, User as UserIcon,
  Save, AlertCircle, Camera, Lock, RefreshCw, SortAsc, SortDesc, Filter
} from 'lucide-react';
import Layout from '../components/Layout';
import { User, SiteSettings, ClassRoom, Submission, Task } from '../types';
import { db } from '../App';

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
    fetchNotifs();
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
      case 'confirmations': return <ConfirmRegistrationsTab triggerConfirm={triggerConfirm} closeConfirm={closeConfirm} />;
      case 'materials': return <ManageContentTab key="materials-tab" type="Materi" triggerConfirm={triggerConfirm} closeConfirm={closeConfirm} adminId={user.id} />;
      case 'tasks': return <ManageContentTab key="tasks-tab" type="Tugas" triggerConfirm={triggerConfirm} closeConfirm={closeConfirm} adminId={user.id} />;
      case 'grades': return <GradesTab triggerConfirm={triggerConfirm} />;
      case 'students': return <ManageStudentsTab triggerConfirm={triggerConfirm} closeConfirm={closeConfirm} />;
      case 'classes': return <ManageClassesTab triggerConfirm={triggerConfirm} closeConfirm={closeConfirm} />;
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 ${confirmModal.type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">{confirmModal.title}</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10">{confirmModal.message}</p>
            <div className="flex gap-4">
              <button 
                onClick={closeConfirm}
                className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all"
              >
                Batal
              </button>
              <button 
                onClick={() => { confirmModal.onConfirm(); closeConfirm(); }}
                className={`flex-1 py-4 text-white rounded-2xl font-black text-sm shadow-xl transition-all ${confirmModal.type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-100'}`}
              >
                Yakin, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

// --- Overview ---
const OverviewTab = ({ setActiveView }: { setActiveView: (v: string) => void }) => {
  const [stats, setStats] = useState({ 
    students: 0, 
    classes: 0, 
    materials: 0, 
    tasks: 0, 
    pending: 0,
    ungraded: 0 
  });
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
      
      const ungradedCount = Array.isArray(submissions) 
        ? submissions.filter((s: Submission) => s.grade === undefined || s.grade === null).length 
        : 0;

      setStats({
        students: Array.isArray(students) ? students.length : 0,
        pending: Array.isArray(pending) ? pending.length : 0,
        classes: Array.isArray(classes) ? classes.length : 0,
        materials: Array.isArray(materials) ? materials.length : 0,
        tasks: Array.isArray(tasks) ? tasks.length : 0,
        ungraded: ungradedCount
      });
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Ringkasan Sistem</h2>
          <p className="text-slate-500 font-medium text-sm">Kelola seluruh ekosistem belajar dari satu tempat.</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-3 text-sm font-bold text-slate-600 shadow-sm">
          <Calendar size={18} className="text-emerald-500" /> {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {stats.pending > 0 && (
          <div className="bg-orange-500 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-orange-100 flex flex-col justify-between group">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-[1.5rem] flex items-center justify-center mb-6 border border-white/30">
                 <UserPlus size={32} />
              </div>
              <h3 className="text-3xl font-black mb-2">{stats.pending} Siswa Baru</h3>
              <p className="opacity-90 font-medium text-lg">Menunggu verifikasi untuk masuk ke kelas.</p>
            </div>
            <button 
              onClick={() => setActiveView('confirmations')} 
              className="mt-10 relative z-10 bg-white text-orange-600 px-8 py-5 rounded-2xl font-black hover:bg-orange-50 transition-all flex items-center justify-center gap-2 shadow-xl w-full sm:w-max"
            >
              Buka Verifikasi <ChevronRight size={20} />
            </button>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <UserCog size={250} />
            </div>
          </div>
        )}

        <div className={`rounded-[3rem] p-10 relative overflow-hidden shadow-2xl flex flex-col justify-between group ${stats.ungraded > 0 ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-800 text-white shadow-slate-200'}`}>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-[1.5rem] flex items-center justify-center mb-6 border border-white/20">
               <Award size={32} />
            </div>
            <h3 className="text-3xl font-black mb-2">{stats.ungraded} Tugas</h3>
            <p className="opacity-90 font-medium text-lg">
              {stats.ungraded > 0 ? 'Pekerjaan siswa yang belum dievaluasi.' : 'Seluruh tugas sudah diberikan nilai.'}
            </p>
          </div>
          <button 
            onClick={() => setActiveView('grades')} 
            className={`mt-10 relative z-10 px-8 py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl w-full sm:w-max ${stats.ungraded > 0 ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
          >
            Mulai Menilai <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:-translate-y-4 transition-transform duration-500">
             <CheckCircle size={250} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Siswa Aktif', value: stats.students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', action: 'students' },
          { label: 'Total Materi', value: stats.materials, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', action: 'materials' },
          { label: 'Tugas Aktif', value: stats.tasks, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50', action: 'tasks' },
          { label: 'Ruang Kelas', value: stats.classes, icon: School, color: 'text-amber-600', bg: 'bg-amber-50', action: 'classes' },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => setActiveView(stat.action)}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className={`${stat.bg} ${stat.color} w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
              <stat.icon size={28} />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{stat.label}</p>
            <div className="flex items-center justify-between">
              <h4 className="text-4xl font-black text-slate-800">{stat.value}</h4>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Konfirmasi Siswa ---
const ConfirmRegistrationsTab = ({ triggerConfirm }: { triggerConfirm: any, closeConfirm: any }) => {
  const [pendingStudents, setPendingStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const saved = await db.get('elearning_pending_students');
      setPendingStudents(Array.isArray(saved) ? saved : []);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleApprove = async (student: User) => {
    setActionLoading(student.username + '_app');
    const activeStudents = await db.get('elearning_students_list');
    const newActiveStudent: User = { 
      ...student, 
      status: 'ACTIVE', 
      id: student.id || `std_${Math.random().toString(36).substr(2, 9)}` 
    };
    const updatedActive = [...activeStudents, newActiveStudent];
    const updatedPending = pendingStudents.filter((s: User) => s.username !== student.username);

    await db.set('elearning_students_list', updatedActive);
    await db.set('elearning_pending_students', updatedPending);

    setPendingStudents(updatedPending);
    setActionLoading(null);
  };

  const handleReject = async (username: string) => {
    triggerConfirm(
      "Tolak Pendaftaran?", 
      "Data pendaftaran ini akan dihapus secara permanen dari antrian sistem.",
      async () => {
        setActionLoading(username + '_rej');
        const updatedPending = pendingStudents.filter((s: User) => s.username !== username);
        await db.set('elearning_pending_students', updatedPending);
        setPendingStudents(updatedPending);
        setActionLoading(null);
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
           <h3 className="text-3xl font-black text-slate-800">Verifikasi Siswa</h3>
           <p className="text-sm text-slate-400 font-medium">Validasi identitas siswa yang baru mendaftar di platform.</p>
        </div>
        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-[1.5rem] flex items-center justify-center shadow-inner">
           <UserPlus size={32} />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100">
           <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        </div>
      ) : pendingStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 text-center">
           <SearchX size={64} className="text-slate-100 mb-6" />
           <h4 className="text-2xl font-black text-slate-300">Antrian Kosong</h4>
           <p className="text-sm text-slate-400 font-medium">Belum ada pendaftar baru yang masuk.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pendingStudents.map(student => (
            <div key={student.username} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all flex flex-col items-center text-center group">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
                <img src={student.avatar} className="relative w-28 h-28 rounded-full border-8 border-slate-50 group-hover:border-emerald-50 transition-all shadow-xl" alt="Avatar" />
              </div>
              <h4 className="font-black text-slate-800 text-2xl mb-1">{student.name}</h4>
              <div className="bg-slate-50 px-5 py-2 rounded-2xl text-[10px] font-black text-slate-500 uppercase mb-10 border border-slate-100 tracking-widest">
                Kelas {student.classId}
              </div>
              <div className="flex gap-4 w-full mt-auto">
                <button 
                  disabled={actionLoading !== null}
                  onClick={() => handleApprove(student)} 
                  className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                >
                  {actionLoading === student.username + '_app' ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Terima</>}
                </button>
                <button 
                  disabled={actionLoading !== null}
                  onClick={() => handleReject(student.username)} 
                  className="flex-1 bg-red-50 text-red-500 py-5 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  {actionLoading === student.username + '_rej' ? <Loader2 size={18} className="animate-spin" /> : <><X size={18} /> Tolak</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Kelola Konten ---
const ManageContentTab: React.FC<{ type: 'Materi' | 'Tugas', triggerConfirm: any, closeConfirm: any, adminId: string }> = ({ type, triggerConfirm, adminId }) => {
  const storageKey = `elearning_${type.toLowerCase()}_list`;
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Advanced Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az'>('newest');
  
  const [form, setForm] = useState({ 
    id: '', 
    title: '', 
    description: '', 
    contentType: 'link' as any, 
    content: '', 
    targetClassIds: [] as string[],
    dueDate: type === 'Tugas' ? new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0] : undefined,
    isSubmissionEnabled: true
  });

  const availableClasses = useMemo(() => {
    const raw = localStorage.getItem('elearning_classes_list');
    return JSON.parse(raw || '[]').map((c: any) => c.name);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const saved = await db.get(storageKey);
      setItems(Array.isArray(saved) ? saved : []);
      setLoading(false);
    };
    fetch();
  }, [storageKey]);

  const filteredItems = useMemo(() => {
    let result = items.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = classFilter === 'ALL' || item.targetClassIds.includes(classFilter);
      
      let matchType = true;
      if (typeFilter !== 'ALL') {
        const content = (item.content || '').toLowerCase();
        if (typeFilter === 'video') matchType = content.includes('youtube') || content.includes('youtu.be');
        else if (typeFilter === 'drive') matchType = content.includes('drive.google.com');
        else if (typeFilter === 'canva') matchType = content.includes('canva.com');
        else matchType = !content.includes('youtube') && !content.includes('youtu.be') && !content.includes('drive.google.com') && !content.includes('canva.com');
      }
      
      return matchSearch && matchClass && matchType;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'az') return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [items, searchTerm, classFilter, typeFilter, sortBy]);

  const handleSave = async () => {
    if (!form.title || !form.content) return alert("Harap lengkapi judul dan link konten!");
    if (form.targetClassIds.length === 0) return alert("Pilih minimal satu kelas tujuan!");
    
    setLoading(true);
    const id = form.id || Math.random().toString(36).substr(2, 9);
    const newItem = { 
      ...form, 
      id, 
      createdAt: form.id ? (items.find(it => it.id === form.id)?.createdAt || new Date().toISOString()) : new Date().toISOString() 
    };
    
    const updated = form.id ? items.map(it => it.id === form.id ? newItem : it) : [newItem, ...items];
    await db.set(storageKey, updated);

    if (!form.id) {
      const allStudents = await db.get('elearning_students_list');
      const targetStudents = (Array.isArray(allStudents) ? allStudents : []).filter(s => form.targetClassIds.includes(s.classId));
      
      for (const student of targetStudents) {
        const studentNotifs = await db.get(`elearning_notifs_${student.id}`);
        const newNotif = {
          id: 'item_' + Date.now() + Math.random(),
          title: `${type} Baru Diterbitkan`,
          message: `Guru telah mengunggah ${type.toLowerCase()} baru: "${form.title}".`,
          type: type.toLowerCase(),
          read: false,
          createdAt: 'Baru saja'
        };
        await db.set(`elearning_notifs_${student.id}`, [newNotif, ...(Array.isArray(studentNotifs) ? studentNotifs : [])]);
      }
    }

    setItems(updated);
    setLoading(false);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({ 
      id: '', 
      title: '', 
      description: '', 
      contentType: 'link', 
      content: '', 
      targetClassIds: [],
      dueDate: type === 'Tugas' ? new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0] : undefined,
      isSubmissionEnabled: true
    });
  };

  const handleDelete = (id: string) => {
    triggerConfirm(
      `Hapus ${type}?`,
      `Seluruh data ${type.toLowerCase()} ini akan dihapus permanen dan tidak dapat diakses lagi oleh siswa.`,
      async () => {
        setLoading(true);
        const updated = items.filter(it => it.id !== id);
        await db.set(storageKey, updated);
        setItems(updated);
        setLoading(false);
      }
    );
  };

  const toggleClass = (cls: string) => {
    setForm(prev => {
      const exists = prev.targetClassIds.includes(cls);
      if (exists) return { ...prev, targetClassIds: prev.targetClassIds.filter(c => c !== cls) };
      return { ...prev, targetClassIds: [...prev.targetClassIds, cls] };
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-8">
             <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner ${type === 'Materi' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
                {type === 'Materi' ? <BookOpen size={32} /> : <ClipboardList size={32} />}
             </div>
             <div>
                <h3 className="text-3xl font-black text-slate-800">Bank {type}</h3>
                <p className="text-sm text-slate-400 font-medium">Distribusi {type.toLowerCase()} Informatika SMP AL Irsyad Surakarta.</p>
             </div>
          </div>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }} 
            className="w-full md:w-auto bg-emerald-600 text-white px-10 py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-emerald-700 shadow-2xl shadow-emerald-50 transition-all active:scale-95"
          >
            <Plus size={24} /> Buat {type}
          </button>
        </div>

        {/* Improved Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-slate-50">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder={`Cari judul ${type.toLowerCase()}...`} 
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-black font-bold shadow-inner focus:ring-2 focus:ring-emerald-500/20 transition-all" 
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
            <select 
              value={classFilter} 
              onChange={e => setClassFilter(e.target.value)} 
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-black font-bold appearance-none cursor-pointer shadow-inner focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">Semua Kelas</option>
              {availableClasses.map((c: string) => <option key={c} value={c}>Kelas {c}</option>)}
            </select>
          </div>

          <div className="relative">
            <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)} 
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-black font-bold appearance-none cursor-pointer shadow-inner focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="video">Video (YouTube)</option>
              <option value="drive">Google Drive</option>
              <option value="canva">Canva</option>
              <option value="other">Tautan Lainnya</option>
            </select>
          </div>

          <div className="relative">
            <SortAsc className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value as any)} 
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-black font-bold appearance-none cursor-pointer shadow-inner focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="newest">Paling Baru</option>
              <option value="oldest">Paling Lama</option>
              <option value="az">Nama A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>
      ) : filteredItems.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[3.5rem] border border-dashed border-slate-100">
           <SearchX size={64} className="mx-auto text-slate-100 mb-6" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Konten tidak ditemukan</p>
           <button onClick={() => { setSearchTerm(''); setClassFilter('ALL'); setTypeFilter('ALL'); }} className="mt-4 text-emerald-600 text-xs font-black hover:underline uppercase tracking-widest">Reset Filter</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(it => {
            const isVideo = it.content.toLowerCase().includes('youtube') || it.content.toLowerCase().includes('youtu.be');
            const isDrive = it.content.toLowerCase().includes('drive.google.com');
            const isCanva = it.content.toLowerCase().includes('canva.com');
            
            return (
              <div key={it.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all flex flex-col group relative overflow-hidden">
                <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={() => { setForm(it); setShowModal(true); }} className="p-3.5 bg-white/90 backdrop-blur text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl border border-slate-100"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(it.id)} className="p-3.5 bg-white/90 backdrop-blur text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl border border-slate-100"><Trash2 size={18} /></button>
                </div>

                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-wrap gap-2">
                    {it.targetClassIds.map((c: string) => (
                      <span key={c} className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">Kelas {c}</span>
                    ))}
                  </div>
                  <div className={`p-3 rounded-xl ${isVideo ? 'bg-red-50 text-red-500' : isDrive ? 'bg-blue-50 text-blue-500' : isCanva ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-50 text-slate-500'}`}>
                    {isVideo ? <Zap size={18} /> : isDrive ? <Database size={18} /> : isCanva ? <Eye size={18} /> : <LinkIcon size={18} />}
                  </div>
                </div>

                <h4 className="font-black text-slate-800 text-2xl mb-4 leading-tight group-hover:text-emerald-700 transition-colors">{it.title}</h4>
                <p className="text-sm text-slate-500 mb-10 line-clamp-3 font-medium leading-relaxed">{it.description || `Pelajari ${type.toLowerCase()} ini untuk memahami topik informatika lebih lanjut.`}</p>
                
                <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Dibuat</span>
                    <span className="text-xs font-bold text-slate-600">{new Date(it.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</span>
                  </div>
                  <a href={it.content} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-50 text-slate-400 px-5 py-3 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-inner font-black text-[10px] uppercase tracking-widest">
                    Buka <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[80] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 md:p-16 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-12">
               <h3 className="text-3xl font-black text-slate-800">Konfigurasi {type}</h3>
               <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:text-red-500 transition-all"><X /></button>
            </div>
            <div className="space-y-8 text-black">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Judul Utama</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Masukkan judul..." className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-black" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Deskripsi/Instruksi</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-medium text-black" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tautan Konten</label>
                <div className="relative">
                  <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="https://..." className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-medium text-black" />
                </div>
              </div>
              {type === 'Tugas' && (
                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Batas Akhir</label>
                      <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-black" />
                   </div>
                   <div className="flex flex-col justify-end pb-3">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={form.isSubmissionEnabled} onChange={e => setForm({...form, isSubmissionEnabled: e.target.checked})} className="w-6 h-6 rounded-lg text-emerald-600 border-slate-200 focus:ring-emerald-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktifkan Upload</span>
                      </label>
                   </div>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Distribusikan ke Kelas</label>
                <div className="flex flex-wrap gap-3">
                  {availableClasses.map((cls: string) => (
                    <button key={cls} onClick={() => toggleClass(cls)} className={`px-6 py-3.5 rounded-2xl text-xs font-black transition-all ${form.targetClassIds.includes(cls) ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-50' : 'bg-white text-slate-400 border border-slate-100'}`}>Kelas {cls}</button>
                  ))}
                </div>
              </div>
              <div className="pt-8">
                 <button onClick={handleSave} className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xl hover:bg-emerald-700 shadow-2xl active:scale-95">
                    {loading ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />} Simpan Konten
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Kelola Siswa ---
const ManageStudentsTab = ({ triggerConfirm }: { triggerConfirm: any, closeConfirm: any }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [form, setForm] = useState({ id: '', name: '', username: '', password: '', classId: '' });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [savedStudents, savedClasses] = await Promise.all([
        db.get('elearning_students_list'),
        db.get('elearning_classes_list')
      ]);
      setStudents(Array.isArray(savedStudents) ? savedStudents : []);
      setClasses(Array.isArray(savedClasses) ? savedClasses : []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.username || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = classFilter === 'ALL' || s.classId === classFilter;
      return matchSearch && matchClass;
    });
  }, [students, searchTerm, classFilter]);

  const handleSave = async () => {
    if (!form.name || !form.username || !form.classId) return alert("Harap isi seluruh data!");
    setLoading(true);
    const id = form.id || `std_${Math.random().toString(36).substr(2, 9)}`;
    const existing = students.find(s => s.id === form.id);
    const finalPassword = form.password || existing?.password || '123456';

    const newStudent: User = { 
      ...form, id, password: finalPassword,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.username}`, 
      role: 'STUDENT', status: 'ACTIVE' 
    };
    const updated = form.id ? students.map(s => s.id === form.id ? newStudent : s) : [newStudent, ...students];
    await db.set('elearning_students_list', updated);
    setStudents(updated);
    setLoading(false);
    setShowModal(false);
    setForm({ id: '', name: '', username: '', password: '', classId: '' });
  };

  const handleDelete = (id: string) => {
    triggerConfirm(
      "Hapus Akun Siswa?",
      "Seluruh data nilai dan progres belajar siswa ini akan hilang secara permanen.",
      async () => {
        setLoading(true);
        const updated = students.filter(s => s.id !== id);
        await db.set('elearning_students_list', updated);
        setStudents(updated);
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
           <h3 className="text-3xl font-black text-slate-800">Manajemen Siswa</h3>
           <p className="text-sm text-slate-400 font-medium">Atur data profil dan akses seluruh siswa aktif.</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
           <div className="relative flex-1 lg:w-64 min-w-[200px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Cari nama/username..." className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-black font-bold shadow-inner" />
           </div>
           <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-black font-bold appearance-none cursor-pointer shadow-inner">
             <option value="ALL">Semua Kelas</option>
             {classes.map(c => <option key={c.id} value={c.name}>Kelas {c.name}</option>)}
           </select>
           <button onClick={() => { setForm({ id: '', name: '', username: '', password: '', classId: '' }); setShowModal(true); }} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-2xl hover:bg-emerald-700 transition-all active:scale-95">
             <Plus size={24} /> Tambah Siswa
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStudents.map(s => (
          <div key={s.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 flex items-center gap-6 relative group shadow-sm hover:shadow-2xl transition-all">
            <div className="relative">
              <div className="absolute inset-0 bg-slate-100 rounded-2xl scale-95 group-hover:scale-105 transition-transform"></div>
              <img src={s.avatar} className="relative w-20 h-20 rounded-2xl bg-white border border-slate-100 object-cover" alt="S" />
            </div>
            <div className="flex-1 truncate">
              <h4 className="font-black text-slate-800 text-lg truncate group-hover:text-emerald-700 transition-colors">{s.name}</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">@{s.username}</p>
              <div className="mt-3">
                 <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">Kelas {s.classId}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setForm({ ...s, password: '' } as any); setShowModal(true); }} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit size={16} /></button>
              <button onClick={() => handleDelete(s.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[80] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] p-12 md:p-16 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-12">
               <h3 className="text-3xl font-black text-slate-800">{form.id ? 'Perbarui' : 'Daftarkan'} Siswa</h3>
               <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X /></button>
            </div>
            <div className="space-y-8 text-black">
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nama Lengkap</label>
                 <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-black focus:ring-4 focus:ring-emerald-500/10 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Username</label>
                   <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-black focus:ring-4 focus:ring-emerald-500/10 transition-all" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Penempatan Kelas</label>
                   <select value={form.classId} onChange={e => setForm({...form, classId: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-black focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer">
                      <option value="">Pilih...</option>
                      {classes.map((c: any) => <option key={c.id} value={c.name}>Kelas {c.name}</option>)}
                   </select>
                </div>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ubah Password</label>
                 <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-black focus:ring-4 focus:ring-emerald-500/10 transition-all" placeholder="••••••••" />
                 <p className="text-[10px] text-slate-400 mt-2 italic">*Kosongkan jika tidak ingin mengganti password aktif.</p>
              </div>
              <div className="pt-8">
                 <button onClick={handleSave} className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                    {loading ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />} Simpan Akun
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Kelola Kelas ---
const ManageClassesTab = ({ triggerConfirm }: { triggerConfirm: any, closeConfirm: any }) => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: '', name: '', homeroomTeacher: '' });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const saved = await db.get('elearning_classes_list');
      setClasses(Array.isArray(saved) ? saved : []);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.homeroomTeacher) return alert("Lengkapi data kelas!");
    setLoading(true);
    const id = form.id || `cls_${Math.random().toString(36).substr(2, 9)}`;
    const newClass = { ...form, id };
    const updated = form.id ? classes.map(c => c.id === form.id ? newClass : c) : [...classes, newClass];
    await db.set('elearning_classes_list', updated);
    setClasses(updated);
    setLoading(false);
    setShowModal(false);
    setForm({ id: '', name: '', homeroomTeacher: '' });
  };

  const handleDelete = (id: string) => {
    triggerConfirm(
      "Hapus Kelas?",
      "Menghapus kelas akan berdampak pada struktur rombel dan filter materi/tugas yang sudah ada.",
      async () => {
        setLoading(true);
        const updated = classes.filter(c => c.id !== id);
        await db.set('elearning_classes_list', updated);
        setClasses(updated);
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
             <School size={32} />
          </div>
          <div>
             <h3 className="text-3xl font-black text-slate-800">Ruang Kelas</h3>
             <p className="text-sm text-slate-400 font-medium">Atur unit kelas dan penetapan wali kelas pengampu.</p>
          </div>
        </div>
        <button onClick={() => { setForm({ id: '', name: '', homeroomTeacher: '' }); setShowModal(true); }} className="bg-emerald-600 text-white px-10 py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-2xl hover:bg-emerald-700 transition-all active:scale-95">
          <Plus size={24} /> Buat Unit Kelas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {classes.map(c => (
          <div key={c.id} className="bg-white p-10 rounded-[4rem] border border-slate-100 text-center hover:shadow-2xl hover:border-emerald-200 transition-all group relative">
            <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => { setForm(c as any); setShowModal(true); }} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit size={16} /></button>
               <button onClick={() => handleDelete(c.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={16} /></button>
            </div>
            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-inner border border-emerald-100/50">
               <Layers size={48} />
            </div>
            <h4 className="text-5xl font-black text-slate-800 mb-8">{c.name}</h4>
            <div className="pt-8 border-t border-slate-50">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Wali Kelas</p>
               <p className="text-sm font-bold text-slate-700 truncate px-4">{c.homeroomTeacher || 'Belum Ditentukan'}</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[80] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] p-12 md:p-16 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-12">
               <h3 className="text-3xl font-black text-slate-800">Atur Unit Kelas</h3>
               <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X size={24} /></button>
            </div>
            <div className="space-y-8 text-black">
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nama/Kode Kelas</label>
                 <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-black text-3xl text-black text-center focus:ring-4 focus:ring-emerald-500/10 transition-all" placeholder="7A" />
              </div>
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nama Lengkap Wali Kelas</label>
                 <div className="relative">
                    <UserCog className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                    <input value={form.homeroomTeacher} onChange={e => setForm({...form, homeroomTeacher: e.target.value})} className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-black focus:ring-4 focus:ring-emerald-500/10 transition-all" placeholder="Bpk/Ibu Guru..." />
                 </div>
              </div>
              <div className="pt-8">
                 <button onClick={handleSave} className="w-full py-7 bg-emerald-600 text-white rounded-[2.5rem] font-black text-2xl hover:bg-emerald-700 shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95">
                    {loading ? <Loader2 size={28} className="animate-spin" /> : <Save size={28} />} Simpan Unit
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Nilai Tugas ---
const GradesTab = ({ triggerConfirm }: { triggerConfirm: any }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('ALL');
  const [taskFilter, setTaskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [gradingModal, setGradingModal] = useState<{show: boolean, submission: Submission | null}>({show: false, submission: null});
  const [gradeInput, setGradeInput] = useState<string>('');
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [subs, tsk, std, cls] = await Promise.all([
        db.get('elearning_submissions_list'),
        db.get('elearning_tugas_list'),
        db.get('elearning_students_list'),
        db.get('elearning_classes_list')
      ]);
      setSubmissions(Array.isArray(subs) ? subs : []);
      setTasks(Array.isArray(tsk) ? tsk : []);
      setStudents(Array.isArray(std) ? std : []);
      setClasses(Array.isArray(cls) ? cls : []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const student = students.find(s => s.id === sub.studentId);
      const matchClass = classFilter === 'ALL' || student?.classId === classFilter;
      const matchTask = taskFilter === 'ALL' || sub.taskId === taskFilter;
      const isGraded = sub.grade !== undefined && sub.grade !== null;
      const matchStatus = statusFilter === 'ALL' || (statusFilter === 'GRADED' ? isGraded : !isGraded);
      return matchClass && matchTask && matchStatus;
    });
  }, [submissions, classFilter, taskFilter, statusFilter, students]);

  const handleOpenGrade = (sub: Submission) => {
    setGradingModal({ show: true, submission: sub });
    setGradeInput(sub.grade?.toString() || '');
    setFeedbackInput(sub.feedback || '');
  };

  const handleSaveGrade = async () => {
    if (!gradingModal.submission || gradeInput === '') return alert("Harap masukkan nilai!");
    setSaving(true);
    const updatedSubmissions = submissions.map(s => {
      if (s.id === gradingModal.submission?.id) return { 
        ...s, 
        grade: Number(gradeInput), 
        feedback: feedbackInput 
      };
      return s;
    });
    
    await db.set('elearning_submissions_list', updatedSubmissions);

    const studentId = gradingModal.submission.studentId;
    const taskTitle = tasks.find(t => t.id === gradingModal.submission?.taskId)?.title || 'Tugas';
    const studentNotifs = await db.get(`elearning_notifs_${studentId}`);
    const newNotif = {
      id: 'grade_' + Date.now(),
      title: 'Tugas Telah Dinilai',
      message: `Tugas "${taskTitle}" Anda telah mendapatkan nilai: ${gradeInput}.`,
      type: 'grade',
      read: false,
      createdAt: 'Baru saja'
    };
    await db.set(`elearning_notifs_${studentId}`, [newNotif, ...(Array.isArray(studentNotifs) ? studentNotifs : [])]);

    setSubmissions(updatedSubmissions);
    setSaving(false);
    setGradingModal({ show: false, submission: null });
  };

  const handleDeleteSubmission = (id: string) => {
    triggerConfirm(
      "Hapus Pengiriman Tugas?",
      "Seluruh data pengerjaan dan nilai (jika ada) untuk tugas ini akan dihapus permanen bagi siswa tersebut.",
      async () => {
        setLoading(true);
        const updated = submissions.filter(s => s.id !== id);
        await db.set('elearning_submissions_list', updated);
        setSubmissions(updated);
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h3 className="text-3xl font-black text-slate-800">Evaluasi Capaian</h3>
           <p className="text-sm text-slate-400 font-medium">Lakukan penilaian objektif dan berikan masukan konstruktif.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-black">
           <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold appearance-none cursor-pointer shadow-inner">
              <option value="ALL">Semua Kelas</option>
              {classes.map(c => <option key={c.id} value={c.name}>Kelas {c.name}</option>)}
           </select>
           <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold appearance-none cursor-pointer shadow-inner">
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Belum Dinilai</option>
              <option value="GRADED">Sudah Dinilai</option>
           </select>
           <select value={taskFilter} onChange={(e) => setTaskFilter(e.target.value)} className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold appearance-none cursor-pointer max-w-[200px] shadow-inner">
              <option value="ALL">Semua Tugas</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
           </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32 bg-white rounded-[3.5rem] border border-dashed border-slate-100">
           <Loader2 className="animate-spin text-emerald-600" size={48} />
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[3.5rem] border border-dashed border-slate-100">
           <SearchX size={64} className="text-slate-100 mx-auto mb-6" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Tidak ada data pengerjaan tugas</p>
        </div>
      ) : (
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
           <table className="w-full text-left border-collapse min-w-[1000px]">
             <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
               <tr>
                 <th className="px-10 py-8">Profil Siswa</th>
                 <th className="px-10 py-8">Materi Tugas</th>
                 <th className="px-10 py-8">Lampiran Pekerjaan</th>
                 <th className="px-10 py-8 text-center">Status & Nilai</th>
                 <th className="px-10 py-8 text-center">Tindakan</th>
               </tr>
             </thead>
             <tbody className="text-sm">
                {filteredSubmissions.map((sub) => {
                  const student = students.find(s => s.id === sub.studentId);
                  const task = tasks.find(t => t.id === sub.taskId);
                  const isGraded = sub.grade !== undefined && sub.grade !== null;
                  
                  return (
                    <tr key={sub.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-5">
                            <img src={student?.avatar} className="w-12 h-12 rounded-full border-2 border-slate-50 shadow-sm" alt="S" />
                            <div>
                               <p className="font-black text-slate-800 text-base">{student?.name || 'Siswa'}</p>
                               <span className="text-[9px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-black uppercase tracking-wider">Kelas {student?.classId}</span>
                            </div>
                         </div>
                      </td>
                      <td className="px-10 py-8">
                         <p className="font-bold text-slate-700 leading-tight max-w-[200px] truncate">{task?.title || 'Tugas Terhapus'}</p>
                         <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">Submisi: {sub.submittedAt}</p>
                      </td>
                      <td className="px-10 py-8">
                         {sub.content === 'Selesai (Tanpa Link)' ? (
                           <div className="flex items-center gap-2 text-slate-400">
                              <AlertCircle size={14} />
                              <span className="italic text-xs font-medium">Bentuk Fisik/Offline</span>
                           </div>
                         ) : (
                           <a href={sub.content} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm">
                              Lihat Pekerjaan <ExternalLink size={14} />
                           </a>
                         )}
                      </td>
                      <td className="px-10 py-8 text-center">
                         {isGraded ? (
                            <div className="flex flex-col items-center gap-2">
                               <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-100 border-4 border-emerald-50">
                                  {sub.grade}
                               </div>
                               <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Dinilai</span>
                            </div>
                         ) : (
                            <div className="flex flex-col items-center gap-2">
                               <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-2xl flex items-center justify-center font-black text-2xl border-4 border-slate-50">
                                  -
                               </div>
                               <span className="text-[8px] font-black text-red-400 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full">Perlu Nilai</span>
                            </div>
                         )}
                      </td>
                      <td className="px-10 py-8 text-center">
                         <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleOpenGrade(sub)} 
                              className={`p-4 rounded-2xl transition-all shadow-lg ${isGraded ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-blue-50' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 animate-pulse'}`}
                              title="Edit Nilai"
                            >
                               <Award size={24} />
                            </button>
                            <button 
                              onClick={() => handleDeleteSubmission(sub.id)} 
                              className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-50"
                              title="Hapus Pengiriman"
                            >
                               <Trash2 size={24} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  );
                })}
             </tbody>
           </table>
        </div>
      )}

      {gradingModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[90] flex items-center justify-center p-6 overflow-y-auto">
           <div className="bg-white w-full max-w-xl rounded-[3.5rem] p-12 md:p-16 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black text-slate-800">Evaluasi Pekerjaan</h3>
                 <button onClick={() => setGradingModal({show: false, submission: null})} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X size={24} /></button>
              </div>
              <div className="space-y-10 text-black">
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
                    <img src={students.find(s => s.id === gradingModal.submission?.studentId)?.avatar} className="w-16 h-16 rounded-full border-4 border-white shadow-sm" alt="Avatar" />
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pengerjaan Oleh</p>
                       <p className="text-xl font-black text-slate-800">{students.find(s => s.id === gradingModal.submission?.studentId)?.name}</p>
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Skor Penilaian</label>
                    <div className="relative">
                       <Star className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-400" size={28} />
                       <input 
                         type="number" max="100" min="0" 
                         value={gradeInput} 
                         onChange={(e) => setGradeInput(e.target.value)} 
                         placeholder="0"
                         className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-black text-4xl text-black focus:ring-4 focus:ring-emerald-500/10 transition-all text-center" 
                       />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Feedback</label>
                    <div className="relative">
                       <MessageCircle className="absolute left-6 top-6 text-slate-300" size={24} />
                       <textarea 
                         rows={3} 
                         value={feedbackInput} 
                         onChange={(e) => setFeedbackInput(e.target.value)} 
                         className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold text-sm text-black focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                         placeholder="Tuliskan catatan..." 
                       />
                    </div>
                 </div>
                 <div className="pt-6">
                    <button 
                      onClick={handleSaveGrade} 
                      disabled={saving} 
                      className="w-full py-7 bg-emerald-600 text-white rounded-[2.5rem] font-black text-2xl hover:bg-emerald-700 shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95"
                    >
                       {saving ? <Loader2 className="animate-spin" /> : <><CheckCircle size={32} /> Publikasikan Nilai</>}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- Pengaturan Portal (Settings) ---
const SettingsTab: React.FC<{ 
  settings: SiteSettings, 
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>,
  user: User,
  onUpdateUser?: (u: User) => void
}> = ({ settings, setSettings, user, onUpdateUser }) => {
  const [loading, setLoading] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  
  // Profile Form States
  const [adminName, setAdminName] = useState(user.name);
  const [adminUsername, setAdminUsername] = useState(user.username);
  const [adminAvatar, setAdminAvatar] = useState(user.avatar || '');
  const [adminPassword, setAdminPassword] = useState('');

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await db.set('elearning_site_settings', localSettings);
      setSettings(localSettings);
      alert("Pengaturan Platform Berhasil Disimpan!");
    } catch (err) {
      alert("Gagal sinkronisasi ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!adminName || !adminUsername) return alert("Nama dan Username harus diisi!");
    setLoading(true);
    try {
      const admins = await db.get('elearning_admins_list');
      
      const updatedAdmin = {
        ...user,
        name: adminName,
        username: adminUsername,
        avatar: adminAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUsername}`,
        ...(adminPassword ? { password: adminPassword } : {})
      };

      const updatedList = Array.isArray(admins) 
        ? (admins.some((a: User) => a.id === user.id) ? admins.map((a: User) => a.id === user.id ? updatedAdmin : a) : [...admins, updatedAdmin])
        : [updatedAdmin];

      await db.set('elearning_admins_list', updatedList);
      
      if (onUpdateUser) {
        onUpdateUser(updatedAdmin);
      } else {
        localStorage.setItem('e_learning_user', JSON.stringify(updatedAdmin));
      }

      alert("Profil Pengelola Berhasil Diperbarui!");
      setAdminPassword('');
    } catch (err) {
      alert("Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  const randomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setAdminAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
  };

  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-500 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10 text-black">
          <div>
            <h4 className="text-xl font-black text-slate-800 mb-2">Identitas Platform</h4>
            <p className="text-xs text-slate-400 font-medium mb-8">Ubah branding dasar portal e-learning.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nama Instansi / Website</label>
                <div className="relative">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input value={localSettings.siteName} onChange={e => setLocalSettings({...localSettings, siteName: e.target.value})} className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-black font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">URL Logo Sekolah</label>
                <input value={localSettings.logoUrl} onChange={e => setLocalSettings({...localSettings, logoUrl: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-black font-medium text-[10px] focus:ring-4 focus:ring-emerald-500/10 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">URL Gambar Hero Utama</label>
                <input value={localSettings.heroImageUrl} onChange={e => setLocalSettings({...localSettings, heroImageUrl: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-black font-medium text-[10px] focus:ring-4 focus:ring-emerald-500/10 transition-all" />
              </div>
            </div>
          </div>
          <button onClick={handleSaveSettings} disabled={loading} className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 hover:bg-emerald-700 transition-all shadow-xl active:scale-95">
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={24} /> Simpan Portal</>}
          </button>
        </div>

        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm text-black flex flex-col">
          <h4 className="text-xl font-black text-slate-800 mb-10">Profil Admin</h4>
          <div className="flex flex-col items-center mb-10">
            <div className="relative">
               <div className="w-32 h-32 rounded-full border-4 border-emerald-50 overflow-hidden bg-slate-50">
                  <img src={adminAvatar || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUsername}`} className="w-full h-full object-cover" alt="Profile" />
               </div>
               <button onClick={randomizeAvatar} className="absolute bottom-0 right-0 p-2.5 bg-emerald-600 text-white rounded-full shadow-lg border-4 border-white hover:bg-emerald-700 transition-all">
                  <RefreshCw size={16} />
               </button>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nama Lengkap</label>
               <input value={adminName} onChange={e => setAdminName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-black focus:ring-4 focus:ring-emerald-500/10 text-sm" />
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Username Baru</label>
               <input value={adminUsername} onChange={e => setAdminUsername(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-black focus:ring-4 focus:ring-emerald-500/10 text-sm" />
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ganti Password</label>
               <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-black focus:ring-4 focus:ring-emerald-500/10 text-sm" />
               </div>
            </div>
          </div>

          <button onClick={handleUpdateProfile} disabled={loading} className="mt-8 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-3">
             <UserCog size={18} /> Update Akun
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
