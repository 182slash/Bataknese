'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/lib/store/authStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router, initAuth]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen" style={{ background: '#000000' }}>

      {/* ── Ambient background — fixed, never scrolls ─────────── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        {/* Top-left crimson bloom */}
        <div
          className="absolute"
          style={{
            top: '-80px',
            left: '-80px',
            width: '700px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(139,0,0,0.32) 0%, transparent 68%)',
            filter: 'blur(72px)',
          }}
        />
        {/* Bottom-right deep-red bloom */}
        <div
          className="absolute"
          style={{
            bottom: '-60px',
            right: '-60px',
            width: '600px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(92,0,0,0.28) 0%, transparent 65%)',
            filter: 'blur(90px)',
          }}
        />
        {/* Centre vignette — keeps the glass surfaces readable */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(8,0,0,0.55) 0%, transparent 75%)',
          }}
        />
        {/* Subtle mid-screen gold glimmer */}
        <div
          className="absolute"
          style={{
            top: '30%',
            right: '20%',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(212,175,55,0.05) 0%, transparent 65%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Ulos-inspired diagonal noise overlay — very faint */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg,  rgba(139,0,0,1)   0px, rgba(139,0,0,1)   1px, transparent 1px, transparent 18px),
              repeating-linear-gradient(-45deg, rgba(212,175,55,1) 0px, rgba(212,175,55,1) 1px, transparent 1px, transparent 18px)
            `,
          }}
        />
      </div>

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Page content ──────────────────────────────────────── */}
      <main className="flex-1 ml-72 relative z-10 min-h-screen">
        {children}
      </main>
    </div>
  );
}