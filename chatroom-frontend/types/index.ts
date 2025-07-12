export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isGoogleUser: boolean;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ChatRoom {
  id: string;
  name?: string;
  type: 'private' | 'group';
  avatar?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members: ChatRoomMember[];
  unreadCount?: number;
  lastMessage?: Message;
}

export interface ChatRoomMember {
  id: string;
  role: 'admin' | 'member';
  joinedAt: string;
  lastReadAt?: string;
  user: User;
}

export interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: User;
  chatRoomId: string;
}

export interface CreateRoomDto {
  name?: string;
  type: 'private' | 'group';
  description?: string;
  memberIds: string[];
}

export interface SendMessageDto {
  content: string;
  type?: 'text' | 'image' | 'file';
  chatRoomId: string;
  fileUrl?: string;
  fileName?: string;
}

export interface TypingDto {
  roomId: string;
  isTyping: boolean;
}