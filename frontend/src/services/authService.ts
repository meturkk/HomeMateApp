import { apiClient } from './apiClient';
import { AuthResponse } from '../types';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export const authService = {
  register: async (data: RegisterRequest & { password: string }): Promise<AuthResponse> => {
    const response = await apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false,
    });

    if (response && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.userId,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        personaId: response.personaId
      }));
    }
    
    return response;
  },

  login: async (data: LoginRequest & { password: string }): Promise<AuthResponse> => {
    const response = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false, // Giriş için token gerekmez
    });
    
    // Başarılı girişte token'ı otomatik kaydet
    if (response && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.userId,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        personaId: response.personaId
      }));
    }
    
    return response;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  getUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  },
  
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  }
};
