'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Building2, MessageCircle, TrendingUp, Award, Crown } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import BatakIDCard from '@/components/id-card/BatakIDCard';
import { Community, DMRoom } from '@/lib/types';
import apiClient from '@/lib/api/client';
import Image from 'next/image';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [recentChats, setRecentChats] = useState<DMRoom[]>([]);
  const [stats, setStats] = useState({
    total_users: 0,
    total_communities: 0,
    my_communities: 0,
    unread_messages: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil komunitas saya
        const communitiesRes = await apiClient.get('/communities/my');
        if (communitiesRes.data.success) {
          setCommunities(communitiesRes.data.data.slice(0, 4));
        }

        // Ambil chat terbaru
        const chatsRes = await apiClient.get('/chat/dm');
        if (chatsRes.data.success) {
          setRecentChats(chatsRes.data.data.slice(0, 5));
        }

        // Ambil statistik pengguna
        const statsRes = await apiClient.get('/users/stats');
        if (statsRes.data.success) {
          setStats({
            total_users: statsRes.data.data.overview.total_users,
            total_communities: 0,
            my_communities: communitiesRes.data.success ? communitiesRes.data.data.length : 0,
            unread_messages: chatsRes.data.success 
              ? chatsRes.data.data.reduce((sum: number, chat: DMRoom) => sum + chat.unread_count, 0)
              : 0,
          });
        }
      } catch (error) {
        console.error('Gagal mengambil data dashboard:', error);
      }
    };

    fetchData();
  }, []);

  if (!user) return null;

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="ulos-border-card">
        <div className="ulos-border-card-inner p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cinzel text-4xl font-bold text-white mb-2">
                Horas, {user.full_name}!
              </h1>
              <p className="text-gray-400 text-lg">
                <span className="text-gold">{user.marga}</span> • {user.batak_id_card}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-gold rounded-full flex items-center justify-center shadow-gold">
                < Crown className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Anggota</p>
              <p className="text-3xl font-bold text-white font-cinzel">{stats.total_users.toLocaleString()}</p>
            </div>
            <Users className="w-12 h-12 text-primary opacity-50" />
          </div>
        </div>

        <div className="card hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Komunitas Saya</p>
              <p className="text-3xl font-bold text-white font-cinzel">{stats.my_communities}</p>
            </div>
            <Building2 className="w-12 h-12 text-gold opacity-50" />
          </div>
        </div>

        <div className="card hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Pesan Belum Dibaca</p>
              <p className="text-3xl font-bold text-white font-cinzel">{stats.unread_messages}</p>
            </div>
            <MessageCircle className="w-12 h-12 text-primary opacity-50" />
          </div>
        </div>

        <div className="card hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Anggota Sejak</p>
              <p className="text-xl font-bold text-white">
                {new Date(user.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
              </p>
            </div>
            <Award className="w-12 h-12 text-gold opacity-50" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Batak ID Card */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="font-cinzel text-2xl font-bold text-white mb-6">ID Batak Anda</h2>
            <BatakIDCard user={user} />
          </div>
        </div>

        {/* Right Column - Communities & Chats */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Communities */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-cinzel text-2xl font-bold text-white">Komunitas Saya</h2>
              <Link href="/community" className="text-primary hover:text-primary-light transition-colors text-sm font-semibold">
                Lihat Semua →
              </Link>
            </div>

            {communities.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Anda belum bergabung dengan komunitas apa pun</p>
                <Link href="/community" className="btn-primary">
                  Jelajahi Komunitas
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {communities.map((community) => (
                  <Link
                    key={community.id}
                    href={`/community/${community.id}`}
                    className="block p-4 bg-dark-lighter rounded-lg border border-gray-800 hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      {community.avatar ? (
                        <Image
                          src={community.avatar}
                          alt={community.name}
                          width={48}
                          height={48}
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-gold rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                          {community.name}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {community.member_count} anggota
                          </span>
                          {community.role && (
                            <span className="badge badge-gold text-xs">
                              {community.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Chats */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-cinzel text-2xl font-bold text-white">Pesan Terbaru</h2>
              <Link href="/chat" className="text-primary hover:text-primary-light transition-colors text-sm font-semibold">
                Lihat Semua →
              </Link>
            </div>

            {recentChats.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Belum ada pesan</p>
                <Link href="/directory" className="btn-primary">
                  Cari Anggota
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentChats.map((chat) => (
                  <Link
                    key={chat.room_id}
                    href={`/chat?room=${chat.room_id}`}
                    className="block p-3 bg-dark-lighter rounded-lg border border-gray-800 hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      {chat.avatar ? (
                        <Image
                          src={chat.avatar}
                          alt={chat.full_name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-gold rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {chat.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-white truncate group-hover:text-primary transition-colors">
                            {chat.full_name}
                          </p>
                          {chat.unread_count > 0 && (
                            <span className="ml-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {chat.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 truncate">{chat.last_message || 'Belum ada pesan'}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}