import { supabase } from '../lib/supabase';
import { type Goal } from '../types';

function toGoalFlat(row: Record<string, unknown>): Omit<Goal, 'children' | 'linkedTasks'> {
  return {
    id: row.id as number,
    userId: row.user_id as string,
    parentId: row.parent_id as number | null,
    text: row.text as string,
    order: row.order as number,
    open: row.open as boolean,
    deadline: row.deadline as string | null,
    deadlineMinutes: row.deadline_minutes as number | null,
    createdAt: row.created_at as string,
  };
}

function buildTree(flat: Omit<Goal, 'children' | 'linkedTasks'>[]): Goal[] {
  const map = new Map<number, Goal>();
  for (const g of flat) map.set(g.id, { ...g, children: [], linkedTasks: [] });
  const roots: Goal[] = [];
  for (const g of flat) {
    const node = map.get(g.id)!;
    if (g.parentId === null) {
      roots.push(node);
    } else {
      map.get(g.parentId)?.children.push(node);
    }
  }
  return roots;
}

export async function fetchGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('order', { ascending: true });
  if (error) throw error;
  return buildTree(data.map(toGoalFlat));
}

export async function createGoal(
  goal: Pick<Goal, 'parentId' | 'text' | 'order'>
): Promise<Goal> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('goals')
    .insert({ user_id: user.id, parent_id: goal.parentId, text: goal.text, order: goal.order, open: true })
    .select()
    .single();
  if (error) throw error;
  return { ...toGoalFlat(data), children: [], linkedTasks: [] };
}

export async function patchGoal(
  id: number,
  updates: { text?: string; open?: boolean; deadline?: string | null; deadlineMinutes?: number | null }
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.text !== undefined) row.text = updates.text;
  if (updates.open !== undefined) row.open = updates.open;
  if ('deadline' in updates) row.deadline = updates.deadline;
  if ('deadlineMinutes' in updates) row.deadline_minutes = updates.deadlineMinutes;
  const { error } = await supabase.from('goals').update(row).eq('id', id);
  if (error) throw error;
}

export async function reparentGoal(
  id: number,
  parentId: number | null,
  order: number,
): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .update({ parent_id: parentId, order })
    .eq('id', id);
  if (error) throw error;
}

export async function removeGoal(id: number): Promise<void> {
  // cascade delete handles children via FK
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
}
