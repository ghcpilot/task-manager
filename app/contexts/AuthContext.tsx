'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile,
  UserProfile,
  signInWithGoogle,
  sendVerificationEmail,
  checkEmailVerified
} from '@/lib/firebaseService';

// Define user type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  firebaseUser?: FirebaseUser;
  profile?: UserProfile;
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
  isEmailVerified: false,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  sendVerificationEmail: async () => {},
  checkEmailVerification: async () => false,
  error: null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if the user is authenticated on initial load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (firebaseUser) {
          // User is signed in
          const userProfile = await getUserProfile(firebaseUser.uid);
          
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || userProfile?.displayName || 'User',
            email: firebaseUser.email || '',
            role: userProfile?.role || 'user',
            avatar: firebaseUser.photoURL || userProfile?.photoURL || undefined,
            firebaseUser,
            profile: userProfile || undefined
          });
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setUser(null);
        setError('Authentication failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await loginUser(email, password);
      // The onAuthStateChanged listener will handle setting the user state
    } catch (err: any) {
      console.error('Sign in error:', err);
      let errorMessage = 'Invalid email or password. Please try again.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await registerUser(email, password, name);
      // The onAuthStateChanged listener will handle setting the user state
    } catch (err: any) {
      console.error('Sign up error:', err);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Google sign in function
  const handleSignInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await signInWithGoogle();
      // The onAuthStateChanged listener will handle setting the user state
    } catch (err: any) {
      console.error('Google sign in error:', err);
      let errorMessage = 'Google sign in failed. Please try again.';
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await logoutUser();
      // The onAuthStateChanged listener will handle clearing the user state
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError('Sign out failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Send verification email function
  const handleSendVerificationEmail = async () => {
    try {
      if (user?.firebaseUser) {
        await sendVerificationEmail(user.firebaseUser);
      }
    } catch (err: any) {
      console.error('Send verification email error:', err);
      setError('Failed to send verification email. Please try again.');
    }
  };

  // Check email verification function
  const handleCheckEmailVerification = async () => {
    try {
      if (user?.firebaseUser) {
        const isVerified = await checkEmailVerified(user.firebaseUser);
        if (isVerified) {
          // Update user state to reflect verification
          setUser(prev => prev ? { ...prev, firebaseUser: { ...prev.firebaseUser!, emailVerified: true } } : null);
        }
        return isVerified;
      }
      return false;
    } catch (err: any) {
      console.error('Check email verification error:', err);
      return false;
    }
  };

  // Provide the authentication context
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isEmailVerified: !!user?.firebaseUser?.emailVerified,
        signIn,
        signUp,
        signInWithGoogle: handleSignInWithGoogle,
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