'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter,
  Calendar as CalendarIcon,
  Clock,
  X,
  Save,
  Sparkles,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { getProjects, getTasks, createTask, LocalProject, LocalTask } from '@/lib/localDb';

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    projectId: ''
  });

  const loadData = () => {
    try {
      setLoading(true);
      const allProjects = getProjects();
      const allTasks = getTasks();
      setProjects(allProjects);
      setTasks(allTasks);

      if (!newTask.projectId && allProjects.length > 0) {
        setNewTask(prev => ({ ...prev, projectId: allProjects[0].id }));
      }
    } catch (err) {
      console.error('Error loading calendar data:', err);
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calendar dates generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = new Date(year, month - 1, 0);
  const daysInPrevMonth = prevMonth.getDate();

  const calendarDays = useMemo(() => {
    const days = [];
    // Previous month padding
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
        fullDate: new Date(year, month - 1, daysInPrevMonth - i)
      });
    }
    // Current month days
    for (let date = 1; date <= daysInMonth; date++) {
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isCurrentMonth && date === todayDate,
        fullDate: new Date(year, month, date)
      });
    }
    // Next month padding
    const remainingDays = 42 - days.length;
    for (let date = 1; date <= remainingDays; date++) {
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        fullDate: new Date(year, month + 1, date)
      });
    }
    return days;
  }, [year, month, firstDayWeekday, daysInMonth, daysInPrevMonth, isCurrentMonth, todayDate]);

  const projectMap = useMemo(() => {
    const map: Record<string, LocalProject> = {};
    projects.forEach(p => {
      map[p.id] = p;
    });
    return map;
  }, [projects]);

  const filteredTasks = useMemo(() => {
    if (selectedProject === 'all') return tasks;
    return tasks.filter(t => t.projectId === selectedProject);
  }, [tasks, selectedProject]);

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredTasks.filter(task => {
      if (!task.dueDate) return false;
      const tDate = task.dueDate.split('T')[0];
      return tDate === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const nextDate = new Date(prev);
      if (direction === 'prev') {
        nextDate.setMonth(prev.getMonth() - 1);
      } else {
        nextDate.setMonth(prev.getMonth() + 1);
      }
      return nextDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (day: any) => {
    const dateStr = day.fullDate.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    if (!newTask.projectId && projects.length > 0) {
      setNewTask(prev => ({ ...prev, projectId: projects[0].id }));
    }
    setShowAddTask(true);
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    if (!newTask.projectId) {
      toast.error('Please select a project');
      return;
    }

    try {
      createTask({
        title: newTask.title.trim(),
        description: newTask.description.trim() || undefined,
        status: 'pending',
        priority: newTask.priority,
        dueDate: selectedDate,
        projectId: newTask.projectId,
      });

      toast.success('Task scheduled on calendar!');
      setShowAddTask(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        projectId: projects.length > 0 ? projects[0].id : '',
      });
      loadData();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to schedule task');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {monthNames[month]} <span className="text-indigo-400">{year}</span>
            </h1>
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] p-0.5 rounded-xl">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Click any day to schedule a task or preview your deadlines.
          </p>
        </div>

        {/* Project Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer appearance-none"
            >
              <option value="all" className="bg-[#121216] text-white">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id} className="bg-[#121216] text-white">
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setShowAddTask(true);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </Button>
        </div>
      </div>

      {/* Calendar Board Card */}
      <div className="glass-card rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden">
        {/* Weekday labels */}
        <div className="grid grid-cols-7 border-b border-white/[0.06] bg-white/[0.02]">
          {dayNames.map(day => (
            <div key={day} className="py-3 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{day}</span>
            </div>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-white/[0.05]">
          {calendarDays.map((day, idx) => {
            const dayTasks = getTasksForDate(day.fullDate);
            return (
              <div
                key={idx}
                onClick={() => handleDateClick(day)}
                className={`min-h-[105px] sm:min-h-[125px] p-2 sm:p-2.5 transition-colors cursor-pointer group hover:bg-white/[0.03] flex flex-col justify-between ${
                  !day.isCurrentMonth ? 'opacity-30 bg-black/20' : ''
                } ${day.isToday ? 'bg-indigo-500/[0.06]' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full transition-all ${
                        day.isToday
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                          : day.isCurrentMonth
                          ? 'text-zinc-200 group-hover:text-white'
                          : 'text-zinc-600'
                      }`}
                    >
                      {day.date}
                    </span>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDateClick(day);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white p-1 rounded-md transition-opacity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Task Chips */}
                  <div className="space-y-1 overflow-y-auto max-h-[75px] scrollbar-none">
                    {dayTasks.slice(0, 3).map(task => {
                      const proj = task.projectId ? projectMap[task.projectId] : undefined;
                      const color = proj?.color || '#6366f1';
                      const isCompleted = task.status === 'completed';

                      return (
                        <div
                          key={task.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium truncate flex items-center gap-1 border transition-all ${
                            isCompleted ? 'line-through opacity-50' : ''
                          }`}
                          style={{
                            backgroundColor: `${color}18`,
                            borderColor: `${color}35`,
                            color: color,
                          }}
                          title={task.title}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="truncate">{task.title}</span>
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <div className="text-[10px] text-zinc-400 font-medium px-1">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTask && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-card rounded-3xl border border-white/[0.1] p-6 w-full max-w-md shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Schedule Task</h3>
                    <p className="text-[11px] text-zinc-400">Date: {selectedDate}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Task Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    placeholder="e.g. Design sprint review"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Description (Optional)</label>
                  <textarea
                    value={newTask.description}
                    onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 resize-none transition-colors"
                    rows={2}
                    placeholder="Add any extra details or instructions..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Project</label>
                    <select
                      value={newTask.projectId}
                      onChange={e => setNewTask(prev => ({ ...prev, projectId: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#121216] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={e => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-[#121216] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddTask(false)}
                    className="px-4 py-2 text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleAddTask}
                    className="px-4 py-2 text-xs font-semibold rounded-xl"
                  >
                    Schedule Task
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}