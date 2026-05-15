import { apiClient } from './apiClient';
import { AdDto } from '../types';

export const adService = {
  getAllAds: async (): Promise<AdDto[]> => {
    return apiClient<AdDto[]>('/ads', {
      method: 'GET',
      requireAuth: false, // Anasayfada herkes görebilir
    });
  },

  getAdById: async (id: number | string): Promise<AdDto> => {
    return apiClient<AdDto>(`/ads/${id}`, {
      method: 'GET',
      requireAuth: false,
    });
  },
};
