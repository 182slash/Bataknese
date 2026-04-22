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
      {/* Sisi Kiri - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-dark via-primary to-gold relative overflow-hidden">
        {/* Pola Latar Belakang */}
        <div className="absolute inset-0 ulos-pattern opacity-20"></div>
        
        {/* Konten */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 text-white">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl">
              <Crown className="w-14 h-14 text-gold" />
            </div>
            <h1 className="font-cinzel text-6xl font-bold mb-4">Bataknese</h1>
            <p className="text-2xl font-cinzel text-gold-light">Platform Komunitas Eksklusif</p>
          </div>

          <div className="max-w-md space-y-6">
            <p className="text-xl leading-relaxed">
              Terhubung dengan sesama orang Batak dari seluruh dunia. Bagikan warisan budaya Anda, bangun hubungan yang langgeng, dan rayakan identitas budaya kita yang kaya.
            </p>
            
            <div className="flex items-center justify-center space-x-8 pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold font-cinzel">10rb+</p>
                <p className="text-sm text-gold-light">Anggota</p>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <p className="text-4xl font-bold font-cinzel">60+</p>
                <p className="text-sm text-gold-light">Marga</p>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <p className="text-4xl font-bold font-cinzel">100+</p>
                <p className="text-sm text-gold-light">Komunitas</p>
              </div>
            </div>
          </div>

          {/* Elemen Dekoratif */}
          <div className="absolute top-8 left-8 w-32 h-32 border-4 border-white/20 rounded-lg rotate-12"></div>
          <div className="absolute bottom-8 right-8 w-24 h-24 border-4 border-gold/30 rounded-full"></div>
        </div>
      </div>

      {/* Sisi Kanan - Formulir Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-dark">
        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-gold rounded-xl flex items-center justify-center mx-auto mb-4">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-cinzel text-3xl font-bold text-white">Bataknese</h1>
            <p className="text-gray-400">Komunitas Eksklusif</p>
          </div>

          <div className="ulos-border-card mb-8">
            <div className="ulos-border-card-inner p-8">
              <div className="text-center mb-8">
                <h2 className="font-cinzel text-3xl font-bold text-white mb-2">Selamat Datang Kembali</h2>
                <p className="text-gray-400">Masuk ke akun Anda</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <    Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-primary border-gray-700 rounded focus:ring-primary" />
                    <span className="ml-2 text-sm text-gray-400">Ingat saya</span>
                  </label>
                  <Link href="#" className="text-sm text-primary hover:text-primary-light transition-colors">
                    Lupa kata sandi?
                  </Link>
                </div>

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

          <div className="text-center">
            <p className="text-gray-400">
              Belum punya akun?{' '}
              <Link href="/auth/register" className="text-gold hover:text-gold-light font-semibold transition-colors">
                Daftar Sekarang
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2024 Bataknese. Hak cipta dilindungi undang-undang.</p>
            <p className="mt-2">Merayakan warisan dan persatuan Batak</p>
          </div>
        </div>
      </div>
    </div>
  );
}