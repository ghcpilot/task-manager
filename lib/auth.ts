import {
  getCurrentUser as getLocalCurrentUser,
  clearCurrentUser,
  handleLocalApiRequest,
} from './localDb';

// Auth utility functions
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Helper function to get user from local storage (client-side only)
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const user = getLocalCurrentUser();
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name || 'User',
      email: user.email || '',
      role: user.role || 'user',
      avatar: user.avatar,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Get ID token for API requests
export async function getIdToken(): Promise<string | null> {
  try {
    const user = getLocalCurrentUser();
    if (!user) {
      return null;
    }
    return `local_token_${user.id}`;
  } catch (error) {
    console.error('Failed to get ID token:', error);
    return null;
  }
}

// Enhanced authenticated fetch function
// Routes directly to localStorage via handleLocalApiRequest when running in browser
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // If running in browser and targeting an /api route, handle via localStorage
  if (typeof window !== 'undefined' && url.startsWith('/api/')) {
    const localResponse = await handleLocalApiRequest(url, options);
    if (localResponse) {
      return localResponse;
    }
  }

  const token = await getIdToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

// Session management functions (client-side)
export async function getSession(): Promise<AuthUser | null> {
  return getAuthUser();
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthUser();
  return user !== null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  return getAuthUser();
}

export async function signOut(): Promise<void> {
  try {
    clearCurrentUser();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}