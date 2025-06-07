'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Star, 
  Users, 
  Zap, 
  Clock, 
  BarChart3, 
  Bell, 
  Shield,
  Target,
  Calendar,
  FileText,
  Headphones
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const handleJoinWaitlist = () => {
    localStorage.setItem('premiumWaitlist', 'true');
    toast.success("You're on the waitlist! We'll notify you when team features are ready.", {
      duration: 4000,
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '1px solid rgba(59, 130, 246, 0.5)'
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Start free forever for personal use. Upgrade when you're ready to collaborate with your team.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm ${!isYearly ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-white' : 'text-gray-400'}`}>
              Yearly
              <span className="ml-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 relative"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Individual</h3>
              <p className="text-gray-400 mb-6">Perfect for personal productivity</p>
              <div className="text-center">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-gray-400 ml-2">forever</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Unlimited personal tasks</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Time tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Personal analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Project organization</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Export reports (CSV)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Mobile app access</span>
              </div>
            </div>

            <Link href="/auth/register">
              <Button variant="outline" className="w-full border-green-500/20 text-green-400 hover:bg-green-500/10">
                Get Started Free
              </Button>
            </Link>
          </motion.div>

          {/* Premium Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border border-blue-500/30 rounded-2xl p-8 relative overflow-hidden"
          >
            {/* Popular Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-bl-lg rounded-tr-2xl text-sm font-medium">
              Coming Soon
            </div>

            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Agency</h3>
                <p className="text-gray-400 mb-6">For teams and small agencies</p>
                <div className="text-center">
                  <span className="text-5xl font-bold text-white">
                    ${isYearly ? '39' : '49'}
                  </span>
                  <span className="text-gray-400 ml-2">/{isYearly ? 'month' : 'month'}</span>
                </div>
                {isYearly && (
                  <p className="text-sm text-green-400 mt-2">Save $120/year</p>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="text-sm text-blue-400 font-medium mb-3">Everything in Individual, plus:</div>
                
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Up to 5 team members</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Real-time notifications</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Team analytics & reports</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Team dashboard</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Advanced permissions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Priority support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Enhanced analytics</span>
                </div>
              </div>

              <Button 
                onClick={handleJoinWaitlist}
                variant="default" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Star className="w-4 h-4 mr-2" />
                Join Waitlist
              </Button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🎉 Early bird special: 50% off first 3 months
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Compare Features
          </h2>
          
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-0">
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Features</h3>
              </div>
              <div className="p-6 border-b border-l border-white/10 text-center">
                <h3 className="text-lg font-semibold text-white">Individual</h3>
                <p className="text-sm text-gray-400">Free forever</p>
              </div>
              <div className="p-6 border-b border-l border-white/10 text-center bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                <h3 className="text-lg font-semibold text-white">Agency</h3>
                <p className="text-sm text-gray-400">Coming soon</p>
              </div>

              {/* Features */}
              {[
                { name: 'Unlimited tasks', individual: true, agency: true },
                { name: 'Time tracking', individual: true, agency: true },
                { name: 'Personal analytics', individual: true, agency: true },
                { name: 'Project organization', individual: true, agency: true },
                { name: 'CSV exports', individual: true, agency: true },
                { name: 'Team members', individual: '1', agency: 'Up to 5' },
                { name: 'Real-time notifications', individual: false, agency: true },
                { name: 'Team analytics', individual: false, agency: true },
                { name: 'Team dashboard', individual: false, agency: true },
                { name: 'Enhanced analytics', individual: false, agency: true },
                { name: 'Priority support', individual: false, agency: true },
              ].map((feature, index) => (
                <React.Fragment key={feature.name}>
                  <div className="p-4 border-b border-white/10">
                    <span className="text-gray-300">{feature.name}</span>
                  </div>
                  <div className="p-4 border-b border-l border-white/10 text-center">
                    {typeof feature.individual === 'boolean' ? (
                      feature.individual ? (
                        <Check className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <span className="text-gray-600">—</span>
                      )
                    ) : (
                      <span className="text-gray-300">{feature.individual}</span>
                    )}
                  </div>
                  <div className="p-4 border-b border-l border-white/10 text-center bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                    {typeof feature.agency === 'boolean' ? (
                      feature.agency ? (
                        <Check className="w-5 h-5 text-blue-400 mx-auto" />
                      ) : (
                        <span className="text-gray-600">—</span>
                      )
                    ) : (
                      <span className="text-gray-300">{feature.agency}</span>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "Is the Individual plan really free forever?",
                answer: "Yes! We believe everyone should have access to great productivity tools. The Individual plan includes all core features and will always be free."
              },
              {
                question: "When will the Agency plan be available?",
                answer: "We're currently building team collaboration features. Join our waitlist to be notified when it launches and get early bird pricing."
              },
              {
                question: "Can I upgrade from Individual to Agency later?",
                answer: "Absolutely! You can upgrade anytime when the Agency plan becomes available. All your data will be preserved."
              },
              {
                question: "What happens to my data if I cancel?",
                answer: "You can export all your data anytime. If you downgrade from Agency to Individual, you'll keep access to all your personal tasks and data."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to boost your productivity?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Start with our free Individual plan and upgrade when you're ready for team features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start Free Today
                </Button>
              </Link>
              <Button 
                onClick={handleJoinWaitlist}
                variant="outline" 
                className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
              >
                <Star className="w-4 h-4 mr-2" />
                Join Agency Waitlist
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 