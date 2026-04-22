'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Home, 
  Users, 
  Building2, 
  MessageCircle, 
  LogOut,
  User,
  Crown
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

const navigation = [
  { name: 'Beranda',   href: '/dashboard',  icon: Home },
  { name: 'Direktori', href: '/directory',  icon: Users },
  { name: 'Komunitas', href: '/community',  icon: Building2 },
  { name: 'Pesan',     href: '/chat',       icon: MessageCircle },
  { name: 'Profil',    href: '/dashboard',  icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-72 flex flex-col z-50"
      style={{
        background: 'rgba(255, 255, 255, 0.07)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '4px 0 40px rgba(0, 0, 0, 0.70), inset -1px 0 0 rgba(255,255,255,0.06)',
      }}
    >

      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #8B0000 0%, #D4AF37 100%)',
              boxShadow: '0 0 20px rgba(139,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.20)',
            }}
          >
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-cinzel text-2xl font-bold text-white group-hover:text-gold transition-colors">
              Bataknese
            </h1>
            <p className="text-xs font-inter" style={{ color: 'rgba(255,255,255,0.40)' }}>
              Komunitas Eksklusif
            </p>
          </div>
        </Link>
      </div>

      {/* ── User Info ────────────────────────────────────────── */}
      {user && (
        <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div
            className="flex items-center space-x-3 p-3 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <div className="relative flex-shrink-0">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.full_name}
                  width={48}
                  height={48}
                  className="rounded-full"
                  style={{ border: '2px solid rgba(139,0,0,0.70)' }}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #8B0000, #5C0000)',
                    border: '2px solid rgba(139,0,0,0.70)',
                    boxShadow: '0 0 12px rgba(139,0,0,0.40)',
                  }}
                >
                  <span className="text-white font-cinzel font-semibold text-lg">
                    {user.full_name.charAt(0)}
                  </span>
                </div>
              )}
              {/* Online dot */}
              <div
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                style={{
                  background: '#22c55e',
                  border: '2px solid #000',
                  boxShadow: '0 0 6px rgba(34,197,94,0.60)',
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user.full_name}</p>
              <p className="text-sm truncate" style={{ color: '#D4AF37' }}>{user.marga}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {user.batak_id_card}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group"
              style={isActive ? {
                background: 'linear-gradient(135deg, #8B0000 0%, #6B0000 100%)',
                border: '1px solid rgba(185,28,28,0.50)',
                boxShadow: '0 4px 20px rgba(139,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.12)',
                color: '#ffffff',
              } : {
                background: 'transparent',
                border: '1px solid transparent',
                color: 'rgba(255,255,255,0.50)',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)';
                  (e.currentTarget as HTMLElement).style.color = '#ffffff';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.50)';
                }
              }}
            >
              <Icon
                className="w-5 h-5 flex-shrink-0 transition-colors"
                style={{ color: isActive ? '#ffffff' : undefined }}
              />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: '#D4AF37', boxShadow: '0 0 6px rgba(212,175,55,0.80)' }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Logout ───────────────────────────────────────────── */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group"
          style={{ color: 'rgba(255,255,255,0.40)', border: '1px solid transparent' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(139,0,0,0.20)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,0,0,0.35)';
            (e.currentTarget as HTMLElement).style.color = '#ffffff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.40)';
          }}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Keluar</span>
        </button>
      </div>

      {/* ── Ulos bottom stripe ───────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, #8B0000, #D4AF37, #8B0000)',
          opacity: 0.70,
        }}
      />
    </aside>
  );
}