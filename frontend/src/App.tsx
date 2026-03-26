import { useState, useEffect } from 'react';
import { type Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { AuthScreen } from './components/auth/AuthScreen';
import { TabBar } from './components/common/TabBar';
import { SettingsSheet } from './components/common/SettingsSheet';
import { TaskScreen } from './components/TaskScreen/TaskScreen';
import { GoalScreen } from './components/GoalScreen/GoalScreen';
import { useTasks } from './hooks/useTasks';
import { useGoals } from './hooks/useGoals';

type Tab = 'tasks' | 'goals';

function MainApp({ email }: { email: string }) {
  const [tab, setTab] = useState<Tab>('tasks');
  const [showSettings, setShowSettings] = useState(false);
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

        {/* 設定ボタン（右上固定） */}
        <button
          onClick={() => setShowSettings(true)}
          style={{
            position: 'absolute', top: 10, right: 12,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4, zIndex: 10,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="2.5" />
            <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.1 4.1l1.1 1.1M14.8 14.8l1.1 1.1M15.9 4.1l-1.1 1.1M5.2 14.8l-1.1 1.1" />
          </svg>
        </button>
      </div>

      <TabBar active={tab} onChange={setTab} />

      {showSettings && (
        <SettingsSheet email={email} onClose={() => setShowSettings(false)} />
      )}
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

  if (session === undefined) return null;
  if (!session) return <AuthScreen />;

  return <MainApp email={session.user.email ?? ''} />;
}
