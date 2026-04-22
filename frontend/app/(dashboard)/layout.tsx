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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-dark">
      {/* Ambient background layers — fixed so they don't scroll */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #8B0000 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, #5C0000 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <Sidebar />

      <main className="flex-1 ml-72 relative z-10 min-h-screen">
        {children}
      </main>
    </div>
  );
}