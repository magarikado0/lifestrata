import { useState, useCallback, useEffect } from 'react';
import { type Goal, type Task } from '../types';
import * as api from '../api/goals';

function hydrateLinkedTasks(goals: Goal[], tasks: Task[]): Goal[] {
  function hydrate(g: Goal): Goal {
    const linked = tasks
      .filter(t => t.goalId === g.id)
      .map(t => ({ id: t.id, text: t.text, done: t.done }));
    return { ...g, linkedTasks: linked, children: g.children.map(hydrate) };
  }
  return goals.map(hydrate);
}

function countChildren(goals: Goal[], parentId: number): number {
  for (const g of goals) {
    if (g.id === parentId) return g.children.length;
    const found = countChildren(g.children, parentId);
    if (found >= 0) return found;
  }
  return 0;
}

function updateInTree(goals: Goal[], id: number, updater: (g: Goal) => Goal): Goal[] {
  return goals.map(g =>
    g.id === id ? updater(g) : { ...g, children: updateInTree(g.children, id, updater) }
  );
}

function deleteInTree(goals: Goal[], id: number): Goal[] {
  return goals
    .filter(g => g.id !== id)
    .map(g => ({ ...g, children: deleteInTree(g.children, id) }));
}

export function useGoals(tasks: Task[]) {
  const [rawGoals, setRawGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.fetchGoals()
      .then(setRawGoals)
      .finally(() => setLoading(false));
  }, []);

  const goals = hydrateLinkedTasks(rawGoals, tasks);

  const addRootGoal = useCallback(async (text: string) => {
    const created = await api.createGoal({ parentId: null, text, order: rawGoals.length });
    setRawGoals(prev => [...prev, created]);
  }, [rawGoals.length]);

  const addChildGoal = useCallback(async (parentId: number, text: string) => {
    const order = countChildren(rawGoals, parentId);
    const created = await api.createGoal({ parentId, text, order });
    setRawGoals(prev =>
      updateInTree(prev, parentId, g => ({ ...g, children: [...g.children, created] }))
    );
  }, [rawGoals]);

  const updateGoal = useCallback(async (id: number, updates: { text?: string; open?: boolean }) => {
    setRawGoals(prev => updateInTree(prev, id, g => ({ ...g, ...updates })));
    await api.patchGoal(id, updates);
  }, []);

  const toggleOpen = useCallback(async (id: number) => {
    let newOpen = true;
    setRawGoals(prev => updateInTree(prev, id, g => {
      newOpen = !g.open;
      return { ...g, open: newOpen };
    }));
    await api.patchGoal(id, { open: newOpen });
  }, []);

  const deleteGoal = useCallback(async (id: number) => {
    setRawGoals(prev => deleteInTree(prev, id));
    await api.removeGoal(id);
  }, []);

  return { goals, loading, addRootGoal, addChildGoal, updateGoal, toggleOpen, deleteGoal };
}
