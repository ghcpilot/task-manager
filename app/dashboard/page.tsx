'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  Calendar,
  FolderOpen,
  Play,
  Pause,
  Square,
  Sparkles,
  ArrowUpRight,
  Flame,
  CheckSquare,
  AlertCircle,
  Tag,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  getProjects,
  getTasks,
  createTask,
  updateTask,
  createTimeEntry,
  getTimeEntries,
  getRunningTimeEntry,
  stopTimeEntry,
  LocalProject,
  LocalTask
} from '@/lib/localDb';

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickProjectId, setQuickProjectId] = useState('');
  const [quickPriority, setQuickPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [activeTimerTask, setActiveTimerTask] = useState<string>('');
  const [runningEntryId, setRunningEntryId] = useState<string | null>(null);

  // Load user data from localStorage
  const loadDashboardData = () => {
    if (!user) return;
    try {
      const userProjects = getProjects(user.id);
      const userTasks = getTasks(user.id);
      setProjects(userProjects);
      setTasks(userTasks);

      if (userProjects.length > 0 && !quickProjectId) {
        setQuickProjectId(userProjects[0].id);
      }

      // Check running timer
      const running = getRunningTimeEntry(user.id);
      if (running) {
        setIsTimerRunning(true);
        setRunningEntryId(running.id);
        setActiveTimerTask(running.taskId || '');
        const elapsed = Math.floor((Date.now() - new Date(running.startTime).getTime()) / 1000);
        setTimerSeconds(Math.max(0, elapsed));
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Stats computation
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Time entries
    const entries = user ? getTimeEntries(user.id) : [];
    const totalFocusSeconds = entries.reduce((acc, curr) => acc + (curr.duration || 0), 0) + timerSeconds;
    const focusHours = (totalFocusSeconds / 3600).toFixed(1);

    return {
      totalTasks,
      completedTasks,
      activeProjects,
      completionRate,
      focusHours,
    };
  }, [tasks, projects, user, timerSeconds]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (activeFilter === 'all') return tasks;
    return tasks.filter((t) => t.status === activeFilter);
  }, [tasks, activeFilter]);

  // Quick Add Task
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !quickTitle.trim()) return;

    try {
      const newTask = createTask({
        title: quickTitle.trim(),
        priority: quickPriority,
        projectId: quickProjectId || (projects[0]?.id ?? undefined),
        userId: user.id,
      });

      setTasks((prev) => [newTask, ...prev]);
      setQuickTitle('');
      toast.success('Task added to focus list');
      loadDashboardData();
    } catch {
      toast.error('Failed to create task');
    }
  };

  // Toggle task status
  const handleToggleTaskStatus = (task: LocalTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const updated = updateTask(task.id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      toast.success(newStatus === 'completed' ? 'Task completed! 🎉' : 'Task marked as pending');
    } catch {
      toast.error('Failed to update task');
    }
  };

  // Timer controls
  const handleStartTimer = (taskId?: string) => {
    if (!user) return;
    try {
      const targetProjectId = projects[0]?.id || 'default-proj';
      const targetTaskId = taskId || activeTimerTask || undefined;

      const entry = createTimeEntry({
        description: 'Focus Session',
        projectId: targetProjectId,
        taskId: targetTaskId,
        userId: user.id,
      });

      setRunningEntryId(entry.id);
      setIsTimerRunning(true);
      if (taskId) setActiveTimerTask(taskId);
      toast.success('Focus timer started');
    } catch {
      toast.error('Failed to start timer');
    }
  };

  const handleStopTimer = () => {
    if (!runningEntryId) {
      setIsTimerRunning(false);
      setTimerSeconds(0);
      return;
    }

    try {
      stopTimeEntry(runningEntryId, new Date());
      setIsTimerRunning(false);
      setRunningEntryId(null);
      setTimerSeconds(0);
      toast.success('Focus session saved!');
    } catch {
      toast.error('Failed to save session');
    }
  };

  const formatTimerDisplay = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Hero Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 glass-card border border-white/[0.08] shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {todayStr}
              </span>
              <span className="text-xs text-zinc-400 light:text-slate-500 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Daily Focus
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white light:text-slate-900">
              Welcome back, <span className="gradient-text">{user?.name || 'Friend'}</span>
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 light:text-slate-600 max-w-xl">
              Here is your daily workflow overview. You have {stats.totalTasks - stats.completedTasks} pending tasks today.
            </p>
          </div>

          {/* Quick Header CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/projects"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-all"
            >
              Projects
            </Link>
            <Link
              href="/dashboard/tasks"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
            >
              Task Board
            </Link>
          </div>
        </div>
      </div>

      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-card rounded-2xl p-5 border border-white/[0.08] card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 light:text-slate-500">Active Projects</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white light:text-slate-900">{stats.activeProjects}</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 light:text-slate-400">Total registered in workspace</p>
        </div>

        {/* Metric 2 */}
        <div className="glass-card rounded-2xl p-5 border border-white/[0.08] card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 light:text-slate-500">Tasks Completed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white light:text-slate-900">{stats.completedTasks}</span>
            <span className="text-xs text-zinc-500">/ {stats.totalTasks}</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-400 font-medium">{stats.completionRate}% completion rate</p>
        </div>

        {/* Metric 3 */}
        <div className="glass-card rounded-2xl p-5 border border-white/[0.08] card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 light:text-slate-500">Focus Hours</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white light:text-slate-900">{stats.focusHours}h</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 light:text-slate-400">Logged on project tasks</p>
        </div>

        {/* Metric 4 */}
        <div className="glass-card rounded-2xl p-5 border border-white/[0.08] card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 light:text-slate-500">Efficiency</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white light:text-slate-900">
              {stats.completionRate >= 50 ? 'Strong' : 'Steady'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-amber-400 font-medium">Optimal flow state</p>
        </div>
      </div>

      {/* Interactive Focus Timer Bar */}
      <div className="glass-card rounded-2xl p-5 border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white light:text-slate-900">Focus Stopwatch</span>
              {isTimerRunning && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <span className="text-[11px] text-zinc-400 light:text-slate-500">
              {isTimerRunning ? 'Interval in progress' : 'Ready to start focus session'}
            </span>
          </div>
        </div>

        {/* Digital Counter Display */}
        <div className="font-mono text-2xl font-bold tracking-widest text-indigo-400 px-5 py-2 rounded-xl bg-black/40 border border-white/[0.06] shadow-inner">
          {formatTimerDisplay(timerSeconds)}
        </div>

        {/* Timer Action Buttons */}
        <div className="flex items-center gap-2">
          {!isTimerRunning ? (
            <button
              onClick={() => handleStartTimer()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Focus</span>
            </button>
          ) : (
            <button
              onClick={handleStopTimer}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop & Save</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Tasks (65%) & Right Projects / Activity (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tasks Section */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-card rounded-2xl p-6 border border-white/[0.08] space-y-5">
            {/* Header & Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white light:text-slate-900">Today's Focus & Tasks</h2>
                <span className="text-xs text-zinc-500 bg-white/[0.06] px-2 py-0.5 rounded-full font-mono">
                  {filteredTasks.length}
                </span>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/[0.06]">
                {(['all', 'pending', 'in_progress', 'completed'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setActiveFilter(filterKey)}
                    className={`
                      px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all capitalize
                      ${
                        activeFilter === filterKey
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }
                    `}
                  >
                    {filterKey.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Add Bar */}
            <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Type a task and press Enter..."
                className="flex-1 px-3.5 py-2.5 bg-white/[0.03] light:bg-slate-100 border border-white/[0.08] light:border-slate-200 rounded-xl text-xs text-zinc-200 light:text-slate-800 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
              />
              <select
                value={quickPriority}
                onChange={(e) => setQuickPriority(e.target.value as any)}
                className="px-2.5 py-2.5 bg-white/[0.04] light:bg-slate-100 border border-white/[0.08] light:border-slate-200 rounded-xl text-xs text-zinc-300 light:text-slate-800 focus:outline-none"
              >
                <option value="low" className="bg-[#121216]">Low</option>
                <option value="medium" className="bg-[#121216]">Med</option>
                <option value="high" className="bg-[#121216]">High</option>
              </select>
              <button
                type="submit"
                disabled={!quickTitle.trim()}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* Tasks List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {filteredTasks.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500">
                    <p className="text-xs">No tasks in this view.</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const isDone = task.status === 'completed';
                    return (
                      <motion.div
                        layout
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`
                          flex items-center justify-between p-3 rounded-xl border transition-all duration-150 group
                          ${
                            isDone
                              ? 'bg-white/[0.01] border-white/[0.04] text-zinc-500'
                              : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06] hover:border-white/[0.12] text-zinc-200'
                          }
                        `}
                      >
                        {/* Checkbox & Title */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <button
                            onClick={() => handleToggleTaskStatus(task)}
                            className={`
                              w-5 h-5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0
                              ${
                                isDone
                                  ? 'bg-emerald-500 border-emerald-500 text-black'
                                  : 'border-zinc-600 hover:border-indigo-400 bg-transparent'
                              }
                            `}
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <div className="min-w-0">
                            <p className={`text-xs font-medium truncate ${isDone ? 'line-through text-zinc-500' : ''}`}>
                              {task.title}
                            </p>
                          </div>
                        </div>

                        {/* Badges & Quick Action */}
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          {task.project && (
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                              style={{
                                backgroundColor: `${task.project.color}15`,
                                color: task.project.color,
                                border: `1px solid ${task.project.color}30`,
                              }}
                            >
                              {task.project.name}
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium uppercase ${
                              task.priority === 'high'
                                ? 'priority-high'
                                : task.priority === 'medium'
                                ? 'priority-medium'
                                : 'priority-low'
                            }`}
                          >
                            {task.priority}
                          </span>

                          <button
                            onClick={() => handleStartTimer(task.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Focus on this task"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column: Projects Overview & Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Projects Card */}
          <div className="glass-card rounded-2xl p-5 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-semibold text-white light:text-slate-900">Projects</h3>
              </div>
              <Link href="/dashboard/projects" className="text-[11px] text-indigo-400 hover:underline flex items-center">
                All <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 4).map((proj) => {
                const projTasks = tasks.filter((t) => t.projectId === proj.id);
                const doneCount = projTasks.filter((t) => t.status === 'completed').length;
                const percent = projTasks.length > 0 ? Math.round((doneCount / projTasks.length) * 100) : 0;

                return (
                  <div
                    key={proj.id}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: proj.color }} />
                        <span className="text-xs font-medium text-zinc-200 truncate">{proj.name}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">{percent}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%`, backgroundColor: proj.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Productivity Tip Card */}
          <div className="glass-card rounded-2xl p-5 border border-white/[0.08] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent space-y-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold">Pro Focus Tip</span>
            </div>
            <p className="text-xs text-zinc-400 light:text-slate-600 leading-relaxed">
              Use keyboard shortcut <kbd className="px-1.5 py-0.5 bg-black/40 text-zinc-200 rounded border border-white/10 text-[10px] font-mono">C</kbd> anywhere to quickly capture new tasks without breaking your current workflow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}