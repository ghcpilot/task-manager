'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, List, Grid, Info, MoreHorizontal, Filter, Plus, Clock } from 'lucide-react';
import TaskCalendar from '@/app/components/ui/TaskCalendar';
import Button from '@/app/components/ui/Button';
import { toast } from 'react-hot-toast';
import TaskForm from '@/app/components/ui/TaskForm';

// Task interface matching the one in TaskCalendar
interface Task {
  id: string;
  title: string;
  date: string; // ISO format: YYYY-MM-DD
  time?: string;
  status: 'completed' | 'in_progress' | 'pending' | 'overdue';
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  projectId?: string;
}

// Test data for tasks
const DUMMY_TASKS: Task[] = [
  {
    id: '1',
    title: 'Team meeting',
    date: new Date().toISOString().split('T')[0], // Today
    time: '10:00',
    status: 'pending',
    description: 'Weekly team sync with product and design'
  },
  {
    id: '2',
    title: 'Client call',
    date: new Date().toISOString().split('T')[0], // Today
    time: '14:30',
    status: 'pending',
    description: 'Discuss project requirements'
  },
  {
    id: '3',
    title: 'Design review',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: '11:00',
    status: 'pending',
    description: 'Review homepage mockups'
  },
  {
    id: '4',
    title: 'Submit proposal',
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Day after tomorrow
    time: '15:00',
    status: 'pending',
    description: 'Complete project proposal and send to client'
  },
  {
    id: '5',
    title: 'Finalize budget',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    time: '09:30',
    status: 'completed',
    description: 'Review and approve project budget'
  },
  {
    id: '6',
    title: 'Technical planning',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 days ago
    time: '13:00',
    status: 'completed',
    description: 'Define technical architecture'
  },
  {
    id: '7',
    title: 'Project deadline',
    date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0], // 10 days from now
    time: '17:00',
    status: 'overdue',
    description: 'Final project delivery'
  },
];

// Generate more tasks for the calendar
const generateMoreTasks = (): Task[] => {
  const tasks = [...DUMMY_TASKS];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Generate 20 random tasks
  for (let i = 0; i < 20; i++) {
    const randomDay = Math.floor(Math.random() * 28) + 1;
    const date = new Date(currentYear, currentMonth, randomDay);
    
    // Skip dates that fall outside the current month
    if (date.getMonth() !== currentMonth) continue;
    
    const taskDate = date.toISOString().split('T')[0];
    const randomHour = Math.floor(Math.random() * 12) + 8;
    const randomMinute = Math.floor(Math.random() * 4) * 15;
    const taskTime = `${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}`;
    
    const statusOptions = ['completed', 'in_progress', 'pending', 'overdue'];
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)] as Task['status'];
    
    tasks.push({
      id: `task-${i + 4}`,
      title: `Task ${i + 1}`,
      date: taskDate,
      time: taskTime,
      status: randomStatus,
      description: `This is a description for Task ${i + 1}`
    });
  }
  
  return tasks;
};

