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
  userId: number;
  title: string;
  description: string;
  price: number;
  location: string;
  houseType: string;
  roomCount: string;
  isActive: boolean;
  createdAt: string;
}
