import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } =
        mode === 'login'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 24px', background: 'var(--bg)',
    }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          LifeStrata
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          タスクと目標を一つに
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="パスワード（6文字以上）"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          style={inputStyle}
        />
        {error && (
          <div style={{ fontSize: 13, color: '#EF5350', padding: '0 4px' }}>{error}</div>
        )}
        <button type="submit" disabled={loading} style={submitStyle}>
          {loading ? '...' : mode === 'login' ? 'ログイン' : 'アカウント作成'}
        </button>
      </form>

      <button
        onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); }}
        style={{ marginTop: 20, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}
      >
        {mode === 'login' ? 'アカウントを作成する →' : 'ログインに戻る →'}
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '12px 14px', borderRadius: 12,
  border: '1px solid var(--border)', background: '#fff',
  fontSize: 15, outline: 'none', width: '100%',
};

const submitStyle: React.CSSProperties = {
  padding: '13px', borderRadius: 12, border: 'none',
  background: 'var(--text-primary)', color: '#fff',
  fontSize: 15, fontWeight: 600, cursor: 'pointer',
  marginTop: 4,
};
