import { apiClient } from './apiClient';
import { MessageDto, ConversationDto } from '@/types';

export const messageService = {
  sendMessage: async (receiverId: number, content: string): Promise<MessageDto> => {
    return apiClient<MessageDto>('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    });
  },

  getConversations: async (): Promise<ConversationDto[]> => {
    return apiClient<ConversationDto[]>('/messages/conversations', {
      method: 'GET',
    });
  },

  getConversation: async (otherUserId: number): Promise<MessageDto[]> => {
    return apiClient<MessageDto[]>(`/messages/${otherUserId}`, {
      method: 'GET',
    });
  },

  markAsRead: async (otherUserId: number): Promise<string> => {
    return apiClient<string>(`/messages/${otherUserId}/read`, {
      method: 'POST',
    });
  },

  getUnreadCount: async (): Promise<number> => {
    const result = await apiClient<{ count: number }>('/messages/unread-count', {
      method: 'GET',
    });
    return result.count;
  },
};
