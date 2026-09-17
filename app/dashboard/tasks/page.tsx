'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, Plus, Filter, Clock, Calendar as CalendarIcon, 
  CheckCircle2, Circle, Search, List, Grid, Tag, AlertCircle,
  Clock4, Sparkles, ArrowUpDown, ChevronDown, Check, Trash2, Edit3,
  ExternalLink
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import TaskModal from '@/app/components/ui/TaskModal';
import { getTasks, updateTask, deleteTask, getProjects, LocalTask, LocalProject } from '@/lib/localDb';

export default function TasksPage() {
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed' | 'overdue'>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'title' | 'priority' | 'status'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const loadData = () => {
    try {
      setLoading(true);
      const allTasks = getTasks();
      const allProjects = getProjects();
      setTasks(allTasks);
      setProjects(allProjects);
    } catch (err) {
      console.error('Error loading tasks:', err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const projectMap = useMemo(() => {
    const map: Record<string, LocalProject> = {};
    projects.forEach(p => {
      map[p.id] = p;
    });
    return map;
  }, [projects]);

  const handleToggleStatus = (task: LocalTask) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updated = updateTask(task.id, {
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
    });
    if (updated) {
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      toast.success(nextStatus === 'completed' ? 'Task marked complete! 🎉' : 'Task reopened');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        if (filter === 'all') return true;
        if (filter === 'in-progress') {
          return task.status === 'in_progress' || (task.status as any) === 'in-progress';
        }
        if (filter === 'overdue') {
          if (!task.dueDate || task.status === 'completed') return false;
          return new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
        }
        return task.status === filter;
      })
      .filter(task => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const projectName = (task.projectId ? projectMap[task.projectId]?.name : '') || '';
        return (
          task.title.toLowerCase().includes(q) ||
          (task.description && task.description.toLowerCase().includes(q)) ||
          projectName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'title') {
          diff = a.title.localeCompare(b.title);
        } else if (sortBy === 'dueDate') {
          const timeA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          const timeB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          diff = timeA - timeB;
        } else if (sortBy === 'priority') {
          const priorityScore: Record<string, number> = { high: 3, medium: 2, low: 1 };
          diff = (priorityScore[b.priority || 'medium'] || 0) - (priorityScore[a.priority || 'medium'] || 0);
        } else if (sortBy === 'status') {
          diff = a.status.localeCompare(b.status);
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [tasks, filter, searchQuery, sortBy, sortOrder, projectMap]);

  // Counts
  const counts = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return {
      all: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress' || (t.status as any) === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.dueDate && t.status !== 'completed' && new Date(t.dueDate).getTime() < today).length,
    };
  }, [tasks]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(d);
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">Low</span>;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Tasks</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              {tasks.length} total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Organize, prioritize, and track all your work items in one place.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="glass-card rounded-2xl p-3 sm:p-4 border border-white/[0.08] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'in-progress', label: 'In Progress', count: counts.inProgress },
            { id: 'pending', label: 'To Do', count: counts.pending },
            { id: 'completed', label: 'Completed', count: counts.completed },
            { id: 'overdue', label: 'Overdue', count: counts.overdue },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filter === tab.id ? 'bg-indigo-800/60 text-white' : 'bg-white/[0.06] text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search, Sort, View Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer appearance-none pr-7"
            >
              <option value="dueDate" className="bg-[#121216] text-white">Sort: Due Date</option>
              <option value="priority" className="bg-[#121216] text-white">Sort: Priority</option>
              <option value="title" className="bg-[#121216] text-white">Sort: Title</option>
              <option value="status" className="bg-[#121216] text-white">Sort: Status</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/[0.04] p-0.5 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Task List / Grid Display */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/[0.06]">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-indigo-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No tasks found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No tasks matched your search. Try changing keywords or resetting the filter.'
              : filter !== 'all'
              ? `No ${filter} tasks right now. Great job keeping on top of your work!`
              : 'You have no tasks yet. Create your first task to start organizing!'}
          </p>
          <div className="mt-5">
            <Button
              variant="primary"
              onClick={() => setIsAddingTask(true)}
              className="text-xs px-4 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Task
            </Button>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-2">
          {filteredTasks.map(task => {
            const project = task.projectId ? projectMap[task.projectId] : undefined;
            const isCompleted = task.status === 'completed';
            const isOverdue =
              task.dueDate &&
              !isCompleted &&
              new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card rounded-xl p-3 sm:p-4 border transition-all flex items-center justify-between gap-3 group hover:border-indigo-500/30 ${
                  isCompleted ? 'opacity-65 border-white/[0.04] bg-white/[0.01]' : 'border-white/[0.08]'
                }`}
              >
                {/* Left: Complete Checkbox + Title + Description */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-zinc-600 hover:border-indigo-400 bg-white/[0.02]'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/tasks/${task.id}`}
                        className={`text-xs sm:text-sm font-medium hover:text-indigo-400 transition-colors truncate ${
                          isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'
                        }`}
                      >
                        {task.title}
                      </Link>
                      {getPriorityBadge(task.priority)}
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">{task.description}</p>
                    )}
                  </div>
                </div>

                {/* Right: Project Pill + Due Date + Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {project && (
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-zinc-400">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: project.color || '#6366f1' }}
                      />
                      <span className="truncate max-w-[120px]">{project.name}</span>
                    </div>
                  )}

                  {task.dueDate && (
                    <div
                      className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg ${
                        isOverdue
                          ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                          : isCompleted
                          ? 'text-zinc-500'
                          : 'text-zinc-400 bg-white/[0.03]'
                      }`}
                    >
                      <CalendarIcon className="w-3 h-3" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="View Details"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => {
            const project = task.projectId ? projectMap[task.projectId] : undefined;
            const isCompleted = task.status === 'completed';
            const isOverdue =
              task.dueDate &&
              !isCompleted &&
              new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`glass-card rounded-2xl p-5 border flex flex-col justify-between transition-all hover:border-indigo-500/30 group ${
                  isCompleted ? 'opacity-65 border-white/[0.04]' : 'border-white/[0.08]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {project ? (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-zinc-300">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: project.color || '#6366f1' }}
                        />
                        <span className="truncate max-w-[100px]">{project.name}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-zinc-500">General</span>
                    )}

                    <div className="flex items-center gap-1.5">
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-zinc-600 hover:border-indigo-400 bg-white/[0.02]'
                      }`}
                    >
                      {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    <div>
                      <Link
                        href={`/dashboard/tasks/${task.id}`}
                        className={`text-sm font-semibold hover:text-indigo-400 transition-colors line-clamp-2 ${
                          isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'
                        }`}
                      >
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{task.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  {task.dueDate ? (
                    <div
                      className={`flex items-center gap-1 text-[11px] font-medium ${
                        isOverdue ? 'text-rose-400' : 'text-zinc-400'
                      }`}
                    >
                      <CalendarIcon className="w-3 h-3" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-zinc-600">No due date</span>
                  )}

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded-lg hover:bg-white/[0.04] transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Task Modal */}
      {isAddingTask && (
        <TaskModal
          isOpen={true}
          onClose={() => setIsAddingTask(false)}
          onAddTask={() => {
            setIsAddingTask(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}