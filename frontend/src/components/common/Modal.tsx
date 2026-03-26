import { useEffect, useRef } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export function Modal({ title, onClose, onSubmit }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (text) {
      onSubmit(text);
      onClose();
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: '0 16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 400,
          background: 'var(--bg)', borderRadius: 16,
          padding: '20px 16px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
          {title}
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 10,
              border: '1px solid var(--border)', background: '#fff',
              fontSize: 15, outline: 'none',
            }}
            placeholder="テキストを入力..."
          />
          <button
            type="submit"
            style={{
              padding: '10px 16px', borderRadius: 10, border: 'none',
              background: 'var(--text-primary)', color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            追加
          </button>
        </form>
      </div>
    </div>
  );
}
