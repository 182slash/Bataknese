'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Crown, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(formData.email, formData.password);
    if (success) router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left — Branding panel ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d0000 0%, #2a0000 35%, #6b0000 70%, #4a2800 100%)' }}
      >
        {/* Ulos diagonal weave */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg,  rgba(139,0,0,1)    0px, rgba(139,0,0,1)    1px, transparent 1px, transparent 20px),
              repeating-linear-gradient(-45deg, rgba(212,175,55,1)  0px, rgba(212,175,55,1)  1px, transparent 1px, transparent 20px)
            `,
            opacity: 0.06,
          }}
        />

        {/* Ambient blobs */}
        <div className="absolute pointer-events-none" style={{
          top: '-60px', right: '-60px', width: '480px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 68%)',
          filter: 'blur(70px)',
        }} />
        <div className="absolute pointer-events-none" style={{
          bottom: '-80px', left: '-80px', width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,0,0,0.45) 0%, transparent 68%)',
          filter: 'blur(90px)',
        }} />
        <div className="absolute pointer-events-none" style={{
          top: '40%', left: '30%', width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} />

        {/* Frosted glass sheen */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }} />

        {/* Decorative corner frames */}
        <div className="absolute top-8 left-8 w-28 h-28 rounded-xl rotate-12 pointer-events-none"
          style={{ border: '2px solid rgba(255,255,255,0.10)' }} />
        <div className="absolute bottom-8 right-8 w-20 h-20 rounded-full pointer-events-none"
          style={{ border: '2px solid rgba(212,175,55,0.22)' }} />
        <div className="absolute bottom-20 left-10 w-14 h-14 rounded-lg -rotate-6 pointer-events-none"
          style={{ border: '2px solid rgba(139,0,0,0.35)' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-14 text-white w-full">
          {/* Logo mark */}
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: 'rgba(255,255,255,0.09)',
              backdropFilter: 'blur(24px) saturate(150%)',
              WebkitBackdropFilter: 'blur(24px) saturate(150%)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            <Crown className="w-13 h-13" style={{ color: '#D4AF37', width: 52, height: 52 }} />
          </div>

          <h1 className="font-cinzel text-6xl font-bold mb-3 text-white tracking-wide">Bataknese</h1>
          <p className="font-cinzel text-xl mb-10" style={{ color: '#E5C453' }}>Platform Komunitas Eksklusif</p>

          <p className="text-lg leading-relaxed max-w-sm mb-10" style={{ color: 'rgba(255,255,255,0.68)' }}>
            Terhubung dengan sesama orang Batak dari seluruh dunia. Bagikan warisan budaya Anda, bangun hubungan yang langgeng, dan rayakan identitas budaya kita yang kaya.
          </p>

          {/* Stats */}
          <div
            className="flex items-center gap-8 px-8 py-5 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px) saturate(140%)',
              WebkitBackdropFilter: 'blur(20px) saturate(140%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.10)',
            }}
          >
            {[
              { val: '10rb+', label: 'Anggota' },
              { val: '60+',   label: 'Marga' },
              { val: '100+',  label: 'Komunitas' },
            ].map((stat, i, arr) => (
              <div key={stat.label} className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold font-cinzel text-white">{stat.val}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#E5C453' }}>{stat.label}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.18)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right — Login form ────────────────────────────────── */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden"
        style={{ background: '#000000' }}
      >
        {/* Ambient glows */}
        <div className="absolute pointer-events-none" style={{
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '640px', height: '640px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,0,0,0.14) 0%, transparent 68%)',
          filter: 'blur(60px)',
        }} />
        <div className="absolute pointer-events-none" style={{
          top: '-40px', right: '-40px', width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} />

        <div className="w-full max-w-md relative z-10">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(139,0,0,0.80), rgba(212,175,55,0.60))',
                border: '1px solid rgba(212,175,55,0.25)',
                boxShadow: '0 0 28px rgba(139,0,0,0.45)',
              }}
            >
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-cinzel text-3xl font-bold text-white">Bataknese</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>Komunitas Eksklusif</p>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl overflow-hidden mb-6"
            style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(48px) saturate(180%)',
              WebkitBackdropFilter: 'blur(48px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.13)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.75), 0 0 40px rgba(139,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          >
            {/* Card inner glow */}
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full pointer-events-none" style={{
              background: 'radial-gradient(circle, rgba(139,0,0,0.18) 0%, transparent 70%)',
              filter: 'blur(24px)',
            }} />

            {/* Header stripe */}
            <div
              className="px-8 py-6 relative"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(139,0,0,0.09)' }}
            >
              <h2 className="font-cinzel text-2xl font-bold text-white mb-1">Selamat Datang Kembali</h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>Masuk ke akun Anda</p>
            </div>

            <div className="px-8 py-7">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: 'rgba(255,255,255,0.50)' }}>
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(255,255,255,0.30)' }} />
                    <GlassInput
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email.anda@contoh.com"
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: 'rgba(255,255,255,0.50)' }}>
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(255,255,255,0.30)' }} />
                    <GlassInput
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                  </div>
                </div>

                {/* Remember + forgot */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: '#8B0000' }} />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>Ingat saya</span>
                  </label>
                  <Link
                    href="#"
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'rgba(185,28,28,0.90)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(185,28,28,0.90)')}
                  >
                    Lupa kata sandi?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, rgba(185,28,28,0.88) 0%, rgba(139,0,0,0.82) 55%, rgba(92,0,0,0.78) 100%)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(185,28,28,0.45)',
                    boxShadow: '0 4px 24px rgba(139,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.16)',
                  }}
                  onMouseEnter={e => {
                    if (!isLoading) {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 32px rgba(139,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.20)';
                      (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(139,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.16)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  }}
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Masuk...</>
                  ) : 'Masuk'}
                </button>
              </form>
            </div>
          </div>

          {/* Register link */}
          <div className="text-center mb-8">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>
              Belum punya akun?{' '}
              <Link
                href="/auth/register"
                className="font-semibold transition-colors duration-150"
                style={{ color: '#D4AF37' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E5C453')}
                onMouseLeave={e => (e.currentTarget.style.color = '#D4AF37')}
              >
                Daftar Sekarang
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.20)' }}>
            <p>© 2024 Bataknese. Hak cipta dilindungi undang-undang.</p>
            <p className="mt-1">Merayakan warisan dan persatuan Batak</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Glass input primitive ──────────────────────────────────────── */
function GlassInput({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        background: 'rgba(0,0,0,0.30)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '0.625rem',
        padding: '0.70rem 0.875rem',
        color: '#ffffff',
        fontSize: '0.875rem',
        outline: 'none',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.50)',
        transition: 'all 0.2s ease',
        ...style,
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'rgba(139,0,0,0.55)';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,0,0,0.15), inset 0 2px 6px rgba(0,0,0,0.40)';
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
        e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.50)';
      }}
    />
  );
}