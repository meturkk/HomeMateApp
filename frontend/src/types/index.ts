export interface AuthResponse {
  token: string;
}

export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  personaId?: number;
  isActive: boolean;
  role: string;
}

export interface AdDto {
  id: number;
  ownerId: number;
  title: string;
  description: string;
  price: number;
  cityId: number;
  cityName: string;
  districtId: number;
  districtName: string;
  photoUrls: string[];
  isActive: boolean;
  createdAt: string;
}
