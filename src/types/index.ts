export type UserRole = 'engineer' | 'supervisor' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = 'not_started' | 'in_progress' | 'done';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  location: string;
  personInCharge: string;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  userId: string;
  progress: number;
  notes: string;
  attachments: string[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyActivity {
  id: string;
  userId: string;
  date: Date;
  description: string;
  location: string;
  attachments: string[];
  status: 'pending' | 'approved' | 'rejected';
  supervisorComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  type: 'annual' | 'sick' | 'emergency' | 'other';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  supervisorComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  supervisorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KPI {
  id: string;
  userId: string;
  period: 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  tasksCompleted: number;
  attendance: number;
  updateDelay: number;
  timeEfficiency: number;
  createdAt: Date;
  updatedAt: Date;
} 