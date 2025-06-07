'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, PieChart, CheckSquare, 
  Clock, Calendar, Loader2,
  Target, TrendingUp, Award, Activity, Star,
  Coffee, Brain, Timer, CheckCircle, AlertCircle
} from 'lucide-react';
import { authenticatedFetch } from '@/lib/auth';

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
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}

interface TaskStatusCount {
  status: string;
  count: number;
}

interface ProductivityInsight {
  title: string;
  description: string;
  icon: any;
  value: string;
  trend: 'up' | 'down' | 'stable';
  type: 'good' | 'warning' | 'info';
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
        
        const [projectsResponse, tasksResponse] = await Promise.all([
          authenticatedFetch('/api/projects'),
          authenticatedFetch('/api/tasks')
        ]);
        
        if (projectsResponse.ok && tasksResponse.ok) {
          const [projectsData, tasksData] = await Promise.all([
            projectsResponse.json(),
            tasksResponse.json()
          ]);
          
          // Transform projects data to include task counts
          const projectsWithCounts = projectsData.map((project: any) => ({
            ...project,
            _count: {
              tasks: tasksData.filter((task: any) => task.projectId === project.id).length
            }
          }));
          
          setProjects(projectsWithCounts);
          
          // Transform tasks data to match expected format
          const transformedTasks = tasksData.map((task: any) => ({
            id: task.id,
            status: task.status === 'in_progress' ? 'in-progress' : task.status,
            priority: task.priority || 'medium',
            createdAt: task.createdAt?.toDate ? task.createdAt.toDate().toISOString() : task.createdAt,
            completedAt: task.completedAt?.toDate ? task.completedAt.toDate().toISOString() : undefined
          }));
          
          setTasks(transformedTasks);
          
        } else {
          // Show empty state for no data
          setProjects([]);
          setTasks([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Show empty state on error
        setProjects([]);
        setTasks([]);
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

  // Calculate productivity insights
  const getProductivityInsights = (): ProductivityInsight[] => {
    const completedTasks = filteredTasks.filter(t => t.status === 'completed');
    const highPriorityCompleted = completedTasks.filter(t => t.priority === 'high').length;
    const totalHighPriority = filteredTasks.filter(t => t.priority === 'high').length;
    
    // Calculate daily productivity (tasks completed per day)
    const daySpan = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : Math.max(7, filteredTasks.length > 0 ? 
      Math.ceil((new Date().getTime() - new Date(Math.min(...filteredTasks.map(t => new Date(t.createdAt).getTime()))).getTime()) / (1000 * 60 * 60 * 24)) : 1);
    const dailyAverage = daySpan > 0 ? (completedTasks.length / daySpan).toFixed(1) : '0';
    
    const insights: ProductivityInsight[] = [
      {
        title: 'Daily Average',
        description: 'Tasks completed per day',
        icon: Target,
        value: dailyAverage,
        trend: parseFloat(dailyAverage) >= 2 ? 'up' : parseFloat(dailyAverage) >= 1 ? 'stable' : 'down',
        type: parseFloat(dailyAverage) >= 2 ? 'good' : parseFloat(dailyAverage) >= 1 ? 'info' : 'warning'
      },
      {
        title: 'Completion Rate',
        description: 'Percentage of tasks finished',
        icon: CheckCircle,
        value: `${completionRate}%`,
        trend: completionRate >= 70 ? 'up' : completionRate >= 50 ? 'stable' : 'down',
        type: completionRate >= 70 ? 'good' : completionRate >= 50 ? 'info' : 'warning'
      }
    ];

    if (totalHighPriority > 0) {
      const highPriorityRate = Math.round((highPriorityCompleted / totalHighPriority) * 100);
      insights.push({
        title: 'High Priority Focus',
        description: 'Important tasks completed',
        icon: Star,
        value: `${highPriorityRate}%`,
        trend: highPriorityRate >= 80 ? 'up' : highPriorityRate >= 60 ? 'stable' : 'down',
        type: highPriorityRate >= 80 ? 'good' : highPriorityRate >= 60 ? 'info' : 'warning'
      });
    }

    // Add streak information if we have recent data
    if (completedTasks.length > 0) {
      const recentDays = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toDateString();
      });

      const streak = recentDays.reduce((count, day) => {
        const hasTaskCompleted = completedTasks.some(task => 
          task.completedAt && new Date(task.completedAt).toDateString() === day
        );
        return hasTaskCompleted ? count + 1 : 0;
      }, 0);

      if (streak > 0) {
        insights.push({
          title: 'Current Streak',
          description: 'Days with completed tasks',
          icon: Award,
          value: `${streak} day${streak > 1 ? 's' : ''}`,
          trend: streak >= 3 ? 'up' : streak >= 1 ? 'stable' : 'down',
          type: streak >= 3 ? 'good' : 'info'
        });
      }
    }

    return insights;
  };

  const productivityInsights = getProductivityInsights();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Personal Analytics</h1>
              <p className="text-gray-400 mt-1">Track your productivity and discover patterns in your work</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-[#1a1a1a] rounded-lg border border-white/10 p-1">
                <select 
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'all')}
                  className="bg-transparent text-white text-sm px-3 py-1 focus:outline-none focus:ring-0"
                >
                  <option value="week" className="bg-[#1a1a1a]">Last 7 Days</option>
                  <option value="month" className="bg-[#1a1a1a]">Last 30 Days</option>
                  <option value="all" className="bg-[#1a1a1a]">All Time</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Productivity Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {productivityInsights.map((insight, index) => (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-[#1a1a1a] p-6 rounded-lg border ${
                  insight.type === 'good' ? 'border-green-500/20' :
                  insight.type === 'warning' ? 'border-yellow-500/20' :
                  'border-blue-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${
                    insight.type === 'good' ? 'from-green-500 to-emerald-500' :
                    insight.type === 'warning' ? 'from-yellow-500 to-orange-500' :
                    'from-blue-500 to-purple-500'
                  } flex items-center justify-center`}>
                    <insight.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    insight.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                    insight.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {insight.trend === 'up' ? '↗' : insight.trend === 'down' ? '↘' : '→'}
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{insight.title}</h3>
                  <p className="text-2xl font-bold text-white mb-2">{insight.value}</p>
                  <p className="text-sm text-gray-400">{insight.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div 
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Tasks</p>
                  <h3 className="text-2xl font-bold text-white">{filteredTasks.length}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 text-blue-400" />
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
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Active Projects</p>
                  <h3 className="text-2xl font-bold text-white">{projects.length}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs">
                <span className="text-xs py-1 px-2 rounded-full bg-purple-500/20 text-purple-400">
                  {projects.length > 0 ? 'With Tasks' : 'No Projects Yet'}
                </span>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Completion Rate</p>
                  <h3 className="text-2xl font-bold text-white">{completionRate}%</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <BarChart2 className="h-5 w-5 text-green-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Task Status Chart */}
            <motion.div
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Task Status Distribution
              </h3>
              {filteredTasks.length > 0 ? (
                <div className="space-y-4">
                  {taskStatusCounts.map((item, index) => {
                    const colors = ['#ef4444', '#f59e0b', '#10b981'];
                    const percentage = Math.round((item.count / filteredTasks.length) * 100);
                    
                    return (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors[index] }}
                          ></div>
                          <span className="text-gray-300">{item.status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{item.count}</span>
                          <span className="text-gray-400 text-sm">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-2">No tasks yet</p>
                  <p className="text-sm text-gray-500">Create your first task to see analytics</p>
                </div>
              )}
            </motion.div>

            {/* Project Overview */}
            <motion.div
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BarChart2 className="h-5 w-5 mr-2" />
                Project Overview
              </h3>
              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        ></div>
                        <span className="text-gray-300">{project.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{project._count.tasks}</span>
                        <span className="text-gray-400 text-sm">tasks</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-2">No projects yet</p>
                  <p className="text-sm text-gray-500">Create your first project to organize tasks</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </h3>
            {filteredTasks.length > 0 ? (
              <div className="space-y-3">
                {filteredTasks.slice(0, 5).map((task, index) => (
                  <div key={task.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-gray-300">Task #{index + 1}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {task.status.replace('-', ' ')}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">No recent activity</p>
                <p className="text-sm text-gray-500">Start working on tasks to see your activity</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 