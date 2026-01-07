
import React, { useState, useEffect } from 'react';
import { Loader2, UserPlus, Award, ChevronRight, Users, BookOpen, ClipboardList, School } from 'lucide-react';
import { db } from '../../App.tsx';
import { Submission } from '../../types.ts';

interface OverviewTabProps {
  setActiveView: (v: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ setActiveView }) => {
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
    <div className="space-y-6 animate-in fade-in duration-700 text-black">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.pending > 0 && (
          <div className="bg-orange-500 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-orange-100 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4 border border-white/30"><UserPlus size={24} /></div>
              <h3 className="text-2xl font-black mb-1">{stats.pending} Siswa Baru</h3>
              <p className="opacity-90 font-medium text-sm">Menunggu verifikasi Anda.</p>
            </div>
            <button onClick={() => setActiveView('confirmations')} className="mt-6 bg-white text-orange-600 px-6 py-3 rounded-xl text-xs font-black shadow-xl w-max flex items-center gap-2 transition-all active:scale-95">Buka Verifikasi <ChevronRight size={16} /></button>
          </div>
        )}
        <div className={`rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between group ${stats.ungraded > 0 ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-800 text-white shadow-slate-200'}`}>
          <div>
            <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center mb-4 border border-white/20"><Award size={24} /></div>
            <h3 className="text-2xl font-black mb-1">{stats.ungraded} Tugas</h3>
            <p className="opacity-90 font-medium text-sm">{stats.ungraded > 0 ? 'Pekerjaan yang belum dinilai.' : 'Semua tugas telah dinilai.'}</p>
          </div>
          <button onClick={() => setActiveView('grades')} className="mt-6 bg-white/10 text-white px-6 py-3 rounded-xl text-xs font-black shadow-xl w-max flex items-center gap-2 border border-white/20 transition-all active:scale-95">Buka Nilai <ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Siswa Aktif', val: stats.students, icon: Users, col: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Materi', val: stats.materials, icon: BookOpen, col: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Tugas', val: stats.tasks, icon: ClipboardList, col: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Kelas', val: stats.classes, icon: School, col: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className={`${s.bg} ${s.col} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}><s.icon size={20}/></div>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{s.label}</p>
            <h4 className="text-2xl font-black text-slate-800">{s.val}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverviewTab;
