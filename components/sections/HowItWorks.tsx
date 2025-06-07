'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  UserPlus, Target, Timer, BarChart3, 
  CheckCircle, ArrowRight, Sparkles, Zap, 
  Clock, TrendingUp, Star, Rocket
} from 'lucide-react';
import Button from '@/components/ui/Button';
import BrowserWindow from '@/components/ui/BrowserWindow';

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'signup',
      title: 'Sign Up',
      subtitle: 'Get started in 30 seconds',
      description: 'Create your account and customize your workspace with beautiful themes.',
      icon: UserPlus,
      color: 'from-blue-500 to-cyan-500',
      mockup: {
        type: 'signup',
        title: 'Welcome to TaskMate'
      }
    },
    {
      id: 'projects',
      title: 'Create Projects',
      subtitle: 'Organize your work',
      description: 'Set up projects with intuitive Kanban boards and invite your team.',
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      mockup: {
        type: 'kanban',
        title: 'Project Board'
      }
    },
    {
      id: 'tracking',
      title: 'Track Time',
      subtitle: 'Beautiful time tracking',
      description: 'Start tracking with our gorgeous interface and get real-time insights.',
      icon: Timer,
      color: 'from-green-500 to-emerald-500',
      mockup: {
        type: 'timer',
        title: 'Time Tracker'
      }
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      subtitle: 'Data-driven insights',
      description: 'Analyze your productivity patterns with beautiful charts and reports.',
      icon: BarChart3,
      color: 'from-orange-500 to-red-500',
      mockup: {
        type: 'analytics',
        title: 'Analytics Dashboard'
      }
    }
  ];

  const renderMockupContent = (step: typeof steps[0]) => {
    switch (step.mockup.type) {
      case 'signup':
        return (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Welcome to TaskMate</h3>
            <p className="text-gray-400 mb-8">Start your productivity journey</p>
            
            <div className="space-y-4 max-w-sm mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400"
                readOnly
              />
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-3 rounded-xl">
                Get Started Free
              </Button>
            </div>
          </div>
        );

      case 'kanban':
        return (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4">
              {['To Do', 'In Progress', 'Done'].map((status, index) => (
                <div key={status} className="space-y-3">
                  <h4 className="text-white font-medium text-sm">{status}</h4>
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className={`p-3 rounded-lg ${
                      index === 0 ? 'bg-blue-500/20 border border-blue-500/30' :
                      index === 1 ? 'bg-orange-500/20 border border-orange-500/30' :
                      'bg-green-500/20 border border-green-500/30'
                    }`}>
                      <div className="text-white text-sm font-medium mb-2">
                        Task {i + 1}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-1">
                          {Array.from({ length: 2 }).map((_, j) => (
                            <div key={j} className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border border-gray-800"></div>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">2 days</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case 'timer':
        return (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="text-4xl font-mono font-bold text-green-400 mb-2">02:34:17</div>
              <div className="text-gray-300">Working on Design</div>
            </div>
            
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-green-500/30"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button className="bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-2 rounded-lg">
                Pause
              </Button>
              <Button className="bg-green-500/20 text-green-400 border border-green-500/30 px-6 py-2 rounded-lg">
                Stop
              </Button>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">24h</div>
                <div className="text-sm text-blue-300">This Week</div>
              </div>
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">89%</div>
                <div className="text-sm text-green-300">Efficiency</div>
              </div>
            </div>
            
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">Weekly Progress</span>
                <span className="text-purple-400">85%</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="p-8 text-center text-gray-400">Loading...</div>;
    }
  };

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] relative overflow-hidden">
      {/* Simple Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Simple Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-blue-400 font-medium text-sm">Simple Process</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get started in
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent block mt-2">
              4 simple steps
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            From signup to insights in minutes. TaskMate makes productivity effortless.
          </p>
        </motion.div>

        {/* Simple Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setActiveStep(index)}
                className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${
                  activeStep === index
                    ? 'bg-white/5 border-white/20 shadow-lg'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all duration-300 ${
                    activeStep === index
                      ? `bg-gradient-to-r ${step.color} text-white`
                      : 'bg-white/10 text-gray-400 group-hover:bg-white/20'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <step.icon className={`w-5 h-5 ${
                        activeStep === index ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      }`} />
                      <h3 className={`text-lg font-semibold ${
                        activeStep === index ? 'text-white' : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {step.title}
                      </h3>
                    </div>
                    <p className={`text-sm mb-2 ${
                      activeStep === index ? 'text-blue-400' : 'text-gray-500'
                    }`}>
                      {step.subtitle}
                    </p>
                    <p className={`text-sm ${
                      activeStep === index ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>

                  <ArrowRight className={`w-5 h-5 transition-all duration-300 ${
                    activeStep === index 
                      ? 'text-white transform translate-x-1' 
                      : 'text-gray-500 group-hover:text-white'
                  }`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Simple Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:sticky lg:top-8"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <BrowserWindow
                title={steps[activeStep].mockup.title}
                url={`https://taskmate.app/${steps[activeStep].id}`}
              >
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[300px] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]"
                >
                  {renderMockupContent(steps[activeStep])}
                </motion.div>
              </BrowserWindow>
            </div>

            {/* Simple Indicators */}
            <div className="flex justify-center mt-6 gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === activeStep 
                      ? `bg-gradient-to-r ${steps[index].color}` 
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 