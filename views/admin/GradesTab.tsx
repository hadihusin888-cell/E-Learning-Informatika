
import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, History, Clock, ClipboardCheck, Search, Filter, ClipboardList, ExternalLink, GraduationCap, X, Eye, Award, Star, MessageCircle, Save } from 'lucide-react';
import { db } from '../../App.tsx';
import { Submission, Task, User, ClassRoom } from '../../types.ts';
import { notifyStudents } from '../../utils/helpers.ts';

interface GradesTabProps {
  triggerConfirm: any;
  classes: ClassRoom[];
}

const GradesTab: React.FC<GradesTabProps> = ({ triggerConfirm, classes }) => {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [gradeModal, setGradeModal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [taskFilter, setTaskFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [s, t, std] = await Promise.all([
        db.get('elearning_submissions_list'), 
        db.get('elearning_tugas_list'), 
        db.get('elearning_students_list')
      ]);
      setSubs(Array.isArray(s) ? s : []);
      setTasks(Array.isArray(t) ? t : []);
      setStudents(Array.isArray(std) ? std : []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filteredSubs = useMemo(() => {
    return subs.filter(s => {
      const student = students.find(st => st.id === s.studentId);
      const matchSearch = student?.name.toLowerCase().includes(search.toLowerCase());
      const matchClass = !classFilter || student?.classId === classFilter;
      const matchTask = !taskFilter || s.taskId === taskFilter;
      return matchSearch && matchClass && matchTask;
    });
  }, [subs, students, search, classFilter, taskFilter]);

  const stats = useMemo(() => ({
    total: subs.length,
    graded: subs.filter(s => s.grade !== undefined && s.grade !== null).length,
    pending: subs.filter(s => s.grade === undefined || s.grade === null).length
  }), [subs]);

  const handleGrade = async () => {
    if (gradeModal.grade === undefined || gradeModal.grade < 0 || gradeModal.grade > 100) {
      alert("Masukkan nilai yang valid (0-100)");
      return;
    }
    const updated = subs.map(s => s.id === gradeModal.id ? { ...gradeModal, grade: Number(gradeModal.grade) } : s);
    await db.saveAll('elearning_submissions_list', updated);
    setSubs(updated);
    notifyStudents([], "Tugas Telah Dinilai!", `Tugas Anda telah dinilai dengan skor ${gradeModal.grade}.`, "grade", gradeModal.studentId);
    setGradeModal(null);
  };

  if (loading) return <div className="py-20 flex flex-col items-center justify-center gap-4 text-black">
    <Loader2 className="animate-spin text-indigo-600" size={40} />
    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">Memuat Pengumpulan...</p>
  </div>;

  return (
    <div className="space-y-6 text-black animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Dikirim', val: stats.total, icon: History, col: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Perlu Dinilai', val: stats.pending, icon: Clock, col: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Sudah Dinilai', val: stats.graded, icon: ClipboardCheck, col: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`${s.bg} ${s.col} w-12 h-12 rounded-xl flex items-center justify-center shadow-inner`}><s.icon size={24}/></div>
            <div>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{s.label}</p>
              <h4 className="text-2xl font-black text-slate-800">{s.val}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input type="text" placeholder="Cari siswa..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
          </div>
          <div className="w-full md:w-48 relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="w-full pl-11 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs appearance-none">
              <option value="">Semua Kelas</option>
              {classes.map(c => <option key={c.id} value={c.name}>Kelas {c.name}</option>)}
            </select>
          </div>
          <div className="w-full md:w-48 relative">
            <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <select value={taskFilter} onChange={e => setTaskFilter(e.target.value)} className="w-full pl-11 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs appearance-none">
              <option value="">Semua Tugas</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 uppercase text-[9px] font-black text-slate-400">
              <tr>
                <th className="px-6 py-4">Siswa</th>
                <th className="px-6 py-4">Tugas & Kelas</th>
                <th className="px-6 py-4">Waktu Kirim</th>
                <th className="px-6 py-4 text-center">Skor</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSubs.map(s => {
                const student = students.find(st => st.id === s.studentId);
                const task = tasks.find(t => t.id === s.taskId);
                const isGraded = s.grade !== undefined && s.grade !== null;
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={student?.avatar} className="w-8 h-8 rounded-full border-2 border-slate-100" alt="" />
                        <div><p className="font-black text-slate-800">{student?.name}</p><p className="text-[8px] text-slate-400 font-bold uppercase">@{student?.username}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700 truncate max-w-[150px]">{task?.title || 'Dihapus'}</p>
                      <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md uppercase">Kelas {student?.classId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-slate-500"><span className="font-medium text-[10px]">{s.submittedAt}</span></div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isGraded ? <span className="text-xl font-black text-indigo-600">{s.grade}</span> : <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-[7px] font-black uppercase">Pending</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setGradeModal(s)} className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase transition-all ${isGraded ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white'}`}>{isGraded ? 'Edit' : 'Nilai'}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {gradeModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 relative my-auto">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><GraduationCap size={20} /></div>
                  <div><h3 className="text-xl font-black text-slate-800">Evaluasi Tugas</h3><p className="text-slate-400 font-medium text-[10px] uppercase">Berikan nilai & feedback</p></div>
               </div>
               <button onClick={() => setGradeModal(null)} className="p-2 bg-slate-50 text-slate-400 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide text-black">
              <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div><p className="text-[8px] font-black text-slate-400 uppercase">Siswa</p><p className="font-bold text-slate-800 text-xs">{students.find(st => st.id === gradeModal.studentId)?.name}</p></div>
                    <div className="text-right"><p className="text-[8px] font-black text-slate-400 uppercase">Kelas</p><p className="font-bold text-slate-800 text-xs">{students.find(st => st.id === gradeModal.studentId)?.classId}</p></div>
                  </div>
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Konten Pengumpulan</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-3 bg-white border border-slate-200 rounded-lg font-medium text-[10px] truncate">{gradeModal.content}</div>
                      <a href={gradeModal.content} target="_blank" rel="noreferrer" className="p-3 bg-white border border-slate-200 rounded-lg text-indigo-600"><ExternalLink size={16} /></a>
                    </div>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Skor (0-100)</label>
                    <input type="number" min="0" max="100" value={gradeModal.grade || ''} onChange={e => setGradeModal({...gradeModal, grade: e.target.value})} placeholder="0" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-black text-indigo-600 outline-none" />
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 font-bold text-[8px] uppercase">Auto sync ke dashboard siswa</div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Komentar Guru</label>
                <textarea value={gradeModal.feedback || ''} onChange={e => setGradeModal({...gradeModal, feedback: e.target.value})} placeholder="Catatan perbaikan..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold h-24 resize-none text-xs" />
              </div>
            </div>
            <div className="p-8 border-t border-slate-50">
              <button onClick={handleGrade} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"><Save size={18}/> Simpan Nilai</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesTab;
