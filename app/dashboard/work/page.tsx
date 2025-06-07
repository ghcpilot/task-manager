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
  Search,
  Play,
  Pause,
  Square,
  X,
  Timer,
  Target,
  Flag,
  Filter,
  MoreHorizontal,
  Calendar
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

export default function WorkPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithTasks | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showProjectList, setShowProjectList] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');
  
  // Time tracking states
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            setIsAddingTask(true);
            break;
          case 'k':
            e.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
          case 'Escape':
            e.preventDefault();
            setSelectedTask(null);
            setIsAddingTask(false);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Wait for auth to load
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchProjects();
    }
  }, [user, authLoading]);

  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await authenticatedFetch('/api/projects');
      
      if (!response.ok) {
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
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectSelect = async (project: Project) => {
    if (!user) return;
    
    try {
      setIsLoadingTasks(true);
      
      const response = await authenticatedFetch(`/api/projects/${project.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch project details');
      }
      
      const projectData = await response.json();
      setSelectedProject(projectData);
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTracking(false);
    setIsPaused(false);
    setStartTime(null);
    setElapsedTime(0);
  };

  const updateTaskStatus = async (taskId: string, status: 'pending' | 'in_progress' | 'completed') => {
    if (!selectedProject || !user) return;

    try {
      const response = await authenticatedFetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTasks = selectedProject.tasks.map(task =>
        task.id === taskId ? { ...task, status } : task
      );

      setSelectedProject({
        ...selectedProject,
        tasks: updatedTasks,
      });

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status });
      }

      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleAddTask = async () => {
    if (!selectedProject || !user || !newTaskTitle.trim()) return;

    try {
      const response = await authenticatedFetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || null,
          priority: newTaskPriority,
          status: 'pending',
          projectId: selectedProject.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      
      setSelectedProject({
        ...selectedProject,
        tasks: [newTask, ...selectedProject.tasks],
      });

      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('medium');
      setIsAddingTask(false);
      
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  // Time tracking functions
  const startTimer = () => {
    setStartTime(new Date());
    setIsTracking(true);
    setIsPaused(false);
    setElapsedTime(0);
    
    if (selectedTask && selectedTask.status === 'pending') {
      updateTaskStatus(selectedTask.id, 'in_progress');
    }
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

  const stopTimer = async () => {
    if (startTime && selectedTask) {
      const endTime = new Date();
      const duration = Math.floor(elapsedTime / 1000);
      
      const newTimeEntry: TimeEntry = {
        id: Date.now().toString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        description: `Work on ${selectedTask.title}`,
      };
      
      setTimeEntries(prev => [newTimeEntry, ...prev]);
      
      setIsTracking(false);
      setIsPaused(false);
      setStartTime(null);
      setElapsedTime(0);
      
      toast.success(`Time entry recorded: ${formatDuration(duration)}`);
    }
  };

  const completeTask = async () => {
    if (selectedTask) {
      if (isTracking) {
        await stopTimer();
      }
      await updateTaskStatus(selectedTask.id, 'completed');
      setSelectedTask(null);
    }
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
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getClockColor = () => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    ];
    const minutes = Math.floor(elapsedTime / 60000);
    return colors[minutes % colors.length];
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTasksByStatus = (status: string) => {
    if (!selectedProject) return [];
    return selectedProject.tasks.filter(task => task.status === status);
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

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="loader mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] light:bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white light:text-gray-900 mb-2 flex items-center gap-3">
                <FolderKanban className="h-6 w-6 md:h-8 md:w-8 text-blue-400 light:text-blue-600" />
                Work
                {selectedProject && (
                  <>
                    <span className="text-gray-400 light:text-gray-600 text-xl">•</span>
                    <span className="text-lg md:text-xl text-gray-300 light:text-gray-700">{selectedProject.name}</span>
                  </>
                )}
              </h1>
              <p className="text-gray-400 light:text-gray-600 text-sm md:text-base">
                {selectedProject 
                  ? `${selectedProject.tasks?.length || 0} tasks in this project`
                  : 'Select a project to view and manage tasks'
                }
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'kanban' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                >
                  <FolderKanban className="h-4 w-4 mr-1" />
                  Kanban
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Calendar
                </Button>
              </div>
              
              {selectedProject && (
                <Button
                  onClick={() => setIsAddingTask(true)}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Task</span>
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Projects */}
          <AnimatePresence>
            {showProjectList && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#111111] border-r border-white/10 overflow-hidden"
              >
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white">Projects</h3>
                    <Button
                      onClick={() => router.push('/dashboard/projects/new')}
                      variant="ghost"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-2 space-y-1 overflow-y-auto max-h-full">
                  {isLoading ? (
                    <div className="p-4 text-center">
                      <div className="loader mb-2"></div>
                      <p className="text-gray-400 text-sm">Loading projects...</p>
                    </div>
                  ) : filteredProjects.length === 0 ? (
                    <div className="p-4 text-center">
                      <FolderKanban className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">No projects found</p>
                    </div>
                  ) : (
                    filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedProject?.id === project.id
                            ? 'bg-white/10 border border-white/20'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                        onClick={() => handleProjectSelect(project)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate text-sm">
                              {project.name}
                            </h4>
                            <p className="text-gray-400 text-xs truncate mt-1">
                              {project.description || "No description"}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <span>{project.tasksCount} tasks</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center - Task Board */}
          <div className="flex-1 p-6 overflow-hidden">
            {selectedProject ? (
              <div className="h-full flex flex-col">
                {/* Project Header */}
                <div className="mb-6 p-4 bg-gradient-to-r from-[#1a1a1a] to-[#111111] rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">{selectedProject.name}</h2>
                      <p className="text-gray-300 text-sm">{selectedProject.description || "No description"}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
                        <Target className="h-4 w-4 text-blue-400" />
                        <span className="text-white">{selectedProject.tasks.length}</span>
                        <span className="text-gray-400">tasks</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Board */}
                {isLoadingTasks ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="loader mb-2"></div>
                    <p className="text-gray-400">Loading tasks...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-6 flex-1 overflow-hidden">
                    {/* To Do */}
                    <div className="bg-[#111111] rounded-xl p-4 border border-white/10 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-white flex items-center">
                          <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                          To Do
                          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-500/20 text-gray-400 rounded-full">
                            {getTasksByStatus('pending').length}
                          </span>
                        </h3>
                      </div>
                      
                      <div className="space-y-3 overflow-y-auto flex-1">
                        {getTasksByStatus('pending').map((task) => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-lg border-l-4 cursor-pointer hover:bg-[#1a1a1a] transition-all ${getPriorityColor(task.priority)}`}
                            onClick={() => handleTaskClick(task)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-white text-sm font-medium flex-1 pr-2">{task.title}</h4>
                              <div className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityBadgeColor(task.priority)}`}>
                                {task.priority}
                              </div>
                            </div>
                            
                            {task.description && (
                              <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">
                                {new Date(task.createdAt).toLocaleDateString()}
                              </span>
                              {task.dueDate && (
                                <span className="text-orange-400">
                                  Due {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* In Progress */}
                    <div className="bg-[#111111] rounded-xl p-4 border border-white/10 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-white flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          In Progress
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                            {getTasksByStatus('in_progress').length}
                          </span>
                        </h3>
                      </div>
                      
                      <div className="space-y-3 overflow-y-auto flex-1">
                        {getTasksByStatus('in_progress').map((task) => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-lg border-l-4 cursor-pointer hover:bg-[#1a1a1a] transition-all ${getPriorityColor(task.priority)}`}
                            onClick={() => handleTaskClick(task)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-white text-sm font-medium flex-1 pr-2">{task.title}</h4>
                              <div className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityBadgeColor(task.priority)}`}>
                                {task.priority}
                              </div>
                            </div>
                            
                            {task.description && (
                              <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-blue-400 flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
                                In Progress
                              </span>
                              {task.dueDate && (
                                <span className="text-orange-400">
                                  Due {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Completed */}
                    <div className="bg-[#111111] rounded-xl p-4 border border-white/10 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-white flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          Completed
                          <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                            {getTasksByStatus('completed').length}
                          </span>
                        </h3>
                      </div>
                      
                      <div className="space-y-3 overflow-y-auto flex-1">
                        {getTasksByStatus('completed').map((task) => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-lg border-l-4 cursor-pointer hover:bg-[#1a1a1a] transition-all opacity-75 ${getPriorityColor(task.priority)}`}
                            onClick={() => handleTaskClick(task)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-white text-sm font-medium flex-1 pr-2 line-through">
                                {task.title}
                              </h4>
                              <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                            </div>
                            
                            {task.description && (
                              <p className="text-gray-400 text-xs mb-2 line-clamp-2 line-through">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-green-400 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </span>
                              <span className="text-gray-500">
                                {new Date(task.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FolderKanban className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">
                    Select a project to get started
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Choose a project from the sidebar to view its tasks and start working
                  </p>
                  <Button 
                    onClick={() => router.push('/dashboard/projects/new')}
                    variant="default"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Project
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Task Details & Timer */}
          <AnimatePresence>
            {selectedTask && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#111111] border-l border-white/10 overflow-hidden"
              >
                <div className="h-full flex flex-col">
                  {/* Task Details Header */}
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-white">Task Details</h3>
                      <button
                        onClick={() => setSelectedTask(null)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 text-xs rounded-full border ${getPriorityBadgeColor(selectedTask.priority)}`}>
                          {selectedTask.priority} priority
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-full ${
                          selectedTask.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          selectedTask.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {selectedTask.status.replace('_', ' ')}
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-bold text-white">{selectedTask.title}</h4>
                      
                      {selectedTask.description && (
                        <p className="text-gray-300 text-sm">{selectedTask.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Timer Section */}
                  <div className="flex-1 p-4">
                    <h4 className="font-medium text-white mb-4">Time Tracker</h4>
                    
                    {/* Digital Display */}
                    <div className="text-center mb-6">
                      <div className="text-4xl font-mono font-bold text-white mb-2">
                        {formatTime(elapsedTime)}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {isTracking ? (isPaused ? 'Paused' : 'Tracking') : 'Ready to start'}
                      </p>
                    </div>

                    {/* Timer Controls */}
                    <div className="space-y-3">
                      {!isTracking ? (
                        <Button
                          onClick={startTimer}
                          variant="default"
                          className="w-full"
                          disabled={selectedTask.status === 'completed'}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Task
                        </Button>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {!isPaused ? (
                            <Button
                              onClick={pauseTimer}
                              variant="outline"
                            >
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </Button>
                          ) : (
                            <Button
                              onClick={resumeTimer}
                              variant="default"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Resume
                            </Button>
                          )}
                          
                          <Button
                            onClick={stopTimer}
                            variant="outline"
                          >
                            <Square className="h-4 w-4 mr-1" />
                            Stop
                          </Button>
                        </div>
                      )}

                      {selectedTask.status !== 'completed' && (
                        <Button
                          onClick={completeTask}
                          variant="default"
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Task
                        </Button>
                      )}
                    </div>

                    {/* Time Entries */}
                    <div className="mt-6">
                      <h5 className="text-sm font-medium text-gray-300 mb-3">Time Entries</h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {timeEntries.length === 0 ? (
                          <p className="text-sm text-gray-400">No time entries yet</p>
                        ) : (
                          timeEntries.map((entry) => (
                            <div key={entry.id} className="p-2 bg-[#1a1a1a] rounded border border-white/10">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-white font-medium">
                                  {formatDuration(entry.duration)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(entry.startTime).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">{entry.description}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Add Task Modal */}
        {isAddingTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-96 max-w-[90vw]">
              <h3 className="text-lg font-medium text-white mb-4">Add New Task</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/20"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Enter task description..."
                    rows={3}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/20 resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={() => {
                    setIsAddingTask(false);
                    setNewTaskTitle('');
                    setNewTaskDescription('');
                    setNewTaskPriority('medium');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTask}
                  variant="default"
                  disabled={!newTaskTitle.trim()}
                >
                  Add Task
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Timer */}
        {isTracking && !selectedTask && (
          <div className="fixed bottom-4 right-4 bg-[#1a1a1a] border border-white/10 rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-sm font-mono text-white">{formatTime(elapsedTime)}</div>
              <div className="flex items-center gap-1">
                <button
                  onClick={isPaused ? resumeTimer : pauseTimer}
                  className="text-gray-400 hover:text-white"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>
                <button
                  onClick={stopTimer}
                  className="text-gray-400 hover:text-white"
                >
                  <Square className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 