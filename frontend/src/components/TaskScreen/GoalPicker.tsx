import { type Goal } from '../../types';

interface FlatGoal {
  id: number;
  text: string;
  depth: number;
}

function flatten(goals: Goal[], depth = 0): FlatGoal[] {
  const result: FlatGoal[] = [];
  for (const g of goals) {
    result.push({ id: g.id, text: g.text, depth });
    if (g.children.length > 0) {
      result.push(...flatten(g.children, depth + 1));
    }
  }
  return result;
}

interface Props {
  goals: Goal[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onClose: () => void;
}

export function GoalPicker({ goals, selectedId, onSelect, onClose }: Props) {
  const flat = flatten(goals);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'flex-end', zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 430, margin: '0 auto',
          background: 'var(--bg)', borderRadius: '16px 16px 0 0',
          maxHeight: '60dvh', display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: '14px 16px 10px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
            ゴールを選択
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}
          >
            ×
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '8px 0' }}>
          {selectedId !== null && (
            <button
              onClick={() => { onSelect(null); onClose(); }}
              style={rowStyle(false)}
            >
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>— 割り当てなし</span>
            </button>
          )}
          {flat.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              ゴールがありません
            </div>
          )}
          {flat.map(g => {
            const isSelected = g.id === selectedId;
            return (
              <button
                key={g.id}
                onClick={() => { onSelect(g.id); onClose(); }}
                style={{ ...rowStyle(isSelected), paddingLeft: 16 + g.depth * 16 }}
              >
                {g.depth > 0 && (
                  <span style={{ color: 'var(--text-muted)', marginRight: 4, fontSize: 12 }}>{'└'}</span>
                )}
                <span style={{ fontSize: 14, color: isSelected ? '#fff' : 'var(--text-primary)', flex: 1, textAlign: 'left' }}>
                  {g.text}
                </span>
                {isSelected && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5 6 4.5 9 10.5 3"/></svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function rowStyle(isSelected: boolean): React.CSSProperties {
  return {
    width: '100%', display: 'flex', alignItems: 'center', gap: 4,
    padding: '11px 16px', border: 'none', cursor: 'pointer',
    background: isSelected ? 'var(--text-primary)' : 'none',
    transition: 'background 0.1s',
  };
}
