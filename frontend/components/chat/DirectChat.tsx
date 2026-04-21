'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import { useSocket } from '@/lib/hooks/useSocket';
import { useAuthStore } from '@/lib/store/authStore';
import { ChatMessage, DMRoom } from '@/lib/types';
import { format } from 'date-fns';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

interface DirectChatProps {
  room: DMRoom | null;
  onBack: () => void;
}

export default function DirectChat({ room, onBack }: DirectChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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
    onTyping,
    markMessagesAsRead
  } = useSocket();

  // Fetch messages when room changes
  useEffect(() => {
    if (!room) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/chat/rooms/${room.room_id}/messages?limit=100`);
        if (response.data.success) {
          setMessages(response.data.data.messages);
          markMessagesAsRead(room.room_id);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [room]);

  // Join room and listen for messages
  useEffect(() => {
    if (!room || !isConnected) return;

    joinRoom(room.room_id);

    const unsubscribeMessage = onMessage?.((message: ChatMessage) => {
      if (message.room_id === room.room_id) {
        setMessages((prev) => [...prev, message]);
        markMessagesAsRead(room.room_id);
      }
    });

    const unsubscribeTyping = onTyping?.((data: any) => {
      if (data.roomId === room.room_id && data.userId !== user?.id) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      leaveRoom(room.room_id);
      unsubscribeMessage?.();
      unsubscribeTyping?.();
    };
  }, [room, isConnected, user, joinRoom, leaveRoom, onMessage, onTyping, markMessagesAsRead]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = () => {
    if (!isConnected || !room) return;

    startTyping(room.room_id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(room.room_id);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || !room) return;

    setIsSending(true);
    try {
      if (isConnected) {
        sendMessage(room.room_id, newMessage.trim());
        setNewMessage('');
        stopTyping(room.room_id);
      } else {
        await apiClient.post(`/chat/rooms/${room.room_id}/messages`, {
          content: newMessage.trim(),
          message_type: 'text',
        });
        setNewMessage('');
        
        const response = await apiClient.get(`/chat/rooms/${room.room_id}/messages?limit=100`);
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

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-20 h-20 bg-dark-lighter rounded-full flex items-center justify-center mb-4">
          <Send className="w-10 h-10 text-gray-600" />
        </div>
        <h3 className="font-cinzel text-xl text-white mb-2">No conversation selected</h3>
        <p className="text-gray-400">Select a conversation from the sidebar to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-dark-card">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {room.avatar ? (
            <Image
              src={room.avatar}
              alt={room.full_name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-white font-cinzel font-semibold">
                {room.full_name.charAt(0)}
              </span>
            </div>
          )}

          <div className="flex-1">
            <h3 className="font-semibold text-white">{room.full_name}</h3>
            <p className="text-sm text-gold">{room.marga}</p>
          </div>

          {isTyping && (
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span>typing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === user?.id;

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[70%]`}>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-dark-lighter text-white border border-gray-700 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>

                  <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    {format(new Date(message.created_at), 'MMM d, HH:mm')}
                  </p>
                </div>
              </div>
            );
          })
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
              placeholder={`Message ${room.full_name}...`}
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
