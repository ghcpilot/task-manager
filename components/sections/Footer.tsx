'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Twitter, 
  Github, 
  Linkedin, 
  Mail,
  ArrowUpRight,
  Timer,
  Target,
  BarChart3,
  Shield
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-16 pb-8 border-t border-white/10 bg-gradient-to-b from-transparent to-black/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Timer className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 text-transparent bg-clip-text">
                  TaskMate
                </span>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Your personal productivity companion. Track time beautifully, manage projects efficiently, and gain insights into your work patterns.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com/taskmate" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://github.com/taskmate" className="text-gray-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="https://linkedin.com/company/taskmate" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="mailto:hello@taskmate.app" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How it Works</a>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  Get Started Free
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-400" />
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:support@taskmate.app" className="text-gray-400 hover:text-white transition-colors">Help Center</a>
              </li>
              <li>
                <a href="mailto:feedback@taskmate.app" className="text-gray-400 hover:text-white transition-colors">Send Feedback</a>
              </li>
              <li>
                <a href="mailto:bug@taskmate.app" className="text-gray-400 hover:text-white transition-colors">Report Bug</a>
              </li>
              <li>
                <Link href="#feedback" className="text-gray-400 hover:text-white transition-colors">Feature Request</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <span className="text-gray-400 text-sm">🔒 End-to-end encrypted</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">✅ GDPR compliant</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 mt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © {currentYear} TaskMate. Built with ❤️ for productivity.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </Link>
              <span className="text-gray-500">Free forever</span>
            </div>
          </div>
          
          {/* Made with love indicator */}
          <motion.div 
            className="text-center mt-6 pt-6 border-t border-white/5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs text-gray-500">
              Made with passion to help you achieve more. Save 2.5 hours daily with TaskMate.
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
} 