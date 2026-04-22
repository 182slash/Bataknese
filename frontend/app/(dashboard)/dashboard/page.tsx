'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Building2, MessageCircle, Award, Crown } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import BatakIDCard from '@/components/id-card/BatakIDCard';
import { Community, DMRoom } from '@/lib/types';
import apiClient from '@/lib/api/client';
import Image from 'next/image';

const glass = {
  base: {
    background: 'rgba(255,255,255,0.055)',
    backdropFilter: 'blur(24px) saturate(150%)',
    WebkitBackdropFilter: 'blur(24px) saturate(150%)',
    border: '1px solid rgba(255,255,255,0.10)',
    boxShadow: '0 4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
  } as React.CSSProperties,
  heavy: {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(48px) saturate(180%)',
    WebkitBackdropFilter: 'blur(48px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.13)',
    boxShadow: '0 8px 48px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.10)',
  } as React.CSSProperties,
  row: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
  } as React.CSSProperties,
  rowHover: {
    background: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(139,0,0,0.50)',
  } as React.CSSProperties,
};

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
        const communitiesRes = await apiClient.get('/communities/my');
        if (communitiesRes.data.success) {
          setCommunities(communitiesRes.data.data.slice(0, 4));
        }

        const chatsRes = await apiClient.get('/chat/dm');
        if (chatsRes.data.success) {
          setRecentChats(chatsRes.data.data.slice(0, 5));
        }

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
    <div className="p-8 space-y-8" style={{ animation: 'fadeIn 0.4s ease' }}>

      {/* ── Welcome Header ─────────────────────────────────────── */}
      <div
        className="rounded-2xl p-8"
        style={{
          ...glass.heavy,
          background: 'rgba(139,0,0,0.10)',
          backdropFilter: 'blur(48px) saturate(180%)',
          WebkitBackdropFilter: 'blur(48px) saturate(180%)',
          border: '1px solid rgba(139,0,0,0.22)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.65), 0 0 32px rgba(139,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.10)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cinzel text-4xl font-bold text-white mb-2">
              Horas, {user.full_name}!
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: '1rem' }}>
              <span style={{ color: '#D4AF37' }}>{user.marga}</span>
              {' '}•{' '}
              {user.batak_id_card}
            </p>
          </div>
          <div className="hidden md:block">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139,0,0,0.80) 0%, rgba(212,175,55,0.70) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(212,175,55,0.30)',
                boxShadow: '0 0 32px rgba(139,0,0,0.55), 0 0 64px rgba(139,0,0,0.20)',
              }}
            >
              <Crown className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Anggota"
          value={stats.total_users.toLocaleString()}
          icon={<Users className="w-11 h-11" style={{ color: 'rgba(185,28,28,0.70)' }} />}
        />
        <StatCard
          label="Komunitas Saya"
          value={String(stats.my_communities)}
          icon={<Building2 className="w-11 h-11" style={{ color: 'rgba(212,175,55,0.70)' }} />}
          gold
        />
        <StatCard
          label="Pesan Belum Dibaca"
          value={String(stats.unread_messages)}
          icon={<MessageCircle className="w-11 h-11" style={{ color: 'rgba(185,28,28,0.70)' }} />}
        />
        <StatCard
          label="Anggota Sejak"
          value={new Date(user.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
          icon={<Award className="w-11 h-11" style={{ color: 'rgba(212,175,55,0.70)' }} />}
          gold
          small
        />
      </div>

      {/* ── Main Content Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left — Batak ID Card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl p-6" style={glass.base}>
            <h2 className="font-cinzel text-2xl font-bold text-white mb-6">ID Batak Anda</h2>
            <BatakIDCard user={user} />
          </div>
        </div>

        {/* Right — Communities & Chats */}
        <div className="lg:col-span-2 space-y-8">

          {/* My Communities */}
          <div className="rounded-2xl p-6" style={glass.base}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-cinzel text-2xl font-bold text-white">Komunitas Saya</h2>
              <Link
                href="/community"
                className="text-sm font-semibold transition-colors"
                style={{ color: 'rgba(185,28,28,0.90)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#ffffff')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(185,28,28,0.90)')}
              >
                Lihat Semua →
              </Link>
            </div>

            {communities.length === 0 ? (
              <EmptyState
                icon={<Building2 className="w-16 h-16" style={{ color: 'rgba(255,255,255,0.18)' }} />}
                message="Anda belum bergabung dengan komunitas apa pun"
                href="/community"
                cta="Jelajahi Komunitas"
              />
            ) : (
              <div className="space-y-3">
                {communities.map((community) => (
                  <GlassRow
                    key={community.id}
                    href={`/community/${community.id}`}
                    avatar={
                      community.avatar
                        ? <Image src={community.avatar} alt={community.name} width={48} height={48} className="rounded-lg object-cover w-12 h-12" />
                        : (
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, rgba(139,0,0,0.80), rgba(212,175,55,0.60))' }}
                          >
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                        )
                    }
                    title={community.name}
                    meta={
                      <div className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {community.member_count} anggota
                        </span>
                        {community.role && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: 'rgba(212,175,55,0.12)',
                              border: '1px solid rgba(212,175,55,0.25)',
                              color: '#E5C453',
                            }}
                          >
                            {community.role}
                          </span>
                        )}
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Chats */}
          <div className="rounded-2xl p-6" style={glass.base}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-cinzel text-2xl font-bold text-white">Pesan Terbaru</h2>
              <Link
                href="/chat"
                className="text-sm font-semibold transition-colors"
                style={{ color: 'rgba(185,28,28,0.90)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#ffffff')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(185,28,28,0.90)')}
              >
                Lihat Semua →
              </Link>
            </div>

            {recentChats.length === 0 ? (
              <EmptyState
                icon={<MessageCircle className="w-16 h-16" style={{ color: 'rgba(255,255,255,0.18)' }} />}
                message="Belum ada pesan"
                href="/directory"
                cta="Cari Anggota"
              />
            ) : (
              <div className="space-y-3">
                {recentChats.map((chat) => (
                  <GlassRow
                    key={chat.room_id}
                    href={`/chat?room=${chat.room_id}`}
                    avatar={
                      chat.avatar
                        ? <Image src={chat.avatar} alt={chat.full_name} width={40} height={40} className="rounded-full object-cover w-10 h-10" />
                        : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, rgba(139,0,0,0.80), rgba(212,175,55,0.60))' }}
                          >
                            <span className="text-white font-semibold text-sm">
                              {chat.full_name.charAt(0)}
                            </span>
                          </div>
                        )
                    }
                    title={chat.full_name}
                    meta={
                      <p className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>
                        {chat.last_message || 'Belum ada pesan'}
                      </p>
                    }
                    trailing={
                      chat.unread_count > 0 ? (
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{
                            background: 'rgba(185,28,28,0.85)',
                            boxShadow: '0 0 10px rgba(139,0,0,0.50)',
                          }}
                        >
                          {chat.unread_count}
                        </span>
                      ) : undefined
                    }
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Stat Card ─────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon,
  gold = false,
  small = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  gold?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center justify-between transition-all duration-300"
      style={{
        background: gold ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.055)',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        border: `1px solid ${gold ? 'rgba(212,175,55,0.16)' : 'rgba(255,255,255,0.10)'}`,
        boxShadow: '0 4px 32px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(-3px)';
        el.style.boxShadow = gold
          ? '0 8px 40px rgba(0,0,0,0.60), 0 0 20px rgba(212,175,55,0.18), inset 0 1px 0 rgba(255,255,255,0.10)'
          : '0 8px 40px rgba(0,0,0,0.60), 0 0 18px rgba(139,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.10)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = '0 4px 32px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)';
      }}
    >
      <div>
        <p className="text-xs mb-1 font-medium tracking-wide" style={{ color: 'rgba(255,255,255,0.42)' }}>
          {label}
        </p>
        <p
          className={`font-bold text-white font-cinzel ${small ? 'text-xl' : 'text-3xl'}`}
        >
          {value}
        </p>
      </div>
      {icon}
    </div>
  );
}

/* ── Glass Row (community / chat item) ─────────────────────────── */
function GlassRow({
  href,
  avatar,
  title,
  meta,
  trailing,
}: {
  href: string;
  avatar: React.ReactNode;
  title: string;
  meta: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'rgba(255,255,255,0.08)';
        el.style.borderColor = 'rgba(139,0,0,0.45)';
        el.style.boxShadow = '0 0 16px rgba(139,0,0,0.12)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'rgba(255,255,255,0.04)';
        el.style.borderColor = 'rgba(255,255,255,0.08)';
        el.style.boxShadow = 'none';
      }}
    >
      <div className="flex-shrink-0">{avatar}</div>
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-white truncate mb-0.5 transition-colors duration-150 group-hover:text-red-300"
        >
          {title}
        </p>
        {meta}
      </div>
      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </Link>
  );
}

/* ── Empty State ───────────────────────────────────────────────── */
function EmptyState({
  icon,
  message,
  href,
  cta,
}: {
  icon: React.ReactNode;
  message: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="text-center py-10">
      <div className="flex justify-center mb-4">{icon}</div>
      <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{message}</p>
      <Link
        href={href}
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, rgba(185,28,28,0.75) 0%, rgba(139,0,0,0.70) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(185,28,28,0.38)',
          boxShadow: '0 2px 16px rgba(139,0,0,0.28)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(139,0,0,0.50)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(139,0,0,0.28)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }}
      >
        {cta}
      </Link>
    </div>
  );
}