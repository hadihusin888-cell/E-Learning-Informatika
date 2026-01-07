
import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, CheckCircle2, Clock, Calendar, 
  AlertCircle, Send, LayoutList, CheckCircle, 
  ArrowRight, MessageSquare, Star, Loader2,
  X, Info, ExternalLink, Filter, Globe, PlayCircle,
  Link as LinkIcon, FileText, Zap, ChevronRight,
  Trophy, MousePointer2, Monitor, ArrowUpRight,
  PartyPopper, ShieldCheck
} from 'lucide-react';
import { db } from '../../App.tsx';
import { User, Submission, Task } from '../../types.ts';

interface TasksTabProps {
  user: User;
  tasks: Task[];
  submissions: Submission[];
  onRefresh: () => void;
}

const TasksTab: React.FC<TasksTabProps> = ({ user, tasks, submissions, onRefresh }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [link, setLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const getDeadlineInfo = (dueDate: string) => {
    const now = new Date();
    const deadline = new Date(dueDate);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Lampau', color: 'text-rose-500 bg-rose-50', icon: AlertCircle };
    if (diffDays <= 2) return { label: `${diffDays} hari`, color: 'text-orange-500 bg-orange-50', icon: Clock };
    return { label: `${diffDays} hari`, color: 'text-emerald-500 bg-emerald-50', icon: Calendar };
  };

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'embed': return { bg: 'bg-purple-50', text: 'text-purple-600', icon: PlayCircle, label: 'Interaktif' };
      case 'file': return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: FileText, label: 'Modul' };
      case 'link': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: LinkIcon, label: 'Tautan' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', icon: ClipboardList, label: 'Tugas' };
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const isSubmitted = submissions.some(s => s.taskId === t.id);
      if (activeFilter === 'pending') return !isSubmitted;
      if (activeFilter === 'completed') return isSubmitted;
      return true;
    });
  }, [tasks, submissions, activeFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => submissions.some(s => s.taskId === t.id)).length;
    return { total, completed, pending: total - completed };
  }, [tasks, submissions]);

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    let embedUrl = url;
    
    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      embedUrl = 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1];
    }
    // Google Forms/Docs/Slides
    else if (url.includes('docs.google.com')) {
      embedUrl = url.includes('?') ? `${url}&embedded=true` : `${url}?embedded=true`;
    }
    // Canva
    else if (url.includes('canva.com/design/') && !url.includes('/view')) {
        embedUrl = url + '/view?embed';
    }
    
    return embedUrl;
  };

  const handleSubmit = async () => {
    if (!link && selectedTask?.isSubmissionEnabled) return alert("Masukkan link hasil pengerjaan Anda!");
    if (!selectedTask) return;

    setSubmitting(true);
    const newSub: Submission = {
      id: `sub_${Date.now()}`,
      taskId: selectedTask.id,
      studentId: user.id,
      content: link || 'Tugas Selesai (Tanpa Link)',
      submittedAt: new Date().toLocaleString('id-ID'),
    };
    
    try {
      await db.append('elearning_submissions_list', newSub);
      onRefresh();
      setLink('');
    } catch (err) {
      alert("Gagal mengirim tugas. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-black pb-24">
      
      {/* 1. Dashboard Stats */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', val: stats.total, color: 'bg-indigo-600', icon: LayoutList },
          { label: 'Proses', val: stats.pending, color: 'bg-orange-500', icon: Clock },
          { label: 'Selesai', val: stats.completed, color: 'bg-emerald-500', icon: CheckCircle2 }
        ].map(s => (
          <div key={s.label} className={`${s.color} p-5 rounded-[1.8rem] text-white flex flex-col justify-center`}>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-70 mb-1">{s.label}</p>
            <h4 className="text-2xl font-black">{s.val}</h4>
          </div>
        ))}
      </section>

      {/* 2. Filters */}
      <section className="flex flex-wrap gap-2">
        {['all', 'pending', 'completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab as any)}
            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              activeFilter === tab ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'
            }`}
          >
            {tab === 'all' ? 'Semua' : tab === 'pending' ? 'Perlu Dikerjakan' : 'Selesai'}
          </button>
        ))}
      </section>

      {/* 3. Task Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredTasks.map(t => {
          const submission = submissions.find(s => s.taskId === t.id);
          const deadline = getDeadlineInfo(t.dueDate);
          const typeStyle = getTypeStyle(t.type);
          const isGraded = submission?.grade !== undefined && submission?.grade !== null;

          return (
            <div key={t.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden relative">
              <div className={`h-16 ${typeStyle.bg} flex items-center justify-center relative`}>
                 <div className="absolute top-3 right-3">
                    <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest flex items-center gap-1 bg-white/80 ${deadline.color.split(' ')[0]}`}>
                      {deadline.label}
                    </span>
                 </div>
                 <typeStyle.icon size={28} className={`${typeStyle.text} opacity-20 transition-transform`} />
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                   <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ${typeStyle.bg} ${typeStyle.text} rounded-md`}>
                      {typeStyle.label}
                   </span>
                   <span className="text-[8px] font-bold text-slate-300 uppercase">{t.dueDate}</span>
                </div>

                <h4 className="text-base font-black text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 line-clamp-2">{t.title}</h4>

                {submission && (
                  <div className={`mb-4 p-3 rounded-xl border-2 ${isGraded ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-black uppercase ${isGraded ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {isGraded ? 'Nilai' : 'Terkirim'}
                      </span>
                      {isGraded && <span className="text-sm font-black text-slate-800">{submission.grade}</span>}
                    </div>
                  </div>
                )}

                <div className="mt-auto">
                  <button 
                    onClick={() => setSelectedTask(t)}
                    className={`w-full py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                      submission ? 'bg-slate-50 text-slate-500' : 'bg-slate-900 text-white hover:bg-indigo-600'
                    }`}
                  >
                    {submission ? 'Detail Nilai' : 'Kerjakan'} 
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Task Modal with Enhanced Embed */}
      {selectedTask && (() => {
        const hasSubmitted = submissions.some(s => s.taskId === selectedTask.id);
        const submissionData = submissions.find(s => s.taskId === selectedTask.id);

        return (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="bg-white w-full max-w-7xl h-full md:max-h-[95vh] md:rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden">
              
              <div className="p-6 md:px-10 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeStyle(selectedTask.type).bg} ${getTypeStyle(selectedTask.type).text}`}>
                      <PlayCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none">{selectedTask.title}</h3>
                      <p className="text-slate-400 font-bold text-[9px] uppercase mt-1 tracking-widest">Pusat Tugas Informatika</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTask(null)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                    <X size={24} />
                 </button>
              </div>

              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Embed Area */}
                <div className="flex-[3] bg-slate-100 p-4 md:p-8 overflow-hidden border-r border-slate-50 flex flex-col">
                  {hasSubmitted ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-white rounded-[2.5rem] shadow-sm animate-in zoom-in">
                       <PartyPopper size={80} className="text-emerald-500 mb-6" />
                       <h4 className="text-3xl font-black text-slate-900 mb-2">Hebat, Kamu Sudah Selesai!</h4>
                       <p className="text-slate-500 font-medium max-w-md">Tugas kamu sudah terkirim pada <span className="font-bold text-slate-800">{submissionData?.submittedAt}</span>. Sekarang kamu bisa istirahat atau lanjut materi lain.</p>
                       <button onClick={() => setSelectedTask(null)} className="mt-8 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Tutup Jendela</button>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col">
                       <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl mb-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                             <Info size={16} className="text-blue-500 shrink-0" />
                             <p className="text-[10px] font-bold text-blue-700 leading-tight">Gagal memuat konten? Pastikan koneksi internet aktif atau buka langsung melalui tombol di panel kanan.</p>
                          </div>
                       </div>
                       <div className="flex-1 bg-white rounded-[2rem] shadow-xl overflow-hidden border-4 border-white">
                          <iframe 
                            src={getEmbedUrl(selectedTask.content)} 
                            className="w-full h-full border-0" 
                            allowFullScreen 
                            title="Task Content"
                            loading="lazy"
                          ></iframe>
                       </div>
                    </div>
                  )}
                </div>

                {/* Submission & Instruction Panel */}
                <div className="flex-1 bg-white p-6 md:p-10 overflow-y-auto flex flex-col space-y-8 scrollbar-hide">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Zap size={16} className="fill-indigo-600" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Instruksi Guru</h4>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed italic bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      "{selectedTask.description || 'Silakan pelajari materi dan selesaikan tugas sesuai petunjuk.'}"
                    </p>
                  </div>

                  <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Send size={16} />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Kirim Hasil Kamu</h4>
                    </div>

                    {!hasSubmitted && selectedTask.isSubmissionEnabled ? (
                      <div className="space-y-4">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tautan Pekerjaan (Link)</label>
                        <div className="relative group">
                           <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500" size={18} />
                           <input 
                            type="url"
                            value={link} 
                            onChange={e => setLink(e.target.value)} 
                            placeholder="https://..." 
                            className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                          />
                        </div>
                        <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 text-[10px] font-medium leading-snug">
                           Pindahkan hasil kerjamu ke Google Drive/Canva lalu tempel link-nya di sini.
                        </div>
                      </div>
                    ) : hasSubmitted && (
                      <div className="space-y-4">
                        <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                           <p className="text-[8px] font-black text-emerald-600 uppercase mb-3 tracking-widest">Pekerjaan Terkirim:</p>
                           <p className="text-[10px] font-bold text-slate-500 truncate mb-4">{submissionData?.content}</p>
                           <a href={submissionData?.content} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase">
                              Lihat Pekerjaan Saya <ArrowUpRight size={14} />
                           </a>
                        </div>
                        
                        {submissionData?.feedback && (
                          <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                             <p className="text-[8px] font-black text-indigo-600 uppercase mb-3 tracking-widest flex items-center gap-2">
                                <Star size={12} className="fill-indigo-600"/> Komentar Guru:
                             </p>
                             <p className="text-[11px] text-indigo-700 font-medium italic">"{submissionData.feedback}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-8 border-t border-slate-50 space-y-4">
                    <a href={selectedTask.content} target="_blank" rel="noreferrer" className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                       Buka di Tab Baru <ArrowUpRight size={14} />
                    </a>
                    
                    {!hasSubmitted && (
                      <button 
                        onClick={handleSubmit} 
                        disabled={submitting}
                        className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                      >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18}/>}
                        {submitting ? 'Mengirim Data...' : 'Kirim Sekarang'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default TasksTab;
