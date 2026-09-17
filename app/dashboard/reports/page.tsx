'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, PieChart, CheckSquare, 
  Clock, Calendar, Target, TrendingUp, Award, Activity, Star,
  CheckCircle2, AlertCircle, ArrowUpRight, FolderOpen, Zap
} from 'lucide-react';
import { getProjects, getTasks, getTimeEntries, LocalProject, LocalTask } from '@/lib/localDb';
import { useAuth } from '@/app/contexts/AuthContext';

export default function ReportsPage() {
  const { user } = useAuth();
  const userId = user?.id || 'local-user';

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    try {
      setLoading(true);
      const allProjects = getProjects();
      const allTasks = getTasks();
      setProjects(allProjects);
      setTasks(allTasks);
    } catch (err) {
      console.error('Error loading reports data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter tasks based on timeframe
  const filteredTasks = useMemo(() => {
    if (timeframe === 'all') return tasks;
    const now = new Date();
    const days = timeframe === 'week' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - days);

    return tasks.filter(task => {
      const d = new Date(task.createdAt);
      return d >= cutoff;
    });
  }, [tasks, timeframe]);

  // Status breakdown
  const statusCounts = useMemo(() => {
    const completed = filteredTasks.filter(t => t.status === 'completed').length;
    const inProgress = filteredTasks.filter(t => t.status === 'in_progress' || (t.status as any) === 'in-progress').length;
    const pending = filteredTasks.filter(t => t.status === 'pending').length;
    return {
      completed,
      inProgress,
      pending,
      total: filteredTasks.length,
    };
  }, [filteredTasks]);

  const completionRate = statusCounts.total > 0
    ? Math.round((statusCounts.completed / statusCounts.total) * 100)
    : 0;

  const projectBreakdown = useMemo(() => {
    return projects.map(p => {
      const projTasks = filteredTasks.filter(t => t.projectId === p.id);
      const completed = projTasks.filter(t => t.status === 'completed').length;
      return {
        id: p.id,
        name: p.name,
        color: p.color || '#6366f1',
        total: projTasks.length,
        completed,
        rate: projTasks.length > 0 ? Math.round((completed / projTasks.length) * 100) : 0,
      };
    });
  }, [projects, filteredTasks]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Analytics & Reports</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Real-time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Track productivity insights, project velocity, and completion trends.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-2">
          <div className="bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl flex items-center gap-1">
            {(['week', 'month', 'all'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  timeframe === tf
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tf === 'week' ? 'Last 7 Days' : tf === 'month' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{filteredTasks.length}</h3>
            <p className="text-[11px] text-zinc-500 mt-1">In selected timeframe</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Completion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{completionRate}%</h3>
            <div className="w-full bg-white/[0.06] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Active Projects</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{projects.length}</h3>
            <p className="text-[11px] text-zinc-500 mt-1">Total workspace projects</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Productivity Score</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {Math.min(100, Math.round(completionRate * 0.7 + statusCounts.completed * 3))}%
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1">Overall velocity index</p>
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="glass-card rounded-3xl p-6 border border-white/[0.08]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white">Task Status Breakdown</h3>
              <p className="text-xs text-zinc-400">Distribution across stages</p>
            </div>
            <PieChart className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-300 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Completed
                </span>
                <span className="text-white font-semibold">
                  {statusCounts.completed} ({statusCounts.total > 0 ? Math.round((statusCounts.completed / statusCounts.total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-white/[0.04] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${statusCounts.total > 0 ? (statusCounts.completed / statusCounts.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-300 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  In Progress
                </span>
                <span className="text-white font-semibold">
                  {statusCounts.inProgress} ({statusCounts.total > 0 ? Math.round((statusCounts.inProgress / statusCounts.total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-white/[0.04] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${statusCounts.total > 0 ? (statusCounts.inProgress / statusCounts.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-300 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  To Do
                </span>
                <span className="text-white font-semibold">
                  {statusCounts.pending} ({statusCounts.total > 0 ? Math.round((statusCounts.pending / statusCounts.total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-white/[0.04] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${statusCounts.total > 0 ? (statusCounts.pending / statusCounts.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Project Breakdown */}
        <div className="glass-card rounded-3xl p-6 border border-white/[0.08]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white">Project Health</h3>
              <p className="text-xs text-zinc-400">Progress by individual project</p>
            </div>
            <BarChart2 className="w-4 h-4 text-zinc-400" />
          </div>

          {projectBreakdown.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500">
              No projects created yet.
            </div>
          ) : (
            <div className="space-y-4">
              {projectBreakdown.map(p => (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-zinc-300 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </span>
                    <span className="text-zinc-400">
                      <span className="text-white font-semibold">{p.completed}</span> / {p.total} tasks ({p.rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.04] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: p.color,
                        width: `${p.rate}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}