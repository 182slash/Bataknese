'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Image as ImageIcon } from 'lucide-react';
import { useSocket } from '@/lib/hooks/useSocket';
import { useAuthStore } from '@/lib/store/authStore';
import { ChatMessage } from '@/lib/types';
import { format } from 'date-fns';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

interface ChatRoomProps {
  roomId: string;
  communityName: string;
}

export default function ChatRoom({ roomId, communityName }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { user } = useAuthStore();
  const { 
    isConnected, 
    joinRoom, 
    leaveRoom, 
    sendMessage, 
    startTyping, 
    stopTyping,
    onMessage,
    onTyping 
  } = useSocket();

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await apiClient.get(`/chat/rooms/${roomId}/messages?limit=50`);
        if (response.data.success) {
          setMessages(response.data.data.messages);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [roomId]);

  // Join room and listen for messages
  useEffect(() => {
    if (isConnected && roomId) {
      joinRoom(roomId);

      const unsubscribeMessage = onMessage?.((message: ChatMessage) => {
        if (message.room_id === roomId) {
          setMessages((prev) => [...prev, message]);
        }
      });

      const unsubscribeTyping = onTyping?.((data: any) => {
        if (data.roomId === roomId && data.userId !== user?.id) {
          if (data.isTyping) {
            setTypingUsers((prev) =>
              prev.includes(data.full_name) ? prev : [...prev, data.full_name]
            );
          } else {
            setTypingUsers((prev) => prev.filter((name) => name !== data.full_name));
          }
        }
      });

      return () => {
        leaveRoom(roomId);
        unsubscribeMessage?.();
        unsubscribeTyping?.();
      };
    }
  }, [isConnected, roomId, user, joinRoom, leaveRoom, onMessage, onTyping]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = () => {
    if (!isConnected) return;

    startTyping(roomId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(roomId);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      if (isConnected) {
        sendMessage(roomId, newMessage.trim());
        setNewMessage('');
        stopTyping(roomId);
      } else {
        // Fallback to REST API
        await apiClient.post(`/chat/rooms/${roomId}/messages`, {
          content: newMessage.trim(),
          message_type: 'text',
        });
        setNewMessage('');
        
        // Refresh messages
        const response = await apiClient.get(`/chat/rooms/${roomId}/messages?limit=50`);
        if (response.data.success) {
          setMessages(response.data.data.messages);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-dark-card">
        <h3 className="font-cinzel text-lg font-semibold text-white">{communityName}</h3>
        <p className="text-sm text-gray-400">
          {isConnected ? (
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Connected
            </span>
          ) : (
            <span className="text-yellow-500">Reconnecting...</span>
          )}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === user?.id;

          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {!isOwnMessage && (
                  <p className="text-xs text-gray-400 mb-1">
                    <span className="text-gold">{message.sender_name}</span>
                    {' • '}
                    {message.sender_marga}
                  </p>
                )}
                
                <div
                  className={`rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-primary text-white'
                      : 'bg-dark-lighter text-white border border-gray-700'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(message.created_at), 'HH:mm')}
                </p>
              </div>
            </div>
          );
        })}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-gray-400 text-sm animate-pulse">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800 bg-dark-card">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="input-primary resize-none h-12 max-h-32"
              rows={1}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="btn-primary !py-3 !px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
