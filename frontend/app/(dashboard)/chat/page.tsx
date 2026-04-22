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
      console.error('Gagal mengambil ruang obrolan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRoom = (room: DMRoom) => {
    setSelectedRoom(room);
    setShowSidebar(false);
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

      {/* ── Conversation Sidebar ───────────────────────────────────── */}
      <div className={`
        ${showSidebar ? 'flex' : 'hidden'} lg:flex
        w-full lg:w-96 flex-col
        sidebar border-r border-glass-3
      `}>

        {/* Header */}
        <div className="p-6 border-b border-glass-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-cinzel text-2xl font-bold text-white">Pesan</h2>
              <p className="text-sm text-white/40">
                {totalUnread > 0 ? `${totalUnread} belum dibaca` : 'Semua pesan telah dibaca'}
              </p>
            </div>

            {totalUnread > 0 && (
              <div className="glass-red w-8 h-8 rounded-full flex items-center justify-center shadow-glow-red-sm">
                <span className="text-white text-sm font-bold">{totalUnread}</span>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-primary pl-10"
              placeholder="Cari percakapan..."
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>

          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="glass-1 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-9 h-9 text-white/25" />
              </div>
              <h3 className="font-cinzel text-lg text-white mb-2">
                {searchQuery ? 'Hasil tidak ditemukan' : 'Belum ada percakapan'}
              </h3>
              <p className="text-white/35 text-sm">
                {searchQuery
                  ? 'Coba pencarian yang berbeda'
                  : 'Mulai percakapan melalui direktori anggota'}
              </p>
            </div>

          ) : (
            <div className="divide-y divide-white/[0.05]">
              {filteredRooms.map((room) => {
                const isActive = selectedRoom?.room_id === room.room_id;
                return (
                  <button
                    key={room.room_id}
                    onClick={() => handleSelectRoom(room)}
                    className={`
                      w-full p-4 text-left transition-all duration-200
                      ${isActive
                        ? 'bg-glass-red border-l-2 border-primary'
                        : 'hover:bg-white/[0.04] border-l-2 border-transparent'}
                    `}
                  >
                    <div className="flex items-start gap-3">

                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {room.avatar ? (
                          <Image
                            src={room.avatar}
                            alt={room.full_name}
                            width={48}
                            height={48}
                            className="rounded-full ring-1 ring-white/10"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center ring-1 ring-white/10">
                            <span className="text-white font-cinzel font-semibold text-lg">
                              {room.full_name.charAt(0)}
                            </span>
                          </div>
                        )}

                        {room.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 glass-red rounded-full flex items-center justify-center shadow-glow-red-sm">
                            <span className="text-white text-xs font-bold leading-none">
                              {room.unread_count}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <h4 className="font-semibold text-white truncate">{room.full_name}</h4>
                          {room.last_message_time && (
                            <span className="text-xs text-white/30 ml-2 flex-shrink-0">
                              {format(new Date(room.last_message_time), 'd MMM')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gold/80 mb-1 truncate">{room.marga}</p>
                        {room.last_message && (
                          <p className={`text-sm truncate ${
                            room.unread_count > 0
                              ? 'text-white font-medium'
                              : 'text-white/40'
                          }`}>
                            {room.last_message}
                          </p>
                        )}
                      </div>

                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Chat Window ────────────────────────────────────────────── */}
      <div className={`
        ${showSidebar ? 'hidden' : 'flex'} lg:flex
        flex-1 flex-col
        glass-inset
      `}>
        <DirectChat
          room={selectedRoom}
          onBack={() => setShowSidebar(true)}
        />
      </div>

    </div>
  );
}