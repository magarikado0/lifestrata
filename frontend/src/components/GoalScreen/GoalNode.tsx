import { useState } from 'react';
import { type Goal, formatDate, minutesToTime } from '../../types';
import { Modal } from '../common/Modal';
import { DeadlineModal } from './DeadlineModal';

interface Props {
  goal: Goal;
  depth: number;
  onToggle: (id: number) => void;
  onAddChild: (parentId: number, text: string) => void;
  onUpdate: (id: number, updates: { deadline?: string | null; deadlineMinutes?: number | null }) => void;
  onDelete: (id: number) => void;
  onUnlink: (goalId: number, taskId: number) => void;
}

const DEPTH_STYLE: Record<number, { fontSize: number; fontWeight: number; color: string }> = {
  0: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' },
  1: { fontSize: 14, fontWeight: 400, color: 'var(--text-primary)' },
  2: { fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)' },
};

function getDepthStyle(depth: number) {
  return DEPTH_STYLE[Math.min(depth, 2)];
}

function deadlineColor(deadline: string): string {
  const today = formatDate(new Date());
  if (deadline < today) return '#EF5350';
  const diff = (new Date(deadline).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24);
  if (diff <= 7) return '#FFA726';
  return 'var(--text-secondary)';
}

export function GoalNode({ goal, depth, onToggle, onAddChild, onUpdate, onDelete, onUnlink }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const hasChildren = goal.children.length > 0;
  const { fontSize, fontWeight, color } = getDepthStyle(depth);
  const isRoot = depth === 0;

  return (
    <div style={{ marginTop: isRoot ? 4 : 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          padding: isRoot ? '12px 0 10px' : '8px 0',
          borderBottom: isRoot ? '1px solid var(--border)' : 'none',
        }}
      >
        {/* Toggle */}
        <button
          onClick={() => onToggle(goal.id)}
          disabled={!hasChildren}
          style={{
            flexShrink: 0,
            marginTop: isRoot ? 3 : 2,
            width: 18,
            height: 18,
            border: 'none',
            background: 'none',
            cursor: hasChildren ? 'pointer' : 'default',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: hasChildren ? 'var(--text-secondary)' : 'var(--border)',
            transition: 'color 0.15s',
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            style={{
              transform: goal.open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
            }}
          >
            <path d="M3 2 L7 5 L3 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize, fontWeight, color, lineHeight: 1.45 }}>
            {goal.text}
          </div>
          {goal.deadline && (
            <div
              onClick={() => setShowDeadlineModal(true)}
              style={{
                fontSize: 11, marginTop: 3, cursor: 'pointer',
                color: deadlineColor(goal.deadline),
                display: 'inline-flex', alignItems: 'center', gap: 3,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14.5"/></svg>
              {goal.deadline}
              {goal.deadlineMinutes !== null && ` ${minutesToTime(goal.deadlineMinutes)}`}
            </div>
          )}
          {goal.linkedTasks.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
              {goal.linkedTasks.map(t => (
                <span
                  key={t.id}
                  onClick={() => onUnlink(goal.id, t.id)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    fontSize: 11, padding: '2px 7px', borderRadius: 20,
                    background: t.done ? 'var(--border)' : 'var(--amber)',
                    color: t.done ? 'var(--text-muted)' : '#fff',
                    cursor: 'pointer',
                    textDecoration: t.done ? 'line-through' : 'none',
                    transition: 'opacity 0.15s',
                  }}
                >
                  {t.text}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 0, flexShrink: 0, alignItems: 'center' }}>
          <button onClick={() => setShowDeadlineModal(true)} style={actionBtn} title="期限を設定">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
          <button onClick={() => setShowAddModal(true)} style={actionBtn}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="7" y1="2" x2="7" y2="12" />
              <line x1="2" y1="7" x2="12" y2="7" />
            </svg>
          </button>
          <button onClick={() => onDelete(goal.id)} style={{ ...actionBtn, color: '#E0E0E0' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="2" y1="2" x2="11" y2="11" />
              <line x1="11" y1="2" x2="2" y2="11" />
            </svg>
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && (
        <div
          style={{
            overflow: 'hidden',
            maxHeight: goal.open ? 4000 : 0,
            transition: 'max-height 0.2s ease',
          }}
        >
          <div style={{
            borderLeft: '1px solid var(--border)',
            marginLeft: 8,
            paddingLeft: 10,
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
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onUnlink={onUnlink}
                />
              ))}
          </div>
        </div>
      )}

      {showAddModal && (
        <Modal
          title="子ゴールを追加"
          onClose={() => setShowAddModal(false)}
          onSubmit={text => onAddChild(goal.id, text)}
        />
      )}

      {showDeadlineModal && (
        <DeadlineModal
          current={{ deadline: goal.deadline, deadlineMinutes: goal.deadlineMinutes }}
          onSave={(deadline, deadlineMinutes) => {
            onUpdate(goal.id, { deadline, deadlineMinutes });
            setShowDeadlineModal(false);
          }}
          onClose={() => setShowDeadlineModal(false)}
        />
      )}
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  padding: '4px 5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
};
