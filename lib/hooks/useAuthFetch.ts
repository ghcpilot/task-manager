import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { isAuthenticated, signOut } from '../auth';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetchData: (url: string, options?: RequestInit) => Promise<T | null>;
}

/**
 * A hook for making authenticated API requests.
 * Handles authentication, loading states, and errors.
 */
export function useAuthFetch<T = any>(): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async (url: string, options: RequestInit = {}): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        toast.error('Your session has expired. Please log in again.');
        await signOut();
        router.push('/login');
        return null;
      }

      // Add default headers
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies
      });

      // Check for unauthorized response
      if (response.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        await signOut();
        router.push('/login');
        return null;
      }

      // Handle other error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      // Parse and return successful response
      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(new Error(errorMessage));
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { data, loading, error, fetchData };
} 