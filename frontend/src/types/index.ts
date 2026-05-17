export interface AuthResponse {
  token: string;
  userId?: number;
  email?: string;
  personaId?: number;
  firstName?: string;
  lastName?: string;
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
  neighborhood?: string;
  photoUrls: string[];
  isActive: boolean;
  createdAt: string;
}

export interface MessageDto {
  id: number;
  senderId: number;
  senderName: string;
  senderProfilePicture?: string;
  receiverId: number;
  receiverName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ConversationDto {
  otherUserId: number;
  otherUserName: string;
  otherUserProfilePicture?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}
