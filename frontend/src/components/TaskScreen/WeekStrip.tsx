import { useRef, useLayoutEffect, useState } from 'react';
import { formatDate } from '../../types';
import { CalendarPicker } from './CalendarPicker';

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];

function getWeekDates(baseDate: Date): Date[] {
  const day = baseDate.getDay();
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
  onJumpToDate: (date: string) => void;
}

export function WeekStrip({ selectedDate, weekOffset, taskDates, onSelectDate, onWeekChange, onToday, onJumpToDate }: Props) {
  const today = new Date();
  const [showCalendar, setShowCalendar] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ignoreScrollRef = useRef(false);

  // 中央（インデックス1）にスクロール位置をリセット（アニメなし）
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    ignoreScrollRef.current = true;
    el.style.scrollBehavior = 'auto';
    el.scrollLeft = el.clientWidth;
    requestAnimationFrame(() => { ignoreScrollRef.current = false; });
  }, [weekOffset]);

  function handleScroll() {
    if (ignoreScrollRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const pos = el.scrollLeft;
      if (pos < w * 0.5) onWeekChange(-1);
      else if (pos > w * 1.5) onWeekChange(1);
    }, 80);
  }

  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + weekOffset * 7);
  const monthLabel = baseDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

  function renderWeek(relOffset: number) {
    const base = new Date(today);
    base.setDate(today.getDate() + (weekOffset + relOffset) * 7);
    const days = getWeekDates(base);
    return (
      <div
        key={relOffset}
        style={{ flex: 'none', width: '100%', display: 'flex', gap: 4, scrollSnapAlign: 'start' }}
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
    );
  }

  return (
    <>
      <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '8px 12px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <button onClick={() => onWeekChange(-1)} style={navBtnStyle}>‹</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowCalendar(true)}
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
            >
              {monthLabel}
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={onToday}
                style={{ fontSize: 11, color: 'var(--amber)', background: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 10, border: '1px solid var(--amber)' }}
              >
                今日
              </button>
            )}
          </div>
          <button onClick={() => onWeekChange(1)} style={navBtnStyle}>›</button>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: 'flex',
            overflowX: 'scroll',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 8,
          } as React.CSSProperties}
        >
          {renderWeek(-1)}
          {renderWeek(0)}
          {renderWeek(1)}
        </div>
      </div>

      {showCalendar && (
        <CalendarPicker
          selectedDate={selectedDate}
          taskDates={taskDates}
          onSelect={onJumpToDate}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', fontSize: 20,
  color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 8px',
};
