import { useState, useCallback } from 'react';
import { type Task, formatDate } from '../types';

let nextId = 1;

function makeTask(partial: Omit<Task, 'id' | 'userId' | 'createdAt'>): Task {
  return {
    id: nextId++,
    userId: 1,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([
    makeTask({ text: 'ABM実装の続き', date: formatDate(new Date()), hasTime: true, minutes: 540, done: false, goalId: null }),
    makeTask({ text: '論文読む', date: formatDate(new Date()), hasTime: true, minutes: 480, done: false, goalId: null }),
    makeTask({ text: '買い物', date: formatDate(new Date()), hasTime: false, minutes: null, done: false, goalId: null }),
    makeTask({ text: 'メール返信', date: formatDate(new Date()), hasTime: true, minutes: 780, done: true, goalId: null }),
  ]);

  const getTasksForDate = useCallback((date: string) => {
    return tasks.filter(t => t.date === date);
  }, [tasks]);

  const getTasksForWeek = useCallback((from: string, to: string) => {
    return tasks.filter(t => t.date >= from && t.date <= to);
  }, [tasks]);

  const addTask = useCallback((text: string, date: string, hasTime: boolean, minutes: number | null, goalId: number | null = null) => {
    setTasks(prev => [...prev, makeTask({ text, date, hasTime, minutes, done: false, goalId })]);
  }, []);

  const updateTask = useCallback((id: number, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleDone = useCallback((id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, []);

  return { tasks, getTasksForDate, getTasksForWeek, addTask, updateTask, deleteTask, toggleDone };
}
