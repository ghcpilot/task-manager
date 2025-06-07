'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Target,
  Clock,
  BarChart3,
  Star,
  Play,
  Users,
  Zap
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface WelcomeTourProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  content: string;
  action?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function WelcomeTour({ isOpen, onClose, userRole = 'user' }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to TaskMate! 🎉',
      description: 'Your personal productivity companion',
      icon: Star,
      content: 'TaskMate helps you track tasks, manage time, and boost your productivity. Let\'s get you started on your productivity journey!',
      action: {
        text: 'Let\'s begin!',
        onClick: () => setCurrentStep(1)
      }
    },
    {
      id: 'tasks',
      title: 'Create & Track Tasks',
      description: 'Organize your work efficiently',
      icon: Target,
      content: 'Add tasks with priorities, due dates, and organize them into projects. Use the quick add feature (⌘+N) to capture ideas instantly.',
      action: {
        text: 'Create your first task',
        href: '/dashboard/tasks'
      }
    },
    {
      id: 'timetracking',
      title: 'Time Tracking Made Easy',
      description: 'Know where your time goes',
      icon: Clock,
      content: 'Start timers for any task to track how long things actually take. This helps you plan better and stay focused.',
      action: {
        text: 'Try time tracking',
        onClick: () => setCurrentStep(3)
      }
    },
    {
      id: 'reports',
      title: 'Personal Analytics',
      description: 'Understand your productivity patterns',
      icon: BarChart3,
      content: 'View detailed reports about your productivity, completion rates, and time spent. Discover your most productive hours and patterns.',
      action: {
        text: 'View your analytics',
        href: '/dashboard/reports'
      }
    },
    {
      id: 'premium',
      title: 'Ready for More?',
      description: 'Team features coming soon',
      icon: Users,
      content: 'Love TaskMate? We\'re building team collaboration features! Join our waitlist to get early access and special pricing.',
      action: {
        text: 'Join waitlist',
        onClick: () => {
          localStorage.setItem('premiumWaitlist', 'true');
          setCurrentStep(5);
        }
      }
    },
    {
      id: 'complete',
      title: 'You\'re All Set! 🚀',
      description: 'Ready to boost your productivity',
      icon: CheckCircle,
      content: 'You\'re ready to start being more productive! Remember, TaskMate is free for personal use forever. Happy task tracking!',
      action: {
        text: 'Start being productive',
        onClick: onClose
      }
    }
  ];

  const currentStepData = tourSteps[currentStep];

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    localStorage.setItem('welcomeTourCompleted', 'true');
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
          
          {/* Header */}
          <div className="relative p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <currentStepData.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{currentStepData.title}</h2>
                  <p className="text-sm text-gray-400">{currentStepData.description}</p>
                </div>
              </div>
              <button
                onClick={skipTour}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Step {currentStep + 1} of {tourSteps.length}</span>
                <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}% complete</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                  <currentStepData.icon className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-gray-300 leading-relaxed text-lg max-w-lg mx-auto">
                  {currentStepData.content}
                </p>
              </div>

              {/* Special content for specific steps */}
              {currentStep === 2 && (
                <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Play className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Start Timer</span>
                    </div>
                    <div className="text-gray-600">→</div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Track Time</span>
                    </div>
                    <div className="text-gray-600">→</div>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">View Reports</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 mb-6 border border-blue-500/20">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-semibold">Early Bird Special</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Get 50% off when team features launch!
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="relative p-6 border-t border-white/10 bg-black/20">
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                {currentStep > 0 && (
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="border-white/20"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                
                <Button
                  onClick={skipTour}
                  variant="outline"
                  className="border-white/20 text-gray-400"
                >
                  Skip Tour
                </Button>
              </div>

              <div>
                {currentStepData.action && (
                  <Button
                    onClick={currentStepData.action.onClick || nextStep}
                    variant="default"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {currentStepData.action.text}
                    {currentStep < tourSteps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 