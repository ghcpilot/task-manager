'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter,
  Calendar as CalendarIcon,
  Clock,
  X,
  Save
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { useApi } from '@/lib/hooks/useApi';

interface Task {
  id: string;
  title: string;
  date: string; // ISO format: YYYY-MM-DD
  status: 'completed' | 'in_progress' | 'pending' | 'overdue';
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  projectId?: string;
  projectName?: string;
  color?: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

export default function CalendarPage() {
  const { user, isAuthenticated } = useAuth();
  const api = useApi();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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

  // Load tasks and projects from Firebase
  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load projects and tasks in parallel
      const [firebaseProjects, firebaseTasks] = await Promise.all([
        api.get('/api/projects'),
        api.get('/api/tasks')
      ]);
      
      // Convert Firebase projects to local format
      const convertedProjects: Project[] = [
        { id: 'all', name: 'All Projects', color: '#6366f1' },
        ...firebaseProjects.map((p: any) => ({
          id: p.id,
          name: p.name,
          color: p.color
        }))
      ];
      setProjects(convertedProjects);
      
      // Set default project if none selected and projects exist
      if (!newTask.projectId && firebaseProjects.length > 0) {
        setNewTask(prev => ({ ...prev, projectId: firebaseProjects[0].id }));
      }
      
      // Convert Firebase tasks to local format
      const convertedTasks: Task[] = firebaseTasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        date: t.dueDate ? new Date(t.dueDate.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        projectName: firebaseProjects.find((p: any) => p.id === t.projectId)?.name || 'Unknown Project',
        color: firebaseProjects.find((p: any) => p.id === t.projectId)?.color || '#6366f1'
      }));
      setTasks(convertedTasks);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Get calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Get previous month's last days to fill the grid
  const prevMonth = new Date(year, month - 1, 0);
  const daysInPrevMonth = prevMonth.getDate();

  // Generate calendar grid
  const calendarDays = [];
  
  // Previous month's days
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    calendarDays.push({
      date: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
      fullDate: new Date(year, month - 1, daysInPrevMonth - i)
    });
  }
  
  // Current month's days
  for (let date = 1; date <= daysInMonth; date++) {
    calendarDays.push({
      date,
      isCurrentMonth: true,
      isToday: isCurrentMonth && date === todayDate,
      fullDate: new Date(year, month, date)
    });
  }
  
  // Next month's days to complete the grid
  const remainingDays = 42 - calendarDays.length;
  for (let date = 1; date <= remainingDays; date++) {
    calendarDays.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      fullDate: new Date(year, month + 1, date)
    });
  }

  // Filter tasks by selected project
  const filteredTasks = selectedProject === 'all' 
    ? tasks 
    : tasks.filter(task => task.projectId === selectedProject);

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredTasks.filter(task => task.date === dateStr);
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle date click
  const handleDateClick = (day: any) => {
    if (day.isCurrentMonth) {
      const dateStr = day.fullDate.toISOString().split('T')[0];
      setSelectedDate(dateStr);
      setShowAddTask(true);
    }
  };

  // Handle add task
  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    if (!newTask.projectId) {
      toast.error('Please select a project');
      return;
    }

    try {
      setLoading(true);
      
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        status: 'pending' as const,
        priority: newTask.priority,
        dueDate: selectedDate,
        projectId: newTask.projectId
      };

      await api.post('/api/tasks', taskData);
      
      toast.success('Task added successfully');
      setShowAddTask(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        projectId: projects.length > 1 ? projects[1].id : ''
      });
      
      // Reload data to show the new task
      await loadData();
      
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your calendar</h2>
          <p className="text-gray-400">You need to be authenticated to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-white">
              {monthNames[month]} {year}
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            
            {/* Project Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#111111] rounded-xl border border-white/10 overflow-hidden"
        >
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {dayNames.map(day => (
              <div key={day} className="p-4 text-center">
                <span className="text-sm font-medium text-gray-400">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayTasks = getTasksForDate(day.fullDate);
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`min-h-[120px] p-2 border-r border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                    !day.isCurrentMonth ? 'opacity-30' : ''
                  } ${
                    day.isToday ? 'bg-blue-500/10' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    day.isToday ? 'text-blue-400' : day.isCurrentMonth ? 'text-white' : 'text-gray-500'
                  }`}>
                    {day.date}
                  </div>
                  
                  {/* Tasks for this day */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        className="text-xs p-1 rounded truncate"
                        style={{ backgroundColor: `${task.color}20`, color: task.color }}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Add New Task</h3>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Task Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="Enter task description"
                  />
                </div>

                {/* Project */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Project
                  </label>
                  <select
                    value={newTask.projectId}
                    onChange={(e) => setNewTask(prev => ({ ...prev, projectId: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a project</option>
                    {projects.filter(p => p.id !== 'all').map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="w-full px-3 py-2 bg-[#222222] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Selected Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Due Date
                  </label>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-[#222222] border border-white/10 rounded-lg">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-white">
                      {new Date(selectedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowAddTask(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleAddTask}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Add Task
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 