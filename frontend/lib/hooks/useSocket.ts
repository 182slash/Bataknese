import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/store/authStore';
import { ChatMessage } from '@/lib/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('✓ Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('✗ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const joinRoom = useCallback((roomId: string) => {
    if (socket && isConnected) {
      socket.emit('room:join', { roomId });
    }
  }, [socket, isConnected]);

  const leaveRoom = useCallback((roomId: string) => {
    if (socket && isConnected) {
      socket.emit('room:leave', { roomId });
    }
  }, [socket, isConnected]);

  const sendMessage = useCallback((roomId: string, content: string, messageType: string = 'text') => {
    if (socket && isConnected) {
      socket.emit('message:send', { roomId, content, messageType });
    }
  }, [socket, isConnected]);

  const startTyping = useCallback((roomId: string) => {
    if (socket && isConnected) {
      socket.emit('typing:start', { roomId });
    }
  }, [socket, isConnected]);

  const stopTyping = useCallback((roomId: string) => {
    if (socket && isConnected) {
      socket.emit('typing:stop', { roomId });
    }
  }, [socket, isConnected]);

  const markMessagesAsRead = useCallback((roomId: string) => {
    if (socket && isConnected) {
      socket.emit('message:mark_read', { roomId });
    }
  }, [socket, isConnected]);

  const joinCommunityChat = useCallback((communityId: string) => {
    if (socket && isConnected) {
      socket.emit('community:join_chat', { communityId });
    }
  }, [socket, isConnected]);

  const onMessage = useCallback((callback: (message: ChatMessage) => void) => {
    if (socket) {
      socket.on('message:received', callback);
      return () => {
        socket.off('message:received', callback);
      };
    }
  }, [socket]);

  const onTyping = useCallback((callback: (data: any) => void) => {
    if (socket) {
      socket.on('typing:user', callback);
      return () => {
        socket.off('typing:user', callback);
      };
    }
  }, [socket]);

  const onUserOnline = useCallback((callback: (data: any) => void) => {
    if (socket) {
      socket.on('user:online', callback);
      return () => {
        socket.off('user:online', callback);
      };
    }
  }, [socket]);

  const onUserOffline = useCallback((callback: (data: any) => void) => {
    if (socket) {
      socket.on('user:offline', callback);
      return () => {
        socket.off('user:offline', callback);
      };
    }
  }, [socket]);

  return {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    joinCommunityChat,
    onMessage,
    onTyping,
    onUserOnline,
    onUserOffline,
  };
};
