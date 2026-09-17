'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, Square, Clock, Calendar, 
  Trash2, Plus, Sparkles, FolderOpen, Tag,
  BarChart3, CheckCircle2, RotateCcw, Timer
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { 
  getTimeEntries, 
  createTimeEntry, 
  deleteTimeEntry, 
  getProjects, 
  getTasks, 
  LocalTimeEntry, 
  LocalProject, 
  LocalTask 
} from '@/lib/localDb';

export default function TimeTrackingPage() {
  const { user } = useAuth();
  const userId = user?.id || 'local-user';

  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [entries, setEntries] = useState<LocalTimeEntry[]>([]);
  
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [filterProjectId, setFilterProjectId] = useState<string>('all');

  const loadData = () => {
    const p = getProjects();
    const t = getTasks();
    const e = getTimeEntries(userId);
    setProjects(p);
    setTasks(t);
    setEntries(e);

    if (!selectedProjectId && p.length > 0) {
      setSelectedProjectId(p[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  // Interval for live timer
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDurationDisplay = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const handleStart = () => {
    setIsRunning(true);
    toast.success('Timer started. Stay focused! 🚀');
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const handleSaveSession = () => {
    if (seconds < 1) {
      toast.error('Session must be at least 1 second to record.');
      return;
    }

    try {
      const entry = createTimeEntry({
        userId,
        description: description.trim() || 'Focus session',
        duration: seconds,
        projectId: selectedProjectId || (projects[0]?.id || 'default'),
        taskId: selectedTaskId || undefined,
        isRunning: false,
        startTime: new Date(Date.now() - seconds * 1000).toISOString(),
      });

      setEntries(prev => [entry, ...prev]);
      setIsRunning(false);
      setSeconds(0);
      setDescription('');
      toast.success('Time entry logged successfully! 🎉');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save session');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this time entry?')) {
      deleteTimeEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Entry removed');
    }
  };

  const projectMap = useMemo(() => {
    const map: Record<string, LocalProject> = {};
    projects.forEach(p => {
      map[p.id] = p;
    });
    return map;
  }, [projects]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    let todaySecs = 0;
    let weekSecs = 0;
    let totalSecs = 0;

    entries.forEach(e => {
      const dur = e.duration || 0;
      totalSecs += dur;
      const entryDate = new Date(e.startTime || e.createdAt);
      if (entryDate >= today) {
        todaySecs += dur;
      }
      if (entryDate >= weekAgo) {
        weekSecs += dur;
      }
    });

    return {
      today: formatDurationDisplay(todaySecs),
      week: formatDurationDisplay(weekSecs),
      total: formatDurationDisplay(totalSecs),
      sessions: entries.length,
    };
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (filterProjectId === 'all') return entries;
    return entries.filter(e => e.projectId === filterProjectId);
  }, [entries, filterProjectId]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Time Tracking</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Live Tracker
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Log your hours, monitor your flow state, and optimize your focus time.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Today's Focus</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{stats.today}</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Recorded today</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Past 7 Days</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{stats.week}</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Weekly focus volume</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Logged</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{stats.total}</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">All-time tracked duration</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Focus Sessions</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{stats.sessions}</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Completed intervals</p>
          </div>
        </div>
      </div>

      {/* Interactive Stopwatch Centerpiece */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-300 mb-6">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
            <span>{isRunning ? 'Currently Tracking' : 'Timer Ready'}</span>
          </div>

          {/* Digital Numbers */}
          <div className="text-5xl sm:text-7xl font-mono font-bold tracking-tight text-white glow-primary mb-8 select-none">
            {formatTimer(seconds)}
          </div>

          {/* Session Form Inputs */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What are you currently focusing on? (e.g. Wireframing UI)"
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>

            <div>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#121216] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedTaskId}
                onChange={e => setSelectedTaskId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#121216] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer"
              >
                <option value="">Link to Task (Optional)</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {!isRunning ? (
              <Button
                variant="primary"
                onClick={handleStart}
                className="px-6 py-3 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/25"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{seconds > 0 ? 'Resume Timer' : 'Start Focus Session'}</span>
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handlePause}
                className="px-6 py-3 text-xs font-semibold rounded-xl flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                <span>Pause Timer</span>
              </Button>
            )}

            {seconds > 0 && (
              <>
                <Button
                  variant="default"
                  onClick={handleSaveSession}
                  className="px-5 py-3 text-xs font-semibold rounded-xl flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Log Session</span>
                </Button>

                <button
                  onClick={handleReset}
                  className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="glass-card rounded-3xl p-6 border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Focus History</h3>
            <p className="text-xs text-zinc-400">All recorded time sessions stored in localStorage</p>
          </div>

          {/* Filter by project */}
          <div className="flex items-center gap-2">
            <select
              value={filterProjectId}
              onChange={e => setFilterProjectId(e.target.value)}
              className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer"
            >
              <option value="all" className="bg-[#121216]">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-[#121216]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/[0.06] rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-2 text-zinc-500">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-300">No time entries recorded</h4>
            <p className="text-xs text-zinc-500 mt-0.5">
              Start your first session with the timer above to see your history!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filteredEntries.map(entry => {
              const project = projectMap[entry.projectId];
              const dateStr = entry.startTime ? new Date(entry.startTime).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Recent';

              return (
                <div key={entry.id} className="py-3.5 flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                      <Timer className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium text-white truncate">
                          {entry.description || 'Focus session'}
                        </span>
                        {project && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-zinc-400">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: project.color || '#6366f1' }}
                            />
                            <span>{project.name}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500">{dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs sm:text-sm font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      {formatDurationDisplay(entry.duration || 0)}
                    </span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}