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
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-gold flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl animate-pulse">
          <Crown className="w-14 h-14 text-gold" />
        </div>
        <h1 className="font-cinzel text-6xl font-bold text-white mb-4">Bataknese</h1>
        <p className="text-xl text-gold-light">Loading...</p>
      </div>
    </div>
  );
}
