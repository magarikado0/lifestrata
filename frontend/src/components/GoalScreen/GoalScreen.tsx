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
