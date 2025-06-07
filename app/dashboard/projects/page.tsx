'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  FolderKanban, 
  Clock, 
  CalendarDays, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Search,
  Play,
  Pause,
  Square,
  MoreHorizontal,
  X,
  Timer,
  Target,
  Flag,
  Edit3,
  Check,
  Filter,
  SortDesc,
  Layout,
  BarChart3,
  Zap,
  TrendingUp,
  CheckSquare,
  Clock4,
  FolderPlus,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authenticatedFetch } from '@/lib/auth';
import { useAuth } from '@/app/contexts/AuthContext';
import Button from '@/components/ui/Button';

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  tasksCount: number;
  completedTasks?: number;
  totalTimeTracked?: number;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
}

interface ProjectWithTasks extends Project {
  tasks: Task[];
}

interface TimeEntry {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  description: string;
}

export default function ProjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithTasks | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  
  // Task creation
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Time tracking
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);

  // Update elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && !isPaused && startTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = now - startTime.getTime() + pausedTime;
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTracking, isPaused, startTime, pausedTime]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await authenticatedFetch('/api/projects');
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please log in again');
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjects(data);
      
      // Auto-select first project if available
      if (data.length > 0 && !selectedProject) {
        handleProjectSelect(data[0]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectSelect = async (project: Project) => {
    setIsLoadingTasks(true);
    try {
      const response = await authenticatedFetch(`/api/projects/${project.id}/tasks`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const tasks = await response.json();
      setSelectedProject({ ...project, tasks });
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      toast.error('Failed to load project tasks');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    // Fetch time entries for this task
    fetchTimeEntries(task.id);
  };

  const fetchTimeEntries = async (taskId: string) => {
    try {
      const response = await authenticatedFetch(`/api/tasks/${taskId}/time-entries`);
      if (response.ok) {
        const entries = await response.json();
        setTimeEntries(entries);
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: 'pending' | 'in_progress' | 'completed') => {
    try {
      const response = await authenticatedFetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update the task in the selected project
      if (selectedProject) {
        const updatedTasks = selectedProject.tasks.map(task =>
          task.id === taskId ? { ...task, status } : task
        );
        setSelectedProject({ ...selectedProject, tasks: updatedTasks });
        
        toast.success(`Task moved to ${status.replace('_', ' ')}`);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleAddTask = async () => {
    if (!selectedProject || !newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      const response = await authenticatedFetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          priority: newTaskPriority,
          dueDate: newTaskDueDate || null,
          projectId: selectedProject.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      
      // Add the new task to the selected project
      setSelectedProject({
        ...selectedProject,
        tasks: [...selectedProject.tasks, newTask]
      });

      // Reset form
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setIsAddingTask(false);
      
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedTasks.size === 0) {
      toast.error('Please select tasks first');
      return;
    }

    try {
      const promises = Array.from(selectedTasks).map(taskId => {
        switch (action) {
          case 'complete':
            return updateTaskStatus(taskId, 'completed');
          case 'delete':
            return authenticatedFetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      
      if (action === 'delete') {
        // Remove deleted tasks from the UI
        if (selectedProject) {
          const updatedTasks = selectedProject.tasks.filter(task => !selectedTasks.has(task.id));
          setSelectedProject({ ...selectedProject, tasks: updatedTasks });
        }
      }
      
      setSelectedTasks(new Set());
      toast.success(`${action === 'complete' ? 'Completed' : 'Deleted'} ${selectedTasks.size} tasks`);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Failed to ${action} tasks`);
    }
  };

  const handleInlineEdit = async (taskId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    try {
      const response = await authenticatedFetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update the task in the selected project
      if (selectedProject) {
        const updatedTasks = selectedProject.tasks.map(task =>
          task.id === taskId ? { ...task, title: newTitle } : task
        );
        setSelectedProject({ ...selectedProject, tasks: updatedTasks });
      }

      setEditingTask(null);
      toast.success('Task updated');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const startTimer = () => {
    setStartTime(new Date());
    setIsTracking(true);
    setIsPaused(false);
    setElapsedTime(0);
    setPausedTime(0);
  };

  const pauseTimer = () => {
    setIsPaused(true);
    setPausedTime(elapsedTime);
  };

  const resumeTimer = () => {
    setIsPaused(false);
    setStartTime(new Date());
  };

  const stopTimer = async () => {
    if (!selectedTask || !startTime) return;

    try {
      const endTime = new Date();
      const duration = Math.floor(elapsedTime / 1000);

      const response = await authenticatedFetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: selectedTask.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration,
          description: `Work on ${selectedTask.title}`,
        }),
      });

      if (response.ok) {
        toast.success(`Logged ${formatDuration(duration)} for ${selectedTask.title}`);
        fetchTimeEntries(selectedTask.id);
      }
    } catch (error) {
      console.error('Error saving time entry:', error);
      toast.error('Failed to save time entry');
    }

    setIsTracking(false);
    setIsPaused(false);
    setStartTime(null);
    setElapsedTime(0);
    setPausedTime(0);
  };

  const completeTask = async () => {
    if (!selectedTask) return;
    
    await updateTaskStatus(selectedTask.id, 'completed');
    setSelectedTask(null);
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getTasksByStatus = (status: string) => {
    if (!selectedProject) return [];
    return selectedProject.tasks.filter(task => task.status === status);
  };

  const getFilteredTasks = (tasks: Task[]) => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-500/5';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/5';
      case 'low': return 'border-l-green-500 bg-green-500/5';
      default: return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-blue-400';
      case 'overdue': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loader mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] p-4 sm:p-6">
      <div className="max-w-[2000px] mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-pink-600/10 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-8 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <FolderKanban className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Projects</h1>
                  <p className="text-sm sm:text-base text-gray-300">Manage your projects and track progress</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Enhanced Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects & tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all w-full sm:w-80 text-sm sm:text-base"
                    />
                  </div>
                  
                  {/* Quick Filters */}
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="all">All Priority</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-2 sm:gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={`p-2 rounded text-sm font-medium transition-all ${
                        viewMode === 'kanban' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Layout className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded text-sm font-medium transition-all ${
                        viewMode === 'list' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <SortDesc className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <Button
                    onClick={() => router.push('/dashboard/projects/new')}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">New Project</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
          {/* Enhanced Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="xl:col-span-4 2xl:col-span-3"
          >
            <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Your Projects</h2>
                <div className="text-xs sm:text-sm text-gray-400 bg-white/5 px-2 sm:px-3 py-1 rounded-full">
                  {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-white/5 h-16 sm:h-20 rounded-lg sm:rounded-xl"></div>
                  ))}
                </div>
              ) : projects.length > 0 ? (
                <div className="space-y-3 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
                  {projects
                    .filter(project => 
                      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleProjectSelect(project)}
                        className={`group cursor-pointer p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200 ${
                          selectedProject?.id === project.id
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 shadow-lg shadow-blue-500/10'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mt-1 flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: project.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white group-hover:text-blue-200 transition-colors truncate text-sm sm:text-base">
                              {project.name}
                            </h3>
                            {project.description && (
                              <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mt-1">
                                {project.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                <span>{project.tasksCount || 0} tasks</span>
                              </div>
                              {project.completedTasks !== undefined && (
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>{project.completedTasks} done</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className={`w-4 h-4 transition-all duration-200 ${
                            selectedProject?.id === project.id ? 'text-blue-400 rotate-90' : 'text-gray-500 group-hover:text-white group-hover:translate-x-1'
                          }`} />
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <EmptyProjectsState onCreateProject={() => router.push('/dashboard/projects/new')} />
              )}
            </div>
          </motion.div>

          {/* Enhanced Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="xl:col-span-8 2xl:col-span-9"
          >
            {selectedProject ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Project Header with Metrics */}
                <ProjectHeader 
                  project={selectedProject}
                  onAddTask={() => setIsAddingTask(true)}
                  selectedTasksCount={selectedTasks.size}
                  onBulkAction={handleBulkAction}
                />

                {/* Enhanced Kanban Board or List View */}
                {isLoadingTasks ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-white/5 h-80 sm:h-96 rounded-xl sm:rounded-2xl"></div>
                    ))}
                  </div>
                ) : viewMode === 'kanban' ? (
                  <KanbanBoard 
                    project={selectedProject}
                    onTaskClick={handleTaskClick}
                    onTaskStatusUpdate={updateTaskStatus}
                    onAddTask={() => setIsAddingTask(true)}
                    filteredTasks={getFilteredTasks}
                    selectedTasks={selectedTasks}
                    onTaskSelect={setSelectedTasks}
                    editingTask={editingTask}
                    editingTaskTitle={editingTaskTitle}
                    onStartEdit={(taskId, title) => {
                      setEditingTask(taskId);
                      setEditingTaskTitle(title);
                    }}
                    onSaveEdit={handleInlineEdit}
                    onCancelEdit={() => setEditingTask(null)}
                    onTaskTitleChange={setEditingTaskTitle}
                  />
                ) : (
                  <ListView 
                    project={selectedProject}
                    onTaskClick={handleTaskClick}
                    onTaskStatusUpdate={updateTaskStatus}
                    filteredTasks={getFilteredTasks}
                    selectedTasks={selectedTasks}
                    onTaskSelect={setSelectedTasks}
                  />
                )}
              </div>
            ) : (
              <EmptyProjectSelection />
            )}
          </motion.div>
        </div>
      </div>

      {/* Bulk Actions Floating Panel */}
      {selectedTasks.size > 0 && (
        <BulkActionsPanel 
          selectedCount={selectedTasks.size}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedTasks(new Set())}
        />
      )}

      {/* Persistent Time Tracking Widget */}
      {isTracking && selectedTask && (
        <PersistentTimeTracker 
          task={selectedTask}
          elapsedTime={elapsedTime}
          isTracking={isTracking}
          isPaused={isPaused}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onStop={stopTimer}
          formatTime={formatTime}
        />
      )}

      {/* Enhanced Modals */}
      <AnimatePresence>
        {/* Add Task Modal */}
        {isAddingTask && (
          <TaskCreationModal 
            isOpen={isAddingTask}
            onClose={() => setIsAddingTask(false)}
            onSubmit={handleAddTask}
            newTaskTitle={newTaskTitle}
            setNewTaskTitle={setNewTaskTitle}
            newTaskDescription={newTaskDescription}
            setNewTaskDescription={setNewTaskDescription}
            newTaskPriority={newTaskPriority}
            setNewTaskPriority={setNewTaskPriority}
            newTaskDueDate={newTaskDueDate}
            setNewTaskDueDate={setNewTaskDueDate}
          />
        )}

        {/* Task Detail Modal */}
        {selectedTask && (
          <TaskDetailModal 
            task={selectedTask}
            timeEntries={timeEntries}
            elapsedTime={elapsedTime}
            isTracking={isTracking}
            isPaused={isPaused}
            onClose={() => setSelectedTask(null)}
            onStartTimer={startTimer}
            onPauseTimer={pauseTimer}
            onResumeTimer={resumeTimer}
            onStopTimer={stopTimer}
            onCompleteTask={completeTask}
            formatTime={formatTime}
            formatDuration={formatDuration}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced Empty States Component
function EmptyProjectsState({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8 sm:py-12"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <FolderKanban className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Ready to organize your work?</h3>
      <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed">
        Projects help you group related tasks and track time effectively. Start with your first project to see the magic happen.
      </p>
      
      {/* Quick Setup Steps */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-6 sm:mb-8 text-xs sm:text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
            <span className="text-blue-400 font-semibold">1</span>
          </div>
          <span>Name your project</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-600 rotate-90 sm:rotate-0" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
            <span className="text-purple-400 font-semibold">2</span>
          </div>
          <span>Add your tasks</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-600 rotate-90 sm:rotate-0" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
            <span className="text-green-400 font-semibold">3</span>
          </div>
          <span>Start tracking time</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Button
          onClick={onCreateProject}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <FolderPlus className="w-5 h-5 mr-2" />
          Create Your First Project
        </Button>
        <Button
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium rounded-xl backdrop-blur-sm"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Learn More
        </Button>
      </div>
      
      {/* Pro tip */}
      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg sm:rounded-xl">
        <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
          <Sparkles className="w-4 h-4" />
          <span className="font-medium">Pro tip:</span>
          <span className="text-gray-300">Use keyboard shortcut 'N' to quickly create a new project</span>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyProjectSelection() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-xl sm:rounded-2xl p-8 sm:p-12 backdrop-blur-sm text-center"
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <FolderKanban className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Select a project</h3>
      <p className="text-base sm:text-lg text-gray-400 max-w-md mx-auto leading-relaxed">
        Choose a project from the sidebar to view and manage its tasks, or create a new project to get started.
      </p>
    </motion.div>
  );
}

// Project Header Component
function ProjectHeader({ 
  project, 
  onAddTask, 
  selectedTasksCount, 
  onBulkAction 
}: { 
  project: ProjectWithTasks;
  onAddTask: () => void;
  selectedTasksCount: number;
  onBulkAction: (action: string) => void;
}) {
  const getTasksByStatus = (status: string) => {
    return project.tasks.filter(task => task.status === status);
  };

  const completionRate = project.tasks.length > 0 
    ? Math.round((getTasksByStatus('completed').length / project.tasks.length) * 100)
    : 0;

  return (
    <div className="bg-gradient-to-r from-white/5 to-white/2 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div 
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-sm"
            style={{ backgroundColor: project.color }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{project.name}</h2>
            {project.description && (
              <p className="text-sm sm:text-base text-gray-300 mt-1 line-clamp-2">{project.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {selectedTasksCount > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={() => onBulkAction('complete')}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Complete {selectedTasksCount}
              </Button>
              <Button
                onClick={() => onBulkAction('delete')}
                variant="outline"
                size="sm"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg text-sm"
              >
                Delete {selectedTasksCount}
              </Button>
            </div>
          )}
          <Button
            onClick={onAddTask}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg sm:rounded-xl font-medium transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Project Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-blue-400">
            {getTasksByStatus('pending').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-400">To Do</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-yellow-400">
            {getTasksByStatus('in_progress').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-400">In Progress</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-400">
            {getTasksByStatus('completed').length}
          </div>
          <div className="text-xs sm:text-sm text-gray-400">Completed</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-purple-400">
            {completionRate}%
          </div>
          <div className="text-xs sm:text-sm text-gray-400">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 sm:mt-6">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Project Progress</span>
          <span>{completionRate}% Complete</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

// Enhanced Kanban Board Component
function KanbanBoard({ 
  project, 
  onTaskClick, 
  onTaskStatusUpdate, 
  onAddTask, 
  filteredTasks,
  selectedTasks,
  onTaskSelect,
  editingTask,
  editingTaskTitle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onTaskTitleChange
}: {
  project: ProjectWithTasks;
  onTaskClick: (task: Task) => void;
  onTaskStatusUpdate: (taskId: string, status: 'pending' | 'in_progress' | 'completed') => void;
  onAddTask: () => void;
  filteredTasks: (tasks: Task[]) => Task[];
  selectedTasks: Set<string>;
  onTaskSelect: (tasks: Set<string>) => void;
  editingTask: string | null;
  editingTaskTitle: string;
  onStartEdit: (taskId: string, title: string) => void;
  onSaveEdit: (taskId: string, title: string) => void;
  onCancelEdit: () => void;
  onTaskTitleChange: (title: string) => void;
}) {
  const getTasksByStatus = (status: string) => {
    const tasks = project.tasks.filter(task => task.status === status);
    return filteredTasks(tasks);
  };

  const columns = [
    { 
      id: 'pending', 
      title: 'To Do', 
      tasks: getTasksByStatus('pending'), 
      color: 'gray',
      icon: Clock4,
      emptyMessage: 'No tasks to do',
      emptyAction: 'Add your first task'
    },
    { 
      id: 'in_progress', 
      title: 'In Progress', 
      tasks: getTasksByStatus('in_progress'), 
      color: 'blue',
      icon: Play,
      emptyMessage: 'No active tasks',
      emptyAction: ''
    },
    { 
      id: 'completed', 
      title: 'Completed', 
      tasks: getTasksByStatus('completed'), 
      color: 'green',
      icon: CheckCircle,
      emptyMessage: 'No completed tasks',
      emptyAction: ''
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {columns.map((column) => (
        <div key={column.id} className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                column.color === 'gray' ? 'bg-gray-400' :
                column.color === 'blue' ? 'bg-blue-400' : 'bg-green-400'
              }`}></div>
              <h3 className="font-semibold text-white">{column.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs ${
                column.color === 'gray' ? 'bg-gray-500/20 text-gray-300' :
                column.color === 'blue' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
              }`}>
                {column.tasks.length}
              </span>
            </div>
            {column.id === 'pending' && (
              <Button
                onClick={onAddTask}
                variant="ghost"
                className="w-8 h-8 p-0 hover:bg-white/10"
              >
                <Plus className="w-4 h-4 text-gray-400" />
              </Button>
            )}
          </div>
          
          <div className="space-y-3 min-h-[300px] sm:min-h-[400px]">
            {column.tasks.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-gray-400">
                <column.icon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">{column.emptyMessage}</p>
                {column.emptyAction && (
                  <button
                    onClick={onAddTask}
                    className="text-blue-400 hover:text-blue-300 text-sm mt-2 underline"
                  >
                    + {column.emptyAction}
                  </button>
                )}
              </div>
            ) : (
              column.tasks.map((task) => (
                <EnhancedTaskCard 
                  key={task.id} 
                  task={task} 
                  onClick={() => onTaskClick(task)}
                  onStatusChange={onTaskStatusUpdate}
                  isSelected={selectedTasks.has(task.id)}
                  onSelect={(selected) => {
                    const newSelection = new Set(selectedTasks);
                    if (selected) {
                      newSelection.add(task.id);
                    } else {
                      newSelection.delete(task.id);
                    }
                    onTaskSelect(newSelection);
                  }}
                  isEditing={editingTask === task.id}
                  editingTitle={editingTaskTitle}
                  onStartEdit={() => onStartEdit(task.id, task.title)}
                  onSaveEdit={(title) => onSaveEdit(task.id, title)}
                  onCancelEdit={onCancelEdit}
                  onTitleChange={onTaskTitleChange}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Enhanced Task Card Component
function EnhancedTaskCard({ 
  task, 
  onClick, 
  onStatusChange,
  isSelected,
  onSelect,
  isEditing,
  editingTitle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onTitleChange
}: { 
  task: Task; 
  onClick: () => void;
  onStatusChange: (taskId: string, status: 'pending' | 'in_progress' | 'completed') => void;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  isEditing: boolean;
  editingTitle: string;
  onStartEdit: () => void;
  onSaveEdit: (title: string) => void;
  onCancelEdit: () => void;
  onTitleChange: (title: string) => void;
}) {
  const priorityDotColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const priorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative bg-gradient-to-br from-white/5 to-white/2 border rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-white/5 ${
        isSelected ? 'border-blue-500/50 bg-blue-500/10' : 
        isOverdue ? 'border-red-500/50 bg-red-500/5' :
        isDueToday ? 'border-yellow-500/50 bg-yellow-500/5' :
        'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(e.target.checked);
          }}
          className="w-4 h-4 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
        />
      </div>

      <div onClick={onClick}>
        {/* Priority Indicator */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${priorityDotColor(task.priority)}`} />
        
        <div className="ml-2">
          {/* Task Title - Editable */}
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            {isEditing ? (
              <div className="flex-1 mr-2">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => onTitleChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSaveEdit(editingTitle);
                    } else if (e.key === 'Escape') {
                      onCancelEdit();
                    }
                  }}
                  onBlur={() => onSaveEdit(editingTitle)}
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            ) : (
              <h4 
                className="font-semibold text-white group-hover:text-blue-200 transition-colors line-clamp-2 flex-1 cursor-text"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onStartEdit();
                }}
              >
                {task.title}
              </h4>
            )}
            
            {!isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEdit();
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
              >
                <Edit3 className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
          
          {task.description && (
            <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mb-3">{task.description}</p>
          )}
          
          {/* Task Meta Information */}
          <div className="flex items-center justify-between">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${priorityBadgeColor(task.priority)}`}>
              <Flag className="w-3 h-3 inline mr-1" />
              {task.priority}
            </div>
            
            <div className="flex items-center gap-2">
              {task.dueDate && (
                <div className={`text-xs flex items-center gap-1 ${
                  isOverdue ? 'text-red-400' : 
                  isDueToday ? 'text-yellow-400' : 
                  'text-gray-400'
                }`}>
                  <Clock className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
              
              {/* Quick Status Actions */}
              <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                {task.status === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(task.id, 'in_progress');
                    }}
                    className="p-1 hover:bg-blue-500/20 rounded text-blue-400 hover:text-blue-300"
                    title="Start Task"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                )}
                {task.status !== 'completed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(task.id, 'completed');
                    }}
                    className="p-1 hover:bg-green-500/20 rounded text-green-400 hover:text-green-300"
                    title="Complete Task"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// List View Component
function ListView({ 
  project, 
  onTaskClick, 
  onTaskStatusUpdate, 
  filteredTasks,
  selectedTasks,
  onTaskSelect 
}: {
  project: ProjectWithTasks;
  onTaskClick: (task: Task) => void;
  onTaskStatusUpdate: (taskId: string, status: 'pending' | 'in_progress' | 'completed') => void;
  filteredTasks: (tasks: Task[]) => Task[];
  selectedTasks: Set<string>;
  onTaskSelect: (tasks: Set<string>) => void;
}) {
  const tasks = filteredTasks(project.tasks);

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-xl sm:rounded-2xl backdrop-blur-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-white/10">
        <h3 className="text-lg sm:text-xl font-semibold text-white">All Tasks</h3>
        <p className="text-sm text-gray-400 mt-1">{tasks.length} tasks total</p>
      </div>
      
      <div className="divide-y divide-white/10">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tasks match your current filters</p>
          </div>
        ) : (
          tasks.map((task) => (
            <ListTaskRow 
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onStatusChange={onTaskStatusUpdate}
              isSelected={selectedTasks.has(task.id)}
              onSelect={(selected) => {
                const newSelection = new Set(selectedTasks);
                if (selected) {
                  newSelection.add(task.id);
                } else {
                  newSelection.delete(task.id);
                }
                onTaskSelect(newSelection);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

// List Task Row Component
function ListTaskRow({ 
  task, 
  onClick, 
  onStatusChange,
  isSelected,
  onSelect 
}: {
  task: Task;
  onClick: () => void;
  onStatusChange: (taskId: string, status: 'pending' | 'in_progress' | 'completed') => void;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
}) {
  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-blue-400';
      case 'overdue': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      className={`p-4 cursor-pointer transition-all ${isSelected ? 'bg-blue-500/10' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(e.target.checked);
          }}
          className="w-4 h-4 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-500"
        />
        
        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white truncate">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-gray-400 mt-1 line-clamp-1">{task.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-4 ml-4">
              {/* Priority */}
              <div className={`text-sm font-medium ${priorityColor(task.priority)}`}>
                {task.priority}
              </div>
              
              {/* Status */}
              <div className={`text-sm ${statusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </div>
              
              {/* Due Date */}
              {task.dueDate && (
                <div className="text-sm text-gray-400">
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
              
              {/* Quick Actions */}
              <div className="flex gap-1">
                {task.status !== 'completed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(task.id, 'completed');
                    }}
                    className="p-1 hover:bg-green-500/20 rounded text-green-400"
                    title="Complete"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Bulk Actions Panel Component
function BulkActionsPanel({ 
  selectedCount, 
  onBulkAction, 
  onClearSelection 
}: {
  selectedCount: number;
  onBulkAction: (action: string) => void;
  onClearSelection: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-[#1a1a1a] border border-white/20 rounded-xl p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">
            {selectedCount} task{selectedCount > 1 ? 's' : ''} selected
          </span>
          
          <div className="flex gap-2">
            <Button
              onClick={() => onBulkAction('complete')}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
            
            <Button
              onClick={() => onBulkAction('delete')}
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Delete
            </Button>
            
            <Button
              onClick={onClearSelection}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Persistent Time Tracker Widget
function PersistentTimeTracker({ 
  task, 
  elapsedTime, 
  isTracking, 
  isPaused, 
  onPause, 
  onResume, 
  onStop, 
  formatTime 
}: {
  task: Task;
  elapsedTime: number;
  isTracking: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  formatTime: (ms: number) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="bg-gradient-to-r from-green-600/90 to-emerald-600/90 border border-green-500/30 rounded-xl p-4 shadow-2xl backdrop-blur-md min-w-[280px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium text-sm">Tracking Time</span>
          </div>
          <button
            onClick={onStop}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mb-3">
          <h4 className="text-white font-semibold text-sm truncate">{task.title}</h4>
          <div className="text-2xl font-mono font-bold text-white mt-1">
            {formatTime(elapsedTime)}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={isPaused ? onResume : onPause}
            size="sm"
            className={`flex-1 ${
              isPaused 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' 
                : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
            } text-white`}
          >
            {isPaused ? (
              <>
                <Play className="w-5 h-5 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            )}
          </Button>
          
          <Button
            onClick={onStop}
            size="sm"
            variant="outline"
            className="py-4 text-lg font-semibold rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Square className="w-5 h-5 mr-2" />
            Stop
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Task Creation Modal Component
function TaskCreationModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  newTaskTitle, 
  setNewTaskTitle, 
  newTaskDescription, 
  setNewTaskDescription, 
  newTaskPriority, 
  setNewTaskPriority, 
  newTaskDueDate, 
  setNewTaskDueDate 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  newTaskTitle: string;
  setNewTaskTitle: (title: string) => void;
  newTaskDescription: string;
  setNewTaskDescription: (desc: string) => void;
  newTaskPriority: 'low' | 'medium' | 'high';
  setNewTaskPriority: (priority: 'low' | 'medium' | 'high') => void;
  newTaskDueDate: string;
  setNewTaskDueDate: (date: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Add New Task</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Task Title *
            </label>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              placeholder="Enter task title..."
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Description
            </label>
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all resize-none"
              rows={3}
              placeholder="Enter task description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Priority
              </label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Due Date
              </label>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="px-6 py-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3"
            >
              Add Task
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Task Detail Modal Component  
function TaskDetailModal({ 
  task, 
  timeEntries, 
  elapsedTime, 
  isTracking, 
  isPaused, 
  onClose, 
  onStartTimer, 
  onPauseTimer, 
  onResumeTimer, 
  onStopTimer, 
  onCompleteTask, 
  formatTime, 
  formatDuration 
}: {
  task: Task;
  timeEntries: TimeEntry[];
  elapsedTime: number;
  isTracking: boolean;
  isPaused: boolean;
  onClose: () => void;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onStopTimer: () => void;
  onCompleteTask: () => void;
  formatTime: (ms: number) => string;
  formatDuration: (seconds: number) => string;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        <div className="flex h-full">
          {/* Task Details */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="text-2xl font-bold text-white mb-2">{task.title}</h4>
              {task.description && (
                <p className="text-gray-300 leading-relaxed">{task.description}</p>
              )}
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-3 text-gray-300">
                <CalendarDays className="w-4 h-4" />
                <span className="text-sm">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              {task.dueDate && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-6 mt-6">
              <h5 className="text-lg font-semibold text-white mb-4">Time Entries</h5>
              {timeEntries.length === 0 ? (
                <p className="text-gray-400 text-sm">No time entries yet</p>
              ) : (
                <div className="space-y-2">
                  {timeEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300 text-sm">{entry.description || 'Work session'}</span>
                      <span className="text-white font-medium">{formatDuration(entry.duration)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Time Tracker */}
          <div className="w-80 p-6 sm:p-8 bg-gradient-to-br from-blue-900/10 to-purple-900/10 border-l border-white/10">
            <h3 className="text-xl font-bold text-white mb-8 text-center">Time Tracker</h3>
            
            <div className="text-center mb-8">
              <div className="text-6xl font-mono font-bold text-white mb-4 tracking-wider">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-gray-400 text-lg">
                {isTracking && !isPaused ? 'Tracking...' : isPaused ? 'Paused' : 'Ready to start'}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="space-y-4">
              {!isTracking ? (
                <Button
                  onClick={onStartTimer}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Start Task
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={isPaused ? onResumeTimer : onPauseTimer}
                    className={`py-4 text-lg font-semibold rounded-xl shadow-lg ${
                      isPaused 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' 
                        : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
                    }`}
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={onStopTimer}
                    variant="outline"
                    className="py-4 text-lg font-semibold rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop
                  </Button>
                </div>
              )}

              <Button
                onClick={onCompleteTask}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg"
              >
                <CheckCircle className="w-6 h-6 mr-3" />
                Complete Task
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 