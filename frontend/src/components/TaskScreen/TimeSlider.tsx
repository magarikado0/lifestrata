import { useRef, useEffect } from 'react';

const ITEM_HEIGHT = 44;
const VISIBLE = 5; // must be odd

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function DrumColumn({
  values,
  selected,
  onChange,
}: {
  values: number[];
  selected: number;
  onChange: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fromUser = useRef(false);
  const dragStart = useRef<{ y: number; scrollTop: number } | null>(null);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync scroll position when value changes externally
  useEffect(() => {
    const el = ref.current;
    if (!el || fromUser.current) return;
    const idx = values.indexOf(selected);
    if (idx >= 0) el.scrollTop = idx * ITEM_HEIGHT;
  }, [selected, values]);

  const snapToNearest = () => {
    const el = ref.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
    el.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
    fromUser.current = false;
  };

  const scheduleSnap = () => {
    if (snapTimer.current) clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(snapToNearest, 120);
  };

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    fromUser.current = true;
    const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(values.length - 1, idx));
    if (values[clamped] !== undefined) onChange(values[clamped]);
  };

  const handleScrollEnd = () => {
    snapToNearest();
  };

  // Mouse wheel support for desktop
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    fromUser.current = true;
    el.scrollTop += e.deltaY;
    scheduleSnap();
  };

  // Mouse drag support for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStart.current = { y: e.clientY, scrollTop: ref.current?.scrollTop ?? 0 };
    fromUser.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart.current || !ref.current) return;
    const delta = dragStart.current.y - e.clientY;
    ref.current.scrollTop = dragStart.current.scrollTop + delta;
    const idx = Math.round(ref.current.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(values.length - 1, idx));
    if (values[clamped] !== undefined) onChange(values[clamped]);
  };

  const handleMouseUp = () => {
    if (!dragStart.current) return;
    dragStart.current = null;
    snapToNearest();
  };

  return (
    <div
      style={{ position: 'relative', width: 56 }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* selection highlight band */}
      <div
        style={{
          position: 'absolute',
          top: ITEM_HEIGHT * Math.floor(VISIBLE / 2),
          left: 4,
          right: 4,
          height: ITEM_HEIGHT,
          background: 'var(--border)',
          borderRadius: 8,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {/* top/bottom fade mask */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, var(--bg) 0%, transparent 35%, transparent 65%, var(--bg) 100%)',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />
      <div
        ref={ref}
        className="drum-scroll"
        onScroll={handleScroll}
        onScrollEnd={handleScrollEnd}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        style={{
          height: ITEM_HEIGHT * VISIBLE,
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          position: 'relative',
          zIndex: 2,
          cursor: 'grab',
        }}
      >
        <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE / 2) }} />
        {values.map(v => (
          <div
            key={v}
            style={{
              height: ITEM_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scrollSnapAlign: 'center',
              fontSize: 20,
              fontWeight: v === selected ? 700 : 400,
              color: v === selected ? 'var(--text-primary)' : 'var(--text-secondary)',
              userSelect: 'none',
              transition: 'font-weight 0.1s, color 0.1s',
            }}
          >
            {String(v).padStart(2, '0')}
          </div>
        ))}
        <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE / 2) }} />
      </div>
    </div>
  );
}

interface Props {
  minutes: number;
  onChange: (minutes: number) => void;
  onClear?: () => void;
  clearLabel?: string;
}

export function TimeSlider({ minutes: totalMinutes, onChange, onClear, clearLabel = '× 時間なし' }: Props) {
  const clamped = Math.max(0, Math.min(1439, Math.round(totalMinutes)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '4px 0' }}>
      {onClear && (
        <button
          onClick={onClear}
          style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'none',
            color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap',
            alignSelf: 'flex-start',
          }}
        >
          {clearLabel}
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <DrumColumn values={HOURS} selected={h} onChange={newH => onChange(newH * 60 + m)} />
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', paddingBottom: 2 }}>:</span>
        <DrumColumn values={MINUTES} selected={m} onChange={newM => onChange(h * 60 + newM)} />
      </div>
    </div>
  );
}
