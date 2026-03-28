import { useState, useRef, useEffect } from 'react';
import { type Goal, type Task, minutesToTime } from '../../types';
import { TimeSlider } from './TimeSlider';
import { GoalPicker } from './GoalPicker';

interface Props {
  goals: Goal[];
  selectedDate: string;
  initialTask?: Task;
  onAdd: (text: string, hasTime: boolean, minutes: number | null, goalId: number | null) => void;
  onClose: () => void;
}

function findGoalText(goals: Goal[], id: number): string | null {
  for (const g of goals) {
    if (g.id === id) return g.text;
    const found = findGoalText(g.children, id);
    if (found) return found;
  }
  return null;
}

export function AddModal({ goals, initialTask, onAdd, onClose }: Props) {
  const [text, setText] = useState(initialTask?.text ?? '');
  const [hasTime, setHasTime] = useState(initialTask?.hasTime ?? false);
  const [minutes, setMinutes] = useState(initialTask?.minutes ?? 540);
  const [goalId, setGoalId] = useState<number | null>(initialTask?.goalId ?? null);
  const isEditing = initialTask !== undefined;
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed, hasTime, hasTime ? minutes : null, goalId);
  }

  const goalText = goalId !== null ? findGoalText(goals, goalId) : null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          borderRadius: 16,
          padding: '20px 20px 20px',
          display: 'flex', flexDirection: 'column', gap: 12,
          maxWidth: 400, width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >

        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && text.trim()) handleSubmit(); }}
          placeholder="タスクを追加..."
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 10,
            border: '1px solid var(--border)', background: '#fff',
            fontSize: 16, outline: 'none', boxSizing: 'border-box',
          }}
        />

        {/* 時間 */}
        <div>
          <button onClick={() => setHasTime(v => !v)} style={rowToggleStyle(hasTime)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14.5"/></svg>
            <span style={{ flex: 1, textAlign: 'left' }}>
              {hasTime ? `時間: ${minutesToTime(minutes)}` : '時間を設定'}
            </span>
            <span style={{ fontSize: 12, color: hasTime ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
              {hasTime ? '▲' : '▼'}
            </span>
          </button>
          {hasTime && (
            <div style={{ paddingTop: 6 }}>
              <TimeSlider minutes={minutes} onChange={setMinutes} onClear={() => setHasTime(false)} />
            </div>
          )}
        </div>

        {/* ゴール */}
        <button onClick={() => setShowGoalPicker(true)} style={rowToggleStyle(goalId !== null)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="4" r="2" />
            <circle cx="5" cy="18" r="2" />
            <circle cx="19" cy="18" r="2" />
            <line x1="12" y1="6" x2="12" y2="11" />
            <path d="M12 11 L5 16" />
            <path d="M12 11 L19 16" />
          </svg>
          <span style={{ flex: 1, textAlign: 'left' }}>{goalText ?? 'ゴールに紐付け'}</span>
          {goalId !== null && (
            <button
              onClick={e => { e.stopPropagation(); setGoalId(null); }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}
            >
              ×
            </button>
          )}
        </button>

        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          style={{
            width: '100%', padding: '12px', borderRadius: 12, border: 'none',
            background: text.trim() ? 'var(--text-primary)' : 'var(--border)',
            color: '#fff', fontSize: 16, fontWeight: 600,
            cursor: text.trim() ? 'pointer' : 'default',
            marginTop: 4,
          }}
        >
          {isEditing ? '更新' : '追加'}
        </button>
      </div>

      {showGoalPicker && (
        <GoalPicker
          goals={goals}
          selectedId={goalId}
          onSelect={setGoalId}
          onClose={() => setShowGoalPicker(false)}
        />
      )}
    </div>
  );
}

function rowToggleStyle(active: boolean): React.CSSProperties {
  return {
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)',
    background: active ? 'var(--text-primary)' : 'none',
    color: active ? '#fff' : 'var(--text-primary)',
    cursor: 'pointer', fontSize: 14,
  };
}
