'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Loader2, Trash2, 
  Plus, CheckCircle, Clock, CalendarDays, Edit,
  Filter, CheckSquare, X, PlusCircle, Search,
  Info, BarChart3, Settings
} from 'lucide-react';
import Button from '@/app/components/ui/Button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import TaskModal from '@/app/components/ui/TaskModal';
import ProjectEditModal from '@/app/components/ui/ProjectEditModal';
import ConfirmationDialog from '@/app/components/ui/ConfirmationDialog';
import TaskDeleteConfirmation from '@/app/components/ui/TaskDeleteConfirmation';

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
}

export default function ProjectDetailPage() {
  // Use the useParams hook to get the id parameter
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isConfirmingTaskDelete, setIsConfirmingTaskDelete] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'board' | 'info'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${projectId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Project not found');
          }
          throw new Error('Failed to fetch project');
        }
        
        const data = await response.json();
        
        // Check localStorage for tasks related to this project
        const savedTasks = localStorage.getItem('savedTasks') 
          ? JSON.parse(localStorage.getItem('savedTasks') || '[]') 
          : [];
        
        // Filter tasks for this project
        const projectTasks = savedTasks.filter((task: any) => task.projectId === projectId)
          .map((task: any) => ({
            ...task,
            status: task.status === 'pending' ? 'pending' : 
                   task.status === 'completed' ? 'completed' : 'in-progress'
          }));
        
        // Add tasks to the project
        const projectWithTasks = {
          ...data,
          tasks: projectTasks.length > 0 ? projectTasks : data.tasks || []
        };
        
        setProject(projectWithTasks);
        setError(null);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
        toast.error('Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId]);
  
  // Handle adding a new task
  const handleTaskAdded = (newTask: Task) => {
    if (project) {
      // Update local state
      const updatedProject = {
        ...project,
        tasks: [newTask, ...project.tasks]
      };
      setProject(updatedProject);
      
      // Save to localStorage for persistence
      const savedTasks = localStorage.getItem('savedTasks') 
        ? JSON.parse(localStorage.getItem('savedTasks') || '[]') 
        : [];
      
      // Add the new task to localStorage
      const taskWithProjectId = {
        ...newTask,
        projectId: projectId
      };
      localStorage.setItem('savedTasks', JSON.stringify([...savedTasks, taskWithProjectId]));
    }
    
    toast.success('Task added successfully');
    setIsAddingTask(false);
  };
  
  // Handle updating project
  const handleProjectUpdated = (updatedProject: Project) => {
    if (project) {
      setProject({
        ...project,
        name: updatedProject.name,
        description: updatedProject.description,
        color: updatedProject.color
      });
    }
  };
  
  const updateTaskStatus = async (taskId: string, status: 'pending' | 'in-progress' | 'completed') => {
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
      if (project) {
        setProject({
          ...project,
          tasks: project.tasks.map(task => 
            task.id === taskId ? updatedTask : task
          )
        });
      }
      
      toast.success('Task updated');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };
  
  // Handle task deletion
  const handleTaskDeleted = (taskId: string) => {
    if (project) {
      setProject({
        ...project,
        tasks: project.tasks.filter(task => task.id !== taskId)
      });
    }
    setTaskToDelete(null);
  };
  
  const deleteTask = async (taskId: string) => {
    const taskToDelete = project?.tasks.find(task => task.id === taskId);
    if (taskToDelete) {
      setTaskToDelete(taskToDelete);
      setIsConfirmingTaskDelete(true);
    }
  };
  
  const deleteProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      toast.success('Project deleted');
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Filter tasks based on search query
  const filteredTasks = project?.tasks.filter(task => 
    !searchQuery || 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];
  
  // Group tasks by status
  const pendingTasks = filteredTasks.filter(task => task.status === 'pending');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');
  
  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-[#ffffff] animate-spin mb-4" />
          <p className="text-gray-400">Loading project...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card rounded-xl p-8 border border-[#ffffff]/20 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button 
              variant="default"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return null;
  }

  console.log("isAddingTask state:", isAddingTask);

  return (
    <main className="flex-1 h-full flex flex-col">
      {/* Command bar */}
      <div className="px-4 py-3 border-b border-[#2e2e2e] bg-[#111111]/30 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={activeTab === 'board' ? 'bg-[#ffffff]/10' : ''}
            onClick={() => setActiveTab('board')}
          >
            <CheckSquare className="h-4 w-4 mr-1" />
            Tasks
          </Button>
          <Button
            variant="ghost" 
            size="sm"
            className={activeTab === 'info' ? 'bg-[#ffffff]/10' : ''}
            onClick={() => setActiveTab('info')}
          >
            <Info className="h-4 w-4 mr-1" />
            Info
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          {activeTab === 'board' && (
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1e1e1e]/80 rounded-md pl-10 pr-4 py-2 text-sm border border-[#ffffff]/20 focus:outline-none focus:ring-1 focus:ring-[#ffffff]/50 text-white w-full md:w-64"
              />
            </form>
          )}
          <Button 
            variant={activeTab === 'info' ? 'ghost' : 'default'}
            size="sm"
            onClick={() => setIsEditingProject(true)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          {activeTab === 'board' && (
            <Button 
              variant="default"
              onClick={() => {
                console.log("Add Task button clicked");
                setIsAddingTask(true);
              }}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Task</span>
            </Button>
          )}
        </div>
      </div>

      {/* Project header */}
      <div className="border-b border-[#2e2e2e] bg-[#111111]/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-5 h-5 rounded-full flex-shrink-0" 
            style={{ backgroundColor: project.color }}
          ></div>
          <h1 className="text-xl font-bold text-white">{project.name}</h1>
        </div>
        {project.description && (
          <p className="text-gray-400 mt-2 ml-8">{project.description}</p>
        )}
      </div>

      {/* Main content - Project board or info */}
      {activeTab === 'board' ? (
        <div className="flex-1 overflow-auto px-4 py-4">
          {/* Tasks Kanban board */}
          <div className="flex gap-4 h-full pb-4">
            {/* To do column */}
            <div className="flex-1 min-w-[300px] flex flex-col h-full">
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                  <h3 className="text-sm font-medium text-white">To Do</h3>
                  <span className="ml-2 text-xs bg-gray-400/10 text-gray-400 px-2 py-0.5 rounded-full">{pendingTasks.length}</span>
                </div>
              </div>
              
              <div className="bg-[#1e1e1e]/30 rounded-lg h-full overflow-y-auto p-2 space-y-2 border border-[#ffffff]/10">
                {pendingTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <p className="text-gray-500 text-sm">No tasks to do</p>
                    <button 
                      onClick={() => setIsAddingTask(true)}
                      className="mt-2 text-[#ffffff] text-sm hover:underline flex items-center"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add task
                    </button>
                  </div>
                ) : (
                  pendingTasks.map(task => (
                    <div 
                      key={task.id}
                      className="bg-[#111111] rounded-md p-3 shadow-sm border border-[#ffffff]/10 hover:border-[#ffffff]/30 cursor-pointer group"
                      onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-white font-medium mb-1">{task.title}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateTaskStatus(task.id, 'in-progress');
                          }}
                        >
                          <ArrowLeft className="h-3 w-3 text-gray-400 rotate-90" />
                        </Button>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-400 text-xs my-2 line-clamp-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 text-xs">
                        {task.dueDate ? (
                          <div className="flex items-center text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        ) : (
                          <span></span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* In Progress column */}
            <div className="flex-1 min-w-[300px] flex flex-col h-full">
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#ffffff] mr-2"></div>
                  <h3 className="text-sm font-medium text-white">In Progress</h3>
                  <span className="ml-2 text-xs bg-[#ffffff]/10 text-[#ffffff] px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
                </div>
              </div>
              
              <div className="bg-[#1e1e1e]/30 rounded-lg h-full overflow-y-auto p-2 space-y-2 border border-[#ffffff]/10">
                {inProgressTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-center">
                    <p className="text-gray-500 text-sm">No tasks in progress</p>
                  </div>
                ) : (
                  inProgressTasks.map(task => (
                    <div 
                      key={task.id}
                      className="bg-[#111111] rounded-md p-3 shadow-sm border border-[#ffffff]/10 hover:border-[#ffffff]/30 cursor-pointer group"
                      onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-white font-medium mb-1">{task.title}</h4>
                        <div className="flex">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, 'pending');
                            }}
                          >
                            <ArrowLeft className="h-3 w-3 text-gray-400 -rotate-90" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, 'completed');
                            }}
                          >
                            <ArrowLeft className="h-3 w-3 text-gray-400 rotate-90" />
                          </Button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-400 text-xs my-2 line-clamp-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 text-xs">
                        {task.dueDate ? (
                          <div className="flex items-center text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        ) : (
                          <span></span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Completed column */}
            <div className="flex-1 min-w-[300px] flex flex-col h-full">
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#ffffff] mr-2"></div>
                  <h3 className="text-sm font-medium text-white">Completed</h3>
                  <span className="ml-2 text-xs bg-[#ffffff]/10 text-[#ffffff] px-2 py-0.5 rounded-full">{completedTasks.length}</span>
                </div>
              </div>
              
              <div className="bg-[#1e1e1e]/30 rounded-lg h-full overflow-y-auto p-2 space-y-2 border border-[#ffffff]/10">
                {completedTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-center">
                    <p className="text-gray-500 text-sm">No completed tasks</p>
                  </div>
                ) : (
                  completedTasks.map(task => (
                    <div 
                      key={task.id}
                      className="bg-[#111111] rounded-md p-3 shadow-sm border border-[#ffffff]/10 hover:border-[#ffffff]/30 cursor-pointer group"
                      onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-white font-medium mb-1 line-through opacity-70">{task.title}</h4>
                        <div className="flex">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, 'in-progress');
                            }}
                          >
                            <ArrowLeft className="h-3 w-3 text-gray-400 -rotate-90" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-400 text-xs my-2 line-clamp-2 opacity-70">{task.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 text-xs">
                        <div className="flex items-center text-green-400/70">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>Completed</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Project info tab
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#111111]/60 rounded-lg border border-[#ffffff]/20 p-6 mb-6">
              <h2 className="text-white text-lg font-medium mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2 text-[#ffffff]" />
                Project Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Project Name</p>
                  <p className="text-white">{project.name}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-1">Description</p>
                  <p className="text-white">{project.description || 'No description provided'}</p>
                </div>
                
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Created On</p>
                    <p className="text-white flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-[#ffffff]" />
                      {formatDate(project.createdAt)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Last Updated</p>
                    <p className="text-white flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-[#ffffff]" />
                      {formatDate(project.updatedAt)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Tasks</p>
                    <p className="text-white flex items-center">
                      <CheckSquare className="h-4 w-4 mr-2 text-[#ffffff]" />
                      {project.tasks.length} tasks
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-1">Project Color</p>
                  <div className="flex items-center">
                    <div 
                      className="w-6 h-6 rounded-full mr-2" 
                      style={{ backgroundColor: project.color }}
                    ></div>
                    <span className="text-white">{project.color}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#111111]/60 rounded-lg border border-[#ffffff]/20 p-6">
              <h2 className="text-white text-lg font-medium mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-[#ffffff]" />
                Project Status
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-gray-400 text-sm">Task Status</p>
                    <p className="text-gray-400 text-sm">
                      {completedTasks.length} of {project.tasks.length} completed
                    </p>
                  </div>
                  <div className="h-2 w-full bg-[#1e1e1e] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#ffffff]" 
                      style={{ 
                        width: project.tasks.length > 0 
                          ? `${(completedTasks.length / project.tasks.length) * 100}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-[#1e1e1e]/80 rounded-lg p-3 border border-[#ffffff]/10">
                    <p className="text-gray-400 text-xs mb-1">To Do</p>
                    <p className="text-white text-lg font-semibold">{pendingTasks.length}</p>
                  </div>
                  
                  <div className="bg-[#1e1e1e]/80 rounded-lg p-3 border border-[#ffffff]/10">
                    <p className="text-gray-400 text-xs mb-1">In Progress</p>
                    <p className="text-white text-lg font-semibold">{inProgressTasks.length}</p>
                  </div>
                  
                  <div className="bg-[#1e1e1e]/80 rounded-lg p-3 border border-[#ffffff]/10">
                    <p className="text-gray-400 text-xs mb-1">Completed</p>
                    <p className="text-white text-lg font-semibold">{completedTasks.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500/10"
                onClick={() => setIsConfirmingDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
              
              <Button
                variant="default"
                onClick={() => setIsEditingProject(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isAddingTask && (
        <TaskModal
          isOpen={true}
          projectId={projectId}
          onClose={() => setIsAddingTask(false)}
          onAddTask={handleTaskAdded}
        />
      )}
      
      {isEditingProject && project && (
        <ProjectEditModal
          isOpen={true}
          projectId={projectId}
          initialData={{
            name: project.name,
            description: project.description,
            color: project.color
          }}
          onClose={() => setIsEditingProject(false)}
          onSave={handleProjectUpdated}
        />
      )}
      
      {isConfirmingDelete && (
        <ConfirmationDialog
          isOpen={isConfirmingDelete}
          title="Delete Project"
          message={`Are you sure you want to delete "${project.name}"? All tasks associated with this project will also be deleted. This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          confirmVariant="destructive"
          onConfirm={deleteProject}
          onCancel={() => setIsConfirmingDelete(false)}
        />
      )}
      
      {isConfirmingTaskDelete && taskToDelete && (
        <TaskDeleteConfirmation
          isOpen={isConfirmingTaskDelete}
          taskId={taskToDelete.id}
          taskTitle={taskToDelete.title}
          onClose={() => {
            setIsConfirmingTaskDelete(false);
            setTaskToDelete(null);
          }}
          onDelete={handleTaskDeleted}
        />
      )}
    </main>
  );
} 