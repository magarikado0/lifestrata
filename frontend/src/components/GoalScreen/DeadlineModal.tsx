import { useState } from 'react';
import { formatDate, minutesToTime } from '../../types';
import { CalendarPicker } from '../TaskScreen/CalendarPicker';
import { TimeSlider } from '../TaskScreen/TimeSlider';

interface Props {
  current: { deadline: string | null; deadlineMinutes: number | null };
  onSave: (deadline: string | null, deadlineMinutes: number | null) => void;
  onClose: () => void;
}

export function DeadlineModal({ current, onSave, onClose }: Props) {
  const today = formatDate(new Date());
  const [deadline, setDeadline] = useState<string | null>(current.deadline);
  const [hasTime, setHasTime] = useState(current.deadlineMinutes !== null);
  const [deadlineMinutes, setDeadlineMinutes] = useState(current.deadlineMinutes ?? 540);
  const [showCalendar, setShowCalendar] = useState(false);

  function handleSave() {
    onSave(deadline, deadline && hasTime ? deadlineMinutes : null);
  }

  function handleClearDeadline() {
    onSave(null, null);
  }

  // 期限の状態に応じた色
  function deadlineColor(d: string): string {
    if (d < today) return '#EF5350';
    const diff = (new Date(d).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 7) return '#FFA726';
    return 'var(--text-primary)';
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 200,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          borderRadius: '16px 16px 0 0',
          padding: '12px 20px 32px',
          display: 'flex', flexDirection: 'column', gap: 12,
          maxWidth: 430, width: '100%', margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>期限を設定</div>

        {/* 日付選択 */}
        <button
          onClick={() => setShowCalendar(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10,
            border: '1px solid var(--border)', background: 'none',
            cursor: 'pointer', fontSize: 15,
            color: deadline ? deadlineColor(deadline) : 'var(--text-secondary)',
          }}
        >
          <span>📅</span>
          <span style={{ flex: 1, textAlign: 'left' }}>
            {deadline ?? '日付を選択'}
          </span>
          {deadline && (
            <button
              onClick={e => { e.stopPropagation(); setDeadline(null); setHasTime(false); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}
            >
              ×
            </button>
          )}
        </button>

        {/* 時刻設定（日付選択後に表示） */}
        {deadline && (
          <div>
            <button
              onClick={() => setHasTime(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)',
                background: hasTime ? 'var(--text-primary)' : 'none',
                color: hasTime ? '#fff' : 'var(--text-primary)',
                cursor: 'pointer', fontSize: 14,
              }}
            >
              <span>🕐</span>
              <span style={{ flex: 1, textAlign: 'left' }}>
                {hasTime ? `時刻: ${minutesToTime(deadlineMinutes)}` : '時刻を設定'}
              </span>
              <span style={{ fontSize: 12, color: hasTime ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                {hasTime ? '▲' : '▼'}
              </span>
            </button>
            {hasTime && (
              <div style={{ paddingTop: 6 }}>
                <TimeSlider
                  minutes={deadlineMinutes}
                  onChange={setDeadlineMinutes}
                  onClear={() => setHasTime(false)}
                />
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          {current.deadline && (
            <button
              onClick={handleClearDeadline}
              style={{
                flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--border)',
                background: 'none', color: '#EF5350', fontSize: 14, cursor: 'pointer',
              }}
            >
              期限を削除
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!deadline}
            style={{
              flex: 2, padding: '12px', borderRadius: 12, border: 'none',
              background: deadline ? 'var(--text-primary)' : 'var(--border)',
              color: '#fff', fontSize: 16, fontWeight: 600,
              cursor: deadline ? 'pointer' : 'default',
            }}
          >
            保存
          </button>
        </div>
      </div>

      {showCalendar && (
        <CalendarPicker
          selectedDate={deadline ?? formatDate(new Date())}
          taskDates={new Set()}
          onSelect={d => { setDeadline(d); setShowCalendar(false); }}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}
