'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  BarChart3,
  Clock,
  Settings,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Mail,
  Sun,
  Moon,
  Shield
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTheme } from '@/app/contexts/ThemeContext';

const sidebarItems = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Today\'s Focus'
  },
  {
    name: 'Projects',
    href: '/dashboard/projects',
    icon: FolderOpen,
    description: 'Projects, Tasks & Time Tracking'
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
    description: 'Analytics & Insights'
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Account & Preferences'
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { user, signOut, isEmailVerified, isLoading } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Redirect if not authenticated or email not verified
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }
    
    if (!isLoading && user && !isEmailVerified) {
      router.push('/auth/verify-email');
      return;
    }
  }, [user, isEmailVerified, isLoading, router]);

  // Add global keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger shortcuts when not typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            router.push('/dashboard');
            break;
          case '2':
            e.preventDefault();
            router.push('/dashboard/projects');
            break;
          case '3':
            e.preventDefault();
            router.push('/dashboard/reports');
            break;
          case 'k':
            e.preventDefault();
            // Focus search input if available
            const searchInput = document.getElementById('search-input') || document.querySelector('input[type="search"]');
            if (searchInput) {
              (searchInput as HTMLElement).focus();
            }
            break;
          case '/':
            e.preventDefault();
            // Toggle sidebar
            setIsSidebarOpen(!isSidebarOpen);
            break;
        }
      }
      
      // Global shortcuts without modifiers
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key) {
          case 'h':
            e.preventDefault();
            router.push('/dashboard');
            break;
          case 'w':
            e.preventDefault();
            router.push('/dashboard/projects');
            break;
          case 'r':
            e.preventDefault();
            router.push('/dashboard/reports');
            break;
          case 's':
            e.preventDefault();
            router.push('/dashboard/settings');
            break;
          case 't':
            e.preventDefault();
            toggleTheme();
            break;
          case '?':
            e.preventDefault();
            setShowShortcuts(!showShortcuts);
            break;
          case 'Escape':
            e.preventDefault();
            if (showShortcuts) {
              setShowShortcuts(false);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router, isSidebarOpen, showShortcuts, toggleTheme]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, redirect to login
      router.push('/auth/login');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] light:bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loader mb-4"></div>
          <p className="text-gray-400 light:text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated or email not verified
  if (!user || !isEmailVerified) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] light:bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 light:bg-black/20 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-20 
        bg-[#1a1a1a] light:bg-white border-r border-white/10 light:border-gray-200 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-white/10 light:border-gray-200">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TM</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/dashboard/projects' && (pathname.startsWith('/dashboard/projects') || pathname.startsWith('/dashboard/work'))) ||
              (item.href === '/dashboard/reports' && pathname.startsWith('/dashboard/reports')) ||
              (item.href === '/dashboard/settings' && pathname.startsWith('/dashboard/settings'));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center px-2 py-4 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-400 light:text-gray-600 hover:text-white light:hover:text-gray-900 hover:bg-white/10 light:hover:bg-gray-100'
                }`}
                title={item.name}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="px-2 py-4 border-t border-white/10 light:border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center w-full px-2 py-4 rounded-xl transition-all duration-200 text-red-400 hover:text-red-300 hover:bg-red-500/10 light:hover:bg-red-50 group"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with theme toggle */}
        <div className="flex items-center justify-between p-4 bg-[#1a1a1a] light:bg-white border-b border-white/10 light:border-gray-200">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-400 light:text-gray-600 hover:text-white light:hover:text-gray-900 hover:bg-white/10 light:hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Desktop: Empty space for balance */}
          <div className="hidden lg:block"></div>
          
          {/* Center: User info */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white light:text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400 light:text-gray-600">{user?.email || 'user@example.com'}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
            </div>
          </div>
          
          {/* Right: Admin and Theme toggle */}
          <div className="flex items-center space-x-2">
            {user?.role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 light:hover:bg-red-50 transition-colors"
                title="Admin Dashboard"
              >
                <Shield className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-400 light:text-gray-600 hover:text-white light:hover:text-gray-900 hover:bg-white/10 light:hover:bg-gray-100 transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-[#0a0a0a] light:bg-gray-50">
          {children}
        </main>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 light:bg-black/20 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] light:bg-white border border-white/10 light:border-gray-200 rounded-xl p-6 w-96 max-w-[90vw] max-h-[80vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white light:text-gray-900">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-gray-400 light:text-gray-600 hover:text-white light:hover:text-gray-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Navigation */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 light:text-gray-700 mb-2">Navigation</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 light:text-gray-600">Go to Home</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">⌘</kbd>
                      <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">1</kbd>
                      <span className="text-gray-500 mx-1">or</span>
                      <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">H</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 light:text-gray-600">Go to Projects</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">⌘</kbd>
                      <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">2</kbd>
                      <span className="text-gray-500 mx-1">or</span>
                      <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">W</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 light:text-gray-600">Go to Reports</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">⌘</kbd>
                      <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">3</kbd>
                      <span className="text-gray-500 mx-1">or</span>
                      <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">R</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 light:text-gray-600">Go to Settings</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">S</kbd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 light:text-gray-700 mb-2">Actions</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 light:text-gray-600">Toggle Theme</span>
                    <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">T</kbd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 light:text-gray-600">Focus Search</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">⌘</kbd>
                      <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">K</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 light:text-gray-600">Toggle Sidebar</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">⌘</kbd>
                      <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">/</kbd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 light:text-gray-700 mb-2">Help</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 light:text-gray-600">Show Shortcuts</span>
                    <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">?</kbd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 light:text-gray-600">Close Modal</span>
                    <kbd className="px-2 py-1 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10 light:border-gray-200">
              <p className="text-xs text-gray-400 light:text-gray-600 text-center">
                Press <kbd className="px-1 py-0.5 bg-gray-700 light:bg-gray-200 text-gray-300 light:text-gray-700 rounded text-xs">?</kbd> anytime to show this help
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 