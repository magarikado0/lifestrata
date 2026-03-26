import { type Task, getSection, type TimeSection } from '../../types';
import { TaskItem } from './TaskItem';

const SECTION_LABELS: Record<TimeSection, string> = {
  morning: '午前',
  afternoon: '午後',
  evening: '夜',
  notime: '時間なし',
};

const SECTION_COLORS: Record<TimeSection, string> = {
  morning: '#F9A825',
  afternoon: '#42A5F5',
  evening: '#AB47BC',
  notime: '#bbb',
};

const SECTION_ORDER: TimeSection[] = ['morning', 'afternoon', 'evening', 'notime'];

type SectionFilter = 'all' | TimeSection;

interface Props {
  tasks: Task[];
  filter: SectionFilter;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TaskList({ tasks, filter, onToggle, onDelete }: Props) {
  const active = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  function renderSection(section: TimeSection, items: Task[]) {
    const filtered = items.filter(t => getSection(t) === section);
    if (filtered.length === 0) return null;
    const sorted = [...filtered].sort((a, b) => (a.minutes ?? 0) - (b.minutes ?? 0));
    return (
      <div key={section}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: SECTION_COLORS[section],
          padding: '10px 0 2px', letterSpacing: '0.5px',
        }}>
          {SECTION_LABELS[section]}
        </div>
        {sorted.map(t => (
          <TaskItem key={t.id} task={t} onToggle={() => onToggle(t.id)} onDelete={() => onDelete(t.id)} />
        ))}
      </div>
    );
  }

  const sections = filter === 'all' ? SECTION_ORDER : [filter as TimeSection];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
      {sections.map(s => renderSection(s, active))}
      {done.length > 0 && (filter === 'all' || done.some(t => getSection(t) === filter)) && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '10px 0 2px' }}>
            完了
          </div>
          {done
            .filter(t => filter === 'all' || getSection(t) === filter)
            .map(t => (
              <TaskItem key={t.id} task={t} onToggle={() => onToggle(t.id)} onDelete={() => onDelete(t.id)} />
            ))}
        </div>
      )}
      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 14 }}>
          タスクなし
        </div>
      )}
    </div>
  );
}
