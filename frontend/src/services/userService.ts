import { apiClient } from './apiClient';
import { UserDto } from '../types';

export const userService = {
  submitPersonalityTest: async (answers: Record<string, number>): Promise<string> => {
    return apiClient<string>('/users/submit-test', {
      method: 'POST',
      body: JSON.stringify(answers),
      requireAuth: true, // Requires JWT token
    });
  },

  getMe: async (): Promise<UserDto> => {
    return apiClient<UserDto>('/users/me', {
      method: 'GET',
      requireAuth: true,
    });
  },

  uploadProfilePicture: async (file: File): Promise<UserDto> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient<UserDto>('/users/profile-picture', {
      method: 'POST',
      body: formData,
      requireAuth: true,
    });
  },

  getAllUsers: async (): Promise<UserDto[]> => {
    return apiClient<UserDto[]>('/users', {
      method: 'GET',
      requireAuth: true,
    });
  },

  deactivateUser: async (id: number): Promise<string> => {
    return apiClient<string>(`/users/${id}/deactivate`, {
      method: 'PATCH',
      requireAuth: true,
    });
  }
};
