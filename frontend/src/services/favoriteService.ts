import { apiClient } from './apiClient';
import { AdDto } from '@/types';

export const favoriteService = {
  /**
   * İlanı favorilere ekle veya çıkar (toggle).
   */
  toggle: async (adId: number): Promise<{ favorited: boolean; message: string }> => {
    return apiClient<{ favorited: boolean; message: string }>(`/favorites/${adId}`, {
      method: 'POST',
    });
  },

  /**
   * Kullanıcının favori ilan ID'lerini döndürür.
   */
  getFavoriteIds: async (): Promise<number[]> => {
    return apiClient<number[]>('/favorites/ids', {
      method: 'GET',
    });
  },

  /**
   * Kullanıcının favori ilanlarını döndürür.
   */
  getFavoriteAds: async (): Promise<AdDto[]> => {
    return apiClient<AdDto[]>('/favorites', {
      method: 'GET',
    });
  },
};
