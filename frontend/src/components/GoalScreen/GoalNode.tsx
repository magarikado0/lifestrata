import { useState } from 'react';
import { type Goal } from '../../types';
import { Modal } from '../common/Modal';

interface Props {
  goal: Goal;
  depth: number;
  onToggle: (id: number) => void;
  onAddChild: (parentId: number, text: string) => void;
  onDelete: (id: number) => void;
  onUnlink: (goalId: number, taskId: number) => void;
}

export function GoalNode({ goal, depth, onToggle, onAddChild, onDelete, onUnlink }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const hasChildren = goal.children.length > 0;

  return (
    <div style={{ marginLeft: depth === 0 ? 0 : 16 }}>
      <div
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 6,
          padding: '8px 0', borderBottom: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => onToggle(goal.id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 12, padding: '2px',
            width: 20, flexShrink: 0, marginTop: 2,
            opacity: hasChildren ? 1 : 0.2,
          }}
          disabled={!hasChildren}
        >
          {goal.open ? '▾' : '▸'}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {goal.text}
          </div>
          {goal.linkedTasks.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              {goal.linkedTasks.map(t => (
                <span
                  key={t.id}
                  onClick={() => onUnlink(goal.id, t.id)}
                  style={{
                    fontSize: 11, padding: '2px 6px', borderRadius: 10,
                    background: 'var(--amber)', color: '#fff', cursor: 'pointer',
                    textDecoration: t.done ? 'line-through' : 'none',
                    opacity: t.done ? 0.6 : 1,
                  }}
                >
                  {t.text}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={iconBtnStyle}
            title="子ゴール追加"
          >
            +
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            style={{ ...iconBtnStyle, color: '#EF5350' }}
            title="削除"
          >
            ✕
          </button>
        </div>
      </div>

      {goal.open && goal.children.length > 0 && (
        <div style={{
          borderLeft: '2px solid var(--border)',
          marginLeft: 10,
          maxHeight: 2000,
          overflow: 'hidden',
          transition: 'max-height 0.2s ease',
        }}>
          {goal.children
            .slice()
            .sort((a, b) => a.order - b.order)
            .map(child => (
              <GoalNode
                key={child.id}
                goal={child}
                depth={depth + 1}
                onToggle={onToggle}
                onAddChild={onAddChild}
                onDelete={onDelete}
                onUnlink={onUnlink}
              />
            ))}
        </div>
      )}

      {showAddModal && (
        <Modal
          title="子ゴールを追加"
          onClose={() => setShowAddModal(false)}
          onSubmit={text => onAddChild(goal.id, text)}
        />
      )}
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)', fontSize: 14, padding: '2px 4px',
};
