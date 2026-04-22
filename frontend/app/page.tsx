'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Crown } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router, initAuth]);

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#000000' }}
    >
      {/* Ambient blobs */}
      <div className="absolute pointer-events-none" style={{
        top: '-80px', left: '-80px', width: '600px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(139,0,0,0.32) 0%, transparent 68%)',
        filter: 'blur(80px)',
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: '-60px', right: '-60px', width: '500px', height: '450px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(92,0,0,0.28) 0%, transparent 65%)',
        filter: 'blur(90px)',
      }} />
      <div className="absolute pointer-events-none" style={{
        top: '40%', right: '25%', width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 65%)',
        filter: 'blur(60px)',
      }} />

      {/* Ulos diagonal weave */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          repeating-linear-gradient(45deg,  rgba(139,0,0,1)    0px, rgba(139,0,0,1)    1px, transparent 1px, transparent 20px),
          repeating-linear-gradient(-45deg, rgba(212,175,55,1)  0px, rgba(212,175,55,1)  1px, transparent 1px, transparent 20px)
        `,
        opacity: 0.04,
      }} />

      {/* Card */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-12 py-14 rounded-3xl"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(48px) saturate(180%)',
          WebkitBackdropFilter: 'blur(48px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.75), 0 0 48px rgba(139,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      >
        {/* Crown icon */}
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center mb-7"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px) saturate(150%)',
            WebkitBackdropFilter: 'blur(24px) saturate(150%)',
            border: '1px solid rgba(255,255,255,0.16)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.55), 0 0 28px rgba(139,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.18)',
            animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
          }}
        >
          <Crown style={{ color: '#D4AF37', width: 52, height: 52 }} />
        </div>

        <h1 className="font-cinzel text-6xl font-bold text-white mb-3 tracking-wide">
          Bataknese
        </h1>

        <p className="font-cinzel text-lg mb-8" style={{ color: '#E5C453' }}>
          Platform Komunitas Eksklusif
        </p>

        {/* Spinner row */}
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded-full border-2 border-t-transparent"
            style={{
              borderColor: 'rgba(212,175,55,0.30)',
              borderTopColor: 'rgba(212,175,55,0.85)',
              animation: 'spin 0.9s linear infinite',
            }}
          />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Memuat...
          </span>
        </div>
      </div>
    </div>
  );
}