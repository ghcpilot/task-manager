'use client';

interface Task {
  id: string;
  title: string;
  date: string;
  time?: string;
  status: 'completed' | 'in_progress' | 'pending' | 'overdue';
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  projectId?: string;
}

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateClick: (date: Date, tasksForDate: Task[]) => void;
  darkMode: boolean;
}

export default function TaskCalendar({ tasks, onTaskClick, onDateClick, darkMode }: TaskCalendarProps) {
  return (
    <div className="p-4 text-center text-gray-400">
      <p>Calendar component placeholder</p>
      <p className="text-sm mt-2">Tasks: {tasks.length}</p>
    </div>
  );
}
