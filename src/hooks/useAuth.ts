import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, handleApiError } from '@/services/api';
import { getTokens, clearTokens } from '@/services/api/axios';
import { toast } from 'sonner';
import type { User } from '@/types';

interface UseAuthOptions {
  redirectTo?: string;
  required?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo = '/login', required = false } = options;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Query for current user
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: authApi.getCurrentUser,
    enabled: !!getTokens().accessToken,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const isAuthenticated = !!user && !!getTokens().accessToken;
  
  // Redirect if required and not authenticated
  useEffect(() => {
    if (required && !isLoading && !isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [required, isLoading, isAuthenticated, navigate, redirectTo]);
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authApi.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user);
      toast.success('Login realizado com sucesso!');
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message || 'Credenciais inválidas');
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      clearTokens();
      navigate('/login', { replace: true });
      toast.success('Logout realizado com sucesso!');
    },
    onError: () => {
      // Force logout even on error
      queryClient.clear();
      clearTokens();
      navigate('/login', { replace: true });
    },
  });
  
  // Login function
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        await loginMutation.mutateAsync({ email, password });
        return true;
      } catch {
        return false;
      }
    },
    [loginMutation]
  );
  
  // Logout function
  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);
  
  return {
    user,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending,
    error,
    login,
    logout,
    refetch,
  };
}

export default useAuth;
