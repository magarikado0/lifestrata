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
}

export function GoalScreen({ goals, onToggle, onAddRoot, onAddChild, onDelete, onUnlink }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
          人生設計
        </h2>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
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
