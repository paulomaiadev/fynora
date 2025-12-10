import api, { setTokens, clearTokens, handleApiError } from './axios';
import type { User } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
}

// Mock user for development
const mockUser: User = {
  id: '1',
  email: 'admin@gestormei.com',
  name: 'João Silva',
  company: 'MEI Solutions',
};

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Mock implementation for development
    await delay(1000);
    
    if (credentials.email === 'admin@gestormei.com' && credentials.password === '123456') {
      const mockToken = `mock-jwt-token-${Date.now()}`;
      const mockRefresh = `mock-refresh-token-${Date.now()}`;
      
      setTokens(mockToken, mockRefresh);
      
      return {
        user: mockUser,
        access_token: mockToken,
        refresh_token: mockRefresh,
      };
    }
    
    throw new Error('Credenciais inválidas');
    
    // Real API call (uncomment when backend is ready)
    // const response = await api.post<AuthResponse>('/auth/login', credentials);
    // setTokens(response.data.access_token, response.data.refresh_token);
    // return response.data;
  },
  
  logout: async (): Promise<void> => {
    try {
      // await api.post('/auth/logout');
    } finally {
      clearTokens();
    }
  },
  
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    // Mock implementation
    await delay(300);
    return mockUser;
    
    // Real API call
    // const response = await api.get<User>('/auth/me');
    // return response.data;
  },
  
  updateProfile: async (data: Partial<User>): Promise<User> => {
    // Mock implementation
    await delay(500);
    return { ...mockUser, ...data };
    
    // Real API call
    // const response = await api.patch<User>('/auth/me', data);
    // return response.data;
  },
};

export { handleApiError };
