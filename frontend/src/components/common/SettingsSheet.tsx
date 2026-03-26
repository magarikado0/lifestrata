import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  email: string;
  onClose: () => void;
}

export function SettingsSheet({ email, onClose }: Props) {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      setErrorMsg('パスワードが一致しません');
      setStatus('error');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('6文字以上で入力してください');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
    } else {
      setStatus('success');
      setNewPassword('');
      setConfirm('');
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: 430, margin: '0 auto', background: 'var(--bg)', borderRadius: '16px 16px 0 0', padding: '20px 16px 40px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ハンドル */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />

        {/* メールアドレス */}
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>{email}</div>

        {/* パスワード変更 */}
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>パスワード変更</div>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="password"
            placeholder="新しいパスワード（6文字以上）"
            value={newPassword}
            onChange={e => { setNewPassword(e.target.value); setStatus('idle'); }}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="確認"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setStatus('idle'); }}
            style={inputStyle}
          />
          {status === 'error' && (
            <div style={{ fontSize: 12, color: '#EF5350' }}>{errorMsg}</div>
          )}
          {status === 'success' && (
            <div style={{ fontSize: 12, color: '#66BB6A' }}>変更しました</div>
          )}
          <button
            type="submit"
            disabled={status === 'loading' || !newPassword || !confirm}
            style={{
              padding: '11px', borderRadius: 10, border: 'none',
              background: newPassword && confirm ? 'var(--text-primary)' : 'var(--border)',
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: newPassword && confirm ? 'pointer' : 'default',
              marginTop: 2,
            }}
          >
            {status === 'loading' ? '...' : '変更する'}
          </button>
        </form>

        {/* ログアウト */}
        <button
          onClick={handleSignOut}
          style={{
            width: '100%', marginTop: 24, padding: '11px', borderRadius: 10,
            border: '1px solid var(--border)', background: 'none',
            color: '#EF5350', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '11px 12px', borderRadius: 10,
  border: '1px solid var(--border)', background: '#fff',
  fontSize: 14, outline: 'none',
};
