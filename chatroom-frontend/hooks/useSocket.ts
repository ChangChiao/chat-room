import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, getSocket, disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/lib/auth-store';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      socketRef.current = initSocket(token);
      
      return () => {
        if (socketRef.current) {
          disconnectSocket();
          socketRef.current = null;
        }
      };
    }
  }, [isAuthenticated, token]);

  const emit = useCallback((event: string, data?: any) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit(event, data);
    }
  }, []);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    const socket = getSocket();
    if (socket) {
      socket.on(event, handler);
      
      return () => {
        socket.off(event, handler);
      };
    }
  }, []);

  const off = useCallback((event: string, handler?: (data: any) => void) => {
    const socket = getSocket();
    if (socket) {
      if (handler) {
        socket.off(event, handler);
      } else {
        socket.off(event);
      }
    }
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    emit('join-room', { roomId });
  }, [emit]);

  const leaveRoom = useCallback((roomId: string) => {
    emit('leave-room', { roomId });
  }, [emit]);

  const sendTyping = useCallback((roomId: string, isTyping: boolean) => {
    emit('typing', { roomId, isTyping });
  }, [emit]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
    sendTyping,
  };
};