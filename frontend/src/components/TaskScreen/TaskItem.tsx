import { type Task, minutesToTime } from '../../types';

interface Props {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskItem({ task, onToggle, onDelete }: Props) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
        borderBottom: '1px solid var(--border)',
        opacity: task.done ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          border: task.done ? 'none' : '2px solid var(--border)',
          background: task.done ? 'var(--text-primary)' : 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        {task.done && <span style={{ color: '#fff', fontSize: 12, lineHeight: 1 }}>✓</span>}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15,
          textDecoration: task.done ? 'line-through' : 'none',
          color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {task.text}
        </div>
        {task.hasTime && task.minutes !== null && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
            {minutesToTime(task.minutes)}
          </div>
        )}
      </div>
      <button
        onClick={onDelete}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
      >
        ×
      </button>
    </div>
  );
}
