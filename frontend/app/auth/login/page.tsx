'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Crown, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(formData.email, formData.password);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left — Branding panel ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1a0000 0%, #3d0000 40%, #8B0000 75%, #6b3a00 100%)',
        }}
      >
        {/* Ulos pattern overlay */}
        <div className="absolute inset-0 ulos-pattern opacity-20 pointer-events-none" />

        {/* Ambient glow blobs */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.40) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />

        {/* Glass overlay on left panel */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(2px)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 text-white w-full">
          <div className="mb-8">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 mx-auto"
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.22)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.20)',
              }}
            >
              <Crown className="w-14 h-14" style={{ color: '#D4AF37' }} />
            </div>
            <h1 className="font-cinzel text-6xl font-bold mb-4 text-white">Bataknese</h1>
            <p className="text-2xl font-cinzel" style={{ color: '#E5C453' }}>Platform Komunitas Eksklusif</p>
          </div>

          <div className="max-w-md space-y-6">
            <p className="text-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.80)' }}>
              Terhubung dengan sesama orang Batak dari seluruh dunia. Bagikan warisan budaya Anda, bangun hubungan yang langgeng, dan rayakan identitas budaya kita yang kaya.
            </p>

            <div className="flex items-center justify-center space-x-8 pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold font-cinzel text-white">10rb+</p>
                <p className="text-sm" style={{ color: '#E5C453' }}>Anggota</p>
              </div>
              <div className="w-px h-12" style={{ background: 'rgba(255,255,255,0.25)' }} />
              <div className="text-center">
                <p className="text-4xl font-bold font-cinzel text-white">60+</p>
                <p className="text-sm" style={{ color: '#E5C453' }}>Marga</p>
              </div>
              <div className="w-px h-12" style={{ background: 'rgba(255,255,255,0.25)' }} />
              <div className="text-center">
                <p className="text-4xl font-bold font-cinzel text-white">100+</p>
                <p className="text-sm" style={{ color: '#E5C453' }}>Komunitas</p>
              </div>
            </div>
          </div>

          {/* Decorative corners */}
          <div
            className="absolute top-8 left-8 w-32 h-32 rounded-lg rotate-12"
            style={{ border: '3px solid rgba(255,255,255,0.12)' }}
          />
          <div
            className="absolute bottom-8 right-8 w-24 h-24 rounded-full"
            style={{ border: '3px solid rgba(212,175,55,0.25)' }}
          />
        </div>
      </div>

      {/* ── Right — Login form ────────────────────────────────── */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden"
        style={{ background: '#000000' }}
      >
        {/* Ambient glow behind form */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />

        <div className="w-full max-w-md relative z-10">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'linear-gradient(135deg, #8B0000, #D4AF37)',
                boxShadow: '0 0 24px rgba(139,0,0,0.50)',
              }}
            >
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-cinzel text-3xl font-bold text-white">Bataknese</h1>
            <p style={{ color: 'rgba(255,255,255,0.40)' }}>Komunitas Eksklusif</p>
          </div>

          {/* Form card */}
          <div className="ulos-border-card mb-8">
            <div
              className="ulos-border-card-inner p-8 relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(32px) saturate(160%)',
                WebkitBackdropFilter: 'blur(32px) saturate(160%)',
              }}
            >
              {/* Subtle top-left red glow inside card */}
              <div
                className="absolute -top-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.20) 0%, transparent 70%)', filter: 'blur(20px)' }}
              />

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="font-cinzel text-3xl font-bold text-white mb-2">Selamat Datang Kembali</h2>
                  <p style={{ color: 'rgba(255,255,255,0.45)' }}>Masuk ke akun Anda</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.70)' }}>
                      Alamat Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.35)' }} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-primary pl-12"
                        placeholder="email.anda@contoh.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.70)' }}>
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.35)' }} />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input-primary pl-12"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  {/* Remember + forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded"
                        style={{ accentColor: '#8B0000' }}
                      />
                      <span className="ml-2 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Ingat saya</span>
                    </label>
                    <Link
                      href="#"
                      className="text-sm transition-colors"
                      style={{ color: '#B91C1C' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#B91C1C')}
                    >
                      Lupa kata sandi?
                    </Link>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full !py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Masuk...
                      </>
                    ) : (
                      'Masuk'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Register link */}
          <div className="text-center">
            <p style={{ color: 'rgba(255,255,255,0.45)' }}>
              Belum punya akun?{' '}
              <Link
                href="/auth/register"
                className="font-semibold transition-colors"
                style={{ color: '#D4AF37' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E5C453')}
                onMouseLeave={e => (e.currentTarget.style.color = '#D4AF37')}
              >
                Daftar Sekarang
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
            <p>© 2024 Bataknese. Hak cipta dilindungi undang-undang.</p>
            <p className="mt-2">Merayakan warisan dan persatuan Batak</p>
          </div>
        </div>
      </div>
    </div>
  );
}