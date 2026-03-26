import { useState, useMemo } from 'react';
import { type Task, type Goal, formatDate } from '../../types';
import { WeekStrip } from './WeekStrip';
import { TaskList } from './TaskList';
import { AddBar } from './AddBar';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <WeekStrip
        selectedDate={selectedDate}
        weekOffset={weekOffset}
        taskDates={taskDates}
        onSelectDate={handleSelectDate}
        onWeekChange={handleWeekChange}
        onToday={handleToday}
      />
      <TaskList
        tasks={dayTasks}
        filter="all"
        onToggle={onToggle}
        onDelete={onDelete}
      />
      <AddBar goals={goals} onAdd={(text, hasTime, minutes, goalId) => onAdd(text, selectedDate, hasTime, minutes, goalId)} />
    </div>
  );
}
