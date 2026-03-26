import { useState, useCallback } from 'react';
import { type Goal, type Task } from '../types';

let nextId = 100;

function makeGoal(partial: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'children' | 'linkedTasks'>): Goal {
  return {
    id: nextId++,
    userId: 1,
    createdAt: new Date().toISOString(),
    children: [],
    linkedTasks: [],
    ...partial,
  };
}

const initialGoals: Goal[] = [
  {
    id: 1, userId: 1, parentId: null, text: '深層研究で起業する', order: 0, open: true,
    createdAt: new Date().toISOString(), linkedTasks: [], children: [
      {
        id: 2, userId: 1, parentId: 1, text: '修士で研究成果を出す', order: 0, open: true,
        createdAt: new Date().toISOString(), linkedTasks: [], children: [],
      },
      {
        id: 3, userId: 1, parentId: 1, text: 'プロダクト開発を始める', order: 1, open: false,
        createdAt: new Date().toISOString(), linkedTasks: [], children: [],
      },
    ],
  },
];

function updateGoalInTree(goals: Goal[], id: number, updater: (g: Goal) => Goal): Goal[] {
  return goals.map(g => {
    if (g.id === id) return updater(g);
    return { ...g, children: updateGoalInTree(g.children, id, updater) };
  });
}

function deleteGoalInTree(goals: Goal[], id: number): Goal[] {
  return goals
    .filter(g => g.id !== id)
    .map(g => ({ ...g, children: deleteGoalInTree(g.children, id) }));
}

function addChildInTree(goals: Goal[], parentId: number, child: Goal): Goal[] {
  return goals.map(g => {
    if (g.id === parentId) return { ...g, children: [...g.children, child] };
    return { ...g, children: addChildInTree(g.children, parentId, child) };
  });
}

export function useGoals(tasks: Task[]) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);

  const getGoalsWithTasks = useCallback((): Goal[] => {
    function hydrate(g: Goal): Goal {
      const linked = tasks.filter(t => t.goalId === g.id).map(t => ({ id: t.id, text: t.text, done: t.done }));
      return { ...g, linkedTasks: linked, children: g.children.map(hydrate) };
    }
    return goals.map(hydrate);
  }, [goals, tasks]);

  const addRootGoal = useCallback((text: string) => {
    const goal = makeGoal({ parentId: null, text, order: goals.length, open: true });
    setGoals(prev => [...prev, goal]);
  }, [goals.length]);

  const addChildGoal = useCallback((parentId: number, text: string) => {
    let childOrder = 0;
    function countChildren(gs: Goal[]): number {
      for (const g of gs) {
        if (g.id === parentId) return g.children.length;
        const r = countChildren(g.children);
        if (r >= 0) return r;
      }
      return 0;
    }
    childOrder = countChildren(goals);
    const child = makeGoal({ parentId, text, order: childOrder, open: true });
    setGoals(prev => addChildInTree(prev, parentId, child));
  }, [goals]);

  const updateGoal = useCallback((id: number, updates: Partial<Goal>) => {
    setGoals(prev => updateGoalInTree(prev, id, g => ({ ...g, ...updates })));
  }, []);

  const toggleOpen = useCallback((id: number) => {
    setGoals(prev => updateGoalInTree(prev, id, g => ({ ...g, open: !g.open })));
  }, []);

  const deleteGoal = useCallback((id: number) => {
    setGoals(prev => deleteGoalInTree(prev, id));
  }, []);

  return { goals: getGoalsWithTasks(), addRootGoal, addChildGoal, updateGoal, toggleOpen, deleteGoal };
}
