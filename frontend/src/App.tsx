import { useState } from 'react';
import { TabBar } from './components/common/TabBar';
import { TaskScreen } from './components/TaskScreen/TaskScreen';
import { GoalScreen } from './components/GoalScreen/GoalScreen';
import { useTasks } from './hooks/useTasks';
import { useGoals } from './hooks/useGoals';

type Tab = 'tasks' | 'goals';

export default function App() {
  const [tab, setTab] = useState<Tab>('tasks');
  const { tasks, addTask, toggleDone, deleteTask, updateTask } = useTasks();
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
