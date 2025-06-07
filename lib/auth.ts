import { auth } from './firebase';

// Auth utility functions
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Helper function to get user from Firebase Auth (client-side only)
export async function getAuthUser() {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    
    return {
      id: user.uid,
      name: user.displayName || 'User',
      email: user.email || '',
      role: 'user'
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Get Firebase ID token for API requests
export async function getIdToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    
    return await user.getIdToken();
  } catch (error) {
    console.error('Failed to get ID token:', error);
    return null;
  }
}

// Enhanced authenticated fetch function
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = await getIdToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}

// Session management functions (client-side)
export async function getSession() {
  return getAuthUser();
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthUser();
  return user !== null;
}

export async function getCurrentUser() {
  return getAuthUser();
}

export async function signOut() {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
} 