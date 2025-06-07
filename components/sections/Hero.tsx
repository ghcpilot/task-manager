'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Clock, CheckCircle2, Timer, BarChart3, 
  Sparkles, Zap, TrendingUp, Users, Star, Activity, ArrowRight,
  Target, Coffee, Play, Shield, User, Calendar, Award, Flame
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeProjects, setActiveProjects] = useState(1);
  const [todayTasks, setTodayTasks] = useState(0);
  const [hoursToday, setHoursToday] = useState('0h');

  useEffect(() => {
    setIsVisible(true);
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Simulate live updates
    const updateInterval = setInterval(() => {
      setActiveProjects(prev => prev + Math.floor(Math.random() * 2));
      setTodayTasks(prev => prev + Math.floor(Math.random() * 3));
    }, 8000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(updateInterval);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const dashboardStats = [
    { label: "Today's Tasks", value: todayTasks, icon: Target, color: 'from-blue-500 to-cyan-500', bg: 'from-blue-500/20 to-cyan-500/20' },
    { label: 'Completed', value: Math.floor(todayTasks * 0.7), icon: CheckCircle2, color: 'from-green-500 to-emerald-500', bg: 'from-green-500/20 to-emerald-500/20' },
    { label: 'Active Projects', value: activeProjects, icon: Activity, color: 'from-purple-500 to-pink-500', bg: 'from-purple-500/20 to-pink-500/20' },
    { label: 'Hours Today', value: hoursToday, icon: Clock, color: 'from-orange-500 to-red-500', bg: 'from-orange-500/20 to-red-500/20' }
  ];

  const featureCards = [
    { 
      title: 'Tasks Completed', 
      value: `${Math.floor(todayTasks * 0.7)}/${todayTasks}`, 
      icon: CheckCircle2, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Track your daily progress'
    },
    { 
      title: 'Time Tracked', 
      value: '0h 0m', 
      percentage: '+15% from yesterday',
      icon: Timer, 
      color: 'from-green-500 to-emerald-500',
      description: 'Monitor your productivity'
    },
    { 
      title: 'Most Due Task', 
      value: 'Review proposal', 
      icon: Calendar, 
      color: 'from-orange-500 to-red-500',
      description: 'Stay on top of deadlines'
    },
    { 
      title: 'Active Projects', 
      value: activeProjects, 
      percentage: '2 due this week',
      icon: Award, 
      color: 'from-purple-500 to-pink-500',
      description: 'Manage your workload'
    }
  ];

  const quickActions = [
    { icon: Play, title: 'Start Working', description: 'Open projects workspace' },
    { icon: Zap, title: 'Quick Add Task', description: 'Add to inbox instantly' },
    { icon: BarChart3, title: 'View Reports', description: 'Check your progress' }
  ];

  return (
    <section className="relative pt-16 sm:pt-20 pb-12 sm:pb-16 overflow-hidden min-h-screen">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0f0f0f]"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-1/4 right-1/6 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8 sm:mb-12"
        >
          {/* Live Badge */}
          <motion.div
            className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6 border border-orange-500/30 group hover:scale-105 transition-all duration-300"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mr-2 sm:mr-3"
            >
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
            </motion.div>
            <span className="text-xs sm:text-sm bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent font-semibold">
              Live Dashboard Preview
            </span>
            <motion.div
              className="ml-2 sm:ml-3 w-2 h-2 bg-orange-400 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 px-2">
            Good morning, <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">Future You!</span> 👋
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 px-2">
            {formatDate(currentTime)} • {formatTime(currentTime)}
          </p>
        </motion.div>

        {/* Dashboard Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12"
        >
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-2 sm:p-0"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-1 sm:mb-2"
                animate={{ 
                  textShadow: [
                    "0 0 0px rgba(59, 130, 246, 0)",
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                    "0 0 0px rgba(59, 130, 246, 0)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
              >
                <span className={`bg-gradient-to-r ${stat.color} text-transparent bg-clip-text`}>
                  {stat.value}
                </span>
              </motion.div>
              <p className="text-gray-400 text-xs sm:text-sm md:text-base font-medium px-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Dashboard Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12"
        >
          {featureCards.map((card, index) => (
            <motion.div
               key={index}
               className={`bg-gradient-to-br ${card.color} p-4 sm:p-6 rounded-xl sm:rounded-2xl relative overflow-hidden group cursor-pointer`}
               whileHover={{ scale: 1.02, y: -5 }}
               whileTap={{ scale: 0.98 }}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
             >
              <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <card.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  {card.percentage && (
                    <motion.div 
                      className="flex items-center gap-1 text-xs font-semibold text-white/80"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                    >
                      <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="hidden sm:inline">{card.percentage}</span>
                      <span className="sm:hidden text-xs">+{card.percentage.match(/\d+/)?.[0]}%</span>
                    </motion.div>
                  )}
                </div>
                <h3 className="text-white text-base sm:text-lg font-semibold mb-2">{card.title}</h3>
                <motion.div 
                  className="text-2xl sm:text-3xl font-bold text-white mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                >
                  {card.value}
                </motion.div>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
          className="text-center mb-8 sm:mb-12 px-2"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Ready to <span className="bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">Transform</span> Your Productivity?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
            Join thousands of professionals who save 2.5 hours daily with our intelligent time tracking dashboard. 
            <span className="text-cyan-400 font-semibold block sm:inline"> Free forever - No credit card required.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl shadow-2xl shadow-purple-500/25 border border-white/10 group relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{ x: [-100, 300] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                  />
                  <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 group-hover:animate-bounce relative z-10" />
                  <span className="relative z-10">Start Your Dashboard</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform relative z-10" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl backdrop-blur-sm group"
              >
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:scale-110 transition-transform" />
                View Demo
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          className="mb-12 sm:mb-16"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 text-center px-2">
            ⚡ Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1 }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">{action.title}</h4>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{action.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400 px-4"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
            <span className="text-center sm:text-left">30-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
            <span className="text-center sm:text-left">Set up in under 60 seconds</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
            <span className="text-center sm:text-left">No spam, unsubscribe anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
