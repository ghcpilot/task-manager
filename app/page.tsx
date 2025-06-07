'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle, 
  Timer, 
  BarChart3, 
  Users, 
  Target,
  Zap,
  Shield,
  Star,
  Play,
  Menu,
  X,
  ChevronDown,
  Clock,
  Laptop,
  Smartphone,
  Globe,
  Coffee,
  TrendingUp,
  Award,
  Sparkles,
  Eye,
  Activity,
  Rocket
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import Button from '@/components/ui/Button';
import FeedbackForm from '@/components/FeedbackForm';
import HowItWorks from '@/components/sections/HowItWorks';
import Features from '@/components/sections/Features';
import Navbar from '@/components/sections/Navbar';
import Footer from '@/components/sections/Footer';
import BrowserWindow, { StatsCode } from '@/components/ui/BrowserWindow';

const features = [
  {
    icon: Target,
    title: 'Personal Project Management',
    description: 'Organize your personal projects with intuitive task boards and customizable workflows that adapt to your style.',
    color: 'from-blue-500 to-cyan-500',
    stats: 'tasks organized',
    benefits: ['Customizable project boards', 'Task prioritization', 'Deadline tracking']
  },
  {
    icon: Timer,
    title: 'Precise Time Tracking',
    description: 'Track time with precision using our beautiful analog clocks and comprehensive analytics to boost your productivity.',
    color: 'from-purple-500 to-pink-500',
    stats: 'hours tracked',
    benefits: ['Beautiful analog clocks', 'Automatic time categorization', 'Detailed time logs']
  },
  {
    icon: BarChart3,
    title: 'Personal Analytics',
    description: 'Get instant insights into your productivity patterns with detailed reports and visual dashboards.',
    color: 'from-green-500 to-emerald-500',
    stats: 'reports generated',
    benefits: ['Personal productivity metrics', 'Custom dashboard widgets', 'Visual insights']
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Plan your day effectively with smart scheduling features and time blocking for optimal productivity.',
    color: 'from-orange-500 to-red-500',
    stats: 'schedules created',
    benefits: ['Time blocking', 'Smart reminders', 'Schedule optimization']
  }
];

interface AppStats {
  totalUsers: string;
  totalProjects: string;
  totalTasks: string;
  completedTasks: string;
  completionRate: string;
  recentSignups: number;
  timeSavedHours: string;
  testimonials: any[];
  lastUpdated: string;
  avgTasksPerUser: number;
  avgProjectsPerUser: number;
  userGrowthRate: number;
  totalTimeTracked: string;
  coffeeCupsEquivalent: number;
}

