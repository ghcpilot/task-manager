import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  reload
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from './firebase';

// Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Project {
  id?: string;
  name: string;
  description?: string;
  color: string;
  status: 'active' | 'completed' | 'archived';
  deadline?: Timestamp;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  taskCount?: number;
}

export interface Task {
  id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Timestamp;
  projectId?: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export interface TimeEntry {
  id?: string;
  description?: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  duration?: number; // in seconds
  isRunning: boolean;
  projectId: string;
  taskId?: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Authentication Functions
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile
    await updateProfile(user, { displayName });
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Create user document in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      role: 'user',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    return { user, userProfile };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Note: Google accounts are automatically verified
    
    // Check if user profile exists, if not create one
    const existingProfile = await getUserProfile(user.uid);
    
    if (!existingProfile) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || 'User',
        photoURL: user.photoURL || undefined,
        role: 'user',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Email Verification Functions
export const sendVerificationEmail = async (user: User) => {
  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const checkEmailVerified = async (user: User) => {
  try {
    await reload(user);
    return user.emailVerified;
  } catch (error) {
    console.error('Error checking email verification:', error);
    return false;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Project Functions
export const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const project: Omit<Project, 'id'> = {
      ...projectData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'projects'), project);
    return { id: docRef.id, ...project };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const getProjects = async (userId: string): Promise<Project[]> => {
  try {
    // First try with orderBy (requires composite index)
    let q = query(
      collection(db, 'projects'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    let querySnapshot;
    try {
      querySnapshot = await getDocs(q);
    } catch (indexError: any) {
      // If index doesn't exist, fall back to simple query without orderBy
      console.warn('Composite index not found, using simple query:', indexError.message);
      q = query(
        collection(db, 'projects'),
        where('userId', '==', userId)
      );
      querySnapshot = await getDocs(q);
    }
    
    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() } as Project);
    });
    
    // Sort manually if we couldn't use orderBy
    projects.sort((a, b) => {
      const aTime = a.updatedAt?.toDate?.() || new Date(0);
      const bTime = b.updatedAt?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });
    
    return projects;
  } catch (error) {
    console.error('Error getting projects:', error);
    // Return empty array instead of throwing for new users
    return [];
  }
};

export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    // First, delete all tasks associated with this project
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    
    const deletePromises = tasksSnapshot.docs.map(taskDoc => 
      deleteDoc(doc(db, 'tasks', taskDoc.id))
    );
    await Promise.all(deletePromises);
    
    // Then delete the project
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const getProjectById = async (projectId: string): Promise<Project | null> => {
  try {
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    if (projectDoc.exists()) {
      return { id: projectDoc.id, ...projectDoc.data() } as Project;
    }
    return null;
  } catch (error) {
    console.error('Error getting project by ID:', error);
    throw error;
  }
};

export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
  try {
    // First try with orderBy (requires composite index)
    let q = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    
    let querySnapshot;
    try {
      querySnapshot = await getDocs(q);
    } catch (indexError: any) {
      // If index doesn't exist, fall back to simple query without orderBy
      console.warn('Composite index not found, using simple query:', indexError.message);
      q = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      querySnapshot = await getDocs(q);
    }
    
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() } as Task);
    });
    
    // Sort manually if we couldn't use orderBy
    tasks.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });
    
    return tasks;
  } catch (error) {
    console.error('Error getting tasks by project:', error);
    // Return empty array instead of throwing for new users
    return [];
  }
};

// Task Functions
export const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const task: Omit<Task, 'id'> = {
      ...taskData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'tasks'), task);
    return { id: docRef.id, ...task };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const getTasks = async (userId: string, projectId?: string): Promise<Task[]> => {
  try {
    let q;
    if (projectId) {
      // First try with orderBy (requires composite index)
      q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }
    
    let querySnapshot;
    try {
      querySnapshot = await getDocs(q);
    } catch (indexError: any) {
      // If index doesn't exist, fall back to simple query without orderBy
      console.warn('Composite index not found, using simple query:', indexError.message);
      if (projectId) {
        q = query(
          collection(db, 'tasks'),
          where('userId', '==', userId),
          where('projectId', '==', projectId)
        );
      } else {
        q = query(
          collection(db, 'tasks'),
          where('userId', '==', userId)
        );
      }
      querySnapshot = await getDocs(q);
    }
    
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() } as Task);
    });
    
    // Sort manually if we couldn't use orderBy
    tasks.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });
    
    return tasks;
  } catch (error) {
    console.error('Error getting tasks:', error);
    // Return empty array instead of throwing for new users
    return [];
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    // If marking as completed, add completedAt timestamp
    if (updates.status === 'completed') {
      updateData.completedAt = Timestamp.now();
    }
    
    await updateDoc(taskRef, updateData);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToProjects = (userId: string, callback: (projects: Project[]) => void) => {
  const q = query(
    collection(db, 'projects'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() } as Project);
    });
    callback(projects);
  });
};

