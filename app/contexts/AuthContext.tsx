'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentUser as getLocalCurrentUser,
  authenticateUser,
  createUser,
  clearCurrentUser,
  handleLocalApiRequest,
  UserAccount,
} from '@/lib/localDb';

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  profile?: {
    displayName: string;
    role: string;
    photoURL?: string;
    email: string;
    createdAt?: { toDate: () => Date };
    updatedAt?: { toDate: () => Date };
  };
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  error: string | null;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isEmailVerified: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  sendVerificationEmail: async () => {},
  checkEmailVerification: async () => true,
  error: null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Setup client-side fetch interceptor for /api/* requests so all components use localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
        let urlStr = '';
        if (typeof input === 'string') {
          urlStr = input;
        } else if (input instanceof URL) {
          urlStr = input.toString();
        } else if (input && typeof input === 'object' && 'url' in input) {
          urlStr = (input as Request).url;
        }

        // Intercept relative or localhost /api/* calls
        if (urlStr.startsWith('/api/') || urlStr.includes('localhost:3000/api/')) {
          try {
            const localResp = await handleLocalApiRequest(urlStr, init);
            if (localResp) {
              return localResp;
            }
          } catch (err) {
            console.error('Local API intercept error:', err);
          }
        }

        return originalFetch.apply(window, [input, init]);
      };
    }
  }, []);

  // Check if user is authenticated from localStorage on initial load
  useEffect(() => {
    try {
      setIsLoading(true);
      const localUser = getLocalCurrentUser();
      if (localUser) {
        setUser({
          id: localUser.id,
          name: localUser.name,
          email: localUser.email,
          role: localUser.role,
          avatar: localUser.avatar,
          profile: {
            displayName: localUser.name,
            role: localUser.role,
            photoURL: localUser.avatar,
            email: localUser.email,
            createdAt: { toDate: () => new Date(localUser.createdAt) },
            updatedAt: { toDate: () => new Date(localUser.updatedAt) },
          },
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error loading local session:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const authenticated = authenticateUser(email, password);
      setUser({
        id: authenticated.id,
        name: authenticated.name,
        email: authenticated.email,
        role: authenticated.role,
        avatar: authenticated.avatar,
        profile: {
          displayName: authenticated.name,
          role: authenticated.role,
          photoURL: authenticated.avatar,
          email: authenticated.email,
          createdAt: { toDate: () => new Date(authenticated.createdAt) },
          updatedAt: { toDate: () => new Date(authenticated.updatedAt) },
        },
      });
    } catch (err: any) {
      console.error('Sign in error:', err);
      const message = err.message || 'Invalid email or password. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const newUser = createUser({ name, email, password });
      authenticateUser(email, password);

      setUser({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        profile: {
          displayName: newUser.name,
          role: newUser.role,
          photoURL: newUser.avatar,
          email: newUser.email,
          createdAt: { toDate: () => new Date(newUser.createdAt) },
          updatedAt: { toDate: () => new Date(newUser.updatedAt) },
        },
      });
    } catch (err: any) {
      console.error('Sign up error:', err);
      const message = err.message || 'Registration failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      clearCurrentUser();
      setUser(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError('Sign out failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send verification email function (instant approval for local accounts)
  const handleSendVerificationEmail = async () => {
    // Local accounts are auto-verified
  };

  // Check email verification function
  const handleCheckEmailVerification = async () => {
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isEmailVerified: true,
        signIn,
        signUp,
        signOut,
        sendVerificationEmail: handleSendVerificationEmail,
        checkEmailVerification: handleCheckEmailVerification,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};