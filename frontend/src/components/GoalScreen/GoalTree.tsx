import { type Goal } from '../../types';
import { GoalNode } from './GoalNode';

interface Props {
  goals: Goal[];
  onToggle: (id: number) => void;
  onAddChild: (parentId: number, text: string) => void;
  onDelete: (id: number) => void;
  onUnlink: (goalId: number, taskId: number) => void;
}

export function GoalTree({ goals, onToggle, onAddChild, onDelete, onUnlink }: Props) {
  if (goals.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 14 }}>
        ゴールを追加してみましょう
      </div>
    );
  }

  return (
    <div>
      {goals
        .slice()
        .sort((a, b) => a.order - b.order)
        .map(goal => (
          <GoalNode
            key={goal.id}
            goal={goal}
            depth={0}
            onToggle={onToggle}
            onAddChild={onAddChild}
            onDelete={onDelete}
            onUnlink={onUnlink}
          />
        ))}
    </div>
  );
}
