import { minutesToTime } from '../../types';

interface Props {
  minutes: number;
  onChange: (minutes: number) => void;
  onClear?: () => void;
  clearLabel?: string;
}

export function TimeSlider({ minutes, onChange, onClear, clearLabel = '× 時間なし' }: Props) {
  const step = Math.round(minutes / 30);
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
        {minutesToTime(step * 30)}
      </span>
      <input
        type="range"
        min={0}
        max={47}
        value={step}
        onChange={e => onChange(Number(e.target.value) * 30)}
        style={{ flex: 1, accentColor: 'var(--text-primary)' }}
      />
    </div>
  );
}