const defaultStats: AppStats = {
  totalUsers: '2.5K+',
  totalProjects: '1.2K+',
  totalTasks: '15K+',
  completedTasks: '12K+',
  completionRate: '85%',
  recentSignups: 47,
  timeSavedHours: '3.2K+',
  testimonials: [],
  lastUpdated: '2025-06-05T08:17:21.863Z',
  avgTasksPerUser: 6,
  avgProjectsPerUser: 2,
  userGrowthRate: 15,
  totalTimeTracked: '3,200 hours',
  coffeeCupsEquivalent: 1600,
};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [appStats, setAppStats] = useState<AppStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [particles, setParticles] = useState<Array<{left: number, top: number}>>([]);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);

  // Parallax animations
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  // Generate particles on client side only to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const newParticles = Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
    }));
    setParticles(newParticles);
  }, []);

  // Fetch real app statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/stats');
        if (response.ok) {
          const text = await response.text();
          if (text) {
            const data = JSON.parse(text);
            setAppStats(data);
          } else {
            console.error('Empty response from /api/stats');
            // Keep default stats
          }
        } else {
          console.error('Failed to fetch stats:', response.status, response.statusText);
          // Keep default stats
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Use default stats on error - they're already set
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic stats for display
  const dynamicStats = [
    { 
      value: appStats?.totalUsers || defaultStats.totalUsers, 
      label: 'Active Users', 
      icon: Users, 
      growth: `+${appStats?.userGrowthRate || defaultStats.userGrowthRate}%`,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      value: appStats?.completionRate || defaultStats.completionRate, 
      label: 'Success Rate', 
      icon: Target, 
      growth: '+12%',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      value: appStats?.totalTasks || defaultStats.totalTasks, 
      label: 'Tasks Completed', 
      icon: CheckCircle, 
      growth: '+25%',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      value: appStats?.timeSavedHours || defaultStats.timeSavedHours, 
      label: 'Hours Saved', 
      icon: Clock, 
      growth: '+18%',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden" ref={heroRef}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div 
            style={{ y: yHero, scale: scaleHero, opacity: opacityHero }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          />
          <motion.div 
            style={{ y: yHero, scale: scaleHero }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div 
            style={{ rotate: scrollYProgress }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
          />
          
          {/* Floating particles */}
          {mounted && particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [-20, 20],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full mb-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </motion.div>
                <span className="text-blue-400 font-medium">
                  {isLoading ? 'Loading...' : `Join ${appStats?.totalUsers || defaultStats.totalUsers} productive users`}
                </span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  Streamline Your
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block"
                >
                  Productivity
                </motion.span>
              </h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
              >
                TaskMate is your personal productivity companion - track time beautifully, 
                manage projects efficiently, and gain insights into your work patterns. Completely free.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              {user ? (
                <Link href="/dashboard">
                  <Button 
                    variant="default" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Continue Working
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/register">
                    <Button 
                      variant="default" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all"
                    >
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Browser Window with Stats Code */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-4xl mx-auto"
              ref={statsRef}
            >
              <BrowserWindow 
                title="TaskMate Dashboard - Live Analytics"
                url="https://taskmate.app/analytics"
                className="transform hover:scale-105 transition-all duration-300"
              >
                <div className="p-8 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] min-h-[500px] relative overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white">TaskMate Analytics</h3>
                      <p className="text-gray-400">Real-time productivity insights</p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">Live</span>
                    </div>
                  </div>

                  {/* Live Metrics Grid */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { icon: Users, label: "Active Users", value: isLoading ? 'Loading...' : dynamicStats[0].value, color: "from-blue-500 to-cyan-500", change: "+100%" },
                      { icon: Target, label: "Success Rate", value: isLoading ? 'Loading...' : dynamicStats[1].value, color: "from-purple-500 to-pink-500", change: "+12%" },
                      { icon: CheckCircle, label: "Tasks Completed", value: isLoading ? 'Loading...' : dynamicStats[2].value, color: "from-green-500 to-emerald-500", change: "+25%" },
                      { icon: Timer, label: "Hours Saved", value: isLoading ? 'Loading...' : dynamicStats[3].value, color: "from-orange-500 to-red-500", change: "+18%" }
                    ].map((stat, index) => (
                      <motion.div 
                        key={index}
                        className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl relative overflow-hidden group`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-2">
                            <stat.icon className="w-6 h-6 text-white" />
                            <motion.div 
                              className="flex items-center gap-1 text-xs font-semibold text-white/80"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                            >
                              <TrendingUp className="w-3 h-3" />
                              {stat.change}
                            </motion.div>
                          </div>
                          <motion.div 
                            className="text-2xl font-bold text-white mb-1"
                            animate={{ 
                              scale: [1, 1.05, 1],
                            }}
                            transition={{ 
                              duration: 3, 
                              repeat: Infinity,
                              delay: index * 0.3
                            }}
                          >
                            {stat.value}
                          </motion.div>
                          <div className="text-xs text-white/80">{stat.label}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Real-time Activity Feed */}
                  <motion.div 
                    className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.5 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">Recent Activity</h4>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 text-sm">Live Updates</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {[
                        { user: "Alex", action: "completed task", project: "Website Redesign", time: "2 min ago", color: "green" },
                        { user: "Sarah", action: "started timer", project: "Mobile App", time: "5 min ago", color: "blue" },
                        { user: "Mike", action: "created project", project: "Brand Strategy", time: "8 min ago", color: "purple" }
                      ].map((activity, index) => (
                        <motion.div 
                          key={index}
                          className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 2.7 + index * 0.2 }}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            activity.color === 'green' ? 'bg-green-400' :
                            activity.color === 'blue' ? 'bg-blue-400' : 'bg-purple-400'
                          } animate-pulse`}></div>
                          <div className="flex-1">
                            <span className="text-white text-sm font-medium">{activity.user}</span>
                            <span className="text-gray-400 text-sm"> {activity.action} </span>
                            <span className="text-cyan-400 text-sm">{activity.project}</span>
                          </div>
                          <span className="text-gray-500 text-xs">{activity.time}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Time Tracking Widget */}
                  <motion.div 
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Timer className="w-5 h-5 text-green-400" />
                        <span className="text-white font-medium">Active Session</span>
                      </div>
                      <motion.div 
                        className="flex items-center gap-1 text-green-400"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm">Recording</span>
                      </motion.div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <motion.div 
                          className="text-2xl font-mono font-bold text-white"
                          animate={{ 
                            textShadow: [
                              "0 0 0px rgba(34, 197, 94, 0)",
                              "0 0 10px rgba(34, 197, 94, 0.5)",
                              "0 0 0px rgba(34, 197, 94, 0)"
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          02:34:17
                        </motion.div>
                        <div className="text-gray-300">Website Redesign</div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button 
                          className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Pause
                        </motion.button>
                        <motion.button 
                          className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-lg text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Stop
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Floating Mobile App Preview */}
                  <motion.div 
                    className="absolute bottom-6 right-6 w-32 h-56 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-1 hidden lg:block"
                    initial={{ opacity: 0, x: 30, y: 30, rotate: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0, rotate: 8 }}
                    transition={{ delay: 3.5, duration: 0.8 }}
                    whileHover={{ rotate: 0, scale: 1.1, y: -10 }}
                  >
                    <div className="w-full h-full bg-[#1a1a1a] rounded-[20px] p-3 flex flex-col">
                      {/* Mobile Header */}
                      <div className="flex items-center justify-center mb-3">
                        <motion.div 
                          className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        >
                          <Timer className="h-4 w-4 text-white" />
                        </motion.div>
                      </div>
                      
                      {/* Mobile Content */}
                      <div className="space-y-2 flex-1">
                        <motion.div 
                          className="bg-blue-500/30 rounded-lg p-2 text-center"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <div className="text-sm font-bold text-white">2:34</div>
                          <div className="text-xs text-blue-200">Active</div>
                        </motion.div>
                        <div className="bg-green-500/30 rounded-lg p-2 text-center">
                          <div className="text-sm font-bold text-white">12</div>
                          <div className="text-xs text-green-200">Tasks</div>
                        </div>
                        <div className="bg-purple-500/30 rounded-lg p-2 text-center">
                          <div className="text-sm font-bold text-white">94%</div>
                          <div className="text-xs text-purple-200">Focus</div>
                        </div>
                      </div>
                      
                      {/* Mobile Action */}
                      <motion.div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-2 text-center mt-2"
                        whileHover={{ scale: 1.05 }}
                        animate={{ 
                          boxShadow: [
                            "0 0 0px rgba(6, 182, 212, 0)",
                            "0 0 20px rgba(6, 182, 212, 0.3)",
                            "0 0 0px rgba(6, 182, 212, 0)"
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <div className="text-white text-xs font-semibold">Quick Start</div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </BrowserWindow>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-400"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </div>
      </section>

      {/* Real-time Insights Section */}
      <section id="live-data" className="relative py-32 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Activity className="w-6 h-6 text-blue-400" />
              <span className="text-blue-400 font-medium">Live Data</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Real Productivity
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                Happening Now
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See how TaskMate users are crushing their goals in real-time
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">Tasks Being Completed</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {isLoading ? (
                  <div className="w-20 h-10 bg-gray-700 animate-pulse rounded"></div>
                ) : (
                  `${Math.floor(parseInt((appStats?.completedTasks || defaultStats.completedTasks).replace(/[^\d]/g, '')) / 1000)}K+`
                )}
              </div>
              <p className="text-gray-300">
                Teams worldwide are finishing {appStats?.avgTasksPerUser || defaultStats.avgTasksPerUser} tasks per day on average
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 text-sm">
                  Saving {appStats?.coffeeCupsEquivalent || defaultStats.coffeeCupsEquivalent}+ coffee breaks worth of time
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-400 font-medium">Active Right Now</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {isLoading ? (
                  <div className="w-20 h-10 bg-gray-700 animate-pulse rounded"></div>
                ) : (
                  `${appStats?.recentSignups || defaultStats.recentSignups}+`
                )}
              </div>
              <p className="text-gray-300">
                New users joined in the last 30 days, growing by {appStats?.userGrowthRate || defaultStats.userGrowthRate}%
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Rocket className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 text-sm">
                  {appStats?.totalTimeTracked || defaultStats.totalTimeTracked} of focused work tracked
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-8 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-orange-400 font-medium">Success Rate</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {isLoading ? (
                  <div className="w-20 h-10 bg-gray-700 animate-pulse rounded"></div>
                ) : (
                  appStats?.completionRate || defaultStats.completionRate
                )}
              </div>
              <p className="text-gray-300">
                Of tasks get completed on time with TaskMate's smart scheduling
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">
                  {appStats?.avgProjectsPerUser || defaultStats.avgProjectsPerUser} projects per user on average
                </span>
              </div>
            </motion.div>
          </div>

          {/* Last updated indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">
                Last updated: {mounted ? new Date(appStats?.lastUpdated || defaultStats.lastUpdated).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit',
                  hour12: false 
                }) : '--:--:--'}
              </span>
            </div>
          </motion.div>
        </div>
      </section>


      {/* How It Works Section */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Feedback Section */}
      <section id="feedback" className="relative py-32 bg-gradient-to-b from-black/10 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Help Us Improve
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                TaskMate
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your feedback helps us make TaskMate better. Share your thoughts, suggestions, or report issues.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
          >
            <FeedbackForm />
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section id="testimonials" className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Loved by Teams
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                Worldwide
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See how TaskMate is transforming productivity for teams of all sizes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(appStats?.testimonials || defaultStats.testimonials).length > 0 ? (
              (appStats?.testimonials || defaultStats.testimonials).map((testimonial: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    {testimonial.verified && (
                      <div className="flex items-center gap-1 text-green-400 text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-6 group-hover:text-gray-200 transition-colors">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{testimonial.avatar}</div>
                    <div>
                      <div className="text-white font-semibold">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role} at {testimonial.company}</div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              // Fallback testimonials while loading
              [1, 2, 3].map((index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
                >
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-5 h-5 bg-gray-600 rounded"></div>
                      ))}
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="h-4 bg-gray-600 rounded"></div>
                      <div className="h-4 bg-gray-600 rounded"></div>
                      <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-600 rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="relative bg-black/40 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">TM</span>
                </div>
                <span className="text-2xl font-bold text-white">TaskMate</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The intelligent project management platform that helps teams stay organized, 
                track time beautifully, and achieve more together.
              </p>
              <div className="flex items-center space-x-4">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Enterprise-grade security</span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm">
              © 2024 TaskMate. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Globe className="w-4 h-4" />
                <span>Available worldwide</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Laptop className="w-4 h-4" />
                <Smartphone className="w-4 h-4" />
                <span>All platforms</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
