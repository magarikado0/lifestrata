import { supabase } from '../lib/supabase';
import { type Task } from '../types';

// DB row → frontend型に変換
function toTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as number,
    userId: row.user_id as string,
    text: row.text as string,
    date: row.date as string,
    hasTime: row.has_time as boolean,
    minutes: row.minutes as number | null,
    endMinutes: row.end_minutes as number | null,
    done: row.done as boolean,
    goalId: row.goal_id as number | null,
    createdAt: row.created_at as string,
  };
}

export async function fetchAllTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('minutes', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data.map(toTask);
}

export async function createTask(
  task: Pick<Task, 'text' | 'date' | 'hasTime' | 'minutes' | 'endMinutes' | 'goalId'>
): Promise<Task> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      text: task.text,
      date: task.date,
      has_time: task.hasTime,
      minutes: task.minutes,
      end_minutes: task.endMinutes,
      done: false,
      goal_id: task.goalId,
    })
    .select()
    .single();
  if (error) throw error;
  return toTask(data);
}

export async function patchTask(id: number, updates: Partial<Task>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.text !== undefined) row.text = updates.text;
  if (updates.date !== undefined) row.date = updates.date;
  if (updates.hasTime !== undefined) row.has_time = updates.hasTime;
  if (updates.minutes !== undefined) row.minutes = updates.minutes;
  if ('endMinutes' in updates) row.end_minutes = updates.endMinutes;
  if (updates.done !== undefined) row.done = updates.done;
  if ('goalId' in updates) row.goal_id = updates.goalId;
  const { error } = await supabase.from('tasks').update(row).eq('id', id);
  if (error) throw error;
}

export async function removeTask(id: number): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}
