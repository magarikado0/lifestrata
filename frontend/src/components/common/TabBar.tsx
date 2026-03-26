type Tab = 'tasks' | 'goals';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

function ChecklistIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 9l2 2 4-4" />
      <line x1="7" y1="14" x2="17" y2="14" />
    </svg>
  );
}

function TreeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" />
      <line x1="12" y1="6" x2="12" y2="11" />
      <path d="M12 11 L5 16" />
      <path d="M12 11 L19 16" />
    </svg>
  );
}

const TABS: { key: Tab; label: string; Icon: typeof ChecklistIcon }[] = [
  { key: 'tasks', label: 'タスク', Icon: ChecklistIcon },
  { key: 'goals', label: '目標ツリー', Icon: TreeIcon },
];

export function TabBar({ active, onChange }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        display: 'flex',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 100,
      }}
    >
      {TABS.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              flex: 1,
              padding: '10px 0 12px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              letterSpacing: '0.3px',
              transition: 'color 0.15s',
            }}
          >
            <Icon active={isActive} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
