'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { MessageCircle, Search, Loader2 } from 'lucide-react';
import DirectChat from '@/components/chat/DirectChat';
import { DMRoom } from '@/lib/types';
import apiClient from '@/lib/api/client';
import { format } from 'date-fns';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const roomIdParam = searchParams.get('room');

  const [rooms, setRooms] = useState<DMRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<DMRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (roomIdParam && rooms.length > 0) {
      const room = rooms.find(r => r.room_id === roomIdParam);
      if (room) {
        setSelectedRoom(room);
        setShowSidebar(false);
      }
    }
  }, [roomIdParam, rooms]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/chat/dm');
      if (response.data.success) {
        setRooms(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRoom = (room: DMRoom) => {
    setSelectedRoom(room);
    setShowSidebar(false);

    // Update unread count locally
    setRooms(rooms.map(r => 
      r.room_id === room.room_id ? { ...r, unread_count: 0 } : r
    ));
  };

  const filteredRooms = rooms.filter(room =>
    room.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.marga.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = rooms.reduce((sum, room) => sum + room.unread_count, 0);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Conversation Sidebar */}
      <div className={`${showSidebar ? 'block' : 'hidden'} lg:block w-full lg:w-96 bg-dark-card border-r border-gray-800 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-cinzel text-2xl font-bold text-white">Messages</h2>
              <p className="text-sm text-gray-400">
                {totalUnread > 0 ? `${totalUnread} unread` : 'All caught up'}
              </p>
            </div>
            {totalUnread > 0 && (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{totalUnread}</span>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-primary pl-12"
              placeholder="Search conversations..."
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <MessageCircle className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="font-cinzel text-lg text-white mb-2">
                {searchQuery ? 'No results found' : 'No conversations yet'}
              </h3>
              <p className="text-gray-400 text-sm">
                {searchQuery ? 'Try a different search' : 'Start a conversation from the directory'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredRooms.map((room) => (
                <button
                  key={room.room_id}
                  onClick={() => handleSelectRoom(room)}
                  className={`w-full p-4 text-left hover:bg-dark-lighter transition-colors ${
                    selectedRoom?.room_id === room.room_id ? 'bg-dark-lighter' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {room.avatar ? (
                        <Image
                          src={room.avatar}
                          alt={room.full_name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center">
                          <span className="text-white font-cinzel font-semibold text-lg">
                            {room.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {room.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{room.unread_count}</span>
                        </div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <h4 className="font-semibold text-white truncate">{room.full_name}</h4>
                        {room.last_message_time && (
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {format(new Date(room.last_message_time), 'MMM d')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gold mb-1 truncate">{room.marga}</p>
                      {room.last_message && (
                        <p className={`text-sm truncate ${
                          room.unread_count > 0 ? 'text-white font-medium' : 'text-gray-400'
                        }`}>
                          {room.last_message}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`${showSidebar ? 'hidden' : 'block'} lg:block flex-1 bg-dark`}>
        <DirectChat 
          room={selectedRoom} 
          onBack={() => setShowSidebar(true)}
        />
      </div>
    </div>
  );
}
