'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, Plus, Loader2, Filter, Clock, Calendar, 
  CheckCircle, CircleDashed, Circle, Search, PlusCircle,
  List, TableProperties, User, ArrowDown, ArrowUp, Calendar as CalendarIcon,
  Grid, ArrowUpDown, Tag, XCircle, AlertTriangle, MoreHorizontal
} from 'lucide-react';
import Button from '@/app/components/ui/Button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import TaskModal from '@/app/components/ui/TaskModal';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  project?: {
    id: string;
    name: string;
    color: string;
  };
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed' | 'overdue'>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'dueDate' | 'status' | 'project'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const router = useRouter();

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // First try to get tasks from localStorage
        const savedTasks = localStorage.getItem('savedTasks')
          ? JSON.parse(localStorage.getItem('savedTasks') || '[]')
          : [];
          
        if (savedTasks.length > 0) {
          console.log('Loading tasks from localStorage:', savedTasks);
          setTasks(savedTasks);
        } else {
          // Fall back to API if no local tasks
          const response = await fetch('/api/tasks');
          
          if (!response.ok) {
            throw new Error('Failed to fetch tasks');
          }
          
          const data = await response.json();
          setTasks(data);
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

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Sort and filter tasks
  const filteredAndSortedTasks = tasks
    // First filter by status if applicable
    .filter(task => {
      if (filter === 'all') return true;
      return task.status === filter;
    })
    // Then filter by search query
    .filter(task => 
      !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.project?.name && task.project.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    // Then sort
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        comparison = dateA - dateB;
      } else if (sortBy === 'status') {
        const statusOrder = { 'completed': 3, 'in-progress': 2, 'pending': 1, 'overdue': 0 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
      } else if (sortBy === 'project') {
        comparison = (a.project?.name || '').localeCompare(b.project?.name || '');
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Update task status
  const updateTaskStatus = async (taskId: string, status: 'pending' | 'in-progress' | 'completed' | 'overdue') => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      const updatedTask = await response.json();
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      toast.success('Task updated');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  // Handle adding a new task
  const handleTaskAdded = (newTask: Task) => {
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-[#ffffff]" />;
      case 'in-progress':
        return <Circle className="h-4 w-4 text-[#8540ff]" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CircleDashed className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get status text with color
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="text-[#ffffff]">Completed</span>;
      case 'in-progress':
        return <span className="text-[#8540ff]">In Progress</span>;
      case 'pending':
        return <span className="text-yellow-500">Pending</span>;
      case 'overdue':
        return <span className="text-red-500">Overdue</span>;
      default:
        return <span className="text-gray-400">To Do</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-[#2e2e2e] rounded-full border-t-[#ffffff]"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 h-full flex flex-col">
      {/* Command bar */}
      <div className="px-4 py-3 border-b border-[#8540ff]/20 bg-[#0a0118]/30 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={viewMode === 'list' ? 'bg-[#8540ff]/10' : ''}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
          <Button
            variant="ghost" 
            size="sm"
            className={viewMode === 'grid' ? 'bg-[#8540ff]/10' : ''}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4 mr-1" />
            Grid
          </Button>
          <div className="h-4 w-[1px] bg-[#8540ff]/20 mx-2"></div>
          <div className="relative">
            <Button 
              size="sm" 
              variant="ghost"
              className={`${showFilterMenu ? 'bg-[#8540ff]/20' : ''} ${filter !== 'all' ? 'text-[#8540ff]' : ''}`}
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <Filter className="h-4 w-4 mr-1" />
              {filter === 'all' ? 'All Tasks' : filter === 'in-progress' ? 'In Progress' : filter === 'completed' ? 'Completed' : filter === 'overdue' ? 'Overdue' : 'To Do'}
            </Button>
            
            <AnimatePresence>
              {showFilterMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 w-48 bg-[#0a0118] border border-[#8540ff]/20 rounded-md shadow-lg z-10 p-2"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => { setFilter('all'); setShowFilterMenu(false); }}
                      className={`text-left px-3 py-1.5 rounded-md text-sm ${filter === 'all' ? 'bg-[#8540ff]/20 text-white' : 'text-gray-300 hover:bg-[#8540ff]/10'}`}
                    >
                      All Tasks
                    </button>
                    <button
                      onClick={() => { setFilter('pending'); setShowFilterMenu(false); }}
                      className={`text-left px-3 py-1.5 rounded-md text-sm ${filter === 'pending' ? 'bg-[#8540ff]/20 text-white' : 'text-gray-300 hover:bg-[#8540ff]/10'}`}
                    >
                      To Do
                    </button>
                    <button
                      onClick={() => { setFilter('in-progress'); setShowFilterMenu(false); }}
                      className={`text-left px-3 py-1.5 rounded-md text-sm ${filter === 'in-progress' ? 'bg-[#8540ff]/20 text-white' : 'text-gray-300 hover:bg-[#8540ff]/10'}`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => { setFilter('completed'); setShowFilterMenu(false); }}
                      className={`text-left px-3 py-1.5 rounded-md text-sm ${filter === 'completed' ? 'bg-[#8540ff]/20 text-white' : 'text-gray-300 hover:bg-[#8540ff]/10'}`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => { setFilter('overdue'); setShowFilterMenu(false); }}
                      className={`text-left px-3 py-1.5 rounded-md text-sm ${filter === 'overdue' ? 'bg-[#8540ff]/20 text-white' : 'text-gray-300 hover:bg-[#8540ff]/10'}`}
                    >
                      Overdue
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <form className="relative" onSubmit={(e) => e.preventDefault()}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0c0428]/80 rounded-md pl-10 pr-4 py-2 text-sm border border-[#8540ff]/20 focus:outline-none focus:ring-1 focus:ring-[#8540ff]/50 text-white w-full md:w-64"
            />
          </form>
          <Button 
            variant="default"
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden md:inline">New Task</span>
          </Button>
        </div>
      </div>
      
      {/* Tasks content */}
      <div className="flex-1 overflow-auto">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="bg-[#0a0118] rounded-full p-4 mb-4">
              <CheckSquare className="h-8 w-8 text-[#8540ff]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
            <p className="text-gray-400 mb-4 text-center">
              {searchQuery 
                ? 'Try a different search term or filter' 
                : filter !== 'all' 
                  ? `No ${filter} tasks found. Try a different filter.` 
                  : 'Get started by creating your first task'}
            </p>
            {!searchQuery && filter === 'all' && (
              <Button 
                variant="default"
                onClick={() => setIsAddingTask(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              // List view
              <div className="p-4 space-y-2">
                {filteredAndSortedTasks.map((task) => (
                  <Link href={`/dashboard/tasks/${task.id}`} key={task.id}>
                    <div className="rounded-md border border-[#8540ff]/20 bg-[#0a0118]/60 p-3 hover:border-[#8540ff]/40 transition-all cursor-pointer flex items-center group">
                      <div className="flex-shrink-0 p-1 mr-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateTaskStatus(
                              task.id,
                              task.status === 'completed' 
                                ? 'pending' 
                                : task.status === 'in-progress' 
                                  ? 'completed' 
                                  : task.status === 'overdue' 
                                    ? 'pending' 
                                    : 'in-progress'
                            );
                          }}
                          className="hover:scale-110 transition-transform"
                        >
                          {getStatusIcon(task.status)}
                        </button>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-white'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-gray-400 text-sm line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 ml-4">
                        {task.project && (
                          <div className="hidden md:flex items-center gap-1.5">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: task.project.color }}
                            ></div>
                            <span className="text-gray-400 text-sm">{task.project.name}</span>
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <div className="flex items-center text-sm">
                            <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-[#ffffff]" />
                            <span className="text-gray-400">{formatDate(task.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              // Grid view
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-xl p-4 border border-[#8540ff]/20 hover:border-[#8540ff]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div 
                        className="px-2 py-1 rounded-md text-xs"
                        style={{ 
                          backgroundColor: `${task.project?.color}20`,
                          color: task.project?.color
                        }}
                      >
                        {task.project?.name}
                      </div>
                      <span className={`
                        px-2 py-1 rounded-full text-xs
                        ${task.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                          task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' : 
                          task.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                          'bg-red-500/20 text-red-400'}
                      `}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <h3 className="text-white font-medium mb-2">{task.title}</h3>
                    
                    {task.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="mt-4 space-y-2">
                      {task.dueDate && (
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-gray-300">{formatDate(task.dueDate)}</span>
                        </div>
                      )}
                      
                      {task.assignee && (
                        <div className="flex items-center text-sm">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-gray-300">{task.assignee}</span>
                        </div>
                      )}
                      
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center text-sm">
                          <Tag className="h-4 w-4 mr-2 text-gray-500" />
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="bg-[#8540ff]/10 text-[#8540ff] px-1.5 py-0.5 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-[#8540ff]/10 flex justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#8540ff]"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400"
                      >
                        View
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Task Modal */}
      {isAddingTask && (
        <TaskModal
          isOpen={true}
          onClose={() => setIsAddingTask(false)}
          onAddTask={handleTaskAdded}
        />
      )}
    </main>
  );
} 