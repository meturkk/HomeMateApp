import { apiClient } from './apiClient';

export interface LocationItem {
  id: number;
  name: string;
}

export const locationService = {
  getCities: async (): Promise<LocationItem[]> => {
    return apiClient<LocationItem[]>('/locations/cities', {
      method: 'GET',
      requireAuth: false,
    });
  },

  getDistricts: async (cityId: number): Promise<LocationItem[]> => {
    return apiClient<LocationItem[]>(`/locations/cities/${cityId}/districts`, {
      method: 'GET',
      requireAuth: false,
    });
  },

  getNeighborhoods: async (districtId: number): Promise<LocationItem[]> => {
    return apiClient<LocationItem[]>(`/locations/districts/${districtId}/neighborhoods`, {
      method: 'GET',
      requireAuth: false,
    });
  },
};