export default function CalendarPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Fetch tasks from local storage (simulating database)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get tasks from local storage
        const savedTasks = localStorage.getItem('savedTasks') 
          ? JSON.parse(localStorage.getItem('savedTasks') || '[]') 
          : [];
        
        if (savedTasks.length > 0) {
          setTasks(savedTasks);
        } else {
          // If no saved tasks, use some sample data
          const sampleTasks = [
            {
              id: '1',
              title: 'Team meeting',
              date: new Date().toISOString().split('T')[0], // Today
              time: '10:00',
              status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'overdue',
              description: 'Weekly team sync with product and design',
              projectId: 'project-1'
            },
            {
              id: '2',
              title: 'Client call',
              date: new Date().toISOString().split('T')[0], // Today
              time: '14:30',
              status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'overdue',
              description: 'Discuss project requirements',
              projectId: 'project-1'
            },
            {
              id: '3',
              title: 'Design review',
              date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
              time: '11:00',
              status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'overdue',
              description: 'Review homepage mockups',
              projectId: 'project-2'
            }
          ];
          setTasks(sampleTasks as Task[]);
          localStorage.setItem('savedTasks', JSON.stringify(sampleTasks));
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  // Handle date click on calendar
  const handleDateClick = (date: Date, tasksForDate: Task[]) => {
    console.log('Date clicked:', date, 'Tasks:', tasksForDate);
    
    if (tasksForDate.length > 0) {
      setSelectedTask(tasksForDate[0]);
    } else {
      // Create a new task for this date
      const newTaskDate = date.toISOString().split('T')[0];
      setSelectedDate(newTaskDate);
      setIsAddingTask(true);
    }
  };
  
  // Handle task click
  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
    setSelectedTask(task);
  };
  
  // Handle task addition
  const handleTaskAdded = async (taskData: any) => {
    try {
      setIsSubmitting(true);
      
      // Prepare the task data for API submission
      const newTaskData = {
        title: taskData.title,
        description: taskData.description || '',
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        projectId: taskData.projectId,
        status: 'pending'
      };
      
      console.log('Saving task with data:', newTaskData);
      
      // In a real app, this would be a real API endpoint
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a new task with a generated ID
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title,
        date: taskData.dueDate,
        status: 'pending',
        description: taskData.description || undefined,
        priority: taskData.priority,
        projectId: taskData.projectId
      };
      
      // For persistence between page reloads (simulating a database)
      const savedTasks = localStorage.getItem('savedTasks') 
        ? JSON.parse(localStorage.getItem('savedTasks') || '[]') 
        : [];
      
      // Add the new task to local storage
      localStorage.setItem('savedTasks', JSON.stringify([...savedTasks, newTask]));
      
      // Add the new task to the task list
      setTasks(prevTasks => [...prevTasks, newTask]);
      setIsAddingTask(false);
      toast.success('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <div className="flex items-center space-x-2">
            {/* View toggle */}
            <div className="flex bg-[#1e1e1e] rounded-md p-1">
              <button
                onClick={() => setView('calendar')}
                className={`p-2 rounded ${view === 'calendar' ? 'bg-[#ffffff]/20 text-[#ffffff]' : 'text-gray-400'}`}
              >
                <Calendar className="h-5 w-5" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded ${view === 'list' ? 'bg-[#ffffff]/20 text-[#ffffff]' : 'text-gray-400'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
            
            {/* Create task button */}
            <Button
              variant="default"
              size="sm"
              className="px-3"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setIsAddingTask(true)}
            >
              Add Task
            </Button>
          </div>
        </div>
        
        {/* Calendar view */}
        {view === 'calendar' && (
          <div className="glass-card rounded-xl p-6 border border-[#ffffff]/20">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ffffff]"></div>
              </div>
            ) : (
              <TaskCalendar 
                tasks={tasks}
                onTaskClick={handleTaskClick}
                onDateClick={handleDateClick}
                darkMode={darkMode}
              />
            )}
          </div>
        )}
        
        {/* List view */}
        {view === 'list' && (
          <div className="glass-card rounded-xl p-6 border border-[#ffffff]/20">
            <h2 className="text-lg font-semibold mb-4 text-white">Upcoming Tasks</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ffffff]"></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No tasks found</p>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setIsAddingTask(true)}
                >
                  Add your first task
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks
                  .filter(task => new Date(task.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(task => {
                    const taskDate = new Date(task.date);
                    const isToday = new Date().toDateString() === taskDate.toDateString();
                    const isTomorrow = new Date(new Date().getTime() + 86400000).toDateString() === taskDate.toDateString();
                    
                    let dateLabel = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    if (isToday) dateLabel = 'Today';
                    if (isTomorrow) dateLabel = 'Tomorrow';
                    
                    return (
                      <div 
                        key={task.id}
                        className="p-3 rounded-lg bg-[#111111]/60 hover:bg-[#ffffff]/5 cursor-pointer transition-colors border border-[#ffffff]/10"
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-medium">{task.title}</h3>
                            {task.description && (
                              <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                              ${task.status === 'completed' 
                                ? 'bg-green-500/20 text-green-400' 
                                : task.status === 'in_progress' 
                                  ? 'bg-blue-500/20 text-blue-400' 
                                  : task.status === 'overdue'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {task.status.replace('_', ' ')}
                            </span>
                            <div className="flex items-center mt-2 text-gray-400 text-sm">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>{dateLabel}</span>
                              {task.time && (
                                <>
                                  <span className="mx-1">•</span>
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>{task.time}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </motion.div>
      
      {/* Add Task Modal */}
      {isAddingTask && (
        <TaskForm 
          onClose={() => setIsAddingTask(false)}
          onSubmit={handleTaskAdded}
          isSubmitting={isSubmitting}
          showProjectSelector={true}
        />
      )}
    </main>
  );
} 