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
