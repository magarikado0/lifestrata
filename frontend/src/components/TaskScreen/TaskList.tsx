import { type Task } from '../../types';
import { TaskItem } from './TaskItem';

interface Props {
  tasks: Task[];
  filter: 'all';
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TaskList({ tasks, onToggle, onDelete }: Props) {
  const active = tasks.filter(t => !t.done).sort((a, b) => (a.minutes ?? 9999) - (b.minutes ?? 9999));
  const done = tasks.filter(t => t.done);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
      {active.map(t => (
        <TaskItem key={t.id} task={t} onToggle={() => onToggle(t.id)} onDelete={() => onDelete(t.id)} />
      ))}
      {done.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '10px 0 2px' }}>
            完了
          </div>
          {done.map(t => (
            <TaskItem key={t.id} task={t} onToggle={() => onToggle(t.id)} onDelete={() => onDelete(t.id)} />
          ))}
        </>
      )}
      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 14 }}>
          タスクなし
        </div>
      )}
    </div>
  );
}
