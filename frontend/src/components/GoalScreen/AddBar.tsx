import { useState } from 'react';

interface Props {
  onAdd: (text: string) => void;
}

export function AddBar({ onAdd }: Props) {
  const [text, setText] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  }

  return (
    <div style={{ borderTop: '1px solid var(--border)', padding: '8px 16px', background: 'var(--bg)' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="ルートゴールを追加..."
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
    </div>
  );
}
