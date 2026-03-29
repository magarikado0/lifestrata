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
  const { goals, addRootGoal, addChildGoal, updateGoal, toggleOpen, reparentGoal, deleteGoal } = useGoals(tasks);

  function handleUnlink(_goalId: number, taskId: number) {
    updateTask(taskId, { goalId: null });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0,
          paddingBottom: 'calc(61px + env(safe-area-inset-bottom))',
          overflow: 'hidden',
          opacity: tab === 'tasks' ? 1 : 0,
          pointerEvents: tab === 'tasks' ? 'auto' : 'none',
          transition: 'opacity 0.15s',
        }}>
          <TaskScreen
            tasks={tasks}
            goals={goals}
            onAdd={(text, date, hasTime, minutes, goalId, endMinutes) => addTask(text, date, hasTime, minutes, goalId, endMinutes)}
            onUpdate={updateTask}
            onToggle={toggleDone}
            onDelete={deleteTask}
          />
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          paddingBottom: 'calc(61px + env(safe-area-inset-bottom))',
          opacity: tab === 'goals' ? 1 : 0,
          pointerEvents: tab === 'goals' ? 'auto' : 'none',
          transition: 'opacity 0.15s',
        }}>
          <GoalScreen
            goals={goals}
            onToggle={toggleOpen}
            onAddRoot={addRootGoal}
            onAddChild={addChildGoal}
            onUpdate={updateGoal}
            onDelete={deleteGoal}
            onUnlink={handleUnlink}
            onReparent={reparentGoal}
            onSettings={() => setShowSettings(true)}
          />
        </div>
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
