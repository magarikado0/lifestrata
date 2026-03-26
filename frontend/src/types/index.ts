export interface Task {
  id: number;
  userId: string; // Supabase auth UUID
  text: string;
  date: string; // ISO date string
  hasTime: boolean;
  minutes: number | null; // minutes from 0:00
  done: boolean;
  goalId: number | null;
  createdAt: string;
}

export interface Goal {
  id: number;
  userId: string; // Supabase auth UUID
  parentId: number | null;
  text: string;
  order: number;
  open: boolean;
  createdAt: string;
  children: Goal[];
  linkedTasks: Pick<Task, 'id' | 'text' | 'done'>[];
}

export type TimeSection = 'morning' | 'afternoon' | 'evening' | 'notime';

export function getSection(task: Task): TimeSection {
  if (!task.hasTime || task.minutes === null) return 'notime';
  if (task.minutes < 720) return 'morning';
  if (task.minutes < 1020) return 'afternoon';
  return 'evening';
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
