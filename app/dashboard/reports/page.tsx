'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, PieChart, LineChart, CheckSquare, 
  Clock, Calendar, Loader2, Filter, Plus
} from 'lucide-react';
import Button from '@/app/components/ui/Button';

interface Project {
  id: string;
  name: string;
  color: string;
  _count: {
    tasks: number;
  };
}

interface Task {
  id: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
}

interface TaskStatusCount {
  status: string;
  count: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects
        const projectsResponse = await fetch('/api/projects');
        if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
        
        // Fetch tasks
        const tasksResponse = await fetch('/api/tasks');
        if (!tasksResponse.ok) throw new Error('Failed to fetch tasks');
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter tasks based on timeframe
  const filteredTasks = tasks.filter(task => {
    if (timeframe === 'all') return true;
    
    const taskDate = new Date(task.createdAt);
    const now = new Date();
    
    if (timeframe === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return taskDate >= weekAgo;
    }
    
    if (timeframe === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return taskDate >= monthAgo;
    }
    
    return true;
  });
  
  // Calculate task status counts
  const taskStatusCounts: TaskStatusCount[] = [
    { status: 'Pending', count: filteredTasks.filter(t => t.status === 'pending').length },
    { status: 'In Progress', count: filteredTasks.filter(t => t.status === 'in-progress').length },
    { status: 'Completed', count: filteredTasks.filter(t => t.status === 'completed').length }
  ];
  
  // Calculate completion rate
  const completionRate = filteredTasks.length > 0
    ? Math.round((filteredTasks.filter(t => t.status === 'completed').length / filteredTasks.length) * 100)
    : 0;
  
  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-[#8540ff] animate-spin mb-4" />
          <p className="text-gray-400">Loading reports...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Reports</h1>
            <p className="text-gray-400 mt-1">View insights and analytics about your productivity</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-[#111111] rounded-md border border-[#2e2e2e] p-1">
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'all')}
                className="bg-transparent text-white text-sm px-3 py-1 focus:outline-none focus:ring-0"
              >
                <option value="week" className="bg-[#111111]">Last 7 Days</option>
                <option value="month" className="bg-[#111111]">Last 30 Days</option>
                <option value="all" className="bg-[#111111]">All Time</option>
              </select>
            </div>
            
            <Button
              variant="default"
              size="sm"
              className="px-3"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => alert('Export functionality would go here')}
            >
              Export
            </Button>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div 
            className="glass-card rounded-xl p-5 border border-[#ffffff]/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Tasks</p>
                <h3 className="text-2xl font-bold text-white">{filteredTasks.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#ffffff]/10 flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-[#ffffff]" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
              <span className="text-gray-400">
                {timeframe === 'week' ? 'Last 7 days' : timeframe === 'month' ? 'Last 30 days' : 'All time'}
              </span>
            </div>
          </motion.div>
          
          <motion.div 
            className="glass-card rounded-xl p-5 border border-[#ffffff]/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Projects</p>
                <h3 className="text-2xl font-bold text-white">{projects.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#ffffff]/10 flex items-center justify-center">
                <PieChart className="h-5 w-5 text-[#ffffff]" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-xs py-1 px-2 rounded-full bg-[#ffffff]/20 text-[#ffffff]">
                Active Projects
              </span>
            </div>
          </motion.div>
          
          <motion.div 
            className="glass-card rounded-xl p-5 border border-[#ffffff]/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Completion Rate</p>
                <h3 className="text-2xl font-bold text-white">{completionRate}%</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#ffffff]/10 flex items-center justify-center">
                <LineChart className="h-5 w-5 text-[#ffffff]" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-[#1e1e1e] rounded-full h-2.5">
                <div 
                  className="bg-[#ffffff] h-2.5 rounded-full" 
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Task Status */}
        <motion.div 
          className="glass-card rounded-xl p-6 border border-[#ffffff]/20 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Task Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {taskStatusCounts.map((status) => (
              <div 
                key={status.status} 
                className="bg-[#111111] rounded-lg p-4 border border-[#2e2e2e]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{status.status}</span>
                  <span 
                    className={`text-xs px-2 py-1 rounded-full ${
                      status.status === 'Completed' 
                        ? 'bg-[#ffffff]/20 text-[#ffffff]' 
                        : status.status === 'In Progress'
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {status.count}
                  </span>
                </div>
                <div className="w-full bg-[#1e1e1e] rounded-full h-2.5 mb-1">
                  <div 
                    className={`h-2.5 rounded-full ${
                      status.status === 'Completed' 
                        ? 'bg-[#ffffff]' 
                        : status.status === 'In Progress'
                          ? 'bg-blue-500' 
                          : 'bg-yellow-500'
                    }`} 
                    style={{ 
                      width: `${filteredTasks.length > 0 
                        ? (status.count / filteredTasks.length) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {filteredTasks.length > 0 
                    ? Math.round((status.count / filteredTasks.length) * 100) 
                    : 0}% of total
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Recent Activity and Project Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Recent Activity */}
          <motion.div 
            className="glass-card rounded-xl p-6 border border-[#ffffff]/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No activity in this timeframe</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((task, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 ${
                        task.status === 'completed' 
                          ? 'bg-[#ffffff]' 
                          : task.status === 'in-progress' 
                            ? 'bg-blue-500' 
                            : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          Task {task.status === 'completed' ? 'completed' : 'updated'}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {new Date(task.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </motion.div>
          
          {/* Project Distribution */}
          <motion.div 
            className="glass-card rounded-xl p-6 border border-[#ffffff]/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Project Distribution</h2>
            
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No projects found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3" 
                      style={{ backgroundColor: project.color || '#ffffff' }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-white text-sm">{project.name}</p>
                        <span className="text-xs text-gray-400">{project._count.tasks} tasks</span>
                      </div>
                      <div className="w-full bg-[#1e1e1e] rounded-full h-1.5 mt-1">
                        <div 
                          className="h-1.5 rounded-full" 
                          style={{ 
                            backgroundColor: project.color || '#ffffff',
                            width: `${Math.min(100, project._count.tasks * 10)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Productivity Trends */}
        <motion.div 
          className="glass-card rounded-xl p-6 border border-[#ffffff]/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6">Productivity Trends</h2>
          
          <div className="text-center text-gray-400 py-10">
            <BarChart2 className="h-12 w-12 mx-auto mb-4 text-[#ffffff]/40" />
            <p className="text-lg mb-2">Productivity chart will appear here</p>
            <p className="text-sm max-w-md mx-auto">
              Complete more tasks to see your productivity trends and patterns visualized
            </p>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
} 