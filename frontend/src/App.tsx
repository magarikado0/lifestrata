import { useState, useEffect } from 'react';
import { type Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { AuthScreen } from './components/auth/AuthScreen';
import { TabBar } from './components/common/TabBar';
import { TaskScreen } from './components/TaskScreen/TaskScreen';
import { GoalScreen } from './components/GoalScreen/GoalScreen';
import { useTasks } from './hooks/useTasks';
import { useGoals } from './hooks/useGoals';

type Tab = 'tasks' | 'goals';

function MainApp() {
  const [tab, setTab] = useState<Tab>('tasks');
  const { tasks, addTask, updateTask, deleteTask, toggleDone } = useTasks();
  const { goals, addRootGoal, addChildGoal, toggleOpen, deleteGoal } = useGoals(tasks);

  function handleUnlink(_goalId: number, taskId: number) {
    updateTask(taskId, { goalId: null });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0,
          opacity: tab === 'tasks' ? 1 : 0,
          pointerEvents: tab === 'tasks' ? 'auto' : 'none',
          transition: 'opacity 0.15s',
        }}>
          <TaskScreen
            tasks={tasks}
            goals={goals}
            onAdd={addTask}
            onToggle={toggleDone}
            onDelete={deleteTask}
          />
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          opacity: tab === 'goals' ? 1 : 0,
          pointerEvents: tab === 'goals' ? 'auto' : 'none',
          transition: 'opacity 0.15s',
        }}>
          <GoalScreen
            goals={goals}
            onToggle={toggleOpen}
            onAddRoot={addRootGoal}
            onAddChild={addChildGoal}
            onDelete={deleteGoal}
            onUnlink={handleUnlink}
          />
        </div>
      </div>
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null; // セッション確認中

  if (!session) return <AuthScreen />;

  return <MainApp />;
}
