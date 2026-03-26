import { useState, useCallback, useEffect } from 'react';
import { type Task } from '../types';
import * as api from '../api/tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.fetchAllTasks()
      .then(setTasks)
      .finally(() => setLoading(false));
  }, []);

  const addTask = useCallback(async (
    text: string,
    date: string,
    hasTime: boolean,
    minutes: number | null,
    goalId: number | null = null,
  ) => {
    const created = await api.createTask({ text, date, hasTime, minutes, goalId });
    setTasks(prev => [...prev, created]);
  }, []);

  const updateTask = useCallback(async (id: number, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    await api.patchTask(id, updates);
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await api.removeTask(id);
  }, []);

  const toggleDone = useCallback(async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const done = !task.done;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done } : t));
    await api.patchTask(id, { done });
  }, [tasks]);

  return { tasks, loading, addTask, updateTask, deleteTask, toggleDone };
}
