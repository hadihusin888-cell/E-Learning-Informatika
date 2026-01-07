
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Home, BookOpen, ClipboardList, CheckCircle, Settings, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { User, SiteSettings } from '../types';
import { db } from '../App';

// Import Tab Components Modularly
import HomeTab from './student/HomeTab.tsx';
import MaterialsTab from './student/MaterialsTab.tsx';
import TasksTab from './student/TasksTab.tsx';
import GradesTab from './student/GradesTab.tsx';
import SettingsTab from './student/SettingsTab.tsx';

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

  const fetchData = useCallback(async () => {
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
  }, [user.id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleMarkAsRead = async (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    await db.saveAll(`elearning_notifs_${user.id}`, updated);
  };

  const studentMaterials = useMemo(() => materials.filter(m => m.targetClassIds.includes(user.classId)), [materials, user.classId]);
  const studentTasks = useMemo(() => tasks.filter(t => t.targetClassIds.includes(user.classId)), [tasks, user.classId]);
  const studentSubmissions = useMemo(() => submissions.filter(s => s.studentId === user.id), [submissions, user.id]);

  const renderContent = () => {
    switch (activeView) {
      case 'home': 
        return <HomeTab user={user} materials={studentMaterials} tasks={studentTasks} submissions={studentSubmissions} setActiveView={setActiveView} />;
      case 'materials': 
        return <MaterialsTab materials={studentMaterials} />;
      case 'tasks': 
        return <TasksTab user={user} tasks={studentTasks} submissions={studentSubmissions} onRefresh={fetchData} />;
      case 'grades': 
        return <GradesTab tasks={tasks} submissions={studentSubmissions} />;
      case 'settings': 
        return <SettingsTab user={user} onUpdateUser={onUpdateUser} />;
      default: 
        return <HomeTab user={user} materials={studentMaterials} tasks={studentTasks} submissions={studentSubmissions} setActiveView={setActiveView} />;
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={onLogout} 
      sidebarItems={[
        { id: 'home', label: 'Beranda', icon: Home },
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
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
      ) : renderContent()}
    </Layout>
  );
};

export default StudentDashboard;
