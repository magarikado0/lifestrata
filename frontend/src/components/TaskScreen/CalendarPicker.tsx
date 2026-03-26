import { useState } from 'react';
import { formatDate } from '../../types';

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const first = new Date(year, month, 1);
  // Monday-based offset: Mon=0 ... Sun=6
  const startOffset = (first.getDay() + 6) % 7;
  // Fill leading blanks with null placeholders via offset
  for (let i = 0; i < startOffset; i++) {
    days.push(null as unknown as Date);
  }
  const total = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= total; d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

interface Props {
  selectedDate: string;
  taskDates: Set<string>;
  onSelect: (date: string) => void;
  onClose: () => void;
}

export function CalendarPicker({ selectedDate, taskDates, onSelect, onClose }: Props) {
  const initial = new Date(selectedDate);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const today = formatDate(new Date());
  const days = getDaysInMonth(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const monthLabel = new Date(viewYear, viewMonth, 1)
    .toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'flex-start', zIndex: 50 }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: 430, margin: '0 auto', background: 'var(--bg)', borderRadius: '0 0 16px 16px', padding: '16px 16px 20px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={prevMonth} style={navBtn}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4L6 9l5 5" />
            </svg>
          </button>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{monthLabel}</span>
          <button onClick={nextMonth} style={navBtn}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 4l5 5-5 5" />
            </svg>
          </button>
        </div>

        {/* Day labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {DAY_LABELS.map((d, i) => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 11, fontWeight: 500, padding: '2px 0',
              color: i === 5 ? '#42A5F5' : i === 6 ? '#EF5350' : 'var(--text-muted)',
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 0' }}>
          {days.map((d, i) => {
            if (!d) return <div key={`blank-${i}`} />;
            const dateStr = formatDate(d);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === today;
            const hasTask = taskDates.has(dateStr);
            const col = i % 7; // 0=Mon,...,5=Sat,6=Sun
            return (
              <button
                key={dateStr}
                onClick={() => { onSelect(dateStr); onClose(); }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 2,
                  padding: '5px 0', border: 'none', cursor: 'pointer', borderRadius: 8,
                  background: isSelected ? 'var(--text-primary)' : 'none',
                }}
              >
                <span style={{
                  fontSize: 14,
                  fontWeight: isToday ? 700 : 400,
                  color: isSelected ? '#fff'
                    : isToday ? 'var(--amber)'
                    : col === 5 ? '#42A5F5'
                    : col === 6 ? '#EF5350'
                    : 'var(--text-primary)',
                }}>
                  {d.getDate()}
                </span>
                <span style={{
                  width: 3, height: 3, borderRadius: '50%',
                  background: hasTask ? (isSelected ? '#fff' : 'var(--amber)') : 'transparent',
                }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-secondary)', padding: 4, display: 'flex',
  alignItems: 'center', borderRadius: 8,
};
