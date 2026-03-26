import { useState } from 'react';
import { type Goal } from '../../types';
import { SortableGoalTree } from './SortableGoalTree';
import { Modal } from '../common/Modal';

interface Props {
  goals: Goal[];
  onToggle: (id: number) => void;
  onAddRoot: (text: string) => void;
  onAddChild: (parentId: number, text: string) => void;
  onUpdate: (id: number, updates: { deadline?: string | null; deadlineMinutes?: number | null }) => void;
  onDelete: (id: number) => void;
  onUnlink: (goalId: number, taskId: number) => void;
  onReparent: (id: number, newParentId: number | null, newOrder: number) => void;
  onSettings: () => void;
}

function countGoals(goals: Goal[]): { total: number; done: number } {
  let total = 0, done = 0;
  for (const g of goals) {
    total++;
    if (g.linkedTasks.length > 0 && g.linkedTasks.every(t => t.done)) done++;
    const child = countGoals(g.children);
    total += child.total;
    done += child.done;
  }
  return { total, done };
}

export function GoalScreen({
  goals, onToggle, onAddRoot, onAddChild, onUpdate, onDelete, onUnlink, onReparent, onSettings,
}: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const { total, done } = countGoals(goals);

  return (
    <div style={{ height: '100%', overflowY: 'auto', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg)' }}>
        <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>目標ツリー</div>
            {total > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                {total}個の目標
                {done > 0 && <span style={{ marginLeft: 6, color: '#C9B48A', fontWeight: 600 }}>{done}個達成</span>}
              </div>
            )}
          </div>
          <button
            onClick={onSettings}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="10" r="2.5" />
              <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.1 4.1l1.1 1.1M14.8 14.8l1.1 1.1M15.9 4.1l-1.1 1.1M5.2 14.8l-1.1 1.1" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ padding: '4px 16px 0' }}>
        <SortableGoalTree
          goals={goals}
          onToggle={onToggle}
          onAddChild={onAddChild}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onUnlink={onUnlink}
          onReparent={onReparent}
        />
      </div>

      {/* FAB */}

      <button
        onClick={() => setShowAddModal(true)}
        style={{
          position: 'fixed',
          bottom: 'calc(61px + env(safe-area-inset-bottom) + 16px)',
          right: 20,
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--text-primary)', color: '#fff',
          border: 'none', fontSize: 26, cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50,
        }}
      >
        +
      </button>

      {showAddModal && (
        <Modal
          title="ルートゴールを追加"
          onClose={() => setShowAddModal(false)}
          onSubmit={text => onAddRoot(text)}
        />
      )}
    </div>
  );
}
