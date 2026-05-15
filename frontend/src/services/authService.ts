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
  register: async (data: RegisterRequest & { password: string }): Promise<string> => {
    return apiClient<string>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false, // Kayıt için token gerekmez
    });
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
    }
    
    return response;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
  
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  }
};
