import { useState, useRef } from 'react';
import { type Goal } from '../../types';
import { TimeSlider } from './TimeSlider';
import { GoalPicker } from './GoalPicker';
import { CalendarPicker } from './CalendarPicker';

interface Props {
  goals: Goal[];
  selectedDate: string;
  onAdd: (text: string, hasTime: boolean, minutes: number | null, goalId: number | null, hasDeadline: boolean, deadline: string | null) => void;
}

function findGoalText(goals: Goal[], id: number): string | null {
  for (const g of goals) {
    if (g.id === id) return g.text;
    const found = findGoalText(g.children, id);
    if (found) return found;
  }
  return null;
}

export function AddBar({ goals, selectedDate, onAdd }: Props) {
  const [text, setText] = useState('');
  const [showSlider, setShowSlider] = useState(false);
  const [minutes, setMinutes] = useState(540);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed, showSlider, showSlider ? minutes : null, selectedGoalId, deadlineDate !== null, deadlineDate);
    setText('');
    setShowSlider(false);
    setSelectedGoalId(null);
    setDeadlineDate(null);
  }

  const selectedGoalText = selectedGoalId !== null ? findGoalText(goals, selectedGoalId) : null;

  return (
    <div style={{ borderTop: '1px solid var(--border)', padding: '8px 16px', background: 'var(--bg)' }}>
      {showSlider && (
        <TimeSlider
          minutes={minutes}
          onChange={setMinutes}
          onClear={() => setShowSlider(false)}
        />
      )}

      {deadlineDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, padding: '3px 8px', borderRadius: 20,
            background: '#EF5350', color: '#fff',
          }}>
            期限: {deadlineDate}
            <button
              type="button"
              onClick={() => setDeadlineDate(null)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: 13, lineHeight: 1 }}
            >
              ×
            </button>
          </span>
        </div>
      )}

      {selectedGoalText && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, padding: '3px 8px', borderRadius: 20,
            background: 'var(--amber)', color: '#fff',
            maxWidth: '100%', overflow: 'hidden',
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedGoalText}
            </span>
            <button
              type="button"
              onClick={() => setSelectedGoalId(null)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: 13, lineHeight: 1 }}
            >
              ×
            </button>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setShowSlider(s => !s)}
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: '1px solid var(--border)',
            background: showSlider ? 'var(--text-primary)' : 'none',
            color: showSlider ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 14, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14.5"/></svg>
        </button>
        <button
          type="button"
          onClick={() => setShowGoalPicker(true)}
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: '1px solid var(--border)',
            background: selectedGoalId !== null ? 'var(--amber)' : 'none',
            color: selectedGoalId !== null ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 14, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title="ゴールに紐付け"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="4" r="2" />
            <circle cx="5" cy="18" r="2" />
            <circle cx="19" cy="18" r="2" />
            <line x1="12" y1="6" x2="12" y2="11" />
            <path d="M12 11 L5 16" />
            <path d="M12 11 L19 16" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setShowDeadlinePicker(true)}
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: '1px solid var(--border)',
            background: deadlineDate !== null ? '#EF5350' : 'none',
            color: deadlineDate !== null ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 14, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title="期限を設定"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </button>
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="タスクを追加..."
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 10,
            border: '1px solid var(--border)', background: '#fff',
            fontSize: 15, outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          style={{
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: text.trim() ? 'var(--text-primary)' : 'var(--border)',
            color: '#fff', cursor: text.trim() ? 'pointer' : 'default',
            fontSize: 18, flexShrink: 0,
          }}
        >
          +
        </button>
      </form>

      {showGoalPicker && (
        <GoalPicker
          goals={goals}
          selectedId={selectedGoalId}
          onSelect={setSelectedGoalId}
          onClose={() => setShowGoalPicker(false)}
        />
      )}

      {showDeadlinePicker && (
        <CalendarPicker
          selectedDate={deadlineDate ?? selectedDate}
          taskDates={new Set()}
          onSelect={date => { setDeadlineDate(date); setShowDeadlinePicker(false); }}
          onClose={() => setShowDeadlinePicker(false)}
        />
      )}
    </div>
  );
}
