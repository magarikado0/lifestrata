import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Goal, formatDate, minutesToTime } from '../../types';
import { Modal } from '../common/Modal';
import { DeadlineModal } from './DeadlineModal';

const INDENT_WIDTH = 20;

interface Props {
  id: number;
  goal: Goal;
  depth: number;
  isOverlay?: boolean;
  isLastInGroup?: boolean;
  onToggle: (id: number) => void;
  onAddChild: (parentId: number, text: string) => void;
  onUpdate: (id: number, updates: { deadline?: string | null; deadlineMinutes?: number | null }) => void;
  onDelete: (id: number) => void;
  onUnlink: (goalId: number, taskId: number) => void;
}

function deadlineColor(deadline: string): string {
  const today = formatDate(new Date());
  if (deadline < today) return '#EF5350';
  const diff = (new Date(deadline).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24);
  return diff <= 7 ? '#FFA726' : 'var(--text-secondary)';
}

export function SortableGoalItem({
  id, goal, depth, isOverlay, isLastInGroup,
  onToggle, onAddChild, onUpdate, onDelete, onUnlink,
}: Props) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);

  const hasChildren = goal.children.length > 0;
  const fontSize = depth === 0 ? 16 : depth === 1 ? 14 : 13;
  const fontWeight = depth === 0 ? 600 : 400;

  const isExpanded = goal.open && hasChildren;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
        marginTop: depth === 0 ? 8 : 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 6,
          paddingTop: depth === 0 ? 11 : 7,
          paddingBottom: depth === 0 ? 11 : 7,
          paddingLeft: depth === 0 ? 10 : depth * INDENT_WIDTH,
          paddingRight: depth === 0 ? 4 : 0,
          ...(depth === 0 ? {
            background: isOverlay ? 'var(--bg)' : '#FDF7EE',
            border: '1.5px solid #C9B48A',
            borderBottom: isExpanded ? '1px solid #DDD0BC' : '1.5px solid #C9B48A',
            borderRadius: isExpanded ? '10px 10px 0 0' : 10,
          } : {
            background: isOverlay ? 'var(--bg)' : '#FFFBF5',
            borderTop: '1px solid #DDD0BC',
            borderBottom: isLastInGroup ? '1.5px solid #C9B48A' : '1px solid #DDD0BC',
            borderLeft: '1.5px solid #C9B48A',
            borderRight: '1.5px solid #C9B48A',
            borderRadius: isLastInGroup ? '0 0 10px 10px' : 0,
          }),
          boxShadow: isOverlay ? '0 4px 16px rgba(0,0,0,0.12)' : 'none',
        }}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          style={{
            flexShrink: 0,
            marginTop: depth === 0 ? 3 : 2,
            width: 18, height: 18,
            border: 'none', background: 'none',
            cursor: isOverlay ? 'grabbing' : 'grab',
            padding: 0, touchAction: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--border)',
          }}
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor">
            <circle cx="2" cy="2" r="1.5" /><circle cx="6" cy="2" r="1.5" />
            <circle cx="2" cy="7" r="1.5" /><circle cx="6" cy="7" r="1.5" />
            <circle cx="2" cy="12" r="1.5" /><circle cx="6" cy="12" r="1.5" />
          </svg>
        </button>

        {/* Expand/collapse */}
        <button
          onClick={() => onToggle(goal.id)}
          disabled={!hasChildren}
          style={{
            flexShrink: 0,
            marginTop: depth === 0 ? 3 : 2,
            width: 18, height: 18,
            border: 'none', background: 'none',
            cursor: hasChildren ? 'pointer' : 'default',
            padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: hasChildren ? 'var(--text-secondary)' : 'var(--border)',
          }}
        >
          <svg
            width="10" height="10" viewBox="0 0 10 10"
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
          <div style={{ fontSize, fontWeight, color: 'var(--text-primary)', lineHeight: 1.45 }}>
            {goal.text}
          </div>
          {goal.deadline && (
            <div
              onClick={() => !isOverlay && setShowDeadlineModal(true)}
              style={{
                fontSize: 11, marginTop: 3,
                cursor: isOverlay ? 'default' : 'pointer',
                color: deadlineColor(goal.deadline),
                display: 'inline-flex', alignItems: 'center', gap: 3,
              }}
            >
              ⏰ {goal.deadline}
              {goal.deadlineMinutes !== null ? ` ${minutesToTime(goal.deadlineMinutes)}` : ''}
            </div>
          )}
          {goal.linkedTasks.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
              {goal.linkedTasks.map(t => (
                <span
                  key={t.id}
                  onClick={() => !isOverlay && onUnlink(goal.id, t.id)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    fontSize: 11, padding: '2px 7px', borderRadius: 20,
                    background: t.done ? 'var(--border)' : 'var(--amber)',
                    color: t.done ? 'var(--text-muted)' : '#fff',
                    cursor: isOverlay ? 'default' : 'pointer',
                    textDecoration: t.done ? 'line-through' : 'none',
                  }}
                >
                  {t.text}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons (hidden in overlay) */}
        {!isOverlay && (
          <div style={{ display: 'flex', flexShrink: 0, alignItems: 'center' }}>
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
        )}
      </div>

      {showAddModal && (
        <Modal
          title="子ゴールを追加"
          onClose={() => setShowAddModal(false)}
          onSubmit={text => { onAddChild(goal.id, text); setShowAddModal(false); }}
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
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)', padding: '4px 5px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6,
};
