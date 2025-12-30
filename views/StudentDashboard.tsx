
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Home, BookOpen, ClipboardList, CheckCircle, Settings,
  ArrowRight, FileText, Calendar, Bell, Star, Edit, Upload, 
  ExternalLink, Check, Clock, AlertCircle, X, User as UserIcon, Lock,
  ChevronRight, CheckSquare, Maximize2, PlayCircle, Eye,
  Link as LinkIcon, MessageCircle, Info, Loader2, RefreshCw, Camera, Globe,
  Save, EyeOff
} from 'lucide-react';
import Layout from '../components/Layout';
import { User, SiteSettings, Submission } from '../types';
import { db } from '../App';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
  settings: SiteSettings;
  onUpdateUser?: (u: User) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout, settings, onUpdateUser }) => {
  const [activeView, setActiveView] = useState('home');
  const [materials, setMaterials] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const storedNotifs = await db.get(`elearning_notifs_${user.id}`);
    setNotifications(Array.isArray(storedNotifs) ? storedNotifs : []);
  }, [user.id]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [storedMaterials, storedTasks, storedSubmissions, storedNotifs] = await Promise.all([
        db.get('elearning_materi_list'),
        db.get('elearning_tugas_list'),
        db.get('elearning_submissions_list'),
        db.get(`elearning_notifs_${user.id}`)
      ]);
      
      setMaterials(Array.isArray(storedMaterials) ? storedMaterials : []);
      setTasks(Array.isArray(storedTasks) ? storedTasks : []);
      setSubmissions(Array.isArray(storedSubmissions) ? storedSubmissions : []);
      setNotifications(Array.isArray(storedNotifs) ? storedNotifs : []);
      setLoading(false);
    };
    fetchData();
  }, [user.id]);

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    await db.set(`elearning_notifs_${user.id}`, updated);
    
    const notif = notifications.find(n => n.id === id);
    if (notif?.type === 'material') setActiveView('materials');
    if (notif?.type === 'task') setActiveView('tasks');
    if (notif?.type === 'grade') setActiveView('grades');
  };

  const handleMarkAllRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    await db.set(`elearning_notifs_${user.id}`, updated);
  };

  const studentMaterials = useMemo(() => {
    return materials.filter(m => m.targetClassIds.includes(user.classId));
  }, [materials, user.classId]);

  const studentTasks = useMemo(() => {
    return tasks.filter(t => t.targetClassIds.includes(user.classId));
  }, [tasks, user.classId]);

  const studentSubmissions = useMemo(() => {
    return submissions.filter(s => s.studentId === user.id);
  }, [submissions, user.id]);

  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;

    switch (activeView) {
      case 'home': return <StudentHomeTab user={user} materials={studentMaterials} tasks={studentTasks} setActiveView={setActiveView} />;
      case 'materials': return <StudentMaterialsTab user={user} materials={studentMaterials} />;
      case 'tasks': return <StudentTasksTab user={user} tasks={studentTasks} submissions={studentSubmissions} setSubmissions={setSubmissions} />;
      case 'grades': return <StudentGradesTab tasks={tasks} submissions={studentSubmissions} />;
      case 'settings': return <StudentSettingsTab user={user} setActiveView={setActiveView} onUpdateUser={onUpdateUser} />;
      default: return <StudentHomeTab user={user} materials={studentMaterials} tasks={studentTasks} setActiveView={setActiveView} />;
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={onLogout} 
      sidebarItems={[
        { id: 'home', label: 'Dashboard', icon: Home },
        { id: 'materials', label: 'Materi Belajar', icon: BookOpen },
        { id: 'tasks', label: 'Tugas Saya', icon: ClipboardList },
        { id: 'grades', label: 'Nilai & Hasil', icon: CheckCircle },
        { id: 'settings', label: 'Pengaturan', icon: Settings },
      ]} 
      activeView={activeView} 
      setActiveView={setActiveView}
      logoUrl={settings.logoUrl}
      siteName={settings.siteName}
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllRead}
    >
      {renderContent()}
    </Layout>
  );
};

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = "";
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('embed/')) {
      return url;
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autohide=1&showinfo=0`;
    }
  } 
  if (url.includes('drive.google.com')) {
    return url.replace('/view', '/preview').replace('/edit', '/preview');
  } 
  if (url.includes('canva.com')) {
    const canvaMatch = url.match(/\/design\/([a-zA-Z0-9_-]+)/);
    if (canvaMatch && canvaMatch[1]) {
      return `https://www.canva.com/design/${canvaMatch[1]}/view?embed`;
    }
  }
  return url;
};

