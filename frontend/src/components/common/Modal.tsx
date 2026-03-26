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
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'flex-end', zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 430, margin: '0 auto',
          background: 'var(--bg)', borderRadius: '16px 16px 0 0',
          padding: '20px 16px 32px',
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
