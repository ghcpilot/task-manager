'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  BarChart3, 
  Clock, 
  Calendar,
  Target,
  Award,
  TrendingUp,
  Activity,
  CheckCircle,
  ArrowRight,
  Edit
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import { authenticatedFetch } from '@/lib/auth';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stats {
  totalTasks: number;
  completedTasks: number;
  activeProjects: number;
  todayFocus: number;
  weeklyGoal: number;
  weeklyProgress: number;
  productivity: number;
  streakDays: number;
}

interface Activity {
  id: string;
  type: 'task_completed' | 'project_created' | 'goal_achieved' | 'milestone_reached';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function ProfilePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const router = useRouter();

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Mock data for development
        setTimeout(() => {
          setStats({
            totalTasks: 247,
            completedTasks: 189,
            activeProjects: 8,
            todayFocus: 6,
            weeklyGoal: 25,
            weeklyProgress: 18,
            productivity: 87,
            streakDays: 12
          });

          setRecentActivity([
            {
              id: '1',
              type: 'task_completed',
              title: 'Completed: Website Redesign',
              description: 'Finished the homepage mockups',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            {
              id: '2',
              type: 'goal_achieved',
              title: 'Weekly Goal Achieved!',
              description: 'Completed 25 tasks this week',
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
            },
            {
              id: '3',
              type: 'project_created',
              title: 'New Project: Mobile App',
              description: 'Started planning the mobile application',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
          ]);

          setAchievements([
            {
              id: '1',
              title: 'Productivity Master',
              description: 'Maintained 80%+ productivity for 30 days',
              icon: '🏆',
              unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              rarity: 'legendary'
            },
            {
              id: '2',
              title: 'Task Destroyer',
              description: 'Completed 100 tasks',
              icon: '⚡',
              unlockedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
              rarity: 'epic'
            },
            {
              id: '3',
              title: 'Week Warrior',
              description: 'Completed weekly goals for 4 weeks straight',
              icon: '🎯',
              unlockedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
              rarity: 'rare'
            }
          ]);

          setIsLoading(false);
        }, 800);

        // Uncomment when API is ready
        /*
        const [statsRes, activityRes, achievementsRes] = await Promise.all([
          authenticatedFetch('/api/user/stats'),
          authenticatedFetch('/api/user/activity'),
          authenticatedFetch('/api/user/achievements')
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (activityRes.ok) setRecentActivity(await activityRes.json());
        if (achievementsRes.ok) setAchievements(await achievementsRes.json());
        */
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'task_completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'project_created': return <Target className="w-4 h-4 text-blue-500" />;
      case 'goal_achieved': return <Award className="w-4 h-4 text-yellow-500" />;
      case 'milestone_reached': return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] light:bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 light:text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] light:bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 border border-blue-500/30 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {user?.email?.split('@')[0] || 'Shaktimaan'}! 👋
                  </h1>
                  <p className="text-white/80 text-lg">Here's your productivity overview</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
                      🔥 {stats?.streakDays || 0} day streak
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
                      📊 {stats?.productivity || 0}% productivity
                    </div>
                  </div>
                </div>
              </div>
              <Link href="/dashboard/settings">
                <Button className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-[#1a1a1a] light:bg-white border border-white/10 light:border-gray-200 rounded-xl p-6 light:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white light:text-gray-900">{stats?.totalTasks || 0}</span>
            </div>
            <h3 className="text-gray-400 light:text-gray-600 text-sm font-medium">Total Tasks</h3>
            <p className="text-green-400 light:text-green-600 text-xs mt-1">
              {stats?.completedTasks || 0} completed
            </p>
          </div>

          <div className="bg-[#1a1a1a] light:bg-white border border-white/10 light:border-gray-200 rounded-xl p-6 light:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white light:text-gray-900">{stats?.activeProjects || 0}</span>
            </div>
            <h3 className="text-gray-400 light:text-gray-600 text-sm font-medium">Active Projects</h3>
            <p className="text-blue-400 light:text-blue-600 text-xs mt-1">In progress</p>
          </div>

          <div className="bg-[#1a1a1a] light:bg-white border border-white/10 light:border-gray-200 rounded-xl p-6 light:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white light:text-gray-900">{stats?.todayFocus || 0}</span>
            </div>
            <h3 className="text-gray-400 light:text-gray-600 text-sm font-medium">Today's Focus</h3>
            <p className="text-orange-400 light:text-orange-600 text-xs mt-1">Tasks planned</p>
          </div>

          <div className="bg-[#1a1a1a] light:bg-white border border-white/10 light:border-gray-200 rounded-xl p-6 light:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white light:text-gray-900">
                {stats?.weeklyProgress || 0}/{stats?.weeklyGoal || 0}
              </span>
            </div>
            <h3 className="text-gray-400 light:text-gray-600 text-sm font-medium">Weekly Goal</h3>
            <div className="w-full bg-gray-700 light:bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(((stats?.weeklyProgress || 0) / (stats?.weeklyGoal || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-[#1a1a1a] light:bg-white border border-white/10 light:border-gray-200 rounded-xl p-6 light:shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white light:text-gray-900">Recent Activity</h2>
                <Link href="/dashboard/work">
                  <Button variant="ghost" size="sm" className="text-blue-400 light:text-blue-600 hover:text-blue-300 light:hover:text-blue-700">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-[#222222] light:bg-gray-50 border border-white/5 light:border-gray-200">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white light:text-gray-900 font-medium text-sm">{activity.title}</p>
                      <p className="text-gray-400 light:text-gray-600 text-xs mt-1">{activity.description}</p>
                      <p className="text-gray-500 light:text-gray-500 text-xs mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-[#1a1a1a] light:bg-white border border-white/10 light:border-gray-200 rounded-xl p-6 light:shadow-lg">
              <h2 className="text-xl font-semibold text-white light:text-gray-900 mb-6">Recent Achievements</h2>
              
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-4 rounded-lg bg-gradient-to-r ${getRarityColor(achievement.rarity)} bg-opacity-20`}>
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-white light:text-gray-900 font-semibold text-sm">{achievement.title}</h3>
                        <p className="text-gray-300 light:text-gray-700 text-xs mt-1">{achievement.description}</p>
                        <p className="text-gray-400 light:text-gray-600 text-xs mt-2">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/dashboard/achievements">
                <Button variant="ghost" className="w-full mt-4 text-blue-400 light:text-blue-600 hover:text-blue-300 light:hover:text-blue-700">
                  View All Achievements <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <div className="bg-[#1a1a1a] light:bg-white border border-white/10 light:border-gray-200 rounded-xl p-6 light:shadow-lg">
            <h2 className="text-xl font-semibold text-white light:text-gray-900 mb-6">Quick Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/work">
                <div className="p-4 rounded-lg bg-[#222222] light:bg-gray-50 border border-white/5 light:border-gray-200 hover:border-blue-500/50 light:hover:border-blue-300 transition-all cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white light:text-gray-900 font-medium">View Projects</h3>
                      <p className="text-gray-400 light:text-gray-600 text-sm">Manage your active work</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/settings">
                <div className="p-4 rounded-lg bg-[#222222] light:bg-gray-50 border border-white/5 light:border-gray-200 hover:border-purple-500/50 light:hover:border-purple-300 transition-all cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white light:text-gray-900 font-medium">Account Settings</h3>
                      <p className="text-gray-400 light:text-gray-600 text-sm">Update your preferences</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/reports">
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 hover:border-green-400/50 transition-all cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white light:text-gray-900 font-medium">Personal Analytics</h3>
                      <p className="text-gray-300 light:text-gray-700 text-sm">View your productivity</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 