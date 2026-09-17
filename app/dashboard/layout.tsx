'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Calendar,
  BarChart3,
  Clock,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  Plus,
  Command,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import TaskModal from '@/app/components/ui/TaskModal';
import { createTask, LocalTask } from '@/lib/localDb';
import { toast } from 'react-hot-toast';

interface NavSection {
  title: string;
  items: {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

const navSections: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
      { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
      { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    ],
  },
  {
    title: 'Productivity',
    items: [
      { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
      { name: 'Time Tracking', href: '/dashboard/timetracking', icon: Clock },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showGlobalTaskModal, setShowGlobalTaskModal] = useState(false);
  const { user, signOut, isEmailVerified, isLoading } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
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
            router.push('/dashboard/tasks');
            break;
          case '4':
            e.preventDefault();
            router.push('/dashboard/calendar');
            break;
          case 'k':
            e.preventDefault();
            const searchInput = document.getElementById('global-search-input');
            searchInput?.focus();
            break;
          case '/':
            e.preventDefault();
            setIsSidebarOpen((prev) => !prev);
            break;
        }
      }

      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key) {
          case 'c':
          case 'n':
            e.preventDefault();
            setShowGlobalTaskModal(true);
            break;
          case 't':
            e.preventDefault();
            toggleTheme();
            break;
          case '?':
            e.preventDefault();
            setShowShortcuts((prev) => !prev);
            break;
          case 'Escape':
            setShowShortcuts(false);
            setShowGlobalTaskModal(false);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router, toggleTheme]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch {
      router.push('/auth/login');
    }
  };

  const handleQuickCreateTask = (taskData: Partial<LocalTask>) => {
    if (!user) return;
    try {
      createTask({
        title: taskData.title || 'Untitled Task',
        description: taskData.description || '',
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate,
        projectId: taskData.projectId,
        userId: user.id,
      });
      toast.success('Task created successfully');
      setShowGlobalTaskModal(false);
    } catch {
      toast.error('Failed to create task');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] light:bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="loader" />
          <p className="text-xs font-medium text-zinc-400">Loading TaskMate...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#09090b] light:bg-slate-50 text-zinc-100 light:text-slate-900 font-sans overflow-hidden">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Modern Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          ${isCollapsed ? 'w-[76px]' : 'w-64'}
          bg-[#121216] light:bg-white
          border-r border-white/[0.08] light:border-slate-200
          transition-all duration-300 ease-in-out flex flex-col justify-between
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-[4px_0_24px_rgba(0,0,0,0.3)] lg:shadow-none
        `}
      >
        {/* Workspace Brand Header */}
        <div className="p-4 border-b border-white/[0.08] light:border-slate-200 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-[1px] shadow-lg shadow-indigo-500/25 flex-shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#121216] light:bg-white rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm tracking-tight text-white light:text-slate-900 flex items-center gap-1.5">
                  TaskMate
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    LOCAL
                  </span>
                </span>
                <span className="text-[11px] text-zinc-400 light:text-slate-500 truncate">
                  Personal Workspace
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] light:hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 light:text-slate-400">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 relative group
                      ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm light:bg-indigo-50 light:text-indigo-600 light:border-indigo-200'
                          : 'text-zinc-400 light:text-slate-600 hover:text-zinc-200 light:hover:text-slate-900 hover:bg-white/[0.04] light:hover:bg-slate-100 border border-transparent'
                      }
                      ${isCollapsed ? 'justify-center px-0' : ''}
                    `}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-500 rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Profile & Footer Controls */}
        <div className="p-3 border-t border-white/[0.08] light:border-slate-200 bg-white/[0.01]">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            {!isCollapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex-shrink-0">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (user.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-200 light:text-slate-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-zinc-500 light:text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            {!isCollapsed && (
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] light:hover:bg-slate-100 transition-colors"
                  title={isDarkMode ? 'Switch to light mode (T)' : 'Switch to dark mode (T)'}
                >
                  {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 border-b border-white/[0.08] light:border-slate-200 bg-[#121216]/80 light:bg-white/80 backdrop-blur-md px-4 flex items-center justify-between gap-4 z-30">
          {/* Left: Mobile Toggle & Search */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full hidden sm:block">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="global-search-input"
                type="text"
                placeholder="Search projects, tasks... (⌘K)"
                className="w-full pl-9 pr-8 py-1.5 bg-white/[0.04] light:bg-slate-100 border border-white/[0.08] light:border-slate-200 rounded-xl text-xs text-zinc-200 light:text-slate-800 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-zinc-500 bg-white/[0.06] light:bg-slate-200 px-1.5 py-0.5 rounded font-mono">
                ⌘K
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Add Task Button */}
            <button
              onClick={() => setShowGlobalTaskModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-500/25 transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
              <kbd className="hidden md:inline px-1 py-0.2 bg-white/20 rounded text-[9px] font-mono ml-1">C</kbd>
            </button>

            {/* Shortcuts Help Modal trigger */}
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] light:hover:bg-slate-100 transition-colors"
              title="Keyboard Shortcuts (?)"
            >
              <Command className="w-4 h-4" />
            </button>

            {/* Theme Toggle Button for mobile */}
            <button
              onClick={toggleTheme}
              className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto bg-[#09090b] light:bg-slate-50">
          {children}
        </main>
      </div>

      {/* Global Task Creation Modal */}
      {showGlobalTaskModal && (
        <TaskModal
          isOpen={showGlobalTaskModal}
          onClose={() => setShowGlobalTaskModal(false)}
          onSave={handleQuickCreateTask}
          mode="create"
        />
      )}

      {/* Keyboard Shortcuts Dialog */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Command className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Create new task</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono">C</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Quick Search</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono">⌘ K</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Toggle Theme</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono">T</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Go to Home</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono">⌘ 1</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Go to Projects</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono">⌘ 2</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Go to Tasks</span>
                <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono">⌘ 3</kbd>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] text-center">
              <p className="text-[11px] text-zinc-500">Press <kbd className="font-mono text-zinc-300">Esc</kbd> to close</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}