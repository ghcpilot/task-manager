/**
 * Local Storage Database Engine
 * Persists all accounts, projects, tasks, time entries, and preferences in browser localStorage.
 */

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalProject {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: 'active' | 'completed' | 'archived';
  deadline?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
}

export interface LocalTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  projectId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  project?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface LocalTimeEntry {
  id: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in seconds
  isRunning: boolean;
  projectId: string;
  taskId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const STORAGE_KEYS = {
  USERS: 'taskmate_users',
  CURRENT_USER: 'taskmate_current_user',
  PROJECTS: 'taskmate_projects',
  TASKS: 'taskmate_tasks',
  TIME_ENTRIES: 'taskmate_time_entries',
  AUTH_TOKEN: 'authToken',
};

// Safe localStorage helpers (SSR-safe)
const isBrowser = () => typeof window !== 'undefined';

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing localStorage key "${key}":`, err);
  }
}

function removeStorageItem(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`Error removing localStorage key "${key}":`, err);
  }
}

// Generate unique ID
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
}

/* =========================================================================
   USER ACCOUNTS & AUTH
   ========================================================================= */

export function getAllUsers(): UserAccount[] {
  return getStorageItem<UserAccount[]>(STORAGE_KEYS.USERS, []);
}

export function getUserByEmail(email: string): UserAccount | null {
  const users = getAllUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export function getUserById(id: string): UserAccount | null {
  const users = getAllUsers();
  return users.find((u) => u.id === id) || null;
}

export function createUser(data: { name: string; email: string; password: string; role?: 'user' | 'admin' }): UserAccount {
  const existing = getUserByEmail(data.email);
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const now = new Date().toISOString();
  const newUser: UserAccount = {
    id: generateId(),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password, // Stored in localStorage
    role: data.role || 'user',
    createdAt: now,
    updatedAt: now,
  };

  const users = getAllUsers();
  users.push(newUser);
  setStorageItem(STORAGE_KEYS.USERS, users);

  // Automatically seed initial workspace data for the new user
  seedUserData(newUser.id, newUser.name);

  return newUser;
}

export function updateUser(id: string, updates: Partial<UserAccount>): UserAccount {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    throw new Error('User not found.');
  }

  const updated: UserAccount = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  users[index] = updated;
  setStorageItem(STORAGE_KEYS.USERS, users);

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === id) {
    setCurrentUser(updated);
  }

  return updated;
}

export function authenticateUser(email: string, password: string): UserAccount {
  const user = getUserByEmail(email);
  if (!user) {
    throw new Error('No account found with this email address.');
  }
  if (user.password !== password) {
    throw new Error('Incorrect password. Please try again.');
  }
  setCurrentUser(user);
  return user;
}

export function getCurrentUser(): (UserAccount & { isEmailVerified: boolean }) | null {
  const user = getStorageItem<UserAccount | null>(STORAGE_KEYS.CURRENT_USER, null);
  if (!user) return null;
  return { ...user, isEmailVerified: true };
}

export function setCurrentUser(user: UserAccount): void {
  const userObj = { ...user, isEmailVerified: true };
  setStorageItem(STORAGE_KEYS.CURRENT_USER, userObj);
  setStorageItem(STORAGE_KEYS.AUTH_TOKEN, `local_token_${user.id}`);
}

export function clearCurrentUser(): void {
  removeStorageItem(STORAGE_KEYS.CURRENT_USER);
  removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
}

/* =========================================================================
   PROJECTS
   ========================================================================= */

export function getProjects(userId?: string): LocalProject[] {
  const projects = getStorageItem<LocalProject[]>(STORAGE_KEYS.PROJECTS, []);
  const current = getCurrentUser();
  const effectiveUserId = userId || current?.id;
  const userProjects = effectiveUserId
    ? projects.filter((p) => p.userId === effectiveUserId || !p.userId)
    : projects;
  
  // Attach taskCount
  const allTasks = getStorageItem<LocalTask[]>(STORAGE_KEYS.TASKS, []);
  return userProjects.map((proj) => ({
    ...proj,
    taskCount: allTasks.filter((t) => t.projectId === proj.id).length,
  }));
}

export function getProjectById(projectId: string): LocalProject | null {
  const projects = getStorageItem<LocalProject[]>(STORAGE_KEYS.PROJECTS, []);
  return projects.find((p) => p.id === projectId) || null;
}

export function createProject(data: {
  name: string;
  description?: string;
  color: string;
  status?: 'active' | 'completed' | 'archived';
  deadline?: string;
  userId?: string;
}): LocalProject {
  const now = new Date().toISOString();
  const current = getCurrentUser();
  const newProj: LocalProject = {
    id: generateId(),
    name: data.name,
    description: data.description || '',
    color: data.color || '#3b82f6',
    status: data.status || 'active',
    deadline: data.deadline,
    userId: data.userId || current?.id || 'demo-user-id',
    createdAt: now,
    updatedAt: now,
    taskCount: 0,
  };

  const projects = getStorageItem<LocalProject[]>(STORAGE_KEYS.PROJECTS, []);
  projects.unshift(newProj);
  setStorageItem(STORAGE_KEYS.PROJECTS, projects);
  return newProj;
}

export function updateProject(projectId: string, updates: Partial<LocalProject>): LocalProject {
  const projects = getStorageItem<LocalProject[]>(STORAGE_KEYS.PROJECTS, []);
  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) {
    throw new Error('Project not found');
  }

  const updated: LocalProject = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  projects[index] = updated;
  setStorageItem(STORAGE_KEYS.PROJECTS, projects);
  return updated;
}

export function deleteProject(projectId: string): void {
  // Delete project
  const projects = getStorageItem<LocalProject[]>(STORAGE_KEYS.PROJECTS, []);
  const filteredProjects = projects.filter((p) => p.id !== projectId);
  setStorageItem(STORAGE_KEYS.PROJECTS, filteredProjects);

  // Delete associated tasks
  const tasks = getStorageItem<LocalTask[]>(STORAGE_KEYS.TASKS, []);
  const filteredTasks = tasks.filter((t) => t.projectId !== projectId);
  setStorageItem(STORAGE_KEYS.TASKS, filteredTasks);

  // Delete associated time entries
  const timeEntries = getStorageItem<LocalTimeEntry[]>(STORAGE_KEYS.TIME_ENTRIES, []);
  const filteredTime = timeEntries.filter((te) => te.projectId !== projectId);
  setStorageItem(STORAGE_KEYS.TIME_ENTRIES, filteredTime);
}

/* =========================================================================
   TASKS
   ========================================================================= */

function normalizeTaskStatus(status: string): 'pending' | 'in_progress' | 'completed' | 'overdue' {
  if (status === 'in-progress') return 'in_progress';
  if (status === 'pending' || status === 'in_progress' || status === 'completed' || status === 'overdue') {
    return status;
  }
  return 'pending';
}

export function getTasks(userId?: string, projectId?: string): LocalTask[] {
  const tasks = getStorageItem<LocalTask[]>(STORAGE_KEYS.TASKS, []);
  const projects = getStorageItem<LocalProject[]>(STORAGE_KEYS.PROJECTS, []);
  const current = getCurrentUser();
  const effectiveUserId = userId || current?.id;

  let filtered = effectiveUserId
    ? tasks.filter((t) => t.userId === effectiveUserId || !t.userId)
    : tasks;
  if (projectId) {
    filtered = filtered.filter((t) => t.projectId === projectId);
  }

  return filtered.map((task) => {
    const project = projects.find((p) => p.id === task.projectId);
    return {
      ...task,
      project: project ? { id: project.id, name: project.name, color: project.color } : undefined,
    };
  });
}

export function getTaskById(taskId: string): LocalTask | null {
  const tasks = getStorageItem<LocalTask[]>(STORAGE_KEYS.TASKS, []);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  const projects = getStorageItem<LocalProject[]>(STORAGE_KEYS.PROJECTS, []);
  const project = projects.find((p) => p.id === task.projectId);
  return {
    ...task,
    project: project ? { id: project.id, name: project.name, color: project.color } : undefined,
  };
}

export function createTask(data: {
  title: string;
  description?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  projectId?: string;
  userId?: string;
}): LocalTask {
  const now = new Date().toISOString();
  const current = getCurrentUser();
  const newTask: LocalTask = {
    id: generateId(),
    title: data.title,
    description: data.description || '',
    status: normalizeTaskStatus(data.status || 'pending'),
    priority: data.priority || 'medium',
    dueDate: data.dueDate,
    projectId: data.projectId,
    userId: data.userId || current?.id || 'demo-user-id',
    createdAt: now,
    updatedAt: now,
  };

  const tasks = getStorageItem<LocalTask[]>(STORAGE_KEYS.TASKS, []);
  tasks.unshift(newTask);
  setStorageItem(STORAGE_KEYS.TASKS, tasks);

  // Sync to legacy 'savedTasks' key for backwards-compatibility
  setStorageItem('savedTasks', tasks);

  const projects = getStorageItem<LocalProject[]>(STORAGE_KEYS.PROJECTS, []);
  const project = projects.find((p) => p.id === newTask.projectId);
  return {
    ...newTask,
    project: project ? { id: project.id, name: project.name, color: project.color } : undefined,
  };
}

export function updateTask(taskId: string, updates: Partial<LocalTask>): LocalTask {
  const tasks = getStorageItem<LocalTask[]>(STORAGE_KEYS.TASKS, []);
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) {
    throw new Error('Task not found');
  }

  const normalizedUpdates = { ...updates };
  if (updates.status) {
    normalizedUpdates.status = normalizeTaskStatus(updates.status);
    if (normalizedUpdates.status === 'completed') {
      normalizedUpdates.completedAt = new Date().toISOString();
    }
  }

  const updated: LocalTask = {
    ...tasks[index],
    ...normalizedUpdates,
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updated;
  setStorageItem(STORAGE_KEYS.TASKS, tasks);
  setStorageItem('savedTasks', tasks);

  const projects = getStorageItem<LocalProject[]>(STORAGE_KEYS.PROJECTS, []);
  const project = projects.find((p) => p.id === updated.projectId);
  return {
    ...updated,
    project: project ? { id: project.id, name: project.name, color: project.color } : undefined,
  };
}

export function deleteTask(taskId: string): void {
  const tasks = getStorageItem<LocalTask[]>(STORAGE_KEYS.TASKS, []);
  const filtered = tasks.filter((t) => t.id !== taskId);
  setStorageItem(STORAGE_KEYS.TASKS, filtered);
  setStorageItem('savedTasks', filtered);

  // Also remove time entries
  const timeEntries = getStorageItem<LocalTimeEntry[]>(STORAGE_KEYS.TIME_ENTRIES, []);
  const filteredTime = timeEntries.filter((te) => te.taskId !== taskId);
  setStorageItem(STORAGE_KEYS.TIME_ENTRIES, filteredTime);
}

/* =========================================================================
   TIME TRACKING
   ========================================================================= */

export function getTimeEntries(
  userId?: string,
  filters?: { projectId?: string; taskId?: string; startDate?: Date; endDate?: Date }
): LocalTimeEntry[] {
  const entries = getStorageItem<LocalTimeEntry[]>(STORAGE_KEYS.TIME_ENTRIES, []);
  const current = getCurrentUser();
  const effectiveUserId = userId || current?.id;
  let filtered = effectiveUserId
    ? entries.filter((e) => e.userId === effectiveUserId || !e.userId)
    : entries;

  if (filters?.projectId) {
    filtered = filtered.filter((e) => e.projectId === filters.projectId);
  }
  if (filters?.taskId) {
    filtered = filtered.filter((e) => e.taskId === filters.taskId);
  }
  if (filters?.startDate) {
    const startMs = filters.startDate.getTime();
    filtered = filtered.filter((e) => new Date(e.startTime).getTime() >= startMs);
  }
  if (filters?.endDate) {
    const endMs = filters.endDate.getTime();
    filtered = filtered.filter((e) => new Date(e.startTime).getTime() <= endMs);
  }

  return filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

export function getTimeEntryById(id: string): LocalTimeEntry | null {
  const entries = getStorageItem<LocalTimeEntry[]>(STORAGE_KEYS.TIME_ENTRIES, []);
  return entries.find((e) => e.id === id) || null;
}

export function createTimeEntry(data: {
  description?: string;
  startTime?: string;
  duration?: number;
  isRunning?: boolean;
  projectId: string;
  taskId?: string;
  userId?: string;
}): LocalTimeEntry {
  const now = new Date().toISOString();
  const current = getCurrentUser();
  const newEntry: LocalTimeEntry = {
    id: generateId(),
    description: data.description || '',
    startTime: data.startTime || now,
    duration: data.duration || 0,
    isRunning: data.isRunning ?? false,
    projectId: data.projectId,
    taskId: data.taskId,
    userId: data.userId || current?.id || 'demo-user-id',
    createdAt: now,
    updatedAt: now,
  };

  const entries = getStorageItem<LocalTimeEntry[]>(STORAGE_KEYS.TIME_ENTRIES, []);
  entries.unshift(newEntry);
  setStorageItem(STORAGE_KEYS.TIME_ENTRIES, entries);
  return newEntry;
}

export function updateTimeEntry(id: string, updates: Partial<LocalTimeEntry>): LocalTimeEntry {
  const entries = getStorageItem<LocalTimeEntry[]>(STORAGE_KEYS.TIME_ENTRIES, []);
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) throw new Error('Time entry not found');

  const updated: LocalTimeEntry = {
    ...entries[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  entries[index] = updated;
  setStorageItem(STORAGE_KEYS.TIME_ENTRIES, entries);
  return updated;
}

export function deleteTimeEntry(id: string): void {
  const entries = getStorageItem<LocalTimeEntry[]>(STORAGE_KEYS.TIME_ENTRIES, []);
  setStorageItem(STORAGE_KEYS.TIME_ENTRIES, entries.filter((e) => e.id !== id));
}

export function getRunningTimeEntry(userId: string): LocalTimeEntry | null {
  const entries = getStorageItem<LocalTimeEntry[]>(STORAGE_KEYS.TIME_ENTRIES, []);
  return entries.find((e) => e.userId === userId && e.isRunning) || null;
}

export function stopTimeEntry(id: string, endTime: Date): number {
  const entry = getTimeEntryById(id);
  if (!entry) throw new Error('Time entry not found');

  const duration = Math.max(0, Math.floor((endTime.getTime() - new Date(entry.startTime).getTime()) / 1000));
  updateTimeEntry(id, {
    endTime: endTime.toISOString(),
    duration,
    isRunning: false,
  });
  return duration;
}

/* =========================================================================
   STATS & ACTIVITY
   ========================================================================= */

export function getProjectStats(userId: string) {
  const projects = getProjects(userId);
  const tasks = getTasks(userId);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate).getTime() < Date.now();
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
    completionRate,
  };
}

export function getUserActivity(userId: string) {
  const tasks = getTasks(userId);
  const timeEntries = getTimeEntries(userId);

  const activities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
  }> = [];

  tasks.slice(0, 5).forEach((t) => {
    activities.push({
      id: 'act_' + t.id,
      type: t.status === 'completed' ? 'task_completed' : 'task_created',
      title: t.status === 'completed' ? `Completed task "${t.title}"` : `Created task "${t.title}"`,
      description: t.description || '',
      timestamp: t.updatedAt || t.createdAt,
    });
  });

  timeEntries.slice(0, 5).forEach((te) => {
    activities.push({
      id: 'act_' + te.id,
      type: 'time_tracked',
      title: `Logged ${Math.round((te.duration || 0) / 60)} minutes`,
      description: te.description || 'Focus session',
      timestamp: te.updatedAt || te.createdAt,
    });
  });

  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getUserAchievements(userId: string) {
  const stats = getProjectStats(userId);
  return [
    {
      id: 'first-step',
      name: 'First Step',
      description: 'Create your account and first project',
      icon: '🚀',
      unlocked: stats.totalProjects > 0,
      progress: Math.min(100, stats.totalProjects * 100),
    },
    {
      id: 'task-master',
      name: 'Task Master',
      description: 'Complete 5 tasks',
      icon: '✅',
      unlocked: stats.completedTasks >= 5,
      progress: Math.min(100, Math.round((stats.completedTasks / 5) * 100)),
    },
    {
      id: 'productivity-hero',
      name: 'Focus Champion',
      description: 'Maintain 80%+ completion rate',
      icon: '⭐',
      unlocked: stats.completionRate >= 80 && stats.totalTasks >= 3,
      progress: stats.completionRate,
    },
  ];
}

/* =========================================================================
   SEED DATA FOR NEW ACCOUNTS
   ========================================================================= */

function seedUserData(userId: string, userName: string): void {
  const now = new Date();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // 1. Create Default Project
  const defaultProj = createProject({
    name: 'Workspace Starter',
    description: `Welcome ${userName}! This is your primary workspace project stored locally in your browser.`,
    color: '#3b82f6',
    status: 'active',
    deadline: nextWeek.toISOString(),
    userId,
  });

  // 2. Create Initial Tasks
  createTask({
    title: 'Explore your TaskMate dashboard',
    description: 'Familiarize yourself with project views, calendars, and time tracking.',
    status: 'completed',
    priority: 'high',
    dueDate: now.toISOString(),
    projectId: defaultProj.id,
    userId,
  });

  createTask({
    title: 'Create your first custom project',
    description: 'Head to the Projects page and click "New Project" to organize your workflow.',
    status: 'pending',
    priority: 'high',
    dueDate: tomorrow.toISOString(),
    projectId: defaultProj.id,
    userId,
  });

  createTask({
    title: 'Track time on a task',
    description: 'Use the built-in stopwatch to track focus intervals directly on your tasks.',
    status: 'pending',
    priority: 'medium',
    dueDate: nextWeek.toISOString(),
    projectId: defaultProj.id,
    userId,
  });
}

/* =========================================================================
   LOCAL API REQUEST DISPATCHER
   Seamlessly handles any /api/* request client-side using localStorage
   ========================================================================= */

export async function handleLocalApiRequest(url: string, options: RequestInit = {}): Promise<Response | null> {
  const parsedUrl = new URL(url, 'http://localhost:3000');
  const pathname = parsedUrl.pathname;
  const method = (options.method || 'GET').toUpperCase();

  // If not an API request, return null so caller can handle
  if (!pathname.startsWith('/api/')) {
    return null;
  }

  const currentUser = getCurrentUser();
  const userId = currentUser ? currentUser.id : 'anonymous';

  let body: any = null;
  if (options.body && typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = options.body;
    }
  }

  const makeJson = (data: unknown, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    // -------------------------------------------------------------
    // /api/projects
    // -------------------------------------------------------------
    if (pathname === '/api/projects') {
      if (method === 'GET') {
        const projects = getProjects(userId);
        return makeJson(projects);
      }
      if (method === 'POST') {
        const project = createProject({
          ...body,
          userId,
        });
        return makeJson(project, 201);
      }
    }

    const projectMatch = pathname.match(/^\/api\/projects\/([^\/]+)$/);
    if (projectMatch) {
      const projId = projectMatch[1];
      if (method === 'GET') {
        const proj = getProjectById(projId);
        if (!proj) return makeJson({ message: 'Project not found' }, 404);
        const tasks = getTasks(userId, projId);
        return makeJson({ ...proj, tasks });
      }
      if (method === 'PATCH' || method === 'PUT') {
        const updated = updateProject(projId, body);
        return makeJson(updated);
      }
      if (method === 'DELETE') {
        deleteProject(projId);
        return makeJson({ success: true });
      }
    }

    const projectTasksMatch = pathname.match(/^\/api\/projects\/([^\/]+)\/tasks$/);
    if (projectTasksMatch) {
      const projId = projectTasksMatch[1];
      if (method === 'GET') {
        const tasks = getTasks(userId, projId);
        return makeJson(tasks);
      }
      if (method === 'POST') {
        const task = createTask({
          ...body,
          projectId: projId,
          userId,
        });
        return makeJson(task, 201);
      }
    }

    // -------------------------------------------------------------
    // /api/tasks
    // -------------------------------------------------------------
    if (pathname === '/api/tasks') {
      if (method === 'GET') {
        const projectIdParam = parsedUrl.searchParams.get('projectId') || undefined;
        const tasks = getTasks(userId, projectIdParam);
        return makeJson(tasks);
      }
      if (method === 'POST') {
        const task = createTask({
          ...body,
          userId,
        });
        return makeJson(task, 201);
      }
    }

    if (pathname === '/api/tasks/recent') {
      const tasks = getTasks(userId).slice(0, 10);
      return makeJson(tasks);
    }

    const taskMatch = pathname.match(/^\/api\/tasks\/([^\/]+)$/);
    if (taskMatch) {
      const taskId = taskMatch[1];
      if (method === 'GET') {
        const task = getTaskById(taskId);
        if (!task) return makeJson({ message: 'Task not found' }, 404);
        return makeJson(task);
      }
      if (method === 'PATCH' || method === 'PUT') {
        const updated = updateTask(taskId, body);
        return makeJson(updated);
      }
      if (method === 'DELETE') {
        deleteTask(taskId);
        return makeJson({ success: true });
      }
    }

    const taskTimeMatch = pathname.match(/^\/api\/tasks\/([^\/]+)\/time-entries$/);
    if (taskTimeMatch) {
      const taskId = taskTimeMatch[1];
      const entries = getTimeEntries(userId, { taskId });
      return makeJson(entries);
    }

    // -------------------------------------------------------------
    // /api/time-entries
    // -------------------------------------------------------------
    if (pathname === '/api/time-entries') {
      if (method === 'GET') {
        const entries = getTimeEntries(userId);
        return makeJson(entries);
      }
      if (method === 'POST') {
        const entry = createTimeEntry({ ...body, userId });
        return makeJson(entry, 201);
      }
    }

    if (pathname === '/api/time-entries/timer') {
      if (method === 'GET') {
        const running = getRunningTimeEntry(userId);
        return makeJson(running);
      }
      if (method === 'POST') {
        const running = getRunningTimeEntry(userId);
        if (running) {
          const duration = stopTimeEntry(running.id, new Date());
          return makeJson({ ...running, duration, isRunning: false });
        }
        return makeJson(null);
      }
    }

    const timeEntryMatch = pathname.match(/^\/api\/time-entries\/([^\/]+)$/);
    if (timeEntryMatch) {
      const id = timeEntryMatch[1];
      if (method === 'GET') {
        const entry = getTimeEntryById(id);
        return makeJson(entry || { message: 'Not found' }, entry ? 200 : 404);
      }
      if (method === 'PUT' || method === 'PATCH') {
        const updated = updateTimeEntry(id, body);
        return makeJson(updated);
      }
      if (method === 'DELETE') {
        deleteTimeEntry(id);
        return makeJson({ success: true });
      }
    }

    // -------------------------------------------------------------
    // /api/user & /api/stats
    // -------------------------------------------------------------
    if (pathname === '/api/user/stats') {
      const stats = getProjectStats(userId);
      return makeJson(stats);
    }

    if (pathname === '/api/user/activity') {
      const activity = getUserActivity(userId);
      return makeJson(activity);
    }

    if (pathname === '/api/user/achievements') {
      const achievements = getUserAchievements(userId);
      return makeJson(achievements);
    }

    if (pathname === '/api/user/upload-image' || pathname === '/api/user/upload-image/remove') {
      if (method === 'POST' && currentUser) {
        const avatarUrl = pathname.includes('remove') ? undefined : body?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
        const updated = updateUser(currentUser.id, { avatar: avatarUrl });
        return makeJson({ success: true, avatar: updated.avatar });
      }
    }

    if (pathname === '/api/stats') {
      const allProjects = getStorageItem<LocalProject[]>(STORAGE_KEYS.PROJECTS, []);
      const allTasks = getStorageItem<LocalTask[]>(STORAGE_KEYS.TASKS, []);
      const allUsers = getAllUsers();
      return makeJson({
        totalUsers: Math.max(1, allUsers.length),
        totalProjects: allProjects.length,
        totalTasks: allTasks.length,
        completedTasks: allTasks.filter((t) => t.status === 'completed').length,
      });
    }

    if (pathname === '/api/feedback' || pathname === '/api/contact') {
      return makeJson({ success: true, message: 'Saved successfully' });
    }

    return makeJson({ message: 'OK' }, 200);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    console.error(`Local API error [${method} ${pathname}]:`, err);
    return makeJson({ message }, 500);
  }
}

/* =========================================================================
   BACKUP, RESTORE & RESET
   ========================================================================= */

export function exportDatabaseJson(): string {
  if (!isBrowser()) return '{}';
  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    users: getStorageItem(STORAGE_KEYS.USERS, []),
    currentUser: getStorageItem(STORAGE_KEYS.CURRENT_USER, null),
    projects: getStorageItem(STORAGE_KEYS.PROJECTS, []),
    tasks: getStorageItem(STORAGE_KEYS.TASKS, []),
    timeEntries: getStorageItem(STORAGE_KEYS.TIME_ENTRIES, []),
  };
  return JSON.stringify(data, null, 2);
}

export function importDatabaseJson(jsonString: string): boolean {
  if (!isBrowser()) return false;
  try {
    const data = JSON.parse(jsonString);
    if (data.projects && Array.isArray(data.projects)) {
      setStorageItem(STORAGE_KEYS.PROJECTS, data.projects);
    }
    if (data.tasks && Array.isArray(data.tasks)) {
      setStorageItem(STORAGE_KEYS.TASKS, data.tasks);
      setStorageItem('savedTasks', data.tasks);
    }
    if (data.timeEntries && Array.isArray(data.timeEntries)) {
      setStorageItem(STORAGE_KEYS.TIME_ENTRIES, data.timeEntries);
    }
    if (data.users && Array.isArray(data.users)) {
      setStorageItem(STORAGE_KEYS.USERS, data.users);
    }
    if (data.currentUser) {
      setStorageItem(STORAGE_KEYS.CURRENT_USER, data.currentUser);
    }
    return true;
  } catch (e) {
    console.error('Failed to import database JSON:', e);
    return false;
  }
}

export function resetToDefaultData(): void {
  if (!isBrowser()) return;
  const demoUserId = 'demo-user-id';
  const defaultProjects: LocalProject[] = [
    {
      id: 'proj_marketing',
      name: 'Marketing Launch',
      description: 'Q4 Product release strategy & content campaign',
      color: '#6366f1',
      status: 'active',
      userId: demoUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      taskCount: 3,
    },
    {
      id: 'proj_platform',
      name: 'Platform Core',
      description: 'Design system tokens and responsive architecture',
      color: '#a855f7',
      status: 'active',
      userId: demoUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      taskCount: 2,
    },
    {
      id: 'proj_mobile',
      name: 'Mobile App',
      description: 'Native experience and notifications',
      color: '#10b981',
      status: 'active',
      userId: demoUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      taskCount: 1,
    },
  ];

  const defaultTasks: LocalTask[] = [
    {
      id: 'task_1',
      title: 'Review Brand & Theme Guidelines',
      description: 'Check color contrast, zinc dark mode tokens, and typography hierarchy.',
      status: 'completed',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      projectId: 'proj_marketing',
      userId: demoUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task_2',
      title: 'Polish Interactive Focus Timer',
      description: 'Refine micro-interactions, responsive sizing, and session history display.',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      projectId: 'proj_platform',
      userId: demoUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task_3',
      title: 'Setup Calendar Event Integration',
      description: 'Enable click-to-schedule modal and task status toggles directly on grid dates.',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      projectId: 'proj_platform',
      userId: demoUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  setStorageItem(STORAGE_KEYS.PROJECTS, defaultProjects);
  setStorageItem(STORAGE_KEYS.TASKS, defaultTasks);
  setStorageItem('savedTasks', defaultTasks);
}

