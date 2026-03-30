import { minutesToTime } from '../../types';

interface Props {
  minutes: number;
  onChange: (minutes: number) => void;
  onClear?: () => void;
  clearLabel?: string;
}

export function TimeSlider({ minutes, onChange, onClear, clearLabel = '× 時間なし' }: Props) {
  const clampedMinutes = Math.max(0, Math.min(1439, Math.round(minutes)));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
      {onClear && (
        <button
          onClick={onClear}
          style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'none',
            color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          {clearLabel}
        </button>
      )}
      <span style={{ fontSize: 13, fontWeight: 600, minWidth: 40, color: 'var(--text-primary)' }}>
        {minutesToTime(clampedMinutes)}
      </span>
      <input
        type="range"
        min={0}
        max={1439}
        step={1}
        value={clampedMinutes}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: 'var(--text-primary)' }}
      />
    </div>
  );
}
