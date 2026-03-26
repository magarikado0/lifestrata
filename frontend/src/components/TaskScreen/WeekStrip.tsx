import { useRef } from 'react';
import { formatDate } from '../../types';

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];

function getWeekDates(baseDate: Date): Date[] {
  const day = baseDate.getDay(); // 0=Sun
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

interface Props {
  selectedDate: string;
  weekOffset: number;
  taskDates: Set<string>;
  onSelectDate: (date: string) => void;
  onWeekChange: (delta: number) => void;
  onToday: () => void;
}

export function WeekStrip({ selectedDate, weekOffset, taskDates, onSelectDate, onWeekChange, onToday }: Props) {
  const today = new Date();
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + weekOffset * 7);
  const days = getWeekDates(baseDate);

  const startX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) onWeekChange(dx < 0 ? 1 : -1);
    startX.current = null;
  }

  return (
    <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '8px 12px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button onClick={() => onWeekChange(-1)} style={navBtnStyle}>‹</button>
        <button
          onClick={onToday}
          style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px' }}
        >
          今日
        </button>
        <button onClick={() => onWeekChange(1)} style={navBtnStyle}>›</button>
      </div>
      <div
        style={{ display: 'flex', gap: 4, paddingBottom: 8 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {days.map((d, i) => {
          const dateStr = formatDate(d);
          const isToday = formatDate(today) === dateStr;
          const isSelected = selectedDate === dateStr;
          const hasTask = taskDates.has(dateStr);
          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 2, padding: '6px 0 8px', borderRadius: 10, border: 'none',
                background: isSelected ? 'var(--text-primary)' : 'none',
                cursor: 'pointer',
                color: isSelected ? '#fff' : isToday ? 'var(--amber)' : i === 5 ? '#42A5F5' : i === 6 ? '#EF5350' : 'var(--text-primary)',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 500 }}>{DAY_LABELS[i]}</span>
              <span style={{ fontSize: 16, fontWeight: isToday ? 700 : 400 }}>{d.getDate()}</span>
              <span style={{
                width: 4, height: 4, borderRadius: '50%',
                background: hasTask ? (isSelected ? '#fff' : 'var(--amber)') : 'transparent',
              }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', fontSize: 20,
  color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 8px',
};
