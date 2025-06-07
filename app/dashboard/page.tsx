'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Clock, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Calendar,
  Bolt,
  Star,
  ArrowRight,
  Timer,
  Zap,
  Award,
  Activity,
  Coffee,
  Brain,
  Play,
  Pause,
  Square,
  X,
  CalendarDays,
  AlertCircle,
  FolderPlus
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { authenticatedFetch } from '@/lib/auth';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import WelcomeTour from '@/app/components/WelcomeTour';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  projectId: string;
  projectName?: string;
}

interface QuickStats {
  todayTasks: number;
  completedToday: number;
  timeTrackedToday: number;
  activeProjects: number;
  dueSoon: number;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const getMotivationalQuote = () => {
  const quotes = [
    "Focus on being productive instead of busy.",
    "The way to get started is to quit talking and begin doing.",
    "Don't watch the clock; do what it does. Keep going.",
    "The future depends on what you do today.",
    "Success is the sum of small efforts repeated day in and day out.",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export default function DashboardPage() {
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskDueDate, setQuickTaskDueDate] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showPremiumTeaser, setShowPremiumTeaser] = useState(false);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  
  // Timer states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Show welcome tour for new users
  useEffect(() => {
    if (user) {
      const hasCompletedTour = localStorage.getItem('welcomeTourCompleted');
      if (!hasCompletedTour) {
        setTimeout(() => setShowWelcomeTour(true), 2000); // Show after 2 seconds
      }
    }
  }, [user]);

  // Show premium teaser after 3 days of usage
  useEffect(() => {
    if (user) {
      const checkPremiumTeaser = () => {
        const createdAtTimestamp = user.profile?.createdAt;
        const userCreated = createdAtTimestamp?.toDate ? createdAtTimestamp.toDate() : new Date();
        const daysSinceJoined = Math.floor((Date.now() - userCreated.getTime()) / (1000 * 60 * 60 * 24));
        const hasSeenTeaser = localStorage.getItem('premiumTeaserSeen');
        const hasCompletedTour = localStorage.getItem('welcomeTourCompleted');
        
        if (daysSinceJoined >= 3 && !hasSeenTeaser && hasCompletedTour) {
          setTimeout(() => setShowPremiumTeaser(true), 5000); // Show after 5 seconds
        }
      };
      
      checkPremiumTeaser();
    }
  }, [user]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && !isPaused && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime());
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, isPaused, startTime]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch real data from API
      try {
        // Fetch recent tasks and projects in parallel
        const [recentTasksResponse, projectsResponse] = await Promise.all([
          authenticatedFetch('/api/tasks/recent'),
          authenticatedFetch('/api/projects')
        ]);
        
        if (recentTasksResponse.ok && projectsResponse.ok) {
          const [recentTasks, apiProjects] = await Promise.all([
            recentTasksResponse.json(),
            projectsResponse.json()
          ]);
          
          // Transform API tasks to match our interface
          const transformedTasks = recentTasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate?.toDate ? task.dueDate.toDate().toISOString() : task.dueDate,
            projectId: task.projectId,
            projectName: apiProjects.find((p: any) => p.id === task.projectId)?.name || 'No Project'
          }));
          
          setTodayTasks(transformedTasks);
          
          // Fetch all tasks for stats calculation
          const allTasksResponse = await authenticatedFetch('/api/tasks');
          if (allTasksResponse.ok) {
            const allTasks = await allTasksResponse.json();
            
            // Calculate real quick stats
            const completedToday = allTasks.filter((t: any) => {
              const taskDate = t.updatedAt?.toDate ? t.updatedAt.toDate() : new Date(t.updatedAt);
              const today = new Date().toDateString();
              return t.status === 'completed' && taskDate.toDateString() === today;
            }).length;
            
            // Calculate tasks due today
            const today = new Date().toDateString();
            const dueTodayTasks = allTasks.filter((t: any) => {
              if (!t.dueDate) return false;
              const dueDate = t.dueDate?.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
              return dueDate.toDateString() === today;
            });
            
            const realStats: QuickStats = {
              todayTasks: dueTodayTasks.length,
              completedToday,
              timeTrackedToday: 0, // This would come from time entries API
              activeProjects: apiProjects.length,
              dueSoon: allTasks.filter((t: any) => {
                if (!t.dueDate) return false;
                const dueDate = t.dueDate?.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return dueDate <= tomorrow && t.status !== 'completed';
              }).length
            };
            
            setQuickStats(realStats);
          }
          
        } else {
          throw new Error('API not available');
        }
      } catch (error) {
        console.log('API not available, using sample data for demo');
        
        // Show sample data with clear indication it's demo data
        const sampleTasks: Task[] = [
          {
            id: 'sample-1',
            title: 'Welcome to TaskMate! 🎉',
            description: 'This is a sample task. Create your first real task to get started.',
            status: 'pending',
            priority: 'high',
            dueDate: new Date().toISOString(),
            projectId: 'sample-project',
            projectName: 'Getting Started'
          },
          {
            id: 'sample-2',
            title: 'Explore the project workspace',
            description: 'Navigate to Projects tab to create your first project and organize your tasks.',
            status: 'pending',
            priority: 'medium',
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            projectId: 'sample-project',
            projectName: 'Getting Started'
          },
          {
            id: 'sample-3',
            title: 'Try the time tracker',
            description: 'Click on any task to open the time tracker and monitor your productivity.',
            status: 'pending',
            priority: 'low',
            dueDate: new Date(Date.now() + 172800000).toISOString(),
            projectId: 'sample-project',
            projectName: 'Getting Started'
          }
        ];
        
        setTodayTasks(sampleTasks);
        
        const sampleStats: QuickStats = {
          todayTasks: 1,
          completedToday: 0,
          timeTrackedToday: 0,
          activeProjects: 1,
          dueSoon: 1
        };
        
        setQuickStats(sampleStats);
        
        // Show a helpful message only once
        if (!sessionStorage.getItem('welcome-shown')) {
          toast('👋 Welcome! These are sample tasks to get you started. Create your first project to begin!', {
            duration: 5000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          });
          sessionStorage.setItem('welcome-shown', 'true');
        }
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTaskAdd = async () => {
    if (!quickTaskTitle.trim()) return;
    
    try {
      // Mock task creation - replace with actual API call
      const newTask: Task = {
        id: Date.now().toString(),
        title: quickTaskTitle.trim(),
        description: null,
        status: 'pending',
        priority: 'medium',
        dueDate: quickTaskDueDate || new Date().toISOString(),
        projectId: 'inbox',
        projectName: 'Inbox'
      };
      
      setTodayTasks(prev => [newTask, ...prev]);
      setQuickTaskTitle('');
      setQuickTaskDueDate('');
      setShowQuickAdd(false);
      
      toast.success('Task added to your inbox!');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-400" />;
      default: return <div className="w-4 h-4 border-2 border-gray-400 rounded-full" />;
    }
  };

  // Timer functions
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    // Reset timer state when opening new task
    setIsTracking(false);
    setIsPaused(false);
    setStartTime(null);
    setElapsedTime(0);
  };

  const startTimer = () => {
    setStartTime(new Date());
    setIsTracking(true);
    setIsPaused(false);
    setElapsedTime(0);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    if (startTime) {
      const newStartTime = new Date(Date.now() - elapsedTime);
      setStartTime(newStartTime);
      setIsPaused(false);
    }
  };

  const stopTimer = () => {
    if (startTime && selectedTask) {
      const duration = Math.floor(elapsedTime / 1000);
      toast.success(`Time entry recorded: ${formatDuration(duration)}`);
    }
    
    setIsTracking(false);
    setIsPaused(false);
    setStartTime(null);
    setElapsedTime(0);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimerDisplay = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] light:bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-pink-600/20 border border-white/10 rounded-2xl p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Welcome Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0a0a0a]"></div>
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {getGreeting()}, {user?.name || 'User'}! 👋
                  </h1>
                  <p className="text-lg text-gray-300">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowQuickAdd(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">New Task</span>
                </Button>
                
                <Link href="/dashboard/projects/new">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    <FolderPlus className="w-5 h-5" />
                    <span className="hidden sm:inline">New Project</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{quickStats?.todayTasks || 0}</div>
                <div className="text-sm text-gray-400">Today's Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{quickStats?.completedToday || 0}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{quickStats?.activeProjects || 0}</div>
                <div className="text-sm text-gray-400">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{Math.round(quickStats?.timeTrackedToday || 0)}h</div>
                <div className="text-sm text-gray-400">Hours Today</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#111111] light:bg-white rounded-xl p-6 border border-white/10 light:border-gray-200">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-700 light:bg-gray-300 rounded mb-2"></div>
                  <div className="h-8 bg-gray-700 light:bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 light:bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            ))
          ) : quickStats ? (
            <>
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 light:from-blue-50 light:to-blue-100 rounded-xl p-6 border border-blue-500/20 light:border-blue-200 hover:border-blue-500/30 light:hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Target className="h-8 w-8 text-blue-400 light:text-blue-600" />
                  <span className="text-xs bg-blue-500/20 light:bg-blue-200 text-blue-400 light:text-blue-700 px-2 py-1 rounded-full">
                    Today
                  </span>
                </div>
                <div className="text-2xl font-bold text-white light:text-gray-900 mb-1">
                  {quickStats.completedToday}/{quickStats.todayTasks}
                </div>
                <div className="text-sm text-gray-400 light:text-gray-600">Tasks Completed</div>
                <div className="mt-2 w-full bg-gray-700 light:bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(quickStats.completedToday / quickStats.todayTasks) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 light:from-green-50 light:to-green-100 rounded-xl p-6 border border-green-500/20 light:border-green-200 hover:border-green-500/30 light:hover:border-green-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Timer className="h-8 w-8 text-green-400 light:text-green-600" />
                  <TrendingUp className="h-4 w-4 text-green-400 light:text-green-600" />
                </div>
                <div className="text-2xl font-bold text-white light:text-gray-900 mb-1">
                  {formatTime(quickStats.timeTrackedToday)}
                </div>
                <div className="text-sm text-gray-400 light:text-gray-600">Time Tracked</div>
                <div className="text-xs text-green-400 light:text-green-600 mt-2">
                  +15% from yesterday
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 light:from-orange-50 light:to-orange-100 rounded-xl p-6 border border-orange-500/20 light:border-orange-200 hover:border-orange-500/30 light:hover:border-orange-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Award className="h-8 w-8 text-orange-400 light:text-orange-600" />
                  <span className="text-xs bg-orange-500/20 light:bg-orange-200 text-orange-400 light:text-orange-700 px-2 py-1 rounded-full">
                    📅
                  </span>
                </div>
                <div className="text-2xl font-bold text-white light:text-gray-900 mb-1">Today</div>
                <div className="text-sm text-gray-400 light:text-gray-600">Most Due Task</div>
                <div className="text-xs text-orange-400 light:text-orange-600 mt-2">
                  Review proposal
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 light:from-purple-50 light:to-purple-100 rounded-xl p-6 border border-purple-500/20 light:border-purple-200 hover:border-purple-500/30 light:hover:border-purple-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Bolt className="h-8 w-8 text-purple-400 light:text-purple-600" />
                  <Zap className="h-4 w-4 text-purple-400 light:text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-white light:text-gray-900 mb-1">5</div>
                <div className="text-sm text-gray-400 light:text-gray-600">Active Projects</div>
                <div className="text-xs text-purple-400 light:text-purple-600 mt-2">
                  2 due this week
                </div>
              </div>
            </>
          ) : null}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-[#111111] light:bg-white rounded-xl p-6 border border-white/10 light:border-gray-200 light:shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white light:text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 light:text-yellow-500" />
                  Recent Tasks
                </h2>
                <Link href="/dashboard/projects">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 bg-[#1a1a1a] light:bg-gray-50 rounded-lg border border-white/10 light:border-gray-200">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-700 light:bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-700 light:bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-700 light:bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : todayTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Coffee className="h-12 w-12 text-gray-500 light:text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 light:text-gray-600 mb-4">No tasks scheduled for today</p>
                    <Button
                      onClick={() => setShowQuickAdd(true)}
                      variant="default"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Task
                    </Button>
                  </div>
                ) : (
                  todayTasks.slice(0, 5).map((task) => (
                    <motion.div
                      key={task.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-[#1a1a1a] light:bg-gray-50 rounded-lg border border-white/10 light:border-gray-200 hover:border-white/20 transition-all cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-medium ${
                              task.status === 'completed' 
                                ? 'text-gray-400 light:text-gray-500 line-through' 
                                : 'text-white light:text-gray-900'
                            }`}>
                              {task.title}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-400 light:text-gray-600 mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 light:text-gray-500">
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {task.projectName}
                            </span>
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due today
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions & Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="bg-[#111111] light:bg-white rounded-xl p-6 border border-white/10 light:border-gray-200 light:shadow-lg">
              <h3 className="text-lg font-medium text-white light:text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-400 light:text-blue-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link href="/dashboard/projects" className="block">
                  <div className="p-3 bg-[#1a1a1a] light:bg-gray-50 rounded-lg hover:bg-[#222] light:hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 light:bg-blue-100 rounded-lg flex items-center justify-center">
                        <Target className="h-4 w-4 text-blue-400 light:text-blue-600" />
                      </div>
                      <div>
                        <div className="text-white light:text-gray-900 font-medium text-sm">Start Working</div>
                        <div className="text-xs text-gray-400 light:text-gray-600">Open projects workspace</div>
                      </div>
                    </div>
                  </div>
                </Link>
                
                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="w-full p-3 bg-[#1a1a1a] light:bg-gray-50 rounded-lg hover:bg-[#222] light:hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 light:bg-green-100 rounded-lg flex items-center justify-center">
                      <Plus className="h-4 w-4 text-green-400 light:text-green-600" />
                    </div>
                    <div>
                      <div className="text-white light:text-gray-900 font-medium text-sm">Quick Add Task</div>
                      <div className="text-xs text-gray-400 light:text-gray-600">Add to inbox instantly</div>
                    </div>
                  </div>
                </button>

                <Link href="/dashboard/reports" className="block">
                  <div className="p-3 bg-[#1a1a1a] light:bg-gray-50 rounded-lg hover:bg-[#222] light:hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 light:bg-purple-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-purple-400 light:text-purple-600" />
                      </div>
                      <div>
                        <div className="text-white light:text-gray-900 font-medium text-sm">View Reports</div>
                        <div className="text-xs text-gray-400 light:text-gray-600">Check your progress</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Productivity Tips */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/5 light:from-indigo-50 light:to-purple-100 rounded-xl p-6 border border-indigo-500/20 light:border-indigo-200">
              <h3 className="text-lg font-medium text-white light:text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-400 light:text-indigo-600" />
                Pro Tip
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-300 light:text-gray-700">
                  🎯 <strong>Focus Block:</strong> Try working in 25-minute focused sessions followed by 5-minute breaks. This helps maintain high productivity throughout the day.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-indigo-400 light:text-indigo-600">Productivity Score: 98%</span>
                  <span className="text-gray-400 light:text-gray-500">•</span>
                  <span className="text-gray-400 light:text-gray-600">Based on your patterns</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Add Modal */}
        {showQuickAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a1a1a] light:bg-white border border-white/10 light:border-gray-200 rounded-xl p-6 w-96 max-w-[90vw] light:shadow-xl"
            >
              <h3 className="text-lg font-medium text-white light:text-gray-900 mb-4">Quick Add Task</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 light:text-gray-700 mb-2">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full px-3 py-2 bg-[#111111] light:bg-gray-50 border border-white/10 light:border-gray-300 rounded-lg text-white light:text-gray-900 placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:border-white/20 light:focus:border-blue-500"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        handleQuickTaskAdd();
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 light:text-gray-700 mb-2">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={quickTaskDueDate}
                    onChange={(e) => setQuickTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111111] light:bg-gray-50 border border-white/10 light:border-gray-300 rounded-lg text-white light:text-gray-900 focus:outline-none focus:border-white/20 light:focus:border-blue-500"
                  />
                </div>
                
                <p className="text-xs text-gray-400 light:text-gray-600">
                  💡 Tip: Use ⌘+N from anywhere to quickly add tasks
                </p>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowQuickAdd(false);
                    setQuickTaskTitle('');
                    setQuickTaskDueDate('');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleQuickTaskAdd}
                  variant="default"
                  disabled={!quickTaskTitle.trim()}
                >
                  Add Task
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Timer Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Time Tracker</h2>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Task Details */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`px-3 py-1 text-xs rounded-full border ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority} priority
                      </div>
                      <div className={`px-3 py-1 text-xs rounded-full ${
                        selectedTask.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        selectedTask.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {selectedTask.status.replace('_', ' ')}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{selectedTask.title}</h3>
                    {selectedTask.description && (
                      <p className="text-gray-300 leading-relaxed mb-4">{selectedTask.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {selectedTask.projectName}
                      </span>
                      {selectedTask.dueDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          Due: {new Date(selectedTask.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timer Display */}
                  <div className="text-center">
                    <div className="text-6xl font-mono font-bold text-white mb-2">
                      {formatTimerDisplay(elapsedTime)}
                    </div>
                    <p className="text-gray-400">
                      {isTracking ? (isPaused ? 'Paused' : 'Tracking') : 'Ready to start'}
                    </p>
                  </div>

                  {/* Control Buttons */}
                  <div className="space-y-4">
                    {!isTracking ? (
                      <Button
                        onClick={startTimer}
                        variant="default"
                        className="w-full h-12 text-lg"
                        disabled={selectedTask.status === 'completed'}
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Start Task
                      </Button>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {!isPaused ? (
                          <Button
                            onClick={pauseTimer}
                            variant="outline"
                            className="h-12"
                          >
                            <Pause className="h-5 w-5 mr-2" />
                            Pause
                          </Button>
                        ) : (
                          <Button
                            onClick={resumeTimer}
                            variant="default"
                            className="h-12"
                          >
                            <Play className="h-5 w-5 mr-2" />
                            Resume
                          </Button>
                        )}
                        
                        <Button
                          onClick={stopTimer}
                          variant="outline"
                          className="h-12"
                        >
                          <Square className="h-5 w-5 mr-2" />
                          Stop
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Premium Feature Teaser Modal */}
        {showPremiumTeaser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border border-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-8 w-full max-w-lg max-w-[90vw] light:shadow-xl relative overflow-hidden"
            >
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Ready for Team Power?</h3>
                  <p className="text-gray-300">
                    You've been crushing your personal productivity! 🚀
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2">Coming Soon: Premium Features</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Team collaboration (up to 5 members)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Real-time notifications</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Advanced team reports</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Admin dashboard</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-semibold">Early Bird Special</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Be the first to know when we launch! Get 50% off the first 3 months.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      localStorage.setItem('premiumTeaserSeen', 'true');
                      setShowPremiumTeaser(false);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Maybe Later
                  </Button>
                  <Button
                    onClick={() => {
                      localStorage.setItem('premiumTeaserSeen', 'true');
                      localStorage.setItem('premiumWaitlist', 'true');
                      setShowPremiumTeaser(false);
                      toast.success("You're on the waitlist! We'll notify you when it's ready.", {
                        duration: 4000,
                        style: {
                          background: '#1a1a1a',
                          color: '#fff',
                          border: '1px solid rgba(59, 130, 246, 0.5)'
                        }
                      });
                    }}
                    variant="default"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Join Waitlist
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Keep enjoying unlimited personal task tracking forever free!
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Welcome Tour */}
        <WelcomeTour
          isOpen={showWelcomeTour}
          onClose={() => {
            setShowWelcomeTour(false);
            localStorage.setItem('welcomeTourCompleted', 'true');
          }}
        />
      </div>
    </div>
  );
} 