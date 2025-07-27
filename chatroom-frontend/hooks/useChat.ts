import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSocket } from './useSocket';
import { chatApi } from '@/lib/api';
import { Message, ChatRoom, SendMessageDto, User } from '@/types';
import { useAuthStore } from '@/lib/auth-store';

interface UseChatOptions {
  roomId?: string;
}

interface TypingUser {
  userId: string;
  user: User;
}

export const useChat = ({ roomId }: UseChatOptions = {}) => {
  const queryClient = useQueryClient();
  const { on, off, emit, joinRoom, leaveRoom, sendTyping } = useSocket();
  const { user } = useAuthStore();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch chat rooms
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['chatRooms'],
    queryFn: () => chatApi.getRooms(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch current room details
  const { data: currentRoom, isLoading: roomLoading } = useQuery({
    queryKey: ['chatRoom', roomId],
    queryFn: () => chatApi.getRoom(roomId!),
    enabled: !!roomId,
  });

  // Fetch messages for current room
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => chatApi.getMessages(roomId!),
    enabled: !!roomId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: Omit<SendMessageDto, 'chatRoomId'>) => 
      chatApi.sendMessage({ ...data, chatRoomId: roomId! }),
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['messages', roomId], (oldMessages: Message[] = []) => 
        [...oldMessages, newMessage]
      );
      emit('send-message', newMessage);
    },
  });

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: chatApi.createRoom,
    onSuccess: (newRoom) => {
      queryClient.setQueryData(['chatRooms'], (oldRooms: ChatRoom[] = []) => 
        [...oldRooms, newRoom]
      );
    },
  });

  // Mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) => chatApi.markAsRead(roomId!, messageId),
  });

  // Handle incoming messages
  useEffect(() => {
    if (!roomId) return;

    const handleNewMessage = (message: Message) => {
      if (message.chatRoomId === roomId) {
        queryClient.setQueryData(['messages', roomId], (oldMessages: Message[] = []) => {
          const exists = oldMessages.some(msg => msg.id === message.id);
          if (exists) return oldMessages;
          return [...oldMessages, message];
        });
      }

      // Update room's last message
      queryClient.setQueryData(['chatRooms'], (oldRooms: ChatRoom[] = []) => 
        oldRooms.map(room => 
          room.id === message.chatRoomId 
            ? { ...room, lastMessage: message, unreadCount: (room.unreadCount || 0) + 1 }
            : room
        )
      );
    };

    const handleMessageUpdate = (message: Message) => {
      queryClient.setQueryData(['messages', roomId], (oldMessages: Message[] = []) => 
        oldMessages.map(msg => msg.id === message.id ? message : msg)
      );
    };

    const handleTyping = ({ userId, user: typingUser, roomId: typingRoomId, isTyping }: any) => {
      if (typingRoomId !== roomId || userId === user?.id) return;

      setTypingUsers(prev => {
        if (isTyping) {
          const exists = prev.some(u => u.userId === userId);
          if (!exists) {
            return [...prev, { userId, user: typingUser }];
          }
          return prev;
        } else {
          return prev.filter(u => u.userId !== userId);
        }
      });
    };

    const handleUserJoined = ({ roomId: joinedRoomId, user: joinedUser }: any) => {
      if (joinedRoomId === roomId) {
        queryClient.invalidateQueries({ queryKey: ['chatRoom', roomId] });
      }
    };

    const handleUserLeft = ({ roomId: leftRoomId, userId }: any) => {
      if (leftRoomId === roomId) {
        queryClient.invalidateQueries({ queryKey: ['chatRoom', roomId] });
        setTypingUsers(prev => prev.filter(u => u.userId !== userId));
      }
    };

    on('new-message', handleNewMessage);
    on('message-updated', handleMessageUpdate);
    on('user-typing', handleTyping);
    on('user-joined', handleUserJoined);
    on('user-left', handleUserLeft);

    joinRoom(roomId);

    return () => {
      off('new-message', handleNewMessage);
      off('message-updated', handleMessageUpdate);
      off('user-typing', handleTyping);
      off('user-joined', handleUserJoined);
      off('user-left', handleUserLeft);
      leaveRoom(roomId);
    };
  }, [roomId, on, off, joinRoom, leaveRoom, queryClient, user?.id]);

  // Send typing status
  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!roomId) return;
    
    sendTyping(roomId, isTyping);
    
    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(roomId, false);
      }, 3000);
    } else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, [roomId, sendTyping]);

  return {
    // Data
    rooms,
    currentRoom,
    messages,
    typingUsers,
    
    // Loading states
    roomsLoading,
    roomLoading,
    messagesLoading,
    
    // Actions
    sendMessage: sendMessageMutation.mutate,
    createRoom: createRoomMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    sendTypingStatus,
    
    // Mutation states
    isSendingMessage: sendMessageMutation.isPending,
    isCreatingRoom: createRoomMutation.isPending,
  };
};