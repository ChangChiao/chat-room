import api from '@/lib/axios';
import { ChatRoom, CreateRoomDto, Message, SendMessageDto } from '@/types';

export const chatApi = {
  getRooms: () => 
    api.get<ChatRoom[]>('/chat/rooms'),
  
  getRoom: (roomId: string) => 
    api.get<ChatRoom>(`/chat/rooms/${roomId}`),
  
  createRoom: (data: CreateRoomDto) => 
    api.post<ChatRoom>('/chat/rooms', data),
  
  deleteRoom: (roomId: string) => 
    api.delete(`/chat/rooms/${roomId}`),
  
  joinRoom: (roomId: string) => 
    api.post(`/chat/rooms/${roomId}/join`),
  
  leaveRoom: (roomId: string) => 
    api.post(`/chat/rooms/${roomId}/leave`),
  
  getMessages: (roomId: string, limit = 50, offset = 0) => 
    api.get<Message[]>(`/chat/rooms/${roomId}/messages`, {
      params: { limit, offset }
    }),
  
  sendMessage: (data: SendMessageDto) => 
    api.post<Message>('/chat/messages', data),
  
  markAsRead: (roomId: string, messageId: string) => 
    api.post(`/chat/rooms/${roomId}/read`, { messageId }),
};