// Auth utility functions
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Session {
  user: AuthUser | null;
  expires: Date;
}

// Get the current session data
export async function getSession(): Promise<Session | null> {
  try {
    const response = await fetch('/api/auth/session');
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

// Get the current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  return session?.user || null;
}

// Sign out the user
export async function signOut(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to sign out:', error);
    return false;
  }
} 