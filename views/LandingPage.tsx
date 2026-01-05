
import React from 'react';
import { BookOpen, Users, Clock, ArrowRight, ShieldCheck, GraduationCap, Zap, Layers, Globe } from 'lucide-react';
import { Role, SiteSettings } from '../types';

interface LandingPageProps {
  onNavigateLogin: (role: Role) => void;
  onNavigateSignup: () => void;
  settings: SiteSettings;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateLogin, onNavigateSignup, settings }) => {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect h-20 px-6 lg:px-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={settings.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
          <div className="hidden lg:block h-8 w-[1px] bg-slate-200 mx-2"></div>
          <h1 className="hidden sm:block text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {settings.siteName}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigateLogin('STUDENT')}
            className="text-slate-600 font-semibold px-4 py-2 hover:text-emerald-600 transition-colors"
          >
            Login Siswa
          </button>
          <button 
            onClick={() => onNavigateLogin('ADMIN')}
            className="hidden md:block text-slate-600 font-semibold px-4 py-2 hover:text-emerald-600 transition-colors"
          >
            Portal Guru
          </button>
          <button 
            onClick={onNavigateSignup}
            className="bg-emerald-600 text-white px-6 py-2 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            Daftar Sekarang
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold mb-6">
              <ShieldCheck size={16} />
              Platform Terintegrasi Kurikulum Merdeka
            </div>
            <h2 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Membangun Masa Depan Digital di <span className="text-emerald-600">SMP Al Irsyad Surakarta</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Platform E-Learning khusus mata pelajaran Informatika. Akses materi interaktif, kerjakan tugas, dan pantau perkembangan belajar secara realtime.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={onNavigateSignup}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 group"
              >
                Mulai Belajar <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onNavigateLogin('STUDENT')}
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all"
              >
                Lihat Nilai Saya
              </button>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-100 rounded-[3rem] blur-3xl opacity-30 -z-10 animate-pulse"></div>
              <img 
                src={settings.heroImageUrl} 
                alt="Hero" 
                className="rounded-[2.5rem] shadow-2xl w-full object-cover aspect-video"
              />
              {/* Floating Stat Cards */}
              <div className="absolute -bottom-6 -left-6 glass-effect p-4 rounded-2xl shadow-xl animate-bounce hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Siswa Aktif</p>
                    <p className="text-lg font-bold text-slate-800">1200+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-black text-slate-900 mb-6">Ekosistem Belajar Digital Terbaik</h3>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Kami menghadirkan inovasi pembelajaran Informatika yang dirancang untuk membentuk generasi yang literat teknologi, kreatif, dan siap menghadapi tantangan masa depan.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                icon: Layers, 
                title: 'Kurikulum Modern', 
                desc: 'Materi terstruktur mulai dari Computational Thinking hingga teknologi terbaru yang relevan dengan kebutuhan industri.', 
                color: 'bg-blue-50 text-blue-600' 
              },
              { 
                icon: Zap, 
                title: 'Kolaborasi Cerdas', 
                desc: 'Sistem manajemen tugas terpadu yang memudahkan interaksi dua arah antara guru dan siswa secara efisien.', 
                color: 'bg-emerald-50 text-emerald-600' 
              },
              { 
                icon: Globe, 
                title: 'Akses Tanpa Batas', 
                desc: 'Belajar kapan pun dan di mana pun dengan sinkronisasi cloud yang memastikan data belajar Anda selalu aman dan terbarui.', 
                color: 'bg-purple-50 text-purple-600' 
              },
            ].map((f, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] border border-slate-100 hover:border-emerald-200 transition-all hover:shadow-2xl hover:-translate-y-2 group bg-slate-50/30">
                <div className={`w-16 h-16 rounded-2xl ${f.color} flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform shadow-inner`}>
                  <f.icon size={32} />
                </div>
                <h4 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">{f.title}</h4>
                <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src={settings.logoUrl} alt="Logo" className="h-10 w-auto object-contain grayscale opacity-50" />
            <span className="text-lg font-bold text-white tracking-tight">{settings.siteName}</span>
          </div>
          <p className="text-sm">© 2026 SMP AL Irsyad Surakarta. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Syarat & Ketentuan</span>
            <span className="hover:text-white cursor-pointer transition-colors">Kebijakan Privasi</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
