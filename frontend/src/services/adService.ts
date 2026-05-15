import { apiClient } from './apiClient';
import { AdDto } from '../types';

export const adService = {
  getAllAds: async (): Promise<AdDto[]> => {
    return apiClient<AdDto[]>('/ads', {
      method: 'GET',
      requireAuth: false, // Anasayfada herkes görebilir
    });
  },
};
