import { useState, useCallback } from 'react';
import { authenticatedFetch } from '@/lib/auth';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (url: string, requestOptions: RequestInit = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authenticatedFetch(url, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const get = useCallback((url: string) => {
    return execute(url, { method: 'GET' });
  }, [execute]);

  const post = useCallback((url: string, data?: any) => {
    return execute(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }, [execute]);

  const put = useCallback((url: string, data?: any) => {
    return execute(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }, [execute]);

  const patch = useCallback((url: string, data?: any) => {
    return execute(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }, [execute]);

  const del = useCallback((url: string) => {
    return execute(url, { method: 'DELETE' });
  }, [execute]);

  return {
    loading,
    error,
    data,
    execute,
    get,
    post,
    put,
    patch,
    delete: del,
  };
} 