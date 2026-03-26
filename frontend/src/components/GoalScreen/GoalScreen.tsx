import { type Goal } from '../../types';
import { GoalTree } from './GoalTree';
import { AddBar } from './AddBar';

interface Props {
  goals: Goal[];
  onToggle: (id: number) => void;
  onAddRoot: (text: string) => void;
  onAddChild: (parentId: number, text: string) => void;
  onDelete: (id: number) => void;
  onUnlink: (goalId: number, taskId: number) => void;
  onSettings: () => void;
}

export function GoalScreen({ goals, onToggle, onAddRoot, onAddChild, onDelete, onUnlink, onSettings }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 12px 0' }}>
        <button
          onClick={onSettings}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="2.5" />
            <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.1 4.1l1.1 1.1M14.8 14.8l1.1 1.1M15.9 4.1l-1.1 1.1M5.2 14.8l-1.1 1.1" />
          </svg>
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 0' }}>
        <GoalTree
          goals={goals}
          onToggle={onToggle}
          onAddChild={onAddChild}
          onDelete={onDelete}
          onUnlink={onUnlink}
        />
      </div>
      <AddBar onAdd={onAddRoot} />
    </div>
  );
}
