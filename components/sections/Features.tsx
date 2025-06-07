'use client';

import { motion } from 'framer-motion';
import { 
  Target, Timer, BarChart3, Users2, Smartphone, Zap, 
  CheckCircle, Clock, Calendar, Folder, Star, ArrowRight,
  Play, Pause, TrendingUp, Award, Shield, Sparkles
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Features() {
  const features = [
    {
      icon: Target,
      title: 'Project Management',
      description: 'Organize tasks with beautiful Kanban boards and intuitive workflows.',
      color: 'from-blue-500 to-cyan-500',
      badge: 'Core',
      stats: '2.5K+ projects created'
    },
    {
      icon: Timer,
      title: 'Time Tracking',
      description: 'Track time with precision using beautiful analog clocks and analytics.',
      color: 'from-purple-500 to-pink-500',
      badge: 'Popular',
      stats: '15K+ hours tracked'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Get insights into productivity patterns with detailed visualizations.',
      color: 'from-green-500 to-emerald-500',
      badge: 'Pro',
      stats: '500+ reports generated'
    },
    {
      icon: Users2,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with real-time updates and notifications.',
      color: 'from-orange-500 to-red-500',
      badge: 'Coming Soon',
      stats: 'Enterprise ready'
    },
    {
      icon: Smartphone,
      title: 'Cross-Platform',
      description: 'Access your work from any device with seamless synchronization.',
      color: 'from-indigo-500 to-purple-500',
      badge: 'Universal',
      stats: 'All devices supported'
    },
    {
      icon: Zap,
      title: 'Smart Automation',
      description: 'Automate repetitive tasks and focus on what matters most.',
      color: 'from-yellow-500 to-orange-500',
      badge: 'AI-Powered',
      stats: '40% time saved'
    }
  ];

  const highlights = [
    { icon: CheckCircle, text: 'Free forever for personal use', color: 'text-green-400' },
    { icon: Clock, text: 'Real-time collaboration', color: 'text-blue-400' },
    { icon: Shield, text: 'Enterprise-grade security', color: 'text-purple-400' },
    { icon: Sparkles, text: 'Beautiful & intuitive design', color: 'text-pink-400' }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-[#0a0a0a] to-[#111111] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 px-6 py-3 mb-6">
            <Sparkles className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-blue-400 font-medium">Powerful Features</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Everything you need to
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block mt-2">
              stay productive
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            TaskMate combines beautiful design with powerful functionality to help you manage projects, 
            track time, and achieve your goals with ease.
          </p>
        </motion.div>

        {/* Highlights Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {highlights.map((highlight, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm text-center">
              <highlight.icon className={`w-6 h-6 ${highlight.color} mx-auto mb-2`} />
              <p className="text-sm text-gray-300 font-medium">{highlight.text}</p>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:border-white/20 transition-all duration-300 h-full">
                {/* Badge */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4 bg-gradient-to-r ${feature.color} text-white`}>
                  {feature.badge}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Stats */}
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {feature.stats}
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 px-4 py-2 mb-6">
                <Award className="w-4 h-4 text-green-400 mr-2" />
                <span className="text-green-400 font-medium text-sm">Award-Winning Design</span>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Built for productivity,
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent block">
                  designed for delight
                </span>
              </h3>
              
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Every pixel is crafted with care. From the smooth animations to the intuitive interface, 
                TaskMate makes project management feel effortless and enjoyable.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">&lt;100ms</div>
                  <div className="text-sm text-gray-400">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">4.9/5</div>
                  <div className="text-sm text-gray-400">User Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">24/7</div>
                  <div className="text-sm text-gray-400">Support</div>
                </div>
              </div>

              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <Play className="w-5 h-5 mr-2" />
                See It In Action
              </Button>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-gray-400 text-sm">TaskMate Dashboard</div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-white font-medium">Website Redesign</span>
                    </div>
                    <div className="text-green-400 text-sm">Completed</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Play className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">API Development</span>
                    </div>
                    <div className="text-blue-400 text-sm">In Progress</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-white font-medium">User Testing</span>
                    </div>
                    <div className="text-gray-400 text-sm">Pending</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Daily Progress</span>
                    <span className="text-purple-400 text-sm">85%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-xl shadow-lg">
                <Timer className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to boost your productivity?
          </h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust TaskMate to manage their projects and track their time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-xl font-semibold">
              Watch Demo
              <Play className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
