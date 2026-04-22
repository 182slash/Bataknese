'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Crown, Mail, Lock, User, Calendar, Phone, MapPin, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { MargaReference } from '@/lib/types';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);
  const [margaList, setMargaList] = useState<MargaReference>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    marga: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    date_of_birth: '',
    phone: '',
    address: '',
    city: '',
    province: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
    const fetchMargaList = async () => {
      try {
        const response = await apiClient.get('/auth/marga-list');
        if (response.data.success) {
          setMargaList(response.data.data);
        }
      } catch (error) {
        console.error('Gagal mengambil daftar marga:', error);
      }
    };
    fetchMargaList();
  }, [isAuthenticated, router]);

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.full_name) {
      toast.error('Mohon isi semua kolom yang wajib diisi');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Kata sandi minimal harus 6 karakter');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Kata sandi tidak cocok');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.marga || !formData.date_of_birth) {
      toast.error('Mohon isi semua kolom yang wajib diisi');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handlePrevStep = () => setStep(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    const submitData = {
      full_name:     formData.full_name,
      marga:         formData.marga,
      email:         formData.email,
      password:      formData.password,
      gender:        formData.gender,
      date_of_birth: formData.date_of_birth,
      phone:         formData.phone,
      address:       formData.address,
      city:          formData.city,
      province:      formData.province,
    };
    const success = await register(submitData);
    if (success) router.push('/dashboard');
  };

  // Shared icon style
  const iconStyle = { color: 'rgba(255,255,255,0.35)' };
  const labelStyle = { color: 'rgba(255,255,255,0.70)' };

  return (
    <div className="min-h-screen flex">

      {/* ── Left — Branding ──────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a0000 0%, #3d0000 40%, #8B0000 75%, #6b3a00 100%)' }}
      >
        <div className="absolute inset-0 ulos-pattern opacity-20 pointer-events-none" />

        {/* Ambient blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.40) 0%, transparent 70%)', filter: 'blur(80px)' }} />

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
            <h1 className="font-cinzel text-6xl font-bold mb-4 text-white">Gabung Bataknese</h1>
            <p className="text-2xl font-cinzel" style={{ color: '#E5C453' }}>Langkah {step} dari 2</p>
          </div>

          <div className="max-w-md space-y-6">
            <p className="text-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.80)' }}>
              {step === 1
                ? 'Buat akun Anda dan dapatkan Kartu Identitas Batak eksklusif Anda'
                : 'Beri tahu kami lebih banyak tentang warisan Batak dan detail pribadi Anda'}
            </p>

            {/* Step indicator */}
            <div className="flex items-center justify-center space-x-4 pt-6">
              {[1, 2].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300"
                    style={step >= s ? {
                      background: 'rgba(255,255,255,0.95)',
                      color: '#8B0000',
                      border: '2px solid #fff',
                      boxShadow: '0 0 16px rgba(255,255,255,0.30)',
                    } : {
                      background: 'transparent',
                      color: 'rgba(255,255,255,0.60)',
                      border: '2px solid rgba(255,255,255,0.35)',
                    }}
                  >
                    {s}
                  </div>
                  {i === 0 && (
                    <div className="w-16 h-1 mx-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.20)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: step >= 2 ? '100%' : '0%', background: '#ffffff' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-8 left-8 w-32 h-32 rounded-lg rotate-12"
          style={{ border: '3px solid rgba(255,255,255,0.12)' }} />
        <div className="absolute bottom-8 right-8 w-24 h-24 rounded-full"
          style={{ border: '3px solid rgba(212,175,55,0.25)' }} />
      </div>

      {/* ── Right — Form ─────────────────────────────────────── */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto relative"
        style={{ background: '#000000' }}
      >
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="w-full max-w-md relative z-10 py-8">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #8B0000, #D4AF37)', boxShadow: '0 0 24px rgba(139,0,0,0.50)' }}
            >
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-cinzel text-3xl font-bold text-white">Bataknese</h1>
            <p style={{ color: 'rgba(255,255,255,0.40)' }}>Langkah {step} dari 2</p>
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
              {/* Inner glow */}
              <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.20) 0%, transparent 70%)', filter: 'blur(20px)' }} />

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="font-cinzel text-3xl font-bold text-white mb-2">
                    {step === 1 ? 'Buat Akun' : 'Detail Pribadi'}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {step === 1 ? 'Atur kredensial Anda' : 'Lengkapi profil Anda'}
                  </p>
                </div>

                <form
                  onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}
                  className="space-y-5"
                >
                  {step === 1 ? (
                    <>
                      {/* Full name */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Nama Lengkap *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={iconStyle} />
                          <input type="text" value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="input-primary pl-12" placeholder="Contoh: John Siregar" required />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Alamat Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={iconStyle} />
                          <input type="email" value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input-primary pl-12" placeholder="email.anda@contoh.com" required />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Kata Sandi *</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={iconStyle} />
                          <input type="password" value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="input-primary pl-12" placeholder="Minimal 6 karakter" required />
                        </div>
                      </div>

                      {/* Confirm password */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Konfirmasi Kata Sandi *</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={iconStyle} />
                          <input type="password" value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="input-primary pl-12" placeholder="Ulangi kata sandi Anda" required />
                        </div>
                      </div>

                      <button type="submit"
                        className="btn-primary w-full !py-4 text-lg font-semibold flex items-center justify-center">
                        Lanjut ke Detail Pribadi
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Marga */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Marga *</label>
                        <select value={formData.marga}
                          onChange={(e) => setFormData({ ...formData, marga: e.target.value })}
                          className="input-primary" required
                          style={{ colorScheme: 'dark' }}
                        >
                          <option value="" style={{ background: '#0A0A0A' }}>Pilih marga Anda</option>
                          {Object.entries(margaList).map(([subEthnic, margas]) => (
                            <optgroup key={subEthnic} label={subEthnic} style={{ background: '#0A0A0A' }}>
                              {margas.map((marga) => (
                                <option key={marga.id} value={marga.marga_name} style={{ background: '#0A0A0A' }}>
                                  {marga.marga_name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Jenis Kelamin *</label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['Male', 'Female', 'Other'] as const).map((gender) => (
                            <button key={gender} type="button"
                              onClick={() => setFormData({ ...formData, gender })}
                              className="px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium"
                              style={formData.gender === gender ? {
                                background: 'linear-gradient(135deg, rgba(139,0,0,0.50), rgba(92,0,0,0.40))',
                                border: '1px solid rgba(185,28,28,0.60)',
                                color: '#ffffff',
                                boxShadow: '0 0 12px rgba(139,0,0,0.30)',
                              } : {
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.10)',
                                color: 'rgba(255,255,255,0.50)',
                              }}
                            >
                              {gender === 'Male' ? 'Laki-laki' : gender === 'Female' ? 'Perempuan' : 'Lainnya'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Date of birth */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Tanggal Lahir *</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={iconStyle} />
                          <input type="date" value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                            className="input-primary pl-12" required
                            style={{ colorScheme: 'dark' }} />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Nomor Telepon</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={iconStyle} />
                          <input type="tel" value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input-primary pl-12" placeholder="+62 812 3456 7890" />
                        </div>
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Kota</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={iconStyle} />
                          <input type="text" value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="input-primary pl-12" placeholder="Jakarta" />
                        </div>
                      </div>

                      {/* Province */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={labelStyle}>Provinsi</label>
                        <input type="text" value={formData.province}
                          onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                          className="input-primary" placeholder="DKI Jakarta" />
                      </div>

                      {/* Back + Submit */}
                      <div className="flex space-x-3 pt-2">
                        <button type="button" onClick={handlePrevStep}
                          className="btn-secondary flex-1 !py-4 text-lg font-semibold flex items-center justify-center">
                          <ChevronLeft className="w-5 h-5 mr-2" />
                          Kembali
                        </button>
                        <button type="submit" disabled={isLoading}
                          className="btn-primary flex-1 !py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                          {isLoading ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Memproses...</>
                          ) : 'Buat Akun'}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Login link */}
          <div className="text-center">
            <p style={{ color: 'rgba(255,255,255,0.45)' }}>
              Sudah punya akun?{' '}
              <Link href="/auth/login"
                className="font-semibold transition-colors"
                style={{ color: '#D4AF37' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E5C453')}
                onMouseLeave={e => (e.currentTarget.style.color = '#D4AF37')}
              >
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}