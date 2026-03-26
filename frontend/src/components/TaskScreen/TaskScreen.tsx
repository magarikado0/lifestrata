import { useState, useMemo } from 'react';
import { type Task, type Goal, formatDate } from '../../types';
import { WeekStrip } from './WeekStrip';
import { TaskList } from './TaskList';
import { AddModal } from './AddModal';

interface Props {
  tasks: Task[];
  goals: Goal[];
  onAdd: (text: string, date: string, hasTime: boolean, minutes: number | null, goalId: number | null) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TaskScreen({ tasks, goals, onAdd, onToggle, onDelete }: Props) {
  const today = formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  const taskDates = useMemo(() => new Set(tasks.map(t => t.date)), [tasks]);
  const dayTasks = useMemo(() => tasks.filter(t => t.date === selectedDate), [tasks, selectedDate]);

  function handleSelectDate(date: string) {
    setSelectedDate(date);
  }

  function handleToday() {
    setSelectedDate(today);
    setWeekOffset(0);
  }

  function handleWeekChange(delta: number) {
    setWeekOffset(o => o + delta);
  }

  function handleJumpToDate(date: string) {
    setSelectedDate(date);
    const todayDate = new Date(today);
    const targetDate = new Date(date);
    const todayMonday = new Date(todayDate);
    todayMonday.setDate(todayDate.getDate() - ((todayDate.getDay() + 6) % 7));
    const targetMonday = new Date(targetDate);
    targetMonday.setDate(targetDate.getDate() - ((targetDate.getDay() + 6) % 7));
    const diff = Math.round((targetMonday.getTime() - todayMonday.getTime()) / (7 * 24 * 60 * 60 * 1000));
    setWeekOffset(diff);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <WeekStrip
        selectedDate={selectedDate}
        weekOffset={weekOffset}
        taskDates={taskDates}
        onSelectDate={handleSelectDate}
        onWeekChange={handleWeekChange}
        onToday={handleToday}
        onJumpToDate={handleJumpToDate}
      />
      <TaskList
        tasks={dayTasks}
        filter="all"
        onToggle={onToggle}
        onDelete={onDelete}
      />

      <button
        onClick={() => setShowAddModal(true)}
        style={{
          position: 'absolute', bottom: 24, right: 20,
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--text-primary)', color: '#fff',
          border: 'none', fontSize: 26, cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        +
      </button>

      {showAddModal && (
        <AddModal
          goals={goals}
          selectedDate={selectedDate}
          onAdd={(text, hasTime, minutes, goalId) => {
            onAdd(text, selectedDate, hasTime, minutes, goalId);
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
