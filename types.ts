
export type Role = 'ADMIN' | 'STUDENT';

export interface User {
  id: string;
  username: string;
  name: string;
  password?: string;
  role: Role;
  classId?: string;
  avatar?: string;
  status?: 'ACTIVE' | 'PENDING';
}

export interface ClassRoom {
  id: string;
  name: string; // e.g., 7A, 8B, 9C
  homeroomTeacher?: string; // Wali Kelas
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'file' | 'link' | 'embed';
  content: string;
  targetClassIds: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'file' | 'link' | 'embed';
  content: string;
  targetClassIds: string[];
  dueDate: string;
  isSubmissionEnabled: boolean;
  createdAt: string;
}

export interface Submission {
  id: string;
  taskId: string;
  studentId: string;
  content: string;
  grade?: number;
  feedback?: string;
  submittedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  type: 'material' | 'task' | 'grade';
  createdAt: string;
}

export interface SiteSettings {
  logoUrl: string;
  heroImageUrl: string;
  siteName: string;
}