// --- Home Tab ---
const StudentHomeTab: React.FC<{ user: User, materials: any[], tasks: any[], setActiveView: (id: string) => void }> = ({ user, materials, tasks, setActiveView }) => {
  const latestMaterial = materials[0];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {latestMaterial && (
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-[2rem] flex items-center gap-4 shadow-sm text-black">
          <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 shrink-0">
            <Bell size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-800">Materi Baru Tersedia!</p>
            <p className="text-xs text-blue-600 font-medium">Guru baru saja mengunggah: "{latestMaterial.title}" untuk kelas {user.classId}.</p>
          </div>
          <button onClick={() => setActiveView('materials')} className="px-4 py-2 bg-white text-blue-600 text-xs font-black rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm">Lihat Materi</button>
        </div>
      )}

      <div className="bg-emerald-600 rounded-[3rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
        <div className="relative z-10">
          <div className="inline-block px-4 py-1.5 bg-emerald-500/50 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-400/30">Siswa Informatika SMP AL Irsyad Surakarta</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Selamat Belajar, <br /> {user.name}!</h2>
          <p className="text-emerald-50 text-lg max-w-xl opacity-90 font-medium leading-relaxed">Kamu memiliki <span className="font-black underline">{materials.length} materi</span> dan <span className="font-black underline">{tasks.length} tugas</span> tersedia.</p>
          <div className="flex gap-4 mt-10">
            <button onClick={() => setActiveView('materials')} className="bg-white text-emerald-700 px-8 py-4 rounded-[1.5rem] font-black hover:bg-emerald-50 transition-all flex items-center gap-2 group shadow-xl">Lanjutkan Belajar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></button>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-12 opacity-10 hidden lg:block rotate-12 scale-150"><BookOpen size={280} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Daftar Materi Terbaru</h3>
            <button onClick={() => setActiveView('materials')} className="text-emerald-600 text-xs font-black hover:underline uppercase tracking-widest">Lihat Semua</button>
          </div>
          <div className="space-y-4 text-black">
            {materials.slice(0, 3).map((item) => (
              <div key={item.id} onClick={() => setActiveView('materials')} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:shadow-xl hover:border-emerald-100 transition-all group cursor-pointer">
                 <div className="flex items-center gap-5">
                   <div className="p-4 bg-slate-50 text-slate-400 rounded-[1.5rem] group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><FileText size={24} /></div>
                   <div>
                     <p className="font-bold text-slate-800">{item.title}</p>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Siswa Kelas {user.classId}</p>
                   </div>
                 </div>
                 <ArrowRight className="text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" size={20} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between text-black">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Status Belajar</h3>
          <div className="grid grid-cols-2 gap-4">
            <div onClick={() => setActiveView('materials')} className="p-6 bg-blue-50/50 rounded-[2rem] text-center cursor-pointer hover:bg-blue-50 transition-colors">
              <p className="text-3xl font-black text-blue-600">{materials.length}</p>
              <p className="text-[10px] font-black text-blue-400 uppercase mt-1">Materi</p>
            </div>
            <div onClick={() => setActiveView('tasks')} className="p-6 bg-purple-50/50 rounded-[2rem] text-center cursor-pointer hover:bg-purple-50 transition-colors">
              <p className="text-3xl font-black text-purple-600">{tasks.length}</p>
              <p className="text-[10px] font-black text-purple-400 uppercase mt-1">Tugas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Materi Tab ---
const StudentMaterialsTab: React.FC<{ user: User, materials: any[] }> = ({ user, materials }) => {
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-black">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800">Materi Informatika</h3>
        <p className="text-sm text-slate-400 font-medium">Khusus Kelas <span className="text-emerald-600 font-black">{user.classId}</span></p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {materials.map((m) => (
          <div key={m.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all flex flex-col overflow-hidden relative">
            <div className="p-8 flex-1 flex flex-col">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                {m.content.includes('youtube') || m.content.includes('youtu.be') ? <PlayCircle size={24} /> : <FileText size={24} />}
              </div>
              <h4 className="font-black text-slate-800 text-xl mb-3 leading-tight line-clamp-2">{m.title}</h4>
              <p className="text-sm text-slate-500 mb-8 line-clamp-2 font-medium">{m.description || 'Pelajari materi ini untuk menambah wawasan informatika Anda.'}</p>
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Update: {new Date(m.createdAt).toLocaleDateString()}</span>
                <button onClick={() => setSelectedMaterial(m)} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"><Eye size={14} /> Pelajari</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedMaterial && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-0 md:p-10 animate-in fade-in duration-300 text-black">
           <div className="bg-white w-full h-full max-w-6xl md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur sticky top-0 z-10">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hidden sm:block"><BookOpen size={20} /></div>
                    <div>
                       <h3 className="text-lg md:text-xl font-black text-slate-800 line-clamp-1">{selectedMaterial.title}</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Materi Informatika Kelas {user.classId}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <a href={selectedMaterial.content} target="_blank" rel="noreferrer" className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><ExternalLink size={20} /></a>
                    <button onClick={() => setSelectedMaterial(null)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X size={24} /></button>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
                 <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
                    {/* Frame Video */}
                    <div className="bg-black rounded-[2rem] overflow-hidden shadow-2xl aspect-video w-full relative">
                       <iframe 
                          src={getEmbedUrl(selectedMaterial.content)} 
                          className="w-full h-full border-none" 
                          title={selectedMaterial.title} 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                          allowFullScreen>
                       </iframe>
                    </div>

                    {/* Deskripsi Materi */}
                    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                       <div className="flex items-center gap-3 mb-6">
                          <div className="w-1 h-8 bg-emerald-500 rounded-full"></div>
                          <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">Keterangan Materi</h4>
                       </div>
                       <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-line text-base md:text-lg">
                          {selectedMaterial.description || 'Tidak ada deskripsi tambahan untuk materi ini. Silakan simak video/konten di atas untuk mempelajari materi selengkapnya.'}
                       </p>
                       
                       <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                             <Calendar size={14} />
                             Dibuat pada: {new Date(selectedMaterial.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-2">
                             <Info size={14} />
                             Tipe: {selectedMaterial.type}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- Tugas Tab ---
const StudentTasksTab: React.FC<{ user: User, tasks: any[], submissions: any[], setSubmissions: any }> = ({ user, tasks, submissions, setSubmissions }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleShowDetail = (task: any) => {
    setSelectedTask(task);
    setShowDetailModal(true);
    setSubmissionLink('');
  };

  const submitTugas = async (isMarkOnly = false) => {
    if (!isMarkOnly && !submissionLink) return alert("Harap masukkan link tugas Anda.");
    
    setSubmitting(true);
    const newSub: Submission = {
      id: `sub_${Math.random().toString(36).substr(2, 9)}`,
      taskId: selectedTask.id,
      studentId: user.id,
      content: isMarkOnly ? 'Selesai (Tanpa Link)' : submissionLink,
      submittedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    try {
      const allSubmissions = await db.get('elearning_submissions_list');
      const updated = [newSub, ...(Array.isArray(allSubmissions) ? allSubmissions : [])];
      await db.set('elearning_submissions_list', updated);
      setSubmissions(updated.filter(s => s.studentId === user.id));
      setShowDetailModal(false);
      alert("Tugas berhasil dikirim ke Admin!");
    } catch (err) {
      alert("Gagal mengirim tugas. Periksa koneksi internet.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-black">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800">Tugas Informatika</h3>
        <p className="text-sm text-slate-400 font-medium">Kerjakan tugas tepat waktu sebelum batas akhir.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => {
          const sub = submissions.find(s => s.taskId === task.id);
          return (
            <div key={task.id} className={`bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col group transition-all hover:shadow-xl ${sub ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100'}`}>
               <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sub ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'}`}>
                     {sub ? <CheckSquare size={20} /> : <ClipboardList size={20} />}
                  </div>
                  {sub && <span className="text-[8px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full uppercase">Sudah Dikirim</span>}
               </div>
               <h4 className="text-lg font-black text-slate-800 mb-4 line-clamp-2">{task.title}</h4>
               <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-300 uppercase">Deadline</span>
                    <span className="text-xs font-bold text-slate-600">{new Date(task.dueDate).toLocaleDateString('id-ID')}</span>
                 </div>
                 <button onClick={() => handleShowDetail(task)} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] hover:bg-emerald-600 transition-all">Detail Tugas</button>
               </div>
            </div>
          );
        })}
      </div>

      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-0 md:p-6 lg:p-10 animate-in fade-in duration-300 text-black">
           <div className="bg-white w-full h-full max-w-7xl md:rounded-[3rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="flex-[3] bg-black relative border-r border-slate-100 min-h-[300px] lg:min-h-0">
                 <div className="absolute top-6 left-6 z-10">
                    <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-2xl text-[10px] font-black text-slate-600 uppercase border border-white shadow-sm flex items-center gap-2"><Maximize2 size={12} /> Pratinjau Tugas</div>
                 </div>
                 <iframe 
                    src={getEmbedUrl(selectedTask.content)} 
                    className="w-full h-full border-none" 
                    title={selectedTask.title} 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen>
                 </iframe>
              </div>

              <div className="flex-[2] flex flex-col bg-white overflow-y-auto">
                 <div className="p-8 md:p-10 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur z-20">
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 leading-tight line-clamp-2">{selectedTask.title}</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Deadline: {new Date(selectedTask.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => setShowDetailModal(false)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X size={24} /></button>
                 </div>

                 <div className="p-8 md:p-10 space-y-8">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2"><Info size={14} className="text-emerald-500" /> Instruksi Kerja</p>
                       <p className="font-medium text-slate-800 text-sm leading-relaxed whitespace-pre-line">{selectedTask.description || 'Silakan kerjakan tugas sesuai pratinjau.'}</p>
                    </div>

                    {!submissions.find(s => s.taskId === selectedTask.id) ? (
                       <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                          {selectedTask.isSubmissionEnabled && (
                            <div>
                               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Link Pekerjaan (Opsional)</label>
                               <div className="relative">
                                  <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                  <input value={submissionLink} onChange={e => setSubmissionLink(e.target.value)} placeholder="Tempel link tugas Anda di sini..." className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-black focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner" />
                               </div>
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row gap-4 pt-2">
                             <button disabled={submitting} onClick={() => submitTugas(true)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] hover:bg-slate-200 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Sudah Selesai
                             </button>
                             {selectedTask.isSubmissionEnabled && submissionLink && (
                               <button disabled={submitting} onClick={() => submitTugas(false)} className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />} Kirim Link
                               </button>
                             )}
                          </div>
                       </div>
                    ) : (
                       <div className="p-10 bg-emerald-50 border border-emerald-100 rounded-[3rem] text-center space-y-4">
                          <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-100 animate-in zoom-in-95 duration-500"><Check size={40} /></div>
                          <div>
                             <p className="text-emerald-700 font-black text-2xl mb-1">Berhasil Terkirim!</p>
                             <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Status: Menunggu Penilaian Guru</p>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- Nilai Tab ---
const StudentGradesTab: React.FC<{ tasks: any[], submissions: any[] }> = ({ tasks, submissions }) => (
  <div className="space-y-8 animate-in fade-in duration-500 text-black">
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-2xl font-black text-slate-800">Capaian Belajar</h3>
      <p className="text-sm text-slate-400 font-medium">Rekapitulasi hasil penilaian tugas Anda.</p>
    </div>
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
       <table className="w-full text-left border-collapse min-w-[800px]">
         <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
           <tr>
             <th className="px-10 py-6">Nama Tugas</th>
             <th className="px-10 py-6">Status Pengiriman</th>
             <th className="px-10 py-6 text-center">Skor Akhir</th>
             <th className="px-10 py-6">Catatan Guru</th>
           </tr>
         </thead>
         <tbody className="text-sm">
           {submissions.map((row, i) => {
             const task = tasks.find(t => t.id === row.taskId);
             return (
               <tr key={i} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                 <td className="px-10 py-6">
                    <p className="font-black text-slate-800">{task?.title || 'Tugas Terhapus'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{row.submittedAt}</p>
                 </td>
                 <td className="px-10 py-6">
                    {row.content === 'Selesai (Tanpa Link)' ? (
                       <span className="text-slate-400 italic text-xs">Pengerjaan Selesai (Offline/Fisik)</span>
                    ) : (
                       <a href={row.content} target="_blank" rel="noreferrer" className="text-emerald-600 font-black flex items-center gap-2 hover:underline">Lihat Tautan <ExternalLink size={12} /></a>
                    )}
                 </td>
                 <td className="px-10 py-6 text-center">
                    {row.grade !== undefined ? (
                       <div className="inline-block px-5 py-2 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-2xl border border-emerald-100">{row.grade}</div>
                    ) : (
                       <span className="text-slate-300 font-bold italic">Belum Dinilai</span>
                    )}
                 </td>
                 <td className="px-10 py-6">
                    <div className="flex items-start gap-3">
                       <MessageCircle size={16} className="text-slate-300 mt-0.5" />
                       <p className="italic text-slate-500 text-xs font-medium max-w-[200px]">{row.feedback || 'Belum ada catatan.'}</p>
                    </div>
                 </td>
               </tr>
             );
           })}
           {submissions.length === 0 && (
              <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">Belum ada data nilai tersedia.</td></tr>
           )}
         </tbody>
       </table>
    </div>
  </div>
);

// --- Pengaturan Siswa ---
const StudentSettingsTab: React.FC<{ 
  user: User, 
  setActiveView: (v: string) => void, 
  onUpdateUser?: (u: User) => void 
}> = ({ user, setActiveView, onUpdateUser }) => {
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!username) return alert("Username tidak boleh kosong!");
    setUpdating(true);

    try {
      const students = await db.get('elearning_students_list');
      
      if (username.toLowerCase() !== user.username.toLowerCase()) {
        const isTaken = students.some((s: User) => s.username.toLowerCase() === username.toLowerCase());
        if (isTaken) {
          alert("Username sudah digunakan oleh siswa lain.");
          setUpdating(false);
          return;
        }
      }

      const updatedUser = { 
        ...user, 
        username, 
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`, 
        ...(password ? { password } : {}) 
      };

      const updatedList = students.map((s: User) => s.id === user.id ? updatedUser : s);
      
      await db.set('elearning_students_list', updatedList);
      
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      } else {
        localStorage.setItem('e_learning_user', JSON.stringify(updatedUser));
      }
      
      alert("Profil berhasil diperbarui!");
      setActiveView('home'); 
      setShowPassword(false);
    } catch (err) {
      alert("Gagal memperbarui profil. Periksa koneksi.");
    } finally {
      setUpdating(false);
    }
  };

  const randomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
  };

  return (
    <div className="max-w-2xl bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-xl mx-auto animate-in slide-in-from-top-4 duration-500 text-black">
      <div className="text-center mb-12">
         <div className="relative inline-block group">
            <div className="w-36 h-36 rounded-full border-8 border-emerald-50 overflow-hidden bg-slate-50 shadow-inner">
               <img 
                  src={avatar || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt="Avatar" 
               />
            </div>
            <button 
               onClick={randomizeAvatar}
               className="absolute bottom-1 right-1 bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 transition-all border-4 border-white"
               title="Acak Foto"
            >
               <RefreshCw size={16} />
            </button>
         </div>
         <h3 className="text-3xl font-black text-slate-800 leading-tight mt-6">{user.name}</h3>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Kelas {user.classId}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
         <div className="opacity-60 cursor-not-allowed">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nama Lengkap (Terkunci)</label>
            <div className="relative">
               <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
               <input type="text" value={user.name} readOnly className="w-full pl-12 pr-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-500 outline-none" />
            </div>
         </div>
         <div className="opacity-60 cursor-not-allowed">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Kelas (Terkunci)</label>
            <div className="relative">
               <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
               <input type="text" value={user.classId} readOnly className="w-full pl-12 pr-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-500 outline-none" />
            </div>
         </div>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Username Baru</label>
          <div className="relative">
             <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-black focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                placeholder="Username"
             />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">URL Foto Profil (Opsional)</label>
          <div className="relative">
             <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
                type="text" 
                value={avatar} 
                onChange={e => setAvatar(e.target.value)} 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-black focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                placeholder="https://link-foto-anda.jpg"
             />
          </div>
          <p className="text-[9px] text-slate-400 mt-2">*Gunakan link gambar atau tekan tombol acak di atas.</p>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Password Baru</label>
          <div className="relative">
             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
             <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-black focus:ring-4 focus:ring-emerald-500/10 transition-all" 
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
          <p className="text-[9px] text-slate-400 mt-2">*Kosongkan jika tidak ingin mengganti password.</p>
        </div>

        <button 
           onClick={handleUpdate} 
           disabled={updating}
           className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xl hover:bg-emerald-700 shadow-2xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
           {updating ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
           Simpan Perubahan
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;
