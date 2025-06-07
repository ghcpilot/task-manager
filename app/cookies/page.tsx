'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Cookie, Settings, BarChart, Shield, Zap } from 'lucide-react';

export default function CookiesPage() {
  const cookieTypes = [
    {
      type: 'Essential Cookies',
      icon: Shield,
      color: 'from-green-500 to-emerald-600',
      required: true,
      description: 'These cookies are necessary for the website to function properly and cannot be disabled.',
      examples: [
        'Authentication cookies to keep you logged in',
        'Session cookies for maintaining your session',
        'Security cookies for protection against attacks',
        'Form submission cookies for contact forms'
      ]
    },
    {
      type: 'Analytics Cookies',
      icon: BarChart,
      color: 'from-blue-500 to-purple-600',
      required: false,
      description: 'These cookies help us understand how visitors interact with our website to improve user experience.',
      examples: [
        'Google Analytics for usage statistics',
        'Page view tracking',
        'User behavior analysis',
        'Performance monitoring'
      ]
    },
    {
      type: 'Functional Cookies',
      icon: Zap,
      color: 'from-orange-500 to-red-600',
      required: false,
      description: 'These cookies enable enhanced functionality and personalization.',
      examples: [
        'Theme preferences (dark/light mode)',
        'Language settings',
        'Timezone preferences',
        'User interface customizations'
      ]
    },
    {
      type: 'Performance Cookies',
      icon: Settings,
      color: 'from-purple-500 to-pink-600',
      required: false,
      description: 'These cookies collect information about how you use our website to help us improve performance.',
      examples: [
        'Loading time measurements',
        'Error tracking',
        'Feature usage statistics',
        'A/B testing data'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Cookie className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Cookie <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Learn about how TaskMate uses cookies to provide you with the best possible experience and protect your privacy.
          </p>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 inline-block">
            <p className="text-gray-400 mb-2">
              <strong className="text-white">Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-gray-400">
              <strong className="text-white">Effective date:</strong> January 1, 2024
            </p>
          </div>
        </motion.div>

        {/* What are Cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-4">What are Cookies?</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-4">
              Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners about user behavior.
            </p>
            <p className="text-gray-300 mb-4">
              TaskMate uses cookies to enhance your experience, remember your preferences, and provide analytics to help us improve our service. We are committed to being transparent about the cookies we use and giving you control over your cookie preferences.
            </p>
            <p className="text-gray-300">
              This Cookie Policy explains what cookies are, how we use them, and how you can manage your cookie preferences.
            </p>
          </div>
        </motion.div>

        {/* Types of Cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Types of Cookies We Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cookieTypes.map((cookie, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${cookie.color} rounded-lg flex items-center justify-center mr-4`}>
                    <cookie.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{cookie.type}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      cookie.required 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {cookie.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{cookie.description}</p>
                
                <div>
                  <h4 className="text-white font-semibold mb-2">Examples:</h4>
                  <ul className="space-y-1">
                    {cookie.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-400 text-sm">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Third-Party Cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Third-Party Cookies</h2>
          <p className="text-gray-300 mb-6">
            We may use third-party services that set their own cookies. These services help us provide better functionality and understand how our website is used.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                service: 'Google Analytics',
                purpose: 'Website analytics and user behavior tracking',
                retention: '2 years',
                optOut: 'https://tools.google.com/dlpage/gaoptout'
              },
              {
                service: 'Firebase Authentication',
                purpose: 'User authentication and account management',
                retention: 'Until logout or account deletion',
                optOut: 'Required for account functionality'
              },
              {
                service: 'Hotjar',
                purpose: 'User experience analysis and feedback',
                retention: '365 days',
                optOut: 'https://www.hotjar.com/opt-out'
              },
              {
                service: 'Intercom',
                purpose: 'Customer support and live chat',
                retention: '10 months',
                optOut: 'Disable in chat widget settings'
              }
            ].map((service, index) => (
              <div key={index} className="bg-[#111111] border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">{service.service}</h3>
                <p className="text-gray-400 text-sm mb-2">{service.purpose}</p>
                <div className="space-y-1">
                  <p className="text-gray-500 text-xs">
                    <strong>Retention:</strong> {service.retention}
                  </p>
                  <p className="text-gray-500 text-xs">
                    <strong>Opt-out:</strong> {service.optOut}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Managing Cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Managing Your Cookie Preferences</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Browser Settings</h3>
              <p className="text-gray-300 mb-4">
                Most web browsers allow you to control cookies through their settings. You can:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Block all cookies',
                  'Block third-party cookies only',
                  'Delete existing cookies',
                  'Set alerts when cookies are being sent'
                ].map((option, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <span className="text-gray-300">{option}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Browser-Specific Instructions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { browser: 'Chrome', link: 'https://support.google.com/chrome/answer/95647' },
                  { browser: 'Firefox', link: 'https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer' },
                  { browser: 'Safari', link: 'https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac' },
                  { browser: 'Edge', link: 'https://support.microsoft.com/en-us/help/4027947/microsoft-edge-delete-cookies' }
                ].map((browser, index) => (
                  <a
                    key={index}
                    href={browser.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-[#111111] border border-white/10 rounded-lg p-3 hover:border-white/20 transition-colors"
                  >
                    <span className="text-white">{browser.browser}</span>
                    <span className="text-blue-400 text-sm">Instructions →</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cookie Consent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Cookie Consent</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-4">
              When you first visit TaskMate, you'll see a cookie consent banner that allows you to:
            </p>
            <div className="space-y-2 mb-4">
              {[
                'Accept all cookies for the full experience',
                'Reject optional cookies (analytics, functional, performance)',
                'Customize your preferences for each cookie type',
                'Learn more about each type of cookie we use'
              ].map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-300">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-300">
              You can change your cookie preferences at any time by accessing the cookie settings in your account preferences or by clearing your browser cookies and revisiting our site.
            </p>
          </div>
        </motion.div>

        {/* Impact of Disabling Cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Impact of Disabling Cookies</h2>
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h3 className="text-red-400 font-semibold mb-2">Essential Cookies Disabled</h3>
              <p className="text-gray-300 text-sm">
                If you disable essential cookies, TaskMate may not function properly. You may experience issues with login, session management, and core functionality.
              </p>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="text-yellow-400 font-semibold mb-2">Analytics Cookies Disabled</h3>
              <p className="text-gray-300 text-sm">
                Disabling analytics cookies won't affect functionality, but it will limit our ability to understand usage patterns and improve the platform.
              </p>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">Functional Cookies Disabled</h3>
              <p className="text-gray-300 text-sm">
                Your preferences (theme, language, etc.) won't be remembered between sessions, and you'll need to reset them each time you visit.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Questions About Cookies?</h2>
          <p className="text-gray-300 mb-6">
            If you have any questions about our use of cookies or this Cookie Policy, please don't hesitate to contact us.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-semibold mb-2">Email</h3>
              <p className="text-orange-400">privacy@taskmate.example.com</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Support</h3>
              <Link 
                href="/contact"
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                Contact Support Team →
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              For more information about your privacy rights, please see our{' '}
              <Link href="/privacy" className="text-orange-400 hover:text-orange-300 transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 