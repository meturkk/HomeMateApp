import { apiClient } from './apiClient';
import { AdDto } from '../types';

export const adService = {
  getAllAds: async (): Promise<AdDto[]> => {
    return apiClient<AdDto[]>('/ads', {
      method: 'GET',
      requireAuth: false, // Anasayfada herkes görebilir
    });
  },

  getAdById: async (id: string): Promise<AdDto> => {
    return apiClient<AdDto>(`/ads/${id}`, {
      method: 'GET',
      requireAuth: false,
    });
  },

  getMyAds: async (): Promise<AdDto[]> => {
    return apiClient<AdDto[]>('/ads/me', {
      method: 'GET',
    });
  },

  createAd: async (formData: FormData): Promise<AdDto> => {
    return apiClient<AdDto>('/ads', {
      method: 'POST',
      body: formData,
      requireAuth: true,
    });
  },
};
