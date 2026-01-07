
import { db } from '../App.tsx';

export const notifyStudents = async (
  targetClasses: string[], 
  title: string, 
  message: string, 
  type: 'material' | 'task' | 'grade' | 'registration', 
  studentId?: string
) => {
  try {
    const students = await db.get('elearning_students_list');
    const studentList = Array.isArray(students) ? students : [];
    
    const targets = studentId 
      ? studentList.filter(s => s.id === studentId)
      : studentList.filter(s => targetClasses.includes(s.classId || ''));

    const newNotif = {
      id: 'notif_' + Date.now() + Math.random().toString(36).substr(2, 5),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    for (const s of targets) {
      await db.append(`elearning_notifs_${s.id}`, newNotif);
    }
  } catch (err) {
    console.error("Failed to notify students:", err);
  }
};