export const subscribeToTasks = (userId: string, callback: (tasks: Task[]) => void, projectId?: string) => {
  let q;
  if (projectId) {
    q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
  }
  
  return onSnapshot(q, (querySnapshot) => {
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() } as Task);
    });
    callback(tasks);
  });
};

// Utility functions
export const getTasksByDate = async (userId: string, date: Date): Promise<Task[]> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      where('dueDate', '>=', Timestamp.fromDate(startOfDay)),
      where('dueDate', '<=', Timestamp.fromDate(endOfDay))
    );
    
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() } as Task);
    });
    
    return tasks;
  } catch (error) {
    console.error('Error getting tasks by date:', error);
    throw error;
  }
};

export const getProjectStats = async (userId: string) => {
  try {
    const [projects, tasks] = await Promise.all([
      getProjects(userId),
      getTasks(userId)
    ]);
    
    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      overdueTasks: tasks.filter(t => t.status === 'overdue').length,
      completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting project stats:', error);
    throw error;
  }
};

// Time Entry Functions
export const createTimeEntry = async (timeEntryData: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const timeEntry: Omit<TimeEntry, 'id'> = {
      ...timeEntryData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'timeEntries'), timeEntry);
    return { id: docRef.id, ...timeEntry };
  } catch (error) {
    console.error('Error creating time entry:', error);
    throw error;
  }
};

export const getTimeEntries = async (
  userId: string, 
  filters?: {
    projectId?: string;
    taskId?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<TimeEntry[]> => {
  try {
    let q = query(
      collection(db, 'timeEntries'),
      where('userId', '==', userId),
      orderBy('startTime', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    let timeEntries: TimeEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      timeEntries.push({ id: doc.id, ...doc.data() } as TimeEntry);
    });
    
    // Apply client-side filtering for complex queries
    if (filters) {
      if (filters.projectId) {
        timeEntries = timeEntries.filter(entry => entry.projectId === filters.projectId);
      }
      
      if (filters.taskId) {
        timeEntries = timeEntries.filter(entry => entry.taskId === filters.taskId);
      }
      
      if (filters.startDate) {
        const startTimestamp = Timestamp.fromDate(filters.startDate);
        timeEntries = timeEntries.filter(entry => entry.startTime.toMillis() >= startTimestamp.toMillis());
      }
      
      if (filters.endDate) {
        const endTimestamp = Timestamp.fromDate(filters.endDate);
        timeEntries = timeEntries.filter(entry => entry.startTime.toMillis() <= endTimestamp.toMillis());
      }
    }
    
    return timeEntries;
  } catch (error) {
    console.error('Error getting time entries:', error);
    throw error;
  }
};

export const getTimeEntryById = async (timeEntryId: string): Promise<TimeEntry | null> => {
  try {
    const timeEntryDoc = await getDoc(doc(db, 'timeEntries', timeEntryId));
    if (timeEntryDoc.exists()) {
      return { id: timeEntryDoc.id, ...timeEntryDoc.data() } as TimeEntry;
    }
    return null;
  } catch (error) {
    console.error('Error getting time entry by ID:', error);
    throw error;
  }
};

export const updateTimeEntry = async (timeEntryId: string, updates: Partial<TimeEntry>) => {
  try {
    const timeEntryRef = doc(db, 'timeEntries', timeEntryId);
    await updateDoc(timeEntryRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating time entry:', error);
    throw error;
  }
};

export const deleteTimeEntry = async (timeEntryId: string) => {
  try {
    await deleteDoc(doc(db, 'timeEntries', timeEntryId));
  } catch (error) {
    console.error('Error deleting time entry:', error);
    throw error;
  }
};

export const getRunningTimeEntry = async (userId: string): Promise<TimeEntry | null> => {
  try {
    const q = query(
      collection(db, 'timeEntries'),
      where('userId', '==', userId),
      where('isRunning', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as TimeEntry;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting running time entry:', error);
    throw error;
  }
};

export const stopTimeEntry = async (timeEntryId: string, endTime: Date) => {
  try {
    const timeEntry = await getTimeEntryById(timeEntryId);
    if (!timeEntry) {
      throw new Error('Time entry not found');
    }
    
    const duration = Math.floor((endTime.getTime() - timeEntry.startTime.toDate().getTime()) / 1000);
    
    await updateTimeEntry(timeEntryId, {
      endTime: Timestamp.fromDate(endTime),
      duration,
      isRunning: false
    });
    
    return duration;
  } catch (error) {
    console.error('Error stopping time entry:', error);
    throw error;
  }
}; 